import { Request, Response } from 'express';
import { createCompanySchema, updateCompanySchema, settingsSchema, inviteUserSchema } from '../validators/company.validator';
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

        const [companiesRes, total] = await Promise.all([
            prisma.perusahaan.findMany({
                where: {
                    aksesPengguna: {
                        some: { penggunaId: userId }
                    }
                },
                include: {
                    perusahaanPakets: {
                        where: { isAktif: true },
                        include: { paket: true },
                        take: 1
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

        const companies = companiesRes.map(c => ({
            ...c,
            tier: c.perusahaanPakets[0]?.paket?.tier || 'UMKM'
        }));

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

export const createBranch = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId;
        const data = req.body;

        if (!perusahaanId) return res.status(400).json({ message: 'Perusahaan tidak ditemukan' });

        const branch = await prisma.cabang.create({
            data: {
                ...data,
                perusahaanId
            }
        });

        res.status(201).json(branch);
    } catch (error) {
        console.error('Create Branch Error:', error);
        res.status(500).json({ message: 'Gagal membuat cabang' });
    }
};

export const updateBranch = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId;
        const { branchId } = req.params;
        const data = req.body;

        const branch = await prisma.cabang.update({
            where: { id: branchId, perusahaanId },
            data
        });

        res.json(branch);
    } catch (error) {
        console.error('Update Branch Error:', error);
        res.status(500).json({ message: 'Gagal memperbarui cabang' });
    }
};

export const deleteBranch = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId;
        const { branchId } = req.params;

        await prisma.cabang.delete({
            where: { id: branchId, perusahaanId }
        });

        res.json({ message: 'Cabang berhasil dihapus' });
    } catch (error) {
        console.error('Delete Branch Error:', error);
        res.status(500).json({ message: 'Gagal menghapus cabang' });
    }
};

export const getCompanyUsers = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const { id } = req.params;
        const perusahaanId = String(id);

        // Verify requestor has access to this company
        const requesterAccess = await prisma.aksesPengguna.findFirst({
            where: {
                penggunaId: authReq.user.id,
                perusahaanId: perusahaanId,
                isAktif: true
            }
        });

        if (!requesterAccess) {
            return res.status(403).json({ message: 'Anda tidak memiliki akses ke perusahaan ini' });
        }

        const users = await prisma.aksesPengguna.findMany({
            where: {
                perusahaanId: perusahaanId,
                isAktif: true
            },
            include: {
                pengguna: {
                    select: {
                        id: true,
                        namaLengkap: true,
                        email: true,
                        username: true,
                        lastLogin: true
                    }
                }
            }
        });

        const formattedUsers = users.map(u => ({
            id: u.pengguna.id,
            nama: u.pengguna.namaLengkap,
            email: u.pengguna.email,
            role: u.roleEnum,
            lastLogin: u.pengguna.lastLogin
        }));

        res.json(formattedUsers);
    } catch (error) {
        console.error('Get Company Users Error:', error);
        res.status(500).json({ message: 'Gagal mengambil daftar pengguna' });
    }
};

export const addUserToCompany = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const { id } = req.params;
        const validatedBody = inviteUserSchema.parse(req.body);

        // Check if user exists in system
        const userToAdd = await prisma.pengguna.findUnique({
            where: { email: validatedBody.email }
        });

        if (!userToAdd) {
            return res.status(404).json({ message: 'User dengan email tersebut tidak ditemukan di sistem.' });
        }

        // Check if already has access
        const existingAccess = await prisma.aksesPengguna.findFirst({
            where: {
                penggunaId: userToAdd.id,
                perusahaanId: String(id)
            }
        });

        if (existingAccess) {
            if (existingAccess.isAktif) {
                return res.status(400).json({ message: 'User sudah terdaftar di perusahaan ini.' });
            } else {
                // Reactivate
                await prisma.aksesPengguna.update({
                    where: { id: existingAccess.id },
                    data: { isAktif: true, roleEnum: validatedBody.role as any }
                });
                return res.json({ message: 'User berhasil diaktifkan kembali.' });
            }
        }

        // Create new access
        await prisma.aksesPengguna.create({
            data: {
                penggunaId: userToAdd.id,
                perusahaanId: String(id),
                roleEnum: validatedBody.role as any,
                isAktif: true
            }
        });

        res.status(201).json({ message: 'User berhasil ditambahkan.' });
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({ message: error.errors[0].message });
        }
        console.error('Add User Error:', error);
        res.status(500).json({ message: 'Gagal menambahkan user' });
    }
};

export const removeUserFromCompany = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const { id, userId } = req.params;

        if (userId === authReq.user.id) {
            return res.status(400).json({ message: 'Anda tidak dapat menghapus diri sendiri.' });
        }

        const access = await prisma.aksesPengguna.findFirst({
            where: {
                perusahaanId: String(id),
                penggunaId: userId
            }
        });

        if (!access) {
            return res.status(404).json({ message: 'User tidak ditemukan di perusahaan ini.' });
        }

        await prisma.aksesPengguna.delete({
            where: { id: access.id }
        });

        res.json({ message: 'User berhasil dihapus aksesnya.' });
    } catch (error) {
        console.error('Remove User Error:', error);
        res.status(500).json({ message: 'Gagal menghapus user' });
    }
};
