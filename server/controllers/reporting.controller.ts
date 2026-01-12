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
            tipe: true
        },
        orderBy: { kodeAkun: 'asc' }
    });

    const accountIds = accounts.map(a => a.id);

    // BATCH QUERY: Get all sums in one go
    const aggregates = await prisma.jurnalDetail.groupBy({
        by: ['akunId'],
        where: {
            akunId: { in: accountIds },
            jurnal: {
                tanggal: {
                    lte: params.endDate ? endOfDay(new Date(params.endDate)) : undefined
                }
            }
        },
        _sum: {
            debit: true,
            kredit: true
        }
    });

    const aggregateMap = aggregates.reduce((acc, curr) => {
        acc[curr.akunId] = {
            debit: Number(curr._sum.debit || 0),
            credit: Number(curr._sum.kredit || 0)
        };
        return acc;
    }, {} as Record<string, { debit: number, credit: number }>);

    return accounts.map(acc => {
        const { debit = 0, credit = 0 } = aggregateMap[acc.id] || {};

        let saldo = 0;
        // Normal Balance Logic
        if (['ASET', 'BEBAN'].includes(acc.tipe)) {
            saldo = debit - credit;
        } else {
            saldo = credit - debit;
        }

        return {
            ...acc,
            saldo
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


// --- SHARED DATA FETCHERS ---

const fetchBalanceSheet = async (perusahaanId: string, inputDate?: string) => {
    const end = inputDate ? String(inputDate) : new Date().toISOString();
    const startOfCurrentYear = startOfYear(new Date(end)).toISOString();

    const assets = await getAccountBalances({ endDate: end, perusahaanId }, ['ASET']);
    const liabilities = await getAccountBalances({ endDate: end, perusahaanId }, ['LIABILITAS']);
    const equity = await getAccountBalances({ endDate: end, perusahaanId }, ['EKUITAS']);

    const currentEarnings = await calculateNetIncome(
        new Date(startOfCurrentYear),
        endOfDay(new Date(end)),
        perusahaanId
    );

    const totalAssets = assets.reduce((sum, a) => sum + a.saldo, 0);
    const totalLiabilities = liabilities.reduce((sum, a) => sum + a.saldo, 0);
    let totalEquity = equity.reduce((sum, a) => sum + a.saldo, 0);
    totalEquity += currentEarnings;

    return {
        assets, liabilities, equity, currentEarnings,
        summary: { totalAssets, totalLiabilities, totalEquity, balanceCheck: totalAssets - (totalLiabilities + totalEquity) }
    };
};

const fetchIncomeStatement = async (perusahaanId: string, startDate?: string, endDate?: string) => {
    const start = startDate ? new Date(String(startDate)) : startOfYear(new Date());
    const end = endDate ? endOfDay(new Date(String(endDate))) : endOfDay(new Date());

    const accounts = await prisma.chartOfAccounts.findMany({
        where: {
            perusahaanId,
            tipe: { in: ['PENDAPATAN', 'BEBAN'] }
        },
        select: { id: true, kodeAkun: true, namaAkun: true, tipe: true }
    });

    const accountIds = accounts.map(a => a.id);

    // BATCH QUERY: Aggregate all at once
    const aggregates = await prisma.jurnalDetail.groupBy({
        by: ['akunId'],
        where: {
            akunId: { in: accountIds },
            jurnal: {
                tanggal: { gte: start, lte: end }
            }
        },
        _sum: { debit: true, kredit: true }
    });

    const aggregateMap = aggregates.reduce((acc, curr) => {
        acc[curr.akunId] = {
            debit: Number(curr._sum.debit || 0),
            credit: Number(curr._sum.kredit || 0)
        };
        return acc;
    }, {} as Record<string, { debit: number, credit: number }>);

    const revenues: any[] = [];
    const expenses: any[] = [];

    accounts.forEach(acc => {
        const { debit = 0, credit = 0 } = aggregateMap[acc.id] || {};
        if (debit === 0 && credit === 0) return;

        if (acc.tipe === 'PENDAPATAN') {
            revenues.push({ ...acc, saldo: credit - debit });
        } else {
            expenses.push({ ...acc, saldo: debit - credit });
        }
    });

    const totalRevenue = revenues.reduce((s, r) => s + r.saldo, 0);
    const totalExpense = expenses.reduce((s, e) => s + e.saldo, 0);

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

// --- CONTROLLERS ---

export const getBalanceSheet = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const { endDate } = req.query;
        const perusahaanId = authReq.currentCompanyId!;
        const end = endDate ? String(endDate) : new Date().toISOString();

        const cacheKey = `report:bs:${perusahaanId}:${end.slice(0, 10)}`;
        const cached = await cacheService.get(cacheKey);
        if (cached) {
            res.setHeader('X-Cache', 'HIT');
            return res.json(cached);
        }

        const result = await fetchBalanceSheet(perusahaanId, end);

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

        const cacheKey = `report:is:${perusahaanId}:${start.toISOString().slice(0, 10)}:${end.toISOString().slice(0, 10)}`;
        const cached = await cacheService.get(cacheKey);
        if (cached) {
            res.setHeader('X-Cache', 'HIT');
            return res.json(cached);
        }

        const result = await fetchIncomeStatement(perusahaanId, String(startDate), String(endDate));

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

        const cashAccounts = await prisma.chartOfAccounts.findMany({
            where: {
                perusahaanId,
                kategoriAset: 'KAS_DAN_SETARA_KAS'
            },
            select: { id: true }
        });

        const cashAccountIds = cashAccounts.map(c => c.id);

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

        for (const move of cashMovements) {
            const isDebit = Number(move.debit) > 0;
            const amount = isDebit ? Number(move.debit) : -Number(move.kredit);

            const contraEntry = move.jurnal.detail.find((d: any) => !cashAccountIds.includes(d.akunId));

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
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
        const { type, format: fileFormat, startDate, endDate } = req.body;

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
                const data = await fetchBalanceSheet(perusahaanId, endDate);

                doc.fontSize(14).text('ASET', { underline: true });
                data.assets.forEach(a => {
                    doc.fontSize(10).text(a.namaAkun, { continued: true }).text(new Intl.NumberFormat('id-ID').format(a.saldo), { align: 'right' });
                });
                doc.fontSize(12).font('Helvetica-Bold').text(`Total Aset: ${new Intl.NumberFormat('id-ID').format(data.summary.totalAssets)}`, { align: 'right' });
                doc.moveDown();

                doc.fontSize(14).font('Helvetica').text('LIABILITAS', { underline: true });
                data.liabilities.forEach(l => {
                    doc.fontSize(10).text(l.namaAkun, { continued: true }).text(new Intl.NumberFormat('id-ID').format(l.saldo), { align: 'right' });
                });
                doc.fontSize(12).font('Helvetica-Bold').text(`Total Liabilitas: ${new Intl.NumberFormat('id-ID').format(data.summary.totalLiabilities)}`, { align: 'right' });
                doc.moveDown();

                doc.fontSize(14).font('Helvetica').text('EKUITAS', { underline: true });
                data.equity.forEach(e => {
                    doc.fontSize(10).text(e.namaAkun, { continued: true }).text(new Intl.NumberFormat('id-ID').format(e.saldo), { align: 'right' });
                });
                doc.fontSize(10).text('Laba Tahun Berjalan', { continued: true }).text(new Intl.NumberFormat('id-ID').format(data.currentEarnings), { align: 'right' });
                doc.fontSize(12).font('Helvetica-Bold').text(`Total Ekuitas: ${new Intl.NumberFormat('id-ID').format(data.summary.totalEquity)}`, { align: 'right' });
            } else if (type === 'income-statement') {
                const data = await fetchIncomeStatement(perusahaanId, startDate, endDate);

                doc.fontSize(14).text('PENDAPATAN', { underline: true });
                data.revenue.forEach(r => {
                    doc.fontSize(10).text(r.namaAkun, { continued: true }).text(new Intl.NumberFormat('id-ID').format(r.saldo), { align: 'right' });
                });
                doc.fontSize(12).font('Helvetica-Bold').text(`Total Pendapatan: ${new Intl.NumberFormat('id-ID').format(data.summary.totalRevenue)}`, { align: 'right' });
                doc.moveDown();

                doc.fontSize(14).font('Helvetica').text('BEBAN', { underline: true });
                data.expense.forEach(e => {
                    doc.fontSize(10).text(e.namaAkun, { continued: true }).text(new Intl.NumberFormat('id-ID').format(e.saldo), { align: 'right' });
                });
                doc.fontSize(12).font('Helvetica-Bold').text(`Total Beban: ${new Intl.NumberFormat('id-ID').format(data.summary.totalExpense)}`, { align: 'right' });
                doc.moveDown();

                doc.fontSize(16).text(`LABA BERSIH: ${new Intl.NumberFormat('id-ID').format(data.summary.netIncome)}`, { align: 'right' });
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
                const data = await fetchBalanceSheet(perusahaanId, endDate);
                sheet.addRow(['NERACA', endDate]);

                sheet.addRow(['ASET']);
                data.assets.forEach(a => sheet.addRow([a.namaAkun, a.saldo]));
                sheet.addRow(['TOTAL ASET', data.summary.totalAssets]).font = { bold: true };

                sheet.addRow(['']);
                sheet.addRow(['LIABILITAS']);
                data.liabilities.forEach(l => sheet.addRow([l.namaAkun, l.saldo]));
                sheet.addRow(['TOTAL LIABILITAS', data.summary.totalLiabilities]).font = { bold: true };

                sheet.addRow(['']);
                sheet.addRow(['EKUITAS']);
                data.equity.forEach(e => sheet.addRow([e.namaAkun, e.saldo]));
                sheet.addRow(['LABA TAHUN BERJALAN', data.currentEarnings]);
                sheet.addRow(['TOTAL EKUITAS', data.summary.totalEquity]).font = { bold: true };
            } else if (type === 'income-statement') {
                const data = await fetchIncomeStatement(perusahaanId, startDate, endDate);
                sheet.addRow(['LABA RUGI', `${startDate} - ${endDate}`]);

                sheet.addRow(['PENDAPATAN']);
                data.revenue.forEach(r => sheet.addRow([r.namaAkun, r.saldo]));
                sheet.addRow(['TOTAL PENDAPATAN', data.summary.totalRevenue]).font = { bold: true };

                sheet.addRow(['']);
                sheet.addRow(['BEBAN']);
                data.expense.forEach(e => sheet.addRow([e.namaAkun, e.saldo]));
                sheet.addRow(['TOTAL BEBAN', data.summary.totalExpense]).font = { bold: true };

                sheet.addRow(['']);
                sheet.addRow(['LABA BERSIH', data.summary.netIncome]).font = { size: 14, bold: true };
            }

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=${type}-${Date.now()}.xlsx`);

            await workbook.xlsx.write(res);
            res.end();
            return;
        }

        res.status(400).json({ message: 'Invalid format or type' });

    } catch (error) {
        console.error('Export Error:', error);
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
