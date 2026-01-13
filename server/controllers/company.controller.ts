import { Request, Response } from 'express';
import { createCompanySchema, updateCompanySchema, settingsSchema } from '../validators/company.validator';
import { ZodError } from 'zod';
import prisma from '../../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { TierPaket } from '@prisma/client';

export const getCompanies = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const userId = authReq.user.id;
        const page = parseInt((req.query.page as string) || '1');
        const limit = parseInt((req.query.limit as string) || '10');
        const skip = (page - 1) * limit;

        const [companies, total] = await Promise.all([
            prisma.perusahaan.findMany({
                where: {
                    aksesPengguna: {
                        some: { penggunaId: userId }
                    }
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.perusahaan.count({
                where: {
                    aksesPengguna: {
                        some: { penggunaId: userId }
                    }
                }
            })
        ]);

        res.json({
            companies,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error: unknown) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengambil daftar perusahaan' });
    }
};

export const getCompany = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const { id } = req.params;
        const userId = authReq.user.id;

        const company = await prisma.perusahaan.findFirst({
            where: {
                id: id as string,
                aksesPengguna: {
                    some: { penggunaId: userId }
                }
            }
        });

        if (!company) {
            return res.status(404).json({ message: 'Perusahaan tidak ditemukan' });
        }

        res.json(company);
    } catch (error: unknown) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengambil detail perusahaan' });
    }
};

export const createCompany = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const { tier, ...rest } = createCompanySchema.parse(req.body);
        const userId = authReq.user.id;

        const company = await prisma.$transaction(async (tx) => {
            const comp = await tx.perusahaan.create({
                data: {
                    ...rest,
                    kode: rest.nama.substring(0, 3).toUpperCase() + Math.floor(Math.random() * 1000),
                }
            });

            // Create default access
            await tx.aksesPengguna.create({
                data: {
                    penggunaId: userId,
                    perusahaanId: comp.id,
                    roleEnum: 'ADMIN', // creator defaults to ADMIN
                    isAktif: true,
                    isDefault: true
                }
            });

            return comp;
        });

        // Assign initial package
        try {
            const paket = await prisma.paketFitur.findFirst({ where: { tier: tier as TierPaket } });
            if (paket) {
                await prisma.perusahaanPaket.create({
                    data: {
                        perusahaanId: company.id,
                        paketId: paket.id,
                        tanggalMulai: new Date(),
                        isAktif: true
                    }
                });
            }
        } catch (e) {
            console.warn('Failed to assign initial package:', e);
        }

        res.status(201).json(company);
    } catch (error: unknown) {
        if (error instanceof ZodError) {
            return res.status(400).json({ message: error.errors[0].message });
        }
        console.error(error);
        res.status(500).json({ message: 'Gagal membuat perusahaan' });
    }
};

export const updateCompany = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const { id } = req.params;
        const validatedData = updateCompanySchema.parse(req.body);
        const userId = authReq.user.id;

        // Verify ownership
        const companyExists = await prisma.perusahaan.findFirst({
            where: { id: String(id), aksesPengguna: { some: { penggunaId: userId } } }
        });

        if (!companyExists) {
            return res.status(404).json({ message: 'Perusahaan tidak ditemukan' });
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { tier: _, ...updateData } = validatedData;
        const updatedCompany = await prisma.perusahaan.update({
            where: { id: String(id) },
            data: updateData
        });

        res.json(updatedCompany);
    } catch (error: unknown) {
        if (error instanceof ZodError) {
            return res.status(400).json({ message: error.errors[0].message });
        }
        res.status(500).json({ message: 'Gagal memperbarui perusahaan' });
    }
};

export const deleteCompany = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const { id } = req.params;
        const userId = authReq.user.id;

        const count = await prisma.perusahaan.count({
            where: { aksesPengguna: { some: { penggunaId: userId } } }
        });

        if (count <= 1) {
            return res.status(400).json({ message: 'Tidak dapat menghapus satu-satunya perusahaan Anda' });
        }

        const company = await prisma.perusahaan.findFirst({
            where: { id: String(id), aksesPengguna: { some: { penggunaId: userId } } }
        });

        if (!company) {
            return res.status(404).json({ message: 'Perusahaan tidak ditemukan' });
        }

        await prisma.perusahaan.delete({ where: { id: String(id) } });

        res.json({ message: 'Perusahaan berhasil dihapus' });
    } catch (error: unknown) {
        console.error(error);
        res.status(500).json({ message: 'Gagal menghapus perusahaan' });
    }
};

export const updateSettings = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const { id } = req.params;
        const validatedData = settingsSchema.parse(req.body);
        const userId = authReq.user.id;

        const company = await prisma.perusahaan.findFirst({
            where: { id: String(id), aksesPengguna: { some: { penggunaId: userId } } }
        });

        if (!company) {
            return res.status(404).json({ message: 'Perusahaan tidak ditemukan' });
        }

        const updatedCompany = await prisma.perusahaan.update({
            where: { id: String(id) },
            data: validatedData
        });

        res.json(updatedCompany);
    } catch (error: unknown) {
        if (error instanceof ZodError) {
            return res.status(400).json({ message: error.errors[0].message });
        }
        res.status(500).json({ message: 'Gagal memperbarui pengaturan' });
    }
};

export const getWarehouses = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId;

        if (!perusahaanId) {
            return res.status(400).json({ message: 'Context perusahaan tidak ditemukan' });
        }

        const warehouses = await prisma.gudang.findMany({
            where: {
                cabang: {
                    perusahaanId: perusahaanId
                }
            },
            include: {
                cabang: {
                    select: { nama: true }
                }
            },
            orderBy: { nama: 'asc' }
        });

        res.json(warehouses);
    } catch (error: unknown) {
        console.error('Get Warehouses Error:', error);
        res.status(500).json({ message: 'Gagal mengambil daftar gudang' });
    }
};
export const getBranches = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId;

        if (!perusahaanId) {
            return res.status(400).json({ message: 'Context perusahaan tidak ditemukan' });
        }

        const branches = await prisma.cabang.findMany({
            where: { perusahaanId },
            orderBy: { nama: 'asc' }
        });

        res.json(branches);
    } catch (error: unknown) {
        console.error('Get Branches Error:', error);
        res.status(500).json({ message: 'Gagal mengambil daftar cabang' });
    }
};
