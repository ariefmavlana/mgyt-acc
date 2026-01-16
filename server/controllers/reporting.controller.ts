import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../../lib/prisma';
import { Prisma, TipeAkun } from '@prisma/client';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { startOfYear, endOfDay } from 'date-fns';
import { ReportingService } from '../services/reporting.service';
import { ReminderService } from '../services/reminder.service';
import { cacheService } from '../services/cache.service';

// --- HELPER TYPES & FUNCTIONS ---

interface ReportParams {
    startDate?: string;
    endDate?: string;
    perusahaanId: string;
    cabangId?: string;
}

// Helper to get summation of journals by account type
const getAccountBalances = async (params: ReportParams, types: TipeAkun[]) => {
    const where: Prisma.ChartOfAccountsWhereInput = {
        perusahaanId: params.perusahaanId,
        tipe: { in: types }
    };

    const accounts = await prisma.chartOfAccounts.findMany({
        where,
        select: {
            id: true,
            kodeAkun: true,
            namaAkun: true,
            tipe: true
        },
        orderBy: { kodeAkun: 'asc' }
    });

    const accountIds = accounts.map((account: { id: string }) => account.id);

    // BATCH QUERY: Get all sums in one go
    const aggregates = await prisma.jurnalDetail.groupBy({
        by: ['akunId'],
        where: {
            akunId: { in: accountIds },
            jurnal: {
                tanggal: {
                    lte: params.endDate ? endOfDay(new Date(params.endDate)) : undefined
                },
                cabangId: params.cabangId
            }
        },
        _sum: {
            debit: true,
            kredit: true
        }
    });

    const aggregateMap = aggregates.reduce((accumulator: Record<string, { debit: number, credit: number }>, currentAggregation: { akunId: string, _sum: { debit: Prisma.Decimal | number | null, kredit: Prisma.Decimal | number | null } }) => {
        accumulator[currentAggregation.akunId] = {
            debit: Number(currentAggregation._sum.debit || 0),
            credit: Number(currentAggregation._sum.kredit || 0)
        };
        return accumulator;
    }, {} as Record<string, { debit: number, credit: number }>);

    return accounts.map((account: { id: string, kodeAkun: string, namaAkun: string, tipe: TipeAkun }) => {
        const { debit = 0, credit = 0 } = aggregateMap[account.id] || {};

        let saldo = 0;
        // Normal Balance Logic
        if (['ASET', 'BEBAN'].includes(account.tipe)) {
            saldo = debit - credit;
        } else {
            saldo = credit - debit;
        }

        return {
            ...account,
            saldo
        };
    }).filter((account: { saldo: number }) => Math.abs(account.saldo) > 0);
};

// Calculate Net Income (Laba/Rugi Berjalan) for precise dates
const calculateNetIncome = async (startDate: Date, endDate: Date, perusahaanId: string, cabangId?: string) => {
    const journalDetails = await prisma.jurnalDetail.findMany({
        where: {
            jurnal: {
                perusahaanId,
                tanggal: {
                    gte: startDate,
                    lte: endDate
                },
                cabangId
            },
            akun: {
                tipe: { in: ['PENDAPATAN', 'BEBAN'] }
            }
        },
        include: { akun: true }
    });

    let revenue = 0;
    let expense = 0;

    journalDetails.forEach((journalDetail: Prisma.JurnalDetailGetPayload<{ include: { akun: true } }>) => {
        const amount = Number(journalDetail.kredit) - Number(journalDetail.debit); // Credit is positive for Revenue
        if (journalDetail.akun.tipe === 'PENDAPATAN') revenue += amount; // Rev: Credit - Debit
        if (journalDetail.akun.tipe === 'BEBAN') expense += (Number(journalDetail.debit) - Number(journalDetail.kredit)); // Exp: Debit - Credit
    });

    return revenue - expense;
};


// --- SHARED DATA FETCHERS ---

const fetchBalanceSheet = async (perusahaanId: string, inputDate?: string, cabangId?: string) => {
    const end = inputDate ? String(inputDate) : new Date().toISOString();
    const startOfCurrentYear = startOfYear(new Date(end)).toISOString();

    const assets = await getAccountBalances({ endDate: end, perusahaanId, cabangId }, ['ASET']);
    const liabilities = await getAccountBalances({ endDate: end, perusahaanId, cabangId }, ['LIABILITAS']);
    const equity = await getAccountBalances({ endDate: end, perusahaanId, cabangId }, ['EKUITAS']);

    const currentEarnings = await calculateNetIncome(
        new Date(startOfCurrentYear),
        endOfDay(new Date(end)),
        perusahaanId,
        cabangId
    );

    const totalAssets = assets.reduce((total: number, accountBalance: { saldo: number }) => total + accountBalance.saldo, 0);
    const totalLiabilities = liabilities.reduce((total: number, accountBalance: { saldo: number }) => total + accountBalance.saldo, 0);
    let totalEquity = equity.reduce((total: number, accountBalance: { saldo: number }) => total + accountBalance.saldo, 0);
    totalEquity += currentEarnings;

    return {
        assets, liabilities, equity, currentEarnings,
        summary: { totalAssets, totalLiabilities, totalEquity, balanceCheck: totalAssets - (totalLiabilities + totalEquity) }
    };
};

const fetchIncomeStatement = async (perusahaanId: string, startDate?: string, endDate?: string, cabangId?: string) => {
    const start = startDate ? new Date(String(startDate)) : startOfYear(new Date());
    const end = endDate ? endOfDay(new Date(String(endDate))) : endOfDay(new Date());

    const accounts = await prisma.chartOfAccounts.findMany({
        where: {
            perusahaanId,
            tipe: { in: ['PENDAPATAN', 'BEBAN'] }
        },
        select: { id: true, kodeAkun: true, namaAkun: true, tipe: true }
    });

    const accountIds = accounts.map((account: { id: string }) => account.id);

    // BATCH QUERY: Aggregate all at once
    const aggregates = await prisma.jurnalDetail.groupBy({
        by: ['akunId'],
        where: {
            akunId: { in: accountIds },
            jurnal: {
                perusahaanId,
                tanggal: { gte: start, lte: end },
                cabangId
            }
        },
        _sum: { debit: true, kredit: true }
    });

    const aggregateMap = aggregates.reduce((accumulator: Record<string, { debit: number, credit: number }>, currentAggregation: { akunId: string, _sum: { debit: Prisma.Decimal | number | null, kredit: Prisma.Decimal | number | null } }) => {
        accumulator[currentAggregation.akunId] = {
            debit: Number(currentAggregation._sum.debit || 0),
            credit: Number(currentAggregation._sum.kredit || 0)
        };
        return accumulator;
    }, {} as Record<string, { debit: number, credit: number }>);

    const revenues: (Prisma.ChartOfAccountsGetPayload<{ select: { id: true, kodeAkun: true, namaAkun: true, tipe: true } }> & { saldo: number })[] = [];
    const expenses: (Prisma.ChartOfAccountsGetPayload<{ select: { id: true, kodeAkun: true, namaAkun: true, tipe: true } }> & { saldo: number })[] = [];

    accounts.forEach((account: { id: string, kodeAkun: string, namaAkun: string, tipe: TipeAkun }) => {
        const { debit = 0, credit = 0 } = aggregateMap[account.id] || {};
        if (debit === 0 && credit === 0) return;

        if (account.tipe === 'PENDAPATAN') {
            revenues.push({ ...account, saldo: credit - debit });
        } else {
            expenses.push({ ...account, saldo: debit - credit });
        }
    });

    const totalRevenue = revenues.reduce((total: number, revenueAccount: { saldo: number }) => total + revenueAccount.saldo, 0);
    const totalExpense = expenses.reduce((total: number, expenseAccount: { saldo: number }) => total + expenseAccount.saldo, 0);

    return {
        revenue: revenues,
        expense: expenses,
        summary: {
            totalRevenue,
            totalExpense,
            netIncome: totalRevenue - totalExpense
        },
        period: { start, end }
    };
    return {
        revenue: revenues,
        expense: expenses,
        summary: {
            totalRevenue,
            totalExpense,
            netIncome: totalRevenue - totalExpense
        },
        period: { start, end }
    };
};

const fetchCashFlow = async (perusahaanId: string, startDate?: string, endDate?: string, cabangId?: string) => {
    const start = startDate ? new Date(String(startDate)) : startOfYear(new Date());
    const end = endDate ? endOfDay(new Date(String(endDate))) : endOfDay(new Date());

    const cashAccounts = await prisma.chartOfAccounts.findMany({
        where: {
            perusahaanId,
            kategoriAset: 'KAS_DAN_SETARA_KAS'
        },
        select: { id: true }
    });

    const cashAccountIds = cashAccounts.map((account: { id: string }) => account.id);

    const cashMovements = await prisma.jurnalDetail.findMany({
        where: {
            akunId: { in: cashAccountIds },
            jurnal: {
                perusahaanId,
                tanggal: { gte: start, lte: end },
                cabangId: cabangId as string
            }
        },
        include: {
            jurnal: {
                include: {
                    detail: {
                        include: { akun: true }
                    }
                }
            }
        }
    });

    let operatingCashFlow = 0;
    let investingCashFlow = 0;
    let financingCashFlow = 0;

    for (const cashMovement of cashMovements) {
        const isDebit = Number(cashMovement.debit) > 0;
        const amount = isDebit ? Number(cashMovement.debit) : -Number(cashMovement.kredit);

        const contraEntry = cashMovement.jurnal.detail.find((detail: { akunId: string, akun: { tipe: string } }) => !cashAccountIds.includes(detail.akunId));

        if (contraEntry) {
            const type = contraEntry.akun.tipe;
            if (['ASET_TETAP', 'INVESTASI_JANGKA_PANJANG', 'PROPERTI_INVESTASI'].includes(type)) {
                investingCashFlow += amount;
            } else if (['LIABILITAS_JANGKA_PANJANG', 'EKUITAS'].includes(type)) {
                financingCashFlow += amount;
            } else {
                operatingCashFlow += amount;
            }
        } else {
            operatingCashFlow += amount;
        }
    }

    return {
        operating: operatingCashFlow,
        investing: investingCashFlow,
        financing: financingCashFlow,
        netChange: operatingCashFlow + investingCashFlow + financingCashFlow,
        period: { start, end }
    };
};

const fetchTrialBalance = async (perusahaanId: string, date?: string, cabangId?: string) => {
    const asOfDate = date ? endOfDay(new Date(String(date))) : endOfDay(new Date());

    const accounts = await prisma.chartOfAccounts.findMany({
        where: { perusahaanId },
        include: {
            jurnalDetail: {
                where: {
                    jurnal: {
                        tanggal: { lte: asOfDate },
                        cabangId: cabangId as string
                    }
                },
                select: { debit: true, kredit: true }
            }
        },
        orderBy: { kodeAkun: 'asc' }
    });

    const report = accounts.map((account: Prisma.ChartOfAccountsGetPayload<{ include: { jurnalDetail: true } }>) => {
        const totalDebit = account.jurnalDetail.reduce((total: number, journalDetail: { debit: Prisma.Decimal | number }) => total + Number(journalDetail.debit), 0);
        const totalCredit = account.jurnalDetail.reduce((total: number, journalDetail: { kredit: Prisma.Decimal | number }) => total + Number(journalDetail.kredit), 0);

        let finalDebit = 0;
        let finalCredit = 0;

        if (totalDebit >= totalCredit) {
            finalDebit = totalDebit - totalCredit;
        } else {
            finalCredit = totalCredit - totalDebit;
        }

        return {
            id: account.id,
            kode: account.kodeAkun,
            nama: account.namaAkun,
            debit: finalDebit,
            kredit: finalCredit
        };
    }).filter((row: { debit: number, kredit: number }) => row.debit > 0 || row.kredit > 0);

    const totalDebit = report.reduce((total: number, row: { debit: number }) => total + row.debit, 0);
    const totalCredit = report.reduce((total: number, row: { kredit: number }) => total + row.kredit, 0);

    return {
        data: report,
        summary: {
            totalDebit,
            totalCredit,
            isBalanced: Math.abs(totalDebit - totalCredit) < 1
        }
    };
};

// --- CONTROLLERS ---

export const getBalanceSheet = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const { endDate, cabangId } = req.query;
        const perusahaanId = authReq.currentCompanyId!;
        const end = endDate ? String(endDate) : new Date().toISOString();

        const cacheKey = `report:bs:${perusahaanId}:${cabangId || 'all'}:${end.slice(0, 10)}`;
        const cached = await cacheService.get(cacheKey);
        if (cached) {
            res.setHeader('X-Cache', 'HIT');
            return res.json(cached);
        }

        const result = await fetchBalanceSheet(perusahaanId, end, cabangId as string);

        await cacheService.set(cacheKey, result, 900);
        res.setHeader('X-Cache', 'MISS');
        res.json(result);
    } catch (error: unknown) {
        console.error('Balance Sheet Error:', error);
        res.status(500).json({ message: 'Gagal menghasilkan Neraca' });
    }
};

export const getIncomeStatement = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const { startDate, endDate, cabangId } = req.query;
        const perusahaanId = authReq.currentCompanyId!;

        const start = startDate ? new Date(String(startDate)) : startOfYear(new Date());
        const end = endDate ? endOfDay(new Date(String(endDate))) : endOfDay(new Date());

        const cacheKey = `report:is:${perusahaanId}:${cabangId || 'all'}:${start.toISOString().slice(0, 10)}:${end.toISOString().slice(0, 10)}`;
        const cached = await cacheService.get(cacheKey);
        if (cached) {
            res.setHeader('X-Cache', 'HIT');
            return res.json(cached);
        }

        const result = await fetchIncomeStatement(perusahaanId, String(startDate), String(endDate), cabangId as string);

        await cacheService.set(cacheKey, result, 900);
        res.setHeader('X-Cache', 'MISS');
        res.json(result);
    } catch (error) {
        console.error('Income Statement Error:', error);
        res.status(500).json({ message: 'Gagal menghasilkan Laba Rugi' });
    }
};

export const getCashFlow = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const { startDate, endDate, cabangId } = req.query;
        const perusahaanId = authReq.currentCompanyId!;

        const start = startDate ? new Date(String(startDate)) : startOfYear(new Date());
        const end = endDate ? endOfDay(new Date(String(endDate))) : endOfDay(new Date());

        const cashAccounts = await prisma.chartOfAccounts.findMany({
            where: {
                perusahaanId,
                kategoriAset: 'KAS_DAN_SETARA_KAS'
            },
            select: { id: true }
        });

        const cashAccountIds = cashAccounts.map((c: { id: string }) => c.id);

        const cashMovements = await prisma.jurnalDetail.findMany({
            where: {
                akunId: { in: cashAccountIds },
                jurnal: {
                    perusahaanId,
                    tanggal: { gte: start, lte: end },
                    cabangId: cabangId as string
                }
            },
            include: {
                jurnal: {
                    include: {
                        detail: {
                            include: { akun: true }
                        }
                    }
                }
            }
        });

        let operatingCashFlow = 0;
        let investingCashFlow = 0;
        let financingCashFlow = 0;

        for (const move of cashMovements) {
            const isDebit = Number(move.debit) > 0;
            const amount = isDebit ? Number(move.debit) : -Number(move.kredit);

            const contraEntry = move.jurnal.detail.find((detail: { akunId: string, akun: { tipe: string } }) => !cashAccountIds.includes(detail.akunId));

            if (contraEntry) {
                const type = contraEntry.akun.tipe;
                if (['ASET_TETAP', 'INVESTASI_JANGKA_PANJANG', 'PROPERTI_INVESTASI'].includes(type)) {
                    investingCashFlow += amount;
                } else if (['LIABILITAS_JANGKA_PANJANG', 'EKUITAS'].includes(type)) {
                    financingCashFlow += amount;
                } else {
                    operatingCashFlow += amount;
                }
            } else {
                operatingCashFlow += amount;
            }
        }

        const result = {
            operating: operatingCashFlow,
            investing: investingCashFlow,
            financing: financingCashFlow,
            netChange: operatingCashFlow + investingCashFlow + financingCashFlow,
            period: { start, end }
        };

        res.json(result);

    } catch (error: unknown) {
        console.error('Cash Flow Error:', error);
        res.status(500).json({ message: 'Gagal menghasilkan Laporan Arus Kas' });
    }
};

export const getTrialBalance = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const { date, cabangId } = req.query;
        const perusahaanId = authReq.currentCompanyId!;

        const result = await fetchTrialBalance(perusahaanId, date as string, cabangId as string);

        res.json(result);

    } catch (error: unknown) {
        console.error('Trial Balance Error:', error);
        res.status(500).json({ message: 'Gagal menghasilkan Neraca Saldo' });
    }
};

export const getGeneralLedger = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const { accountId, startDate, endDate, cabangId } = req.query;
        const perusahaanId = authReq.currentCompanyId!;

        if (!accountId) {
            return res.status(400).json({ message: 'Account ID is required' });
        }

        const start = startDate ? new Date(String(startDate)) : startOfYear(new Date());
        const end = endDate ? endOfDay(new Date(String(endDate))) : endOfDay(new Date());

        // 1. Get Opening Balance (Before Start Date)
        const openingAgg = await prisma.jurnalDetail.aggregate({
            where: {
                akunId: String(accountId),
                jurnal: {
                    perusahaanId,
                    tanggal: { lt: start },
                    cabangId: cabangId as string
                }
            },
            _sum: { debit: true, kredit: true }
        });

        const account = await prisma.chartOfAccounts.findUnique({ where: { id: String(accountId) } });
        if (!account) return res.status(404).json({ message: 'Account not found' });

        const openDebit = Number(openingAgg._sum.debit || 0);
        const openCredit = Number(openingAgg._sum.kredit || 0);
        let openingBalance = 0;

        // Normal Balance Logic for Running Balance
        const isDebitNormal = ['ASET', 'BEBAN'].includes(account.tipe);

        if (isDebitNormal) {
            openingBalance = openDebit - openCredit;
        } else {
            openingBalance = openCredit - openDebit;
        }

        // 2. Get Transactions (In Range)
        const transactions = await prisma.jurnalDetail.findMany({
            where: {
                akunId: String(accountId),
                jurnal: {
                    perusahaanId,
                    tanggal: { gte: start, lte: end },
                    cabangId: cabangId as string
                }
            },
            include: {
                jurnal: true
            },
            orderBy: { jurnal: { tanggal: 'asc' } }
        });

        // 3. Calculate Running Balance
        let currentBalance = openingBalance;
        const lines = transactions.map((transactionDetail: Prisma.JurnalDetailGetPayload<{ include: { jurnal: true } }>) => {
            const debitAmount = Number(transactionDetail.debit);
            const creditAmount = Number(transactionDetail.kredit);

            if (isDebitNormal) {
                currentBalance += (debitAmount - creditAmount);
            } else {
                currentBalance += (creditAmount - debitAmount);
            }

            return {
                date: transactionDetail.jurnal.tanggal,
                ref: transactionDetail.jurnal.nomorJurnal,
                description: transactionDetail.jurnal.deskripsi || transactionDetail.jurnal.nomorJurnal,
                debit: debitAmount,
                credit: creditAmount,
                balance: currentBalance
            };
        });

        res.json({
            account: {
                name: account.namaAkun,
                code: account.kodeAkun,
                type: account.tipe
            },
            period: { start, end },
            openingBalance,
            transactions: lines,
            closingBalance: currentBalance
        });

    } catch (error: unknown) {
        console.error('General Ledger Error:', error);
        res.status(500).json({ message: 'Gagal menghasilkan Buku Besar' });
    }
};

export const exportReport = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
        const { type, format: fileFormat, startDate, endDate, cabangId } = req.body;

        if (fileFormat === 'pdf') {
            const doc = new PDFDocument({ margin: 50 });
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${type}-${Date.now()}.pdf`);
            doc.pipe(res);

            // Title
            doc.fontSize(18).text(`Laporan ${type.replace('-', ' ').toUpperCase()}`, { align: 'center' });
            doc.fontSize(10).text(`Periode: ${startDate || 'Awal'} s/d ${endDate || 'Hari Ini'}`, { align: 'center' });
            doc.moveDown();

            if (type === 'balance-sheet') {
                const data = await fetchBalanceSheet(perusahaanId, endDate, cabangId as string);

                doc.fontSize(14).text('ASET', { underline: true });
                data.assets.forEach((account: { namaAkun: string, saldo: number }) => {
                    doc.fontSize(10).text(account.namaAkun, { continued: true }).text(new Intl.NumberFormat('id-ID').format(account.saldo), { align: 'right' });
                });
                doc.fontSize(12).font('Helvetica-Bold').text(`Total Aset: ${new Intl.NumberFormat('id-ID').format(data.summary.totalAssets)}`, { align: 'right' });
                doc.moveDown();

                doc.fontSize(14).font('Helvetica').text('LIABILITAS', { underline: true });
                data.liabilities.forEach((liabilityAccount: { namaAkun: string, saldo: number }) => {
                    doc.fontSize(10).text(liabilityAccount.namaAkun, { continued: true }).text(new Intl.NumberFormat('id-ID').format(liabilityAccount.saldo), { align: 'right' });
                });
                doc.fontSize(12).font('Helvetica-Bold').text(`Total Liabilitas: ${new Intl.NumberFormat('id-ID').format(data.summary.totalLiabilities)}`, { align: 'right' });
                doc.moveDown();

                doc.fontSize(14).font('Helvetica').text('EKUITAS', { underline: true });
                data.equity.forEach((equityAccount: { namaAkun: string, saldo: number }) => {
                    doc.fontSize(10).text(equityAccount.namaAkun, { continued: true }).text(new Intl.NumberFormat('id-ID').format(equityAccount.saldo), { align: 'right' });
                });
                doc.fontSize(10).text('Laba Tahun Berjalan', { continued: true }).text(new Intl.NumberFormat('id-ID').format(data.currentEarnings), { align: 'right' });
                doc.fontSize(12).font('Helvetica-Bold').text(`Total Ekuitas: ${new Intl.NumberFormat('id-ID').format(data.summary.totalEquity)}`, { align: 'right' });
            } else if (type === 'income-statement') {
                const data = await fetchIncomeStatement(perusahaanId, startDate, endDate, cabangId as string);

                doc.fontSize(14).text('PENDAPATAN', { underline: true });
                data.revenue.forEach((revenueAccount: { namaAkun: string, saldo: number }) => {
                    doc.fontSize(10).text(revenueAccount.namaAkun, { continued: true }).text(new Intl.NumberFormat('id-ID').format(revenueAccount.saldo), { align: 'right' });
                });
                doc.fontSize(12).font('Helvetica-Bold').text(`Total Pendapatan: ${new Intl.NumberFormat('id-ID').format(data.summary.totalRevenue)}`, { align: 'right' });
                doc.moveDown();

                doc.fontSize(14).font('Helvetica').text('BEBAN', { underline: true });
                data.expense.forEach((expenseAccount: { namaAkun: string, saldo: number }) => {
                    doc.fontSize(10).text(expenseAccount.namaAkun, { continued: true }).text(new Intl.NumberFormat('id-ID').format(expenseAccount.saldo), { align: 'right' });
                });
                doc.fontSize(12).font('Helvetica-Bold').text(`Total Beban: ${new Intl.NumberFormat('id-ID').format(data.summary.totalExpense)}`, { align: 'right' });
                doc.moveDown();

                doc.fontSize(16).text(`LABA BERSIH: ${new Intl.NumberFormat('id-ID').format(data.summary.netIncome)}`, { align: 'right' });
            } else if (type === 'cash-flow') {
                const data = await fetchCashFlow(perusahaanId, startDate, endDate, cabangId as string);

                doc.fontSize(14).text('ARUS KAS OPERASIONAL', { underline: true });
                doc.fontSize(12).text(`Total: ${new Intl.NumberFormat('id-ID').format(data.operating)}`, { align: 'right' });
                doc.moveDown();

                doc.fontSize(14).text('ARUS KAS INVESTASI', { underline: true });
                doc.fontSize(12).text(`Total: ${new Intl.NumberFormat('id-ID').format(data.investing)}`, { align: 'right' });
                doc.moveDown();

                doc.fontSize(14).text('ARUS KAS PENDANAAN', { underline: true });
                doc.fontSize(12).text(`Total: ${new Intl.NumberFormat('id-ID').format(data.financing)}`, { align: 'right' });
                doc.moveDown();

                doc.fontSize(16).text(`KENAIKAN BERSIH KAS: ${new Intl.NumberFormat('id-ID').format(data.netChange)}`, { align: 'right' });
            } else if (type === 'trial-balance') {
                const data = await fetchTrialBalance(perusahaanId, endDate, cabangId as string);

                doc.fontSize(10);
                doc.text('Kode', 50, doc.y, { continued: true, width: 80 });
                doc.text('Nama Akun', { continued: true, width: 200 });
                doc.text('Debit', { continued: true, width: 100, align: 'right' });
                doc.text('Kredit', { width: 100, align: 'right' });
                doc.moveDown();

                data.data.forEach((row: { kode: string, nama: string, debit: number, kredit: number }) => {
                    doc.text(row.kode, 50, doc.y, { continued: true, width: 80 });
                    doc.text(row.nama, { continued: true, width: 200 });
                    doc.text(new Intl.NumberFormat('id-ID').format(row.debit), { continued: true, width: 100, align: 'right' });
                    doc.text(new Intl.NumberFormat('id-ID').format(row.kredit), { width: 100, align: 'right' });
                });

                doc.moveDown();
                doc.font('Helvetica-Bold');
                doc.text('TOTAL', 50, doc.y, { continued: true, width: 280 });
                doc.text(new Intl.NumberFormat('id-ID').format(data.summary.totalDebit), { continued: true, width: 100, align: 'right' });
                doc.text(new Intl.NumberFormat('id-ID').format(data.summary.totalCredit), { width: 100, align: 'right' });
            } else if (type === 'general-ledger') {
                doc.text('Silakan export Buku Besar dari halaman detail akun untuk data yang lebih spesifik.', { align: 'center' });
            }

            doc.end();
            return;
        }

        if (fileFormat === 'excel') {
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet(type);

            sheet.getColumn(1).width = 40;
            sheet.getColumn(2).width = 20;

            if (type === 'balance-sheet') {
                const data = await fetchBalanceSheet(perusahaanId, endDate, cabangId as string);
                sheet.addRow(['NERACA', endDate]);

                sheet.addRow(['ASET']);
                data.assets.forEach((account: { namaAkun: string, saldo: number }) => sheet.addRow([account.namaAkun, account.saldo]));
                sheet.addRow(['TOTAL ASET', data.summary.totalAssets]).font = { bold: true };

                sheet.addRow(['']);
                sheet.addRow(['LIABILITAS']);
                data.liabilities.forEach((liabilityAccount: { namaAkun: string, saldo: number }) => sheet.addRow([liabilityAccount.namaAkun, liabilityAccount.saldo]));
                sheet.addRow(['TOTAL LIABILITAS', data.summary.totalLiabilities]).font = { bold: true };

                sheet.addRow(['']);
                sheet.addRow(['EKUITAS']);
                data.equity.forEach((equityAccount: { namaAkun: string, saldo: number }) => sheet.addRow([equityAccount.namaAkun, equityAccount.saldo]));
                sheet.addRow(['LABA TAHUN BERJALAN', data.currentEarnings]);
                sheet.addRow(['TOTAL EKUITAS', data.summary.totalEquity]).font = { bold: true };
            } else if (type === 'income-statement') {
                const data = await fetchIncomeStatement(perusahaanId, startDate, endDate, cabangId as string);
                sheet.addRow(['LABA RUGI', `${startDate} - ${endDate}`]);

                sheet.addRow(['PENDAPATAN']);
                data.revenue.forEach((revenueAccount: { namaAkun: string, saldo: number }) => sheet.addRow([revenueAccount.namaAkun, revenueAccount.saldo]));
                sheet.addRow(['TOTAL PENDAPATAN', data.summary.totalRevenue]).font = { bold: true };

                sheet.addRow(['']);
                sheet.addRow(['BEBAN']);
                data.expense.forEach((expenseAccount: { namaAkun: string, saldo: number }) => sheet.addRow([expenseAccount.namaAkun, expenseAccount.saldo]));
                sheet.addRow(['TOTAL BEBAN', data.summary.totalExpense]).font = { bold: true };

                sheet.addRow(['']);
                sheet.addRow(['LABA BERSIH', data.summary.netIncome]).font = { size: 14, bold: true };
            } else if (type === 'cash-flow') {
                const data = await fetchCashFlow(perusahaanId, startDate, endDate, cabangId as string);
                sheet.addRow(['ARUS KAS', `${startDate} - ${endDate}`]);
                sheet.addRow(['Operasional', data.operating]);
                sheet.addRow(['Investasi', data.investing]);
                sheet.addRow(['Pendanaan', data.financing]);
                sheet.addRow(['Kenaikan Bersih', data.netChange]).font = { bold: true };
            } else if (type === 'trial-balance') {
                const data = await fetchTrialBalance(perusahaanId, endDate, cabangId as string);
                sheet.addRow(['NERACA SALDO', endDate]);
                sheet.addRow(['Kode', 'Nama Akun', 'Debit', 'Kredit']).font = { bold: true };
                data.data.forEach((row: { kode: string, nama: string, debit: number, kredit: number }) => {
                    sheet.addRow([row.kode, row.nama, row.debit, row.kredit]);
                });
                sheet.addRow(['TOTAL', '', data.summary.totalDebit, data.summary.totalCredit]).font = { bold: true };
            } else if (type === 'general-ledger') {
                sheet.addRow(['Info', 'Silakan export dari halaman detail akun.']);
            }

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=${type}-${Date.now()}.xlsx`);

            await workbook.xlsx.write(res);
            res.end();
            return;
        }

        res.status(400).json({ message: 'Invalid format or type' });

    } catch (error: unknown) {
        console.error('Export Error:', error);
        res.status(500).json({ message: 'Export failed' });
    }
};



export const getARAging = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
        const { cabangId } = req.query;
        const report = await ReportingService.calculateARAging(perusahaanId, cabangId as string);
        res.json(report);
    } catch {
        res.status(500).json({ message: 'Gagal mengambil aging piutang' });
    }
};

export const getAPAging = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
        const { cabangId } = req.query;
        const report = await ReportingService.calculateAPAging(perusahaanId, cabangId as string);
        res.json(report);
    } catch {
        res.status(500).json({ message: 'Gagal mengambil aging hutang' });
    }
};

export const triggerReminders = async (req: Request, res: Response) => {
    try {
        const results = await ReminderService.processReminders();
        res.json({
            message: 'Reminder processing complete',
            results
        });
    } catch {
        res.status(500).json({ message: 'Gagal memproses pengingat pembayaran' });
    }
};
