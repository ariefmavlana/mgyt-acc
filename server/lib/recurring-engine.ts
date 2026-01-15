import { FrekuensiRekuren } from '@prisma/client';
import { addDays, addWeeks, addMonths, setDate, endOfMonth } from 'date-fns';
import prisma from '../../lib/prisma';

export class RecurringEngine {
    /**
     * Scan and process all due recurring transactions
     */
    static async processAll() {
        const now = new Date();
        const dueTransactions = await prisma.transaksiRekuren.findMany({
            where: {
                isAktif: true,
                tanggalExekusiBerikutnya: { lte: now },
                OR: [
                    { tanggalAkhir: null },
                    { tanggalAkhir: { gte: now } }
                ]
            }
        });

        const results = [];

        for (const rt of dueTransactions) {
            try {
                const result = await this.execute(rt.id);
                results.push({ id: rt.id, status: 'SUCCESS', transactionId: result.transaksiId });
            } catch (error: any) {
                results.push({ id: rt.id, status: 'FAILED', error: error.message });
            }
        }

        return results;
    }

    /**
     * Execute a specific recurring transaction
     */
    static async execute(id: string) {
        return await prisma.$transaction(async (tx) => {
            const rt = await tx.transaksiRekuren.findUnique({
                where: { id },
                include: { perusahaan: true }
            });

            if (!rt || !rt.isAktif) throw new Error('Recurring transaction not found or inactive');

            const templateData = rt.templateTransaksi as any;

            // 1. Create the Transaksi
            const newTransaction = await tx.transaksi.create({
                data: {
                    ...templateData,
                    perusahaanId: rt.perusahaanId,
                    tanggal: new Date(),
                    keterangan: (templateData.keterangan || rt.nama) + ` (Auto-generated from ${rt.kode})`,
                }
            });

            // 2. Update RT stats and next date
            const nextDate = this.calculateNextDate(rt.tanggalExekusiBerikutnya, rt.frekuensi, rt.intervalHari, rt.hariDalamBulan);

            await tx.transaksiRekuren.update({
                where: { id: rt.id },
                data: {
                    tanggalExekusiBerikutnya: nextDate,
                    jumlahEksekusi: { increment: 1 },
                    jumlahBerhasil: { increment: 1 }
                }
            });

            // 3. Log history
            await tx.riwayatTransaksiRekuren.create({
                data: {
                    rekurenId: rt.id,
                    transaksiId: newTransaction.id,
                    tanggalDijadwalkan: rt.tanggalExekusiBerikutnya,
                    tanggalDiproses: new Date(),
                    status: 'BERHASIL'
                }
            });

            return { transaksiId: newTransaction.id };
        });
    }

    private static calculateNextDate(current: Date, freq: FrekuensiRekuren, interval?: number | null, dayOfMonth?: number | null): Date {
        switch (freq) {
            case 'HARIAN':
                return addDays(current, interval || 1);
            case 'MINGGUAN':
                return addWeeks(current, interval || 1);
            case 'BULANAN':
                let next = addMonths(current, interval || 1);
                if (dayOfMonth) {
                    if (dayOfMonth === 99) {
                        next = endOfMonth(next);
                    } else {
                        next = setDate(next, dayOfMonth);
                    }
                }
                return next;
            case 'TAHUNAN':
                return addMonths(current, 12);
            default:
                return addDays(current, 1);
        }
    }
}
