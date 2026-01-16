
import { Request, Response } from 'express';
import { Prisma, TipeTransaksi } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { createTransactionSchema } from '../validators/transaction.validator';
import { AccountingEngine } from '../lib/accounting-engine';
import { AuditService } from '../services/audit.service';

import prisma from '../../lib/prisma';
import ExcelJS from 'exceljs';
import { format } from 'date-fns';

export const getTransactions = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;

        const page = parseInt(((req.query.page as string) || '1'), 10);
        const limit = parseInt(((req.query.limit as string) || '10'), 10);
        const skip = (page - 1) * limit;

        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const type = req.query.type as string | undefined;

        const where: Prisma.TransaksiWhereInput = {
            perusahaanId: perusahaanId,
        };

        if (startDate && startDate !== 'undefined') {
            const start = new Date(startDate);
            if (!isNaN(start.getTime())) {
                where.tanggal = { ...(where.tanggal as Record<string, unknown>), gte: start };
            }
        }

        if (endDate && endDate !== 'undefined') {
            const end = new Date(endDate);
            if (!isNaN(end.getTime())) {
                where.tanggal = { ...(where.tanggal as any), lte: end };
            }
        }

        if (type && type !== 'undefined') {
            where.tipe = type as TipeTransaksi;
        }

        const search = req.query.search as string | undefined;
        if (search) {
            where.OR = [
                { deskripsi: { contains: search, mode: 'insensitive' } },
                { nomorTransaksi: { contains: search, mode: 'insensitive' } }
            ];
        }

        const cursor = req.query.cursor as string | undefined;
        let queryOptions: Prisma.TransaksiFindManyArgs = {
            where,
            take: limit,
            orderBy: { tanggal: 'desc' },
            include: {
                pengguna: { select: { namaLengkap: true } },
                mataUang: true,
            }
        };

        if (cursor) {
            queryOptions = {
                ...queryOptions,
                skip: 1, // Skip the cursor itself
                cursor: { id: cursor }
            };
        } else {
            queryOptions = {
                ...queryOptions,
                skip
            };
        }

        const [transactions, total] = await Promise.all([
            prisma.transaksi.findMany(queryOptions),
            prisma.transaksi.count({ where })
        ]);

        const nextCursor = transactions.length === limit ? transactions[transactions.length - 1].id : null;

        res.json({
            transactions,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                nextCursor
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengambil daftar transaksi' });
    }
};

export const createTransaction = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
        const validatedData = createTransactionSchema.parse(req.body);

        const result = await prisma.$transaction(async (tx) => {
            const engine = new AccountingEngine(tx);
            const date = new Date(validatedData.tanggal);

            // 1. Validate Period
            const period = await engine.validatePeriod(perusahaanId, date);

            // 2. Generate Numbers
            const transNo = validatedData.nomorTransaksi || await engine.generateNumber(perusahaanId, 'TRX', 'transaksi');
            const voucherNo = await engine.generateNumber(perusahaanId, 'VCH', 'voucher');
            const journalNo = await engine.generateNumber(perusahaanId, 'GL', 'jurnalUmum');

            // 3. Process Taxes
            const taxItems: { pajakId: string, dasar: number, tarif: Prisma.Decimal, jumlah: number }[] = [];
            const taxSummary: Record<string, { amount: number, accountId: string, pajakId: string, name: string }> = {};

            // Fetch all required taxes
            const pajakIds = [...new Set(validatedData.items.filter(i => i.pajakId).map(i => i.pajakId))] as string[];
            const pajaks = await tx.masterPajak.findMany({
                where: { id: { in: pajakIds } }
            });
            const taxMap = new Map<string, typeof pajaks[0]>(pajaks.map(t => [t.id, t]));

            const processedItems = validatedData.items.map((item, index) => {
                const baseAmount = item.debit > 0 ? item.debit : item.kredit;
                let taxAmount = 0;

                if (item.pajakId) {
                    const taxDef = taxMap.get(item.pajakId);
                    if (taxDef) {
                        taxAmount = Number(baseAmount) * (Number(taxDef.tarif) / 100);

                        // Track for TransaksiPajak
                        taxItems.push({
                            pajakId: item.pajakId,
                            dasar: baseAmount,
                            tarif: taxDef.tarif,
                            jumlah: taxAmount,
                        });

                        // Aggregate for Journal
                        if (taxDef.akunPajak) {
                            const key = taxDef.akunPajak;
                            if (!taxSummary[key]) {
                                taxSummary[key] = {
                                    amount: 0,
                                    accountId: taxDef.akunPajak,
                                    pajakId: taxDef.id,
                                    name: taxDef.namaPajak
                                };
                            }
                            // PPN Keluaran/Masukan logic usually follows the base amount's side
                            taxSummary[key].amount += taxAmount;
                        }
                    }
                }

                return {
                    ...item,
                    originalIndex: index,
                    taxAmount
                };
            });

            const totalAmount = validatedData.items.reduce((sum: number, item: any) => sum + (Number(item.debit) || 0), 0);
            const totalTax = Object.values(taxSummary).reduce((sum, t) => sum + t.amount, 0);

            // 4. Create Transaksi
            const transaksi = await tx.transaksi.create({
                data: {
                    perusahaanId,
                    penggunaId: authReq.user.id,
                    nomorTransaksi: transNo,
                    tanggal: date,
                    tipe: validatedData.tipe as TipeTransaksi,
                    cabangId: validatedData.cabangId,
                    deskripsi: validatedData.deskripsi,
                    referensi: validatedData.referensi,
                    subtotal: totalAmount,
                    nilaiPajak: totalTax,
                    total: totalAmount + totalTax, // Standard additive tax assumption
                    statusPembayaran: 'LUNAS',
                    isPosted: true,
                    postedAt: new Date(),
                    postedBy: authReq.user.username,
                    detail: {
                        create: processedItems.map((item, index) => ({
                            urutan: index + 1,
                            akunId: item.akunId,
                            deskripsi: item.deskripsi || validatedData.deskripsi,
                            hargaSatuan: item.debit > 0 ? item.debit : item.kredit,
                            kuantitas: 1,
                            subtotal: item.debit > 0 ? item.debit : item.kredit,
                        }))
                    },
                    pajak: {
                        create: taxItems.map(ti => ({
                            pajakId: ti.pajakId,
                            dasar: ti.dasar,
                            tarif: ti.tarif,
                            jumlah: ti.jumlah,
                        }))
                    }
                }
            });

            // 5. Build Final Journal Lines (Original + Taxes)
            const finalVoucherItems = [...validatedData.items.map((item, idx) => ({
                urutan: idx + 1,
                akunId: item.akunId,
                deskripsi: item.deskripsi || validatedData.deskripsi,
                debit: item.debit,
                kredit: item.kredit,
            }))];

            // Add tax lines
            Object.values(taxSummary).forEach((ts) => {
                const isPPNMasukan = pajaks.find(t => t.id === ts.pajakId)?.jenis === 'PPN_MASUKAN';
                const isPPNKeluaran = pajaks.find(t => t.id === ts.pajakId)?.jenis === 'PPN_KELUARAN';

                let debit = 0;
                let kredit = 0;

                // Simplified rule for PPN
                if (isPPNMasukan) debit = ts.amount;
                else if (isPPNKeluaran) kredit = ts.amount;
                else debit = ts.amount; // Default to debit for other taxes for now

                finalVoucherItems.push({
                    urutan: finalVoucherItems.length + 1,
                    akunId: ts.accountId,
                    deskripsi: `Pajak: ${ts.name}`,
                    debit: debit,
                    kredit: kredit,
                });
            });

            const finalTotalDebit = finalVoucherItems.reduce((sum, i) => sum + i.debit, 0);
            const finalTotalKredit = finalVoucherItems.reduce((sum, i) => sum + i.kredit, 0);

            // 5b. Validate Balance Integrity (PSAK)
            engine.validateJournal(finalVoucherItems);

            // 6. Create Voucher
            const voucher = await tx.voucher.create({
                data: {
                    perusahaanId,
                    transaksiId: transaksi.id,
                    nomorVoucher: voucherNo,
                    tanggal: date,
                    tipe: 'JURNAL_UMUM',
                    cabangId: validatedData.cabangId,
                    deskripsi: validatedData.deskripsi,
                    totalDebit: finalTotalDebit,
                    totalKredit: finalTotalKredit,
                    status: 'DIPOSTING',
                    dibuatOlehId: authReq.user.id,
                    lampiran: validatedData.lampiran,
                    isPosted: true,
                    postedAt: new Date(),
                    postedBy: authReq.user.username,
                    detail: {
                        create: finalVoucherItems.map(item => ({
                            urutan: item.urutan,
                            akunId: item.akunId,
                            deskripsi: item.deskripsi,
                            debit: item.debit,
                            kredit: item.kredit,
                        }))
                    }
                }
            });

            // 7. Create Jurnal & Update Balances
            const journal = await tx.jurnalUmum.create({
                data: {
                    perusahaanId,
                    periodeId: period.id,
                    voucherId: voucher.id,
                    cabangId: validatedData.cabangId,
                    nomorJurnal: journalNo,
                    tanggal: date,
                    deskripsi: validatedData.deskripsi,
                    totalDebit: finalTotalDebit,
                    totalKredit: finalTotalKredit,
                    isPosted: true,
                    postedAt: new Date(),
                }
            });

            // PRE-FETCH ALL ACCOUNTS (Original + Tax)
            const allAccountIds = [...new Set(finalVoucherItems.map(i => i.akunId))];
            const accounts = await tx.chartOfAccounts.findMany({
                where: { id: { in: allAccountIds } }
            });
            const accountMap = new Map(accounts.map(a => [a.id, a]));

            const balanceUpdates: Record<string, number> = {};

            for (const [index, item] of finalVoucherItems.entries()) {
                const amount = item.debit > 0 ? item.debit : item.kredit;
                const type = item.debit > 0 ? 'DEBIT' : 'KREDIT';
                const account = accountMap.get(item.akunId);

                if (!account) throw new Error(`Akun ID ${item.akunId} tidak ditemukan`);

                const change = type === 'DEBIT' ? amount : -amount;
                const saldoSebelum = Number(account.saldoBerjalan);
                const currentAggregatedChange = balanceUpdates[item.akunId] || 0;

                balanceUpdates[item.akunId] = currentAggregatedChange + change;

                await tx.jurnalDetail.create({
                    data: {
                        jurnalId: journal.id,
                        urutan: index + 1,
                        akunId: item.akunId,
                        deskripsi: item.deskripsi || validatedData.deskripsi,
                        debit: item.debit,
                        kredit: item.kredit,
                        saldoSebelum: saldoSebelum + currentAggregatedChange,
                        saldoSesudah: saldoSebelum + currentAggregatedChange + change
                    }
                });
            }

            // Perform aggregated balance updates
            for (const [accId, netAmount] of Object.entries(balanceUpdates)) {
                await tx.chartOfAccounts.update({
                    where: { id: accId },
                    data: { saldoBerjalan: { increment: netAmount } }
                });
            }

            return transaksi;
        });

        // 6. Audit Log (Async)
        AuditService.log({
            perusahaanId,
            userId: authReq.user.id,
            action: 'CREATE',
            entity: 'Transaksi',
            entityId: result.id,
            details: `Created transaction ${result.nomorTransaksi}`,
            metadata: { total: result.total, tipe: result.tipe },
            req
        });

        res.status(201).json(result);
    } catch (error) {
        console.error(error);
        const err = error as Error;
        const message = err.message || 'Gagal membuat transaksi';
        res.status(400).json({ message });
    }
};

export const getAccounts = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;

        const accounts = await prisma.chartOfAccounts.findMany({
            where: {
                perusahaanId,
                isActive: true,
                isHeader: false, // Only posting accounts
            },
            orderBy: { kodeAkun: 'asc' },
            select: {
                id: true,
                kodeAkun: true,
                namaAkun: true,
                tipe: true,
            }
        });

        res.json(accounts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengambil daftar akun' });
    }
};

export const voidTransaction = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const id = req.params.id as string;
        const perusahaanId = authReq.currentCompanyId!;
        const reason = req.body?.reason || 'Voided by user';

        const result = await prisma.$transaction(async (tx) => {
            const engine = new AccountingEngine(tx as any);

            // 1. Find the transaction with its details
            const transaction = await tx.transaksi.findFirst({
                where: { id, perusahaanId },
                include: {
                    detail: true,
                    voucher: {
                        include: {
                            jurnal: {
                                include: {
                                    detail: true
                                }
                            }
                        }
                    }
                }
            });

            if (!transaction) {
                throw new Error('Transaksi tidak ditemukan');
            }

            if (transaction.isVoid) {
                throw new Error('Transaksi sudah dibatalkan sebelumnya');
            }

            // Check if current period is open for reversal journal
            await engine.validatePeriod(perusahaanId, new Date());

            // 2. Mark as void
            const updatedTransaction = await tx.transaksi.update({
                where: { id },
                data: {
                    isVoid: true,
                    voidAt: new Date(),
                    voidBy: authReq.user.username,
                    voidReason: reason
                }
            });

            // 3. Create REVERSAL entries in Journal & Update Balances
            if (transaction.voucher?.jurnal?.[0]) {
                const originalJournal = transaction.voucher.jurnal[0];
                const reversalJournalNo = `REV-${originalJournal.nomorJurnal}`;

                const reversalJournal = await tx.jurnalUmum.create({
                    data: {
                        perusahaanId,
                        periodeId: originalJournal.periodeId,
                        voucherId: transaction.voucher.id,
                        cabangId: transaction.cabangId,
                        nomorJurnal: reversalJournalNo,
                        tanggal: new Date(),
                        deskripsi: `Pembalikan transaksi ${transaction.nomorTransaksi}: ${transaction.deskripsi}`,
                        totalDebit: originalJournal.totalKredit,
                        totalKredit: originalJournal.totalDebit,
                        isPosted: true,
                        postedAt: new Date(),
                    }
                });

                // PRE-FETCH ACCOUNTS FOR REVERSAL
                const originalJournalDetail = originalJournal.detail;
                const reversalAccountIds = originalJournalDetail.map(jd => jd.akunId);
                const reversalAccounts = await tx.chartOfAccounts.findMany({
                    where: { id: { in: reversalAccountIds } }
                });
                const reversalAccountMap = new Map<string, typeof reversalAccounts[0]>(reversalAccounts.map(a => [a.id, a]));
                const reversalBalanceUpdates: Record<string, number> = {};

                for (const [index, jd] of originalJournalDetail.entries()) {
                    // Flip Debit and Credit
                    const debit = jd.kredit;
                    const kredit = jd.debit;
                    const amount = Number(debit) > 0 ? Number(debit) : Number(kredit);
                    const type = Number(debit) > 0 ? 'DEBIT' : 'KREDIT';

                    const account = reversalAccountMap.get(jd.akunId);
                    if (!account) throw new Error(`Akun ID ${jd.akunId} tidak ditemukan untuk pembalikan`);

                    const change = type === 'DEBIT' ? amount : -amount;
                    const saldoSebelum = Number(account.saldoBerjalan);
                    const currentAggregatedChange = reversalBalanceUpdates[jd.akunId] || 0;

                    reversalBalanceUpdates[jd.akunId] = currentAggregatedChange + change;

                    await tx.jurnalDetail.create({
                        data: {
                            jurnalId: reversalJournal.id,
                            urutan: index + 1,
                            akunId: jd.akunId,
                            deskripsi: `PEMBALIKAN: ${jd.deskripsi}`,
                            debit,
                            kredit,
                            saldoSebelum: saldoSebelum + currentAggregatedChange,
                            saldoSesudah: saldoSebelum + currentAggregatedChange + change
                        }
                    });
                }

                // Apply aggregated reversal updates
                for (const [accId, netAmount] of Object.entries(reversalBalanceUpdates)) {
                    await tx.chartOfAccounts.update({
                        where: { id: accId },
                        data: { saldoBerjalan: { increment: netAmount } }
                    });
                }
            }

            // 4. Update related documents status
            await tx.voucher.updateMany({
                where: { transaksiId: id },
                data: { status: 'DIBATALKAN', isPosted: false }
            });

            const vouchers = await tx.voucher.findMany({ where: { transaksiId: id } });
            const voucherIds = vouchers.map(v => v.id);

            await tx.jurnalUmum.updateMany({
                where: { voucherId: { in: voucherIds } },
                data: { isPosted: false }
            });

            return updatedTransaction;
        });

        await AuditService.log({
            perusahaanId: result.perusahaanId,
            userId: authReq.user.id,
            action: 'VOID',
            entity: 'Transaksi',
            entityId: id,
            details: `Voided transaction ${result.nomorTransaksi} - Reason: ${reason}`,
            req
        });

        res.json(result);
    } catch (error: unknown) {
        console.error(error);
        const err = error as Error;
        res.status(400).json({ message: err.message || 'Gagal membatalkan transaksi' });
    }
};

export const duplicateTransaction = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const id = req.params.id;
        const perusahaanId = authReq.currentCompanyId!;

        const transaction = await prisma.transaksi.findUnique({
            where: { id: id as string, perusahaanId },
            include: {
                voucher: {
                    include: {
                        jurnal: {
                            include: {
                                detail: true
                            }
                        }
                    }
                }
            }
        });

        if (!transaction) return res.status(404).json({ message: 'Transaksi tidak ditemukan' });

        const tx = transaction as any;

        // Simple duplication: return the data to be used in a NEW create call
        const duplicationData = {
            tipe: tx.tipe,
            deskripsi: `SALINAN: ${tx.deskripsi}`,
            tanggal: new Date(),
            total: Number(tx.total),
            items: tx.voucher?.jurnal?.[0]?.detail.map((d: any) => ({
                akunId: d.akunId,
                debit: Number(d.debit),
                kredit: Number(d.kredit),
                deskripsi: d.deskripsi
            })) || []
        };

        res.json(duplicationData);
    } catch (error: unknown) {
        console.error(error);
        const err = error as Error;
        res.status(400).json({ message: err.message || 'Gagal menyalin transaksi' });
    }
};

export const exportTransactions = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;

        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const type = req.query.type as string | undefined;
        const search = req.query.search as string | undefined;

        const where: Prisma.TransaksiWhereInput = {
            perusahaanId: perusahaanId,
        };

        if (startDate && startDate !== 'undefined') {
            const start = new Date(startDate);
            if (!isNaN(start.getTime())) {
                where.tanggal = { ...(where.tanggal as Record<string, unknown>), gte: start };
            }
        }

        if (endDate && endDate !== 'undefined') {
            const end = new Date(endDate);
            if (!isNaN(end.getTime())) {
                where.tanggal = { ...(where.tanggal as any), lte: end };
            }
        }

        if (type && type !== 'undefined') {
            where.tipe = type as TipeTransaksi;
        }

        if (search) {
            where.OR = [
                { deskripsi: { contains: search, mode: 'insensitive' } },
                { nomorTransaksi: { contains: search, mode: 'insensitive' } }
            ];
        }

        const transactions = await prisma.transaksi.findMany({
            where,
            orderBy: { tanggal: 'desc' },
            include: {
                pengguna: { select: { namaLengkap: true } },
                mataUang: true,
            }
        });

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Transactions');

        sheet.columns = [
            { header: 'Tanggal', key: 'tanggal', width: 15 },
            { header: 'Nomor Transaksi', key: 'nomorTransaksi', width: 20 },
            { header: 'Tipe', key: 'tipe', width: 20 },
            { header: 'Deskripsi', key: 'deskripsi', width: 40 },
            { header: 'Referensi', key: 'referensi', width: 20 },
            { header: 'Total', key: 'total', width: 15 },
            { header: 'Status', key: 'statusPembayaran', width: 15 },
            { header: 'Dibuat Oleh', key: 'pengguna', width: 20 },
        ];

        transactions.forEach(tx => {
            sheet.addRow({
                tanggal: format(new Date(tx.tanggal), 'yyyy-MM-dd'),
                nomorTransaksi: tx.nomorTransaksi,
                tipe: tx.tipe,
                deskripsi: tx.deskripsi,
                referensi: tx.referensi || '',
                total: Number(tx.total),
                statusPembayaran: tx.isVoid ? 'DIBATALKAN' : tx.statusPembayaran,
                pengguna: tx.pengguna.namaLengkap
            });
        });

        // Styling
        sheet.getRow(1).font = { bold: true };
        sheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Transactions-${new Date().toISOString().slice(0, 10)}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Export Transactions Error:', error);
        res.status(500).json({ message: 'Gagal mengexport data transaksi' });
    }
};
