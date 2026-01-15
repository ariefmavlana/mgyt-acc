import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import { createProjectSchema } from '../validators/project.validator';

export const getProjects = async (req: Request, res: Response) => {
    try {
        const perusahaanId = req.headers['x-perusahaan-id'] as string;
        if (!perusahaanId) return res.status(400).json({ message: 'Perusahaan ID diperlukan' });

        const projects = await prisma.proyek.findMany({
            where: { perusahaanId },
            include: {
                pelanggan: { select: { nama: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ data: projects });
    } catch (error: unknown) {
        console.error('Get Projects Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createProject = async (req: Request, res: Response) => {
    try {
        const perusahaanId = req.headers['x-perusahaan-id'] as string;
        if (!perusahaanId) return res.status(400).json({ message: 'Perusahaan ID diperlukan' });

        const validatedData = createProjectSchema.parse(req.body);

        const project = await prisma.proyek.create({
            data: {
                perusahaanId,
                kodeProyek: validatedData.kodeProyek,
                namaProyek: validatedData.namaProyek,
                pelangganId: validatedData.pelangganId,
                tanggalMulai: new Date(validatedData.tanggalMulai),
                tanggalSelesai: validatedData.tanggalSelesai ? new Date(validatedData.tanggalSelesai) : null,
                targetSelesai: validatedData.targetSelesai ? new Date(validatedData.targetSelesai) : null,
                nilaiKontrak: validatedData.nilaiKontrak,
                manajerProyek: validatedData.manajerProyek,
                lokasi: validatedData.lokasi,
                deskripsi: validatedData.deskripsi,
            }
        });

        res.status(201).json({ data: project });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Gagal membuat proyek';
        res.status(400).json({ message });
    }
};

// Add update, delete, etc. as needed...
