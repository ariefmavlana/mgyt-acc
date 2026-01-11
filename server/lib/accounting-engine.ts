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

        const saldoSesudah = saldoSebelum + adjustment;

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
            saldoSesudah
        };
    }
}
