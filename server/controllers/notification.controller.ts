import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../../lib/prisma';

export const getNotifications = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const penggunaId = authReq.user!.id;

        const notif = await prisma.notifikasi.findMany({
            where: { penggunaId },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        res.json({ success: true, data: notif });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal mengambil notifikasi' });
    }
};

export const getUnreadCount = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const penggunaId = authReq.user!.id;

        const count = await prisma.notifikasi.count({
            where: { penggunaId, dibaca: false }
        });

        res.json({ success: true, count });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal menghitung notifikasi baru' });
    }
};

export const markAsRead = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const penggunaId = authReq.user!.id;
        const { id } = req.params;

        await prisma.notifikasi.updateMany({
            where: { id, penggunaId },
            data: { dibaca: true, tanggalDibaca: new Date() }
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal menandai notifikasi' });
    }
};

export const markAllAsRead = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const penggunaId = authReq.user!.id;

        await prisma.notifikasi.updateMany({
            where: { penggunaId, dibaca: false },
            data: { dibaca: true, tanggalDibaca: new Date() }
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal menandai semua notifikasi' });
    }
};
