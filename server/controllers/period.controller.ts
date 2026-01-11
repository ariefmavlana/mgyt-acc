import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../../lib/prisma';
import { AccountingEngine } from '../lib/accounting-engine';

export const getPeriods = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;

        const periods = await prisma.periodeAkuntansi.findMany({
            where: { perusahaanId },
            orderBy: [{ tahun: 'desc' }, { bulan: 'desc' }]
        });

        res.json(periods);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengambil daftar periode' });
    }
};

export const closePeriod = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const id = req.params.id;
        const perusahaanId = authReq.currentCompanyId!;

        const result = await prisma.$transaction(async (tx) => {
            // 1. Find period
            const period = await tx.periodeAkuntansi.findUnique({
                where: { id: id as string, perusahaanId }
            });

            if (!period) throw new Error('Periode tidak ditemukan');
            if (period.status !== 'TERBUKA') throw new Error('Periode sudah ditutup');

            // 2. Check for unposted entries (vouchers/transactions)
            // In this strict engine, transactions are auto-posted, so we check if any are DRAFT
            const unpostedVouchers = await tx.voucher.count({
                where: {
                    perusahaanId,
                    tanggal: {
                        gte: period.tanggalMulai,
                        lte: period.tanggalAkhir
                    },
                    status: 'DRAFT'
                }
            });

            if (unpostedVouchers > 0) {
                throw new Error(`Gagal menutup periode: Terdapat ${unpostedVouchers} voucher yang masih status DRAFT.`);
            }

            // 3. Update Period status
            const updatedPeriod = await tx.periodeAkuntansi.update({
                where: { id: id as string },
                data: {
                    status: 'DITUTUP_PERMANEN',
                    ditutupOleh: authReq.user.username,
                    tanggalDitutup: new Date()
                }
            });

            // 4. Record Carry forward (Historical tracking)
            // For now, COA balances are real-time, so closing doesn't 'shift' balances, 
            // but it locks entries for that date range in createTransaction.

            return updatedPeriod;
        });

        res.json({
            message: 'Periode berhasil ditutup. Transaksi pada periode ini sekarang terkunci.',
            period: result
        });
    } catch (error: any) {
        console.error(error);
        res.status(400).json({ message: error.message || 'Gagal menutup periode' });
    }
};
