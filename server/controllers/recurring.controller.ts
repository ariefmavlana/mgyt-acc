import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../../lib/prisma';
import { RecurringEngine } from '../lib/recurring-engine';

export const getRecurringTransactions = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;

        const lists = await prisma.transaksiRekuren.findMany({
            where: { perusahaanId },
            include: { riwayat: { take: 5, orderBy: { createdAt: 'desc' } } },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, data: lists });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal mengambil data transaksi rekuren' });
    }
};

export const createRecurringTransaction = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
        const data = req.body;

        const rt = await prisma.transaksiRekuren.create({
            data: {
                ...data,
                perusahaanId,
                tanggalExekusiBerikutnya: new Date(data.tanggalMulai)
            }
        });

        res.status(201).json({ success: true, data: rt });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const processRecurringTrigger = async (req: Request, res: Response) => {
    try {
        const results = await RecurringEngine.processAll();
        res.json({ success: true, results });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal memproses pemicu rekuren' });
    }
};
