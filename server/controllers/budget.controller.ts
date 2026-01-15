import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import { createBudgetSchema, updateBudgetSchema, budgetQuerySchema } from '../validators/budget.validator';
import { Prisma, Budget, BudgetDetail } from '@prisma/client';

interface BudgetWithDetails extends Budget {
    detail: BudgetDetail[];
}

export const getBudgets = async (req: Request, res: Response) => {
    try {
        const { perusahaanId, tahun, status, tipe } = budgetQuerySchema.parse(req.query);

        const where: Prisma.BudgetWhereInput = {};
        if (perusahaanId) where.perusahaanId = perusahaanId;
        if (tahun) where.tahun = parseInt(tahun);
        if (status) where.status = status;
        if (tipe) where.tipe = tipe;

        const budgets = await prisma.budget.findMany({
            where,
            include: {
                departemen: { select: { nama: true } },
                proyek: { select: { namaProyek: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(budgets);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Gagal mengambil data budget';
        console.error('Get Budgets Error:', error);
        res.status(400).json({ message });
    }
};

export const getBudgetById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const budget = await prisma.budget.findUnique({
            where: { id: id as string },
            include: {
                detail: {
                    include: {
                        akun: { select: { kodeAkun: true, namaAkun: true } }
                    },
                    orderBy: { periode: 'asc' }
                },
                departemen: true,
                proyek: true,
                revisi: { orderBy: { createdAt: 'desc' } }
            }
        });

        if (!budget) {
            return res.status(404).json({ message: 'Budget tidak ditemukan' });
        }

        // Logic for Real-time Realization could be injected here or handled separately
        // For now, returning stored values from DB which should be updated periodically or on request

        res.json(budget);
    } catch (error: unknown) {
        console.error('Get Budget By ID Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createBudget = async (req: Request, res: Response) => {
    try {
        const perusahaanId = req.headers['x-perusahaan-id'] as string;
        if (!perusahaanId) return res.status(400).json({ message: 'Perusahaan ID diperlukan' });

        const validatedData = createBudgetSchema.parse(req.body);

        const totalBudget = validatedData.details.reduce((sum: number, item) => sum + item.jumlahBudget, 0);

        const budget = await prisma.budget.create({
            data: {
                perusahaanId,
                kode: validatedData.kode,
                nama: validatedData.nama,
                tahun: validatedData.tahun,
                tipe: validatedData.tipe,
                tanggalMulai: new Date(validatedData.tanggalMulai),
                tanggalAkhir: new Date(validatedData.tanggalAkhir),
                departemenId: validatedData.departemenId,
                proyekId: validatedData.proyekId,
                deskripsi: validatedData.deskripsi,
                totalBudget,
                status: 'DRAFT',
                detail: {
                    create: validatedData.details.map(d => ({
                        akunId: d.akunId,
                        periode: new Date(d.periode),
                        bulan: new Date(d.periode).getMonth() + 1,
                        jumlahBudget: d.jumlahBudget,
                        keterangan: d.keterangan,
                        departemenId: validatedData.departemenId
                    }))
                }
            }
        });

        res.status(201).json(budget);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Gagal membuat budget';
        console.error('Create Budget Error:', error);
        res.status(400).json({ message });
    }
};

export const updateBudget = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const validatedData = updateBudgetSchema.parse(req.body);

        const existingBudget = await prisma.budget.findUnique({
            where: { id: id as string },
            include: { detail: true }
        });

        if (!existingBudget) return res.status(404).json({ message: 'Budget tidak ditemukan' });
        if (existingBudget.status === 'APPROVED' || existingBudget.status === 'CLOSED') {
            return res.status(400).json({ message: 'Budget yang sudah disetujui atau ditutup tidak dapat diubah' });
        }

        const result = await prisma.$transaction(async (tx) => {
            // Update details if provided
            if (validatedData.details) {
                // Simplified: delete all existing and recreating
                await tx.budgetDetail.deleteMany({ where: { budgetId: id } });

                const totalBudget = validatedData.details.reduce((sum, item) => sum + item.jumlahBudget, 0);

                return await tx.budget.update({
                    where: { id: id as string },
                    data: {
                        nama: validatedData.nama,
                        deskripsi: validatedData.deskripsi,
                        totalBudget,
                        status: validatedData.status,
                        detail: {
                            create: validatedData.details.map(d => ({
                                akunId: d.akunId,
                                periode: new Date(d.periode),
                                bulan: new Date(d.periode).getMonth() + 1,
                                jumlahBudget: d.jumlahBudget,
                                keterangan: d.keterangan,
                                departemenId: validatedData.departemenId || existingBudget.departemenId
                            }))
                        }
                    }
                });
            }

            return await tx.budget.update({
                where: { id: id as string },
                data: {
                    nama: validatedData.nama,
                    deskripsi: validatedData.deskripsi,
                    status: validatedData.status
                }
            });
        });

        res.json(result);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Gagal mengubah budget';
        console.error('Update Budget Error:', error);
        res.status(400).json({ message });
    }
};

export const deleteBudget = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const budget = await prisma.budget.findUnique({ where: { id: id as string } });

        if (!budget) return res.status(404).json({ message: 'Budget tidak ditemukan' });
        if (budget.status === 'APPROVED' || budget.status === 'AKTIF') {
            return res.status(400).json({ message: 'Budget aktif tidak dapat dihapus' });
        }

        await prisma.budget.delete({ where: { id: id as string } });
        res.json({ message: 'Budget berhasil dihapus' });
    } catch (error: unknown) {
        console.error('Delete Budget Error:', error);
        res.status(500).json({ message: 'Gagal menghapus budget' });
    }
};

/**
 * Recalculate Realization for a Budget
 * Aggregates data from TransaksiDetail
 */
export const calculateBudgetRealization = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const budget = await prisma.budget.findUnique({
            where: { id: id as string },
            include: { detail: true }
        }) as BudgetWithDetails;

        if (!budget) return res.status(404).json({ message: 'Budget tidak ditemukan' });

        const results = await prisma.$transaction(async (tx) => {
            let totalActual = 0;

            for (const detail of budget.detail) {
                // Aggregate actual transactions for this account in this period
                // Assumes monthly budgeting
                const startOfMonth = new Date(detail.periode.getFullYear(), detail.periode.getMonth(), 1);
                const endOfMonth = new Date(detail.periode.getFullYear(), detail.periode.getMonth() + 1, 0, 23, 59, 59);

                const actualTransactions = await tx.transaksiDetail.aggregate({
                    where: {
                        akunId: detail.akunId,
                        transaksi: {
                            perusahaanId: budget.perusahaanId,
                            tanggal: { gte: startOfMonth, lte: endOfMonth },
                            isPosted: true // Only posted transactions
                        }
                    },
                    _sum: {
                        subtotal: true
                    }
                });

                const actualAmount = Number(actualTransactions._sum.subtotal || 0);
                const variance = Number(detail.jumlahBudget) - actualAmount;
                const variancePersentase = Number(detail.jumlahBudget) > 0 ? (variance / Number(detail.jumlahBudget)) * 100 : 0;

                await tx.budgetDetail.update({
                    where: { id: detail.id },
                    data: {
                        jumlahRealisasi: actualAmount,
                        variance: variance,
                        variancePersentase: variancePersentase
                    }
                });

                totalActual += actualAmount;
            }

            const totalVar = Number(budget.totalBudget) - totalActual;
            const pctRealization = Number(budget.totalBudget) > 0 ? (totalActual / Number(budget.totalBudget)) * 100 : 0;

            return await tx.budget.update({
                where: { id: id as string },
                data: {
                    totalRealisasi: totalActual,
                    totalVariance: totalVar,
                    persentaseRealisasi: pctRealization
                }
            });
        });

        res.json(results);
    } catch (error: unknown) {
        console.error('Calculate Realization Error:', error);
        res.status(500).json({ message: 'Gagal menghitung realisasi budget' });
    }
};

/**
 * Get Variance Report for Dashboard
 * Provides overall summary
 */
export const getVarianceReport = async (req: Request, res: Response) => {
    try {
        const perusahaanId = req.headers['x-perusahaan-id'] as string;
        const { tahun } = req.query;

        if (!perusahaanId) return res.status(400).json({ message: 'Perusahaan ID diperlukan' });

        const where: Prisma.BudgetWhereInput = {
            perusahaanId,
            status: 'AKTIF'
        };
        if (tahun) where.tahun = parseInt(tahun as string);

        const budgets = await prisma.budget.findMany({
            where,
            select: {
                id: true,
                nama: true,
                totalBudget: true,
                totalRealisasi: true,
                totalVariance: true,
                persentaseRealisasi: true,
                tipe: true,
                status: true
            }
        });

        const summary = {
            totalPlanned: budgets.reduce((sum: number, b) => sum + Number(b.totalBudget), 0),
            totalActual: budgets.reduce((sum: number, b) => sum + Number(b.totalRealisasi), 0),
            totalVariance: budgets.reduce((sum: number, b) => sum + Number(b.totalVariance), 0),
            count: budgets.length,
            budgets: budgets // List for breakdown
        };

        res.json(summary);
    } catch (error: unknown) {
        console.error('Variance Report Error:', error);
        res.status(500).json({ message: 'Gagal memuat laporan varians' });
    }
};
