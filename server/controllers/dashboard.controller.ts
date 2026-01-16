
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../../lib/prisma';
import { TipeAkun, KategoriAset } from '@prisma/client';

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId;
        const { cabangId } = req.query;

        if (!perusahaanId) {
            return res.status(400).json({ message: 'Context perusahaan tidak ditemukan' });
        }

        // Create explicit where for journals
        const journalWhere: any = {
            perusahaanId,
            isPosted: true
        };
        if (cabangId) {
            journalWhere.cabangId = cabangId as string;
        }

        // 1. Calculate Revenue (PENDAPATAN) - Normal Balance: CREDIT
        const revenueAgg = await prisma.jurnalDetail.aggregate({
            _sum: {
                kredit: true,
                debit: true
            },
            where: {
                jurnal: journalWhere,
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
                jurnal: journalWhere,
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
                cabangId: (cabangId as string) || undefined,
                status: 'MENUNGGU_PERSETUJUAN'
            }
        });

        // 5. Active Users & Breakdown
        const activeUsersCount = await prisma.aksesPengguna.count({
            where: {
                perusahaanId,
                isAktif: true
            }
        });

        const usersByRole = await prisma.aksesPengguna.groupBy({
            by: ['roleEnum'],
            where: {
                perusahaanId,
                isAktif: true
            },
            _count: {
                _all: true
            }
        });

        // Format: { ADMIN: 2, STAFF: 5 }
        const roleBreakdown = usersByRole.reduce((acc, curr) => {
            acc[curr.roleEnum] = curr._count._all;
            return acc;
        }, {} as Record<string, number>);

        // 6. Cash Balance
        const cashAgg = await prisma.jurnalDetail.aggregate({
            _sum: {
                debit: true,
                kredit: true
            },
            where: {
                jurnal: journalWhere,
                akun: {
                    kategoriAset: KategoriAset.KAS_DAN_SETARA_KAS
                }
            }
        });
        const cashBalance = Number(cashAgg._sum.debit || 0) - Number(cashAgg._sum.kredit || 0);

        // 7. Active Period
        const activePeriod = await prisma.periodeAkuntansi.findFirst({
            where: {
                perusahaanId,
                status: 'TERBUKA'
            },
            orderBy: [{ tahun: 'desc' }, { bulan: 'desc' }]
        });

        res.json({
            revenue,
            expense,
            netProfit,
            pendingApprovals,
            activeUsers: activeUsersCount,
            usersByRole: roleBreakdown,
            cashBalance,
            activePeriod: activePeriod ? {
                nama: activePeriod.nama,
                tahun: activePeriod.tahun,
                bulan: activePeriod.bulan
            } : null
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
