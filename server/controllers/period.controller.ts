import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';
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
    } catch (error: unknown) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengambil daftar periode' });
    }
};

export const closePeriod = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const id = req.params.id;
        const perusahaanId = authReq.currentCompanyId!;

        const result = await prisma.$transaction(async (transactionClient: Prisma.TransactionClient) => {
            // 1. Find period
            const period = await transactionClient.periodeAkuntansi.findUnique({
                where: { id: id as string, perusahaanId }
            });

            if (!period) throw new Error('Periode tidak ditemukan');
            if (period.status !== 'TERBUKA') throw new Error('Periode sudah ditutup');

            // 2. Check for unposted entries (vouchers/transactions)
            // In this strict engine, transactions are auto-posted, so we check if any are DRAFT
            const unpostedVouchers = await transactionClient.voucher.count({
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

            // 3. Perform Closing Journal Entries (PSAK)
            const engine = new AccountingEngine(transactionClient);
            await engine.performClosing(perusahaanId, id as string, authReq.user!.username);

            // 4. Update Period status
            const updatedPeriod = await transactionClient.periodeAkuntansi.update({
                where: { id: id as string },
                data: {
                    status: 'DITUTUP_PERMANEN',
                    ditutupOleh: authReq.user!.username,
                    tanggalDitutup: new Date()
                }
            });

            return updatedPeriod;
        });

        res.json({
            message: 'Periode berhasil ditutup. Transaksi pada periode ini sekarang terkunci.',
            period: result
        });
    } catch (error: unknown) {
        console.error(error);
        const message = error instanceof Error ? error.message : 'Gagal menutup periode';
        res.status(400).json({ message });
    }
};

export const createPeriod = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
        const { tahun, bulan, nama, tanggalMulai, tanggalAkhir } = req.body;

        if (!tahun || !bulan || !nama || !tanggalMulai || !tanggalAkhir) {
            return res.status(400).json({ message: 'Semua field wajib diisi' });
        }

        const existing = await prisma.periodeAkuntansi.findFirst({
            where: { perusahaanId, tahun, bulan }
        });

        if (existing) {
            return res.status(400).json({ message: 'Periode untuk tahun dan bulan ini sudah ada' });
        }

        const period = await prisma.periodeAkuntansi.create({
            data: {
                perusahaanId,
                tahun: parseInt(tahun),
                bulan: parseInt(bulan),
                nama,
                tanggalMulai: new Date(tanggalMulai),
                tanggalAkhir: new Date(tanggalAkhir),
                status: 'TERBUKA'
            }
        });

        res.json(period);
    } catch (error: unknown) {
        console.error(error);
        res.status(500).json({ message: 'Gagal membuat periode baru' });
    }
};
