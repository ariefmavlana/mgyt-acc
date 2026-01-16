import { Prisma, TipeTransaksi, StatusPeriode } from '@prisma/client';

export class AccountingEngine {
    constructor(private prisma: any) { }

    /**
     * Validate if a date falls within an open accounting period
     */
    async validatePeriod(perusahaanId: string, date: Date) {
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        const period = await this.prisma.periodeAkuntansi.findFirst({
            where: {
                perusahaanId,
                bulan: month,
                tahun: year,
                status: 'TERBUKA'
            }
        });

        if (!period) {
            throw new Error(`Periode akuntansi untuk ${month}/${year} tidak ditemukan atau sudah ditutup.`);
        }

        return period;
    }

    /**
     * Generate sequential numbers for documents
     */
    async generateNumber(perusahaanId: string, prefix: string, model: 'transaksi' | 'voucher' | 'jurnalUmum') {
        const now = new Date();
        const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;

        // Simple sequential number based on count for the month
        // In production, this should use a separate sequence table to avoid gaps/dupes
        const count = await this.prisma[model].count({
            where: {
                perusahaanId,
                createdAt: {
                    gte: new Date(now.getFullYear(), now.getMonth(), 1),
                }
            }
        });

        return `${prefix}/${yearMonth}/${String(count + 1).padStart(5, '0')}`;
    }

    /**
     * Update account balances correctly based on Normal Balance logic
     */
    async updateBalance(perusahaanId: string, accountId: string, amount: number, type: 'DEBIT' | 'KREDIT') {
        const account = await this.prisma.chartOfAccounts.findUnique({
            where: { id: accountId },
            select: { id: true, normalBalance: true, saldoBerjalan: true, isHeader: true }
        });

        if (!account) throw new Error(`Akun dengan ID ${accountId} tidak ditemukan.`);
        if (account.isHeader) throw new Error(`Akun ${accountId} adalah akun header dan tidak dapat menerima posting langsung.`);

        const saldoSebelum = Number(account.saldoBerjalan);
        let adjustment = 0;

        if (account.normalBalance === 'DEBIT') {
            adjustment = type === 'DEBIT' ? amount : -amount;
        } else {
            adjustment = type === 'KREDIT' ? amount : -amount;
        }

        await this.prisma.chartOfAccounts.update({
            where: { id: accountId },
            data: {
                saldoBerjalan: {
                    increment: adjustment
                }
            }
        });

        return {
            saldoSebelum,
            saldoSesudah: saldoSebelum + adjustment
        };
    }

    /**
     * Ensure Debit equals Credit for any journal entry
     */
    validateJournal(details: { debit: number, kredit: number }[]) {
        const totalDebit = details.reduce((sum, d) => sum + Number(d.debit), 0);
        const totalKredit = details.reduce((sum, d) => sum + Number(d.kredit), 0);

        // Usage of tolerance for floating point comparisons
        if (Math.abs(totalDebit - totalKredit) > 0.01) {
            throw new Error(`Integritas Jurnal Gagal: Total Debit (${totalDebit}) tidak sama dengan Total Kredit (${totalKredit}).`);
        }
        return true;
    }

    /**
     * Process Year-End or Period-End Closing
     * Zeroes out temporary accounts and moves balance to Retained Earnings
     */
    async performClosing(perusahaanId: string, periodeId: string, closingBy: string) {
        // 1. Get Period Info
        const period = await this.prisma.periodeAkuntansi.findUnique({
            where: { id: periodeId }
        });
        if (!period) throw new Error('Periode tidak ditemukan');
        if (period.status !== 'TERBUKA') throw new Error('Periode sudah ditutup');

        // 2. Get Company Settings for Closing Accounts
        const settings = await this.prisma.pengaturanPerusahaan.findUnique({
            where: { perusahaanId }
        });
        if (!settings || !settings.akunLabaTahunBerjalanId) {
            throw new Error('Akun Laba Tahun Berjalan belum dikonfigurasi di Pengaturan Perusahaan.');
        }

        // 3. Find all Income & Expense accounts with non-zero balance
        const tempAccounts = await this.prisma.chartOfAccounts.findMany({
            where: {
                perusahaanId,
                tipe: { in: ['PENDAPATAN', 'BEBAN'] },
                saldoBerjalan: { not: 0 }
            }
        });

        if (tempAccounts.length === 0) return null; // Nothing to close

        let totalNetIncome = 0;
        const journalDetails: any[] = [];

        for (const acc of tempAccounts) {
            const balance = Number(acc.saldoBerjalan);
            const isRevenue = acc.tipe === 'PENDAPATAN';

            // To zero out:
            // Revenue (Normal Credit (+)) -> Debit it
            // Expense (Normal Debit (+)) -> Credit it

            const debit = isRevenue ? balance : 0;
            const kredit = isRevenue ? 0 : balance;

            if (isRevenue) totalNetIncome += balance;
            else totalNetIncome -= balance;

            journalDetails.push({
                akunId: acc.id,
                deskripsi: `Penutupan Saldo - ${period.nama}`,
                debit,
                kredit
            });
        }

        // 4. Create Jurnal Penutup
        const journalNo = await this.generateNumber(perusahaanId, 'CLS', 'jurnalUmum');

        const closingJournal = await this.prisma.jurnalUmum.create({
            data: {
                perusahaanId,
                periodeId: period.id,
                nomorJurnal: journalNo,
                tanggal: period.tanggalAkhir,
                deskripsi: `Jurnal Penutup Periode ${period.nama} oleh ${closingBy}`,
                totalDebit: Math.abs(totalNetIncome),
                totalKredit: Math.abs(totalNetIncome),
                isPosted: true,
                postedAt: new Date()
            }
        });

        // 5. Add details and Update Balances (including the net income dump)
        for (const item of journalDetails) {
            await this.prisma.jurnalDetail.create({
                data: {
                    jurnalId: closingJournal.id,
                    urutan: journalDetails.indexOf(item) + 1,
                    ...item
                }
            });

            // Update balance to ZERO
            await this.prisma.chartOfAccounts.update({
                where: { id: item.akunId },
                data: { saldoBerjalan: 0 }
            });
        }

        // 6. Dump Net Income to Laba Tahun Berjalan
        // If Net Income > 0, Credit Laba Tahun Berjalan. If < 0, Debit it.
        const isProfit = totalNetIncome >= 0;
        const dumpDebit = isProfit ? 0 : Math.abs(totalNetIncome);
        const dumpKredit = isProfit ? Math.abs(totalNetIncome) : 0;

        await this.prisma.jurnalDetail.create({
            data: {
                jurnalId: closingJournal.id,
                urutan: journalDetails.length + 1,
                akunId: settings.akunLabaTahunBerjalanId,
                deskripsi: `Laba/Rugi Bersih Periode ${period.nama}`,
                debit: dumpDebit,
                kredit: dumpKredit
            }
        });

        await this.updateBalance(perusahaanId, settings.akunLabaTahunBerjalanId, Math.abs(totalNetIncome), isProfit ? 'KREDIT' : 'DEBIT');

        return closingJournal;
    }
}
