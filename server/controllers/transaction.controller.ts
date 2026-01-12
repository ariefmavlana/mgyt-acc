
import { Request, Response } from 'express';
import { Prisma, TipeTransaksi } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { createTransactionSchema } from '../validators/transaction.validator';
import { AccountingEngine } from '../lib/accounting-engine';
import { AuditService } from '../services/audit.service';

import prisma from '../../lib/prisma';

export const getTransactions = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;

        const page = parseInt((req.query.page as string) || '1');
        const limit = parseInt((req.query.limit as string) || '10');
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
                where.tanggal = { ...(where.tanggal as any), gte: start };
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
            const engine = new AccountingEngine(tx as any); // Cast to handle transaction client compatibility
            const date = new Date(validatedData.tanggal);

            // 1. Validate Period
            const period = await engine.validatePeriod(perusahaanId, date);

            // 2. Generate Numbers
            const transNo = validatedData.nomorTransaksi || await engine.generateNumber(perusahaanId, 'TRX', 'transaksi');
            const voucherNo = await engine.generateNumber(perusahaanId, 'VCH', 'voucher');
            const journalNo = await engine.generateNumber(perusahaanId, 'GL', 'jurnalUmum');

            const totalAmount = validatedData.items.reduce((sum: number, item: any) => sum + Number(item.debit), 0);

            // 3. Create Transaksi
            const transaksi = await tx.transaksi.create({
                data: {
                    perusahaanId,
                    penggunaId: authReq.user.id,
                    nomorTransaksi: transNo,
                    tanggal: date,
                    tipe: validatedData.tipe as TipeTransaksi,
                    deskripsi: validatedData.deskripsi,
                    referensi: validatedData.referensi,
                    total: totalAmount,
                    statusPembayaran: 'LUNAS',
                    isPosted: true,
                    postedAt: new Date(),
                    postedBy: authReq.user.username,
                    detail: {
                        create: validatedData.items.map((item: any, index: number) => ({
                            urutan: index + 1,
                            akunId: item.akunId,
                            deskripsi: item.deskripsi || validatedData.deskripsi,
                            hargaSatuan: item.debit > 0 ? item.debit : item.kredit,
                            kuantitas: 1,
                            subtotal: item.debit > 0 ? item.debit : item.kredit,
                        }))
                    }
                }
            });

            // 4. Create Voucher
            const voucher = await tx.voucher.create({
                data: {
                    perusahaanId,
                    transaksiId: transaksi.id,
                    nomorVoucher: voucherNo,
                    tanggal: date,
                    tipe: 'JURNAL_UMUM',
                    deskripsi: validatedData.deskripsi,
                    totalDebit: totalAmount,
                    totalKredit: totalAmount,
                    status: 'DIPOSTING',
                    dibuatOlehId: authReq.user.id,
                    lampiran: validatedData.lampiran,
                    isPosted: true,
                    postedAt: new Date(),
                    postedBy: authReq.user.username,
                    detail: {
                        create: validatedData.items.map((item: any, index: number) => ({
                            urutan: index + 1,
                            akunId: item.akunId,
                            deskripsi: item.deskripsi || validatedData.deskripsi,
                            debit: item.debit,
                            kredit: item.kredit,
                        }))
                    }
                }
            });

            // 5. Create Jurnal & Update Balances
            const journal = await tx.jurnalUmum.create({
                data: {
                    perusahaanId,
                    periodeId: period.id,
                    voucherId: voucher.id,
                    nomorJurnal: journalNo,
                    tanggal: date,
                    deskripsi: validatedData.deskripsi,
                    totalDebit: totalAmount,
                    totalKredit: totalAmount,
                    isPosted: true,
                    postedAt: new Date(),
                }
            });

            // PRE-FETCH ACCOUNTS FOR BALANCE UPDATES
            const accountIds = validatedData.items.map((i: any) => i.akunId);
            const accounts = await tx.chartOfAccounts.findMany({
                where: { id: { in: accountIds } }
            });
            const accountMap = new Map(accounts.map(a => [a.id, a]));

            const balanceUpdates: Record<string, number> = {};

            for (const [index, item] of validatedData.items.entries()) {
                const amount = item.debit > 0 ? item.debit : item.kredit;
                const type = item.debit > 0 ? 'DEBIT' : 'KREDIT';
                const account = accountMap.get(item.akunId);

                if (!account) throw new Error(`Akun ID ${item.akunId} tidak ditemukan`);

                const change = type === 'DEBIT' ? amount : -amount;
                const saldoSebelum = Number(account.saldoBerjalan);
                const currentAggregatedChange = balanceUpdates[item.akunId] || 0;

                // Track aggregated change for DB update at the end
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
        const reason = req.body.reason || 'Voided by user';

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

            // Check period
            await engine.validatePeriod(perusahaanId, transaction.tanggal);

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
                const reversalAccountIds = originalJournalDetail.map((jd: any) => jd.akunId);
                const reversalAccounts = await tx.chartOfAccounts.findMany({
                    where: { id: { in: reversalAccountIds } }
                });
                const reversalAccountMap = new Map(reversalAccounts.map(a => [a.id, a]));
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
