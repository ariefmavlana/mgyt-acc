
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';

export const getAuditLogs = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
        const { search, limit = 50, page = 1 } = req.query;

        // basic search filter
        const where: Prisma.JejakAuditWhereInput = {
            perusahaanId
        };

        if (search) {
            const s = String(search);
            where.OR = [
                { pengguna: { namaLengkap: { contains: s, mode: 'insensitive' } } },
                { aksi: { contains: s, mode: 'insensitive' } },
                { modul: { contains: s, mode: 'insensitive' } },
                { keterangan: { contains: s, mode: 'insensitive' } }
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [data, total] = await Promise.all([
            prisma.jejakAudit.findMany({
                where,
                include: {
                    pengguna: {
                        select: { id: true, namaLengkap: true, email: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: Number(limit),
                skip
            }),
            prisma.jejakAudit.count({ where })
        ]);

        res.json({
            data,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            }
        });

    } catch (error) {
        console.error('Audit Log Error:', error);
        res.status(500).json({ message: 'Gagal memuat jejak audit' });
    }
};

export const getAuditLogById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;

        const log = await prisma.jejakAudit.findFirst({
            where: { id: String(id), perusahaanId },
            include: {
                pengguna: { select: { id: true, namaLengkap: true, email: true } }
            }
        });

        if (!log) {
            return res.status(404).json({ message: 'Log tidak ditemukan' });
        }

        res.json(log);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving log' });
    }
};
