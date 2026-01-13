
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../../lib/prisma';
import { TipeAkun, KategoriAset } from '@prisma/client';

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId;

        if (!perusahaanId) {
            return res.status(400).json({ message: 'Context perusahaan tidak ditemukan' });
        }

        // 1. Calculate Revenue (PENDAPATAN) - Normal Balance: CREDIT
        const revenueAgg = await prisma.jurnalDetail.aggregate({
            _sum: {
                kredit: true,
                debit: true
            },
            where: {
                jurnal: {
                    perusahaanId,
                    isPosted: true
                },
                akun: {
                    tipe: {
                        in: [TipeAkun.PENDAPATAN, TipeAkun.PENDAPATAN_KOMPREHENSIF_LAIN]
                    }
                }
            }
        });
        const revenue = Number(revenueAgg._sum.kredit || 0) - Number(revenueAgg._sum.debit || 0);

        // 2. Calculate Expenses (BEBAN) - Normal Balance: DEBIT
        const expenseAgg = await prisma.jurnalDetail.aggregate({
            _sum: {
                debit: true,
                kredit: true
            },
            where: {
                jurnal: {
                    perusahaanId,
                    isPosted: true
                },
                akun: {
                    tipe: TipeAkun.BEBAN
                }
            }
        });
        const expense = Number(expenseAgg._sum.debit || 0) - Number(expenseAgg._sum.kredit || 0);

        // 3. Net Profit
        const netProfit = revenue - expense;

        // 4. Pending Approvals (Voucher)
        const pendingApprovals = await prisma.voucher.count({
            where: {
                perusahaanId,
                status: 'MENUNGGU_PERSETUJUAN'
            }
        });

        // 5. Active Users
        const activeUsers = await prisma.aksesPengguna.count({
            where: {
                perusahaanId,
                isAktif: true
            }
        });

        // 6. Cash Balance
        const cashAgg = await prisma.jurnalDetail.aggregate({
            _sum: {
                debit: true,
                kredit: true
            },
            where: {
                jurnal: {
                    perusahaanId,
                    isPosted: true
                },
                akun: {
                    kategoriAset: KategoriAset.KAS_DAN_SETARA_KAS
                }
            }
        });
        const cashBalance = Number(cashAgg._sum.debit || 0) - Number(cashAgg._sum.kredit || 0);

        res.json({
            revenue,
            expense,
            netProfit,
            pendingApprovals,
            activeUsers,
            cashBalance
        });

    } catch (error: unknown) {
        console.error('Dashboard Stats Error:', error);
        const message = error instanceof Error ? error.message : 'Gagal memuat statistik dashboard';
        res.status(500).json({
            message: 'Gagal memuat statistik dashboard',
            debug: message
        });
    }
};
