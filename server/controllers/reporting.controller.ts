import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../../lib/prisma';
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
}

// Helper to get summation of journals by account type
const getAccountBalances = async (params: ReportParams, types: string[]) => {
    const where: any = {
        perusahaanId: params.perusahaanId,
        tipe: { in: types }
    };

    const accounts = await prisma.chartOfAccounts.findMany({
        where,
        select: {
            id: true,
            kodeAkun: true,
            namaAkun: true,
            tipe: true,
            jurnalDetail: {
                where: {
                    jurnal: {
                        tanggal: {
                            lte: params.endDate ? endOfDay(new Date(params.endDate)) : undefined
                        }
                    }
                },
                select: {
                    debit: true,
                    kredit: true
                }
            }
        },
        orderBy: { kodeAkun: 'asc' }
    });

    return accounts.map(acc => {
        const totalDebit = acc.jurnalDetail.reduce((sum, j) => sum + Number(j.debit), 0);
        const totalCredit = acc.jurnalDetail.reduce((sum, j) => sum + Number(j.kredit), 0);

        let saldo = 0;
        // Normal Balance Logic
        if (['ASET', 'BEBAN'].includes(acc.tipe)) {
            saldo = totalDebit - totalCredit;
        } else {
            saldo = totalCredit - totalDebit;
        }

        return {
            ...acc,
            saldo,
            jurnalDetail: undefined
        };
    }).filter(a => Math.abs(a.saldo) > 0);
};

// Calculate Net Income (Laba/Rugi Berjalan) for precise dates
const calculateNetIncome = async (startDate: Date, endDate: Date, perusahaanId: string) => {
    const journalDetails = await prisma.jurnalDetail.findMany({
        where: {
            jurnal: {
                perusahaanId,
                tanggal: {
                    gte: startDate,
                    lte: endDate
                }
            },
            akun: {
                tipe: { in: ['PENDAPATAN', 'BEBAN'] }
            }
        },
        include: { akun: true }
    });

    let revenue = 0;
    let expense = 0;

    journalDetails.forEach(j => {
        const amount = Number(j.kredit) - Number(j.debit); // Credit is positive for Revenue
        if (j.akun.tipe === 'PENDAPATAN') revenue += amount; // Rev: Credit - Debit
        if (j.akun.tipe === 'BEBAN') expense += (Number(j.debit) - Number(j.kredit)); // Exp: Debit - Credit
    });

    return revenue - expense;
};


// --- CONTROLLERS ---

export const getBalanceSheet = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const { endDate } = req.query;
        const perusahaanId = authReq.currentCompanyId!;

        const end = endDate ? String(endDate) : new Date().toISOString();

        // 0. Cache Check
        const cacheKey = `report:bs:${perusahaanId}:${end.slice(0, 10)}`;
        const cached = await cacheService.get(cacheKey);
        if (cached) {
            res.setHeader('X-Cache', 'HIT');
            return res.json(cached);
        }

        const startOfCurrentYear = startOfYear(new Date(end)).toISOString();

        // 1. Get Components
        const assets = await getAccountBalances({ endDate: end, perusahaanId }, ['ASET']);
        const liabilities = await getAccountBalances({ endDate: end, perusahaanId }, ['LIABILITAS']);
        const equity = await getAccountBalances({ endDate: end, perusahaanId }, ['EKUITAS']);

        // 2. Calculate Current Year Earnings (Laba Ditahan / Berjalan)
        // From Start of Year to End Date
        const currentEarnings = await calculateNetIncome(
            new Date(startOfCurrentYear),
            endOfDay(new Date(end)),
            perusahaanId
        );

        // 3. Totals
        const totalAssets = assets.reduce((sum, a) => sum + a.saldo, 0);
        const totalLiabilities = liabilities.reduce((sum, a) => sum + a.saldo, 0);
        let totalEquity = equity.reduce((sum, a) => sum + a.saldo, 0);

        // Add calculated earnings to Equity section implicitly or explicitly
        // Usually shown as a separate line item "Laba Tahun Berjalan"
        totalEquity += currentEarnings;

        const result = {
            assets,
            liabilities,
            equity,
            currentEarnings,
            summary: {
                totalAssets,
                totalLiabilities,
                totalEquity,
                balanceCheck: totalAssets - (totalLiabilities + totalEquity) // Should be 0
            }
        };

        // Cache Result (15 mins)
        await cacheService.set(cacheKey, result, 900);
        res.setHeader('X-Cache', 'MISS');

        res.json(result);

    } catch (error) {
        console.error('Balance Sheet Error:', error);
        res.status(500).json({ message: 'Gagal menghasilkan Neraca', error });
    }
};

export const getIncomeStatement = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const { startDate, endDate } = req.query;
        const perusahaanId = authReq.currentCompanyId!;

        const start = startDate ? new Date(String(startDate)) : startOfYear(new Date());
        const end = endDate ? endOfDay(new Date(String(endDate))) : endOfDay(new Date());

        // 0. Cache Check
        const cacheKey = `report:is:${perusahaanId}:${start.toISOString().slice(0, 10)}:${end.toISOString().slice(0, 10)}`;
        const cached = await cacheService.get(cacheKey);
        if (cached) {
            res.setHeader('X-Cache', 'HIT');
            return res.json(cached);
        }

        // Get journals specifically for this period
        const revenueAccounts = await prisma.chartOfAccounts.findMany({
            where: { perusahaanId, tipe: 'PENDAPATAN' },
            select: { id: true, kodeAkun: true, namaAkun: true }
        });

        const expenseAccounts = await prisma.chartOfAccounts.findMany({
            where: { perusahaanId, tipe: 'BEBAN' },
            select: { id: true, kodeAkun: true, namaAkun: true }
        });

        // Fetch aggregation manually to ensure range correctness
        const getSum = async (accountId: string) => {
            const aggr = await prisma.jurnalDetail.aggregate({
                where: {
                    akunId: accountId,
                    jurnal: {
                        tanggal: { gte: start, lte: end }
                    }
                },
                _sum: { debit: true, kredit: true }
            });
            return { debit: Number(aggr._sum.debit || 0), credit: Number(aggr._sum.kredit || 0) };
        };

        const revenues = await Promise.all(revenueAccounts.map(async (acc) => {
            const { debit, credit } = await getSum(acc.id);
            const saldo = credit - debit;
            return { ...acc, saldo };
        }));

        const expenses = await Promise.all(expenseAccounts.map(async (acc) => {
            const { debit, credit } = await getSum(acc.id);
            const saldo = debit - credit;
            return { ...acc, saldo };
        }));

        // Filter out zero balances
        const activeRevenues = revenues.filter(r => r.saldo !== 0);
        const activeExpenses = expenses.filter(e => e.saldo !== 0);

        const totalRevenue = activeRevenues.reduce((s, r) => s + r.saldo, 0);
        const totalExpense = activeExpenses.reduce((s, e) => s + e.saldo, 0);

        const result = {
            revenue: activeRevenues,
            expense: activeExpenses,
            summary: {
                totalRevenue,
                totalExpense,
                netIncome: totalRevenue - totalExpense
            },
            period: { start, end }
        };

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
        const { startDate, endDate } = req.query;
        const perusahaanId = authReq.currentCompanyId!;

        const start = startDate ? new Date(String(startDate)) : startOfYear(new Date());
        const end = endDate ? endOfDay(new Date(String(endDate))) : endOfDay(new Date());

        // Direct Method Approximation:
        // 1. Operating: Receipts from customers (Revenue), Payments to suppliers (Expenses) - mapped via Cash/Bank mutations
        // 2. Investing: Purchase/Sale of Assets
        // 3. Financing: Equity/Loans

        // For this version, we will categorize based on the 'lawan transaksi' account type in the Journal
        // This is a simplified "Net Cash Movement" approach.

        const cashAccounts = await prisma.chartOfAccounts.findMany({
            where: {
                perusahaanId,
                kategoriAset: 'KAS_DAN_SETARA_KAS'
            },
            select: { id: true }
        });

        const cashAccountIds = cashAccounts.map(c => c.id);

        // Find all journal details involving cash accounts
        const cashMovements = await prisma.jurnalDetail.findMany({
            where: {
                akunId: { in: cashAccountIds },
                jurnal: {
                    perusahaanId,
                    tanggal: { gte: start, lte: end }
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

        // Naive categorization logic roughly:
        // If Cash Debit -> Inflow. Check other side of journal.
        // If Cash Credit -> Outflow. Check other side.

        // This loop is computationally heavy for large datasets but acceptable for MVP/SME scale.
        for (const move of cashMovements) {
            const isDebit = Number(move.debit) > 0;
            const amount = isDebit ? Number(move.debit) : -Number(move.kredit);

            // Find the "contra" account (simplistic assumption: usually 2 lines in journal)
            // If complex journal, we take the dominant other entry or just dump into Operating for now.
            // move.jurnal has 'detail' property now due to include change
            const contraEntry = move.jurnal.detail.find((d: any) => !cashAccountIds.includes(d.akunId));

            if (contraEntry) {
                const type = contraEntry.akun.tipe;
                if (['ASET_TETAP', 'INVESTASI_JANGKA_PANJANG', 'PROPERTI_INVESTASI'].includes(type)) {
                    investingCashFlow += amount;
                } else if (['LIABILITAS_JANGKA_PANJANG', 'EKUITAS'].includes(type)) {
                    financingCashFlow += amount;
                } else {
                    // Current Assets (AR), Current Liabilities (AP), Revenue, Expenses -> Operating
                    operatingCashFlow += amount;
                }
            } else {
                // Transfer between cash accounts? Ignore net effect zero, or internal movement.
                // Or unmatched. Default to operating.
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

    } catch (error) {
        console.error('Cash Flow Error:', error);
        res.status(500).json({ message: 'Gagal menghasilkan Laporan Arus Kas' });
    }
};

export const getTrialBalance = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const { date } = req.query;
        const perusahaanId = authReq.currentCompanyId!;
        const asOfDate = date ? endOfDay(new Date(String(date))) : endOfDay(new Date());

        const accounts = await prisma.chartOfAccounts.findMany({
            where: { perusahaanId },
            include: {
                jurnalDetail: {
                    where: {
                        jurnal: { tanggal: { lte: asOfDate } }
                    },
                    select: { debit: true, kredit: true }
                }
            },
            orderBy: { kodeAkun: 'asc' }
        });

        const report = accounts.map(acc => {
            const totalDebit = acc.jurnalDetail.reduce((sum, jd) => sum + Number(jd.debit), 0);
            const totalCredit = acc.jurnalDetail.reduce((sum, jd) => sum + Number(jd.kredit), 0);

            // Trial balance shows net debit or credit per account usually, 
            // OR strictly total Debit and Total Credit side by side.
            // Let's show Debit vs Credit totals for the trial balance columns.

            let finalDebit = 0;
            let finalCredit = 0;

            if (totalDebit >= totalCredit) {
                finalDebit = totalDebit - totalCredit;
            } else {
                finalCredit = totalCredit - totalDebit;
            }

            return {
                id: acc.id,
                kode: acc.kodeAkun,
                nama: acc.namaAkun,
                debit: finalDebit,
                kredit: finalCredit
            };
        }).filter(item => item.debit > 0 || item.kredit > 0);

        const totalDebit = report.reduce((sum, r) => sum + r.debit, 0);
        const totalCredit = report.reduce((sum, r) => sum + r.kredit, 0);

        res.json({
            data: report,
            summary: {
                totalDebit,
                totalCredit,
                isBalanced: Math.abs(totalDebit - totalCredit) < 1 // Floating point tolerance
            }
        });

    } catch (error) {
        console.error('Trial Balance Error:', error);
        res.status(500).json({ message: 'Gagal menghasilkan Neraca Saldo' });
    }
};

export const getGeneralLedger = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const { accountId, startDate, endDate } = req.query;
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
                    tanggal: { lt: start }
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
                    tanggal: { gte: start, lte: end }
                }
            },
            include: {
                jurnal: true
            },
            orderBy: { jurnal: { tanggal: 'asc' } }
        });

        // 3. Calculate Running Balance
        let currentBalance = openingBalance;
        const lines = transactions.map(tx => {
            const deb = Number(tx.debit);
            const cred = Number(tx.kredit);

            if (isDebitNormal) {
                currentBalance += (deb - cred);
            } else {
                currentBalance += (cred - deb);
            }

            return {
                date: tx.jurnal.tanggal,
                ref: tx.jurnal.noJurnal,
                description: tx.jurnal.keterangan || tx.jurnal.noJurnal,
                debit: deb,
                credit: cred,
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

    } catch (error) {
        console.error('General Ledger Error:', error);
        res.status(500).json({ message: 'Gagal menghasilkan Buku Besar' });
    }
};

export const exportReport = async (req: Request, res: Response) => {
    try {
        const { type, format: fileFormat } = req.body;

        if (fileFormat === 'pdf') {
            const doc = new PDFDocument();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${type}-${Date.now()}.pdf`);

            doc.pipe(res);
            doc.fontSize(20).text(`Laporan ${type}`, { align: 'center' });
            doc.fontSize(12).text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
            doc.moveDown();

            // Render content based on type...
            doc.text('Detailed report content here...');

            doc.end();
            return;
        }

        if (fileFormat === 'excel') {
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('Report');

            sheet.addRow(['Laporan', type]);
            sheet.addRow(['Generated', new Date().toLocaleDateString()]);

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=${type}-${Date.now()}.xlsx`);

            await workbook.xlsx.write(res);
            res.end();
            return;
        }

        res.status(400).json({ message: 'Invalid format' });

    } catch (error) {
        res.status(500).json({ message: 'Export failed' });
    }
};

export const getARAging = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
        const report = await ReportingService.calculateARAging(perusahaanId);
        res.json(report);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil aging piutang' });
    }
};

export const getAPAging = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
        const report = await ReportingService.calculateAPAging(perusahaanId);
        res.json(report);
    } catch (error) {
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
    } catch (error) {
        res.status(500).json({ message: 'Gagal memproses pengingat pembayaran' });
    }
};
