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

export const updateProject = async (req: Request, res: Response) => {
    try {
        const perusahaanId = req.headers['x-perusahaan-id'] as string;
        const { id } = req.params;
        const validatedData = createProjectSchema.parse(req.body);

        const project = await prisma.proyek.update({
            where: { id, perusahaanId },
            data: {
                ...validatedData,
                tanggalMulai: new Date(validatedData.tanggalMulai),
                tanggalSelesai: validatedData.tanggalSelesai ? new Date(validatedData.tanggalSelesai) : null,
                targetSelesai: validatedData.targetSelesai ? new Date(validatedData.targetSelesai) : null,
            }
        });

        res.json({ data: project });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Gagal memperbarui proyek';
        res.status(400).json({ message });
    }
};

export const deleteProject = async (req: Request, res: Response) => {
    try {
        const perusahaanId = req.headers['x-perusahaan-id'] as string;
        const { id } = req.params;

        await prisma.proyek.delete({
            where: { id, perusahaanId }
        });

        res.json({ message: 'Proyek berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus proyek. Pastikan tidak ada transaksi yang terhubung.' });
    }
};

export const getProjectProfitability = async (req: Request, res: Response) => {
    try {
        const perusahaanId = req.headers['x-perusahaan-id'] as string;
        const { id } = req.params;

        const project = await prisma.proyek.findFirst({
            where: { id, perusahaanId },
            include: {
                proyekTransaksi: {
                    include: {
                        akun: { select: { namaAkun: true, tipe: true } }
                    }
                }
            }
        });

        if (!project) return res.status(404).json({ message: 'Proyek tidak ditemukan' });

        let totalRevenue = 0;
        let totalCost = 0;

        project.proyekTransaksi.forEach(pt => {
            const amount = Number(pt.jumlah);
            // Assuming TipeAkun logic or tipeTransaksi if explicitly set
            if (pt.tipeTransaksi === 'REVENUE' || (pt.akun && pt.akun.tipe === 'PENDAPATAN')) {
                totalRevenue += amount;
            } else if (pt.tipeTransaksi === 'COST' || (pt.akun && pt.akun.tipe === 'BEBAN')) {
                totalCost += amount;
            }
        });

        res.json({
            data: {
                id: project.id,
                namaProyek: project.namaProyek,
                totalRevenue,
                totalCost,
                grossProfit: totalRevenue - totalCost,
                margin: totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghitung profitabilitas proyek' });
    }
};
