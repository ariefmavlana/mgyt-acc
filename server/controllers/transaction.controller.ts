import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../../lib/prisma';
import { createTransactionSchema } from '../validators/transaction.validator';
import { Prisma } from '@prisma/client';

export const getTransactions = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.user.perusahaanId;

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
                where.tanggal = { ...(where.tanggal as object), gte: start };
            }
        }

        if (endDate && endDate !== 'undefined') {
            const end = new Date(endDate);
            if (!isNaN(end.getTime())) {
                where.tanggal = { ...(where.tanggal as object), lte: end };
            }
        }

        if (type && type !== 'undefined') {
            where.tipe = type as Prisma.EnumTipeTransaksiFilter;
        }

        const [transactions, total] = await Promise.all([
            prisma.transaksi.findMany({
                where,
                skip,
                take: limit,
                orderBy: { tanggal: 'desc' },
                include: {
                    pengguna: { select: { namaLengkap: true } },
                    mataUang: true,
                }
            }),
            prisma.transaksi.count({ where })
        ]);

        res.json({
            transactions,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
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
        const validatedData = createTransactionSchema.parse(req.body);
        const perusahaanId = authReq.user.perusahaanId;

        const result = await prisma.$transaction(async (tx) => {
            // 1. Find or create active period
            const date = new Date(validatedData.tanggal);
            const month = date.getMonth() + 1;
            const year = date.getFullYear();

            let period = await tx.periodeAkuntansi.findFirst({
                where: {
                    perusahaanId,
                    bulan: month,
                    tahun: year,
                    status: 'TERBUKA'
                }
            });

            if (!period) {
                // Auto-create period if it doesn't exist? 
                // In strict systems, this should error. Let's create it for now to be user-friendly.
                period = await tx.periodeAkuntansi.create({
                    data: {
                        perusahaanId,
                        bulan: month,
                        tahun: year,
                        nama: `${month}-${year}`,
                        tanggalMulai: new Date(year, month - 1, 1),
                        tanggalAkhir: new Date(year, month, 0),
                        status: 'TERBUKA',
                    }
                });
            }

            // 2. Create Transaksi
            const totalAmount = validatedData.items.reduce((sum, item) => sum + item.debit, 0); // Since it must be balanced

            const transNo = validatedData.nomorTransaksi || `TRX-${Date.now()}`;

            const transaksi = await tx.transaksi.create({
                data: {
                    perusahaanId,
                    penggunaId: authReq.user.id,
                    nomorTransaksi: transNo,
                    tanggal: date,
                    tipe: validatedData.tipe as 'PENJUALAN' | 'PEMBELIAN' | 'JURNAL_UMUM',
                    deskripsi: validatedData.deskripsi,
                    referensi: validatedData.referensi,
                    total: totalAmount,
                    statusPembayaran: 'LUNAS', // Default to LUNAS for simple journal entries
                    isPosted: true,
                    postedAt: new Date(),
                    postedBy: authReq.user.username,
                    detail: {
                        create: validatedData.items.map((item, index) => ({
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

            // 3. Create Voucher
            const voucher = await tx.voucher.create({
                data: {
                    perusahaanId,
                    transaksiId: transaksi.id,
                    nomorVoucher: `VCH-${transNo}`,
                    tanggal: date,
                    tipe: 'JURNAL_UMUM',
                    deskripsi: validatedData.deskripsi,
                    totalDebit: totalAmount,
                    totalKredit: totalAmount,
                    status: 'DIPOSTING',
                    dibuatOlehId: authReq.user.id,
                    isPosted: true,
                    postedAt: new Date(),
                    postedBy: authReq.user.username,
                    detail: {
                        create: validatedData.items.map((item, index) => ({
                            urutan: index + 1,
                            akunId: item.akunId,
                            deskripsi: item.deskripsi || validatedData.deskripsi,
                            debit: item.debit,
                            kredit: item.kredit,
                        }))
                    }
                }
            });

            // 4. Create Jurnal Umum
            await tx.jurnalUmum.create({
                data: {
                    perusahaanId,
                    periodeId: period.id,
                    voucherId: voucher.id,
                    nomorJurnal: `GL-${transNo}`,
                    tanggal: date,
                    deskripsi: validatedData.deskripsi,
                    totalDebit: totalAmount,
                    totalKredit: totalAmount,
                    isPosted: true,
                    postedAt: new Date(),
                    detail: {
                        create: validatedData.items.map((item, index) => ({
                            urutan: index + 1,
                            akunId: item.akunId,
                            deskripsi: item.deskripsi || validatedData.deskripsi,
                            debit: item.debit,
                            kredit: item.kredit,
                        }))
                    }
                }
            });

            // 5. Update COA Balances (Real-time)
            for (const item of validatedData.items) {
                const akun = await tx.chartOfAccounts.findUnique({
                    where: { id: item.akunId }
                });

                if (akun) {
                    // Update Balance
                    const adjustment = item.debit - item.kredit;
                    // Note: normal balance logic usually applies here (Debit balance vs Credit balance)
                    // For now, we update saldoBerjalan directly as a net amount.
                    await tx.chartOfAccounts.update({
                        where: { id: item.akunId },
                        data: {
                            saldoBerjalan: {
                                increment: adjustment
                            }
                        }
                    });
                }
            }

            return transaksi;
        });

        res.status(201).json({
            message: 'Transaksi berhasil disimpan dan diposting',
            transaksi: result
        });
    } catch (error: unknown) {
        console.error(error);
        if (typeof error === 'object' && error !== null && 'name' in error && error.name === 'ZodError') {
            const zodError = error as unknown as { errors: Array<{ message: string }> };
            const errorMessage = zodError.errors?.[0]?.message || 'Validasi gagal';
            return res.status(400).json({ message: errorMessage, errors: zodError.errors });
        }
        res.status(500).json({ message: 'Gagal membuat transaksi' });
    }
};

export const getAccounts = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.user.perusahaanId;

        const accounts = await prisma.chartOfAccounts.findMany({
            where: {
                perusahaanId,
                isActive: true,
            },
            orderBy: { kodeAkun: 'asc' },
            select: {
                id: true,
                kodeAkun: true,
                namaAkun: true,
                tipe: true,
                isHeader: true,
                saldoBerjalan: true,
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
        const perusahaanId = authReq.user.perusahaanId;

        const result = await prisma.$transaction(async (tx) => {
            // 1. Find the transaction with its details
            const transaction = await tx.transaksi.findUnique({
                where: { id, perusahaanId },
                include: { detail: true }
            });

            if (!transaction) {
                throw new Error('Transaksi tidak ditemukan');
            }

            if (transaction.isVoid) {
                throw new Error('Transaksi sudah dibatalkan sebelumnya');
            }

            // 2. Mark as void
            const updatedTransaction = await tx.transaksi.update({
                where: { id },
                data: {
                    isVoid: true,
                    voidAt: new Date(),
                    voidBy: authReq.user.username,
                }
            });

            // 3. Reverse COA Balances
            for (const item of transaction.detail) {
                // Find journal details for this transaction item to get exact debit/credit amounts
                const journalDetails = await tx.jurnalDetail.findMany({
                    where: {
                        jurnal: {
                            voucher: { transaksiId: id }
                        },
                        akunId: item.akunId
                    }
                });

                for (const jd of journalDetails) {
                    // Reverse the movement: if it was + (debit - kredit), reversal is - (debit - kredit) = kredit - debit
                    const adjustment = Number(jd.kredit) - Number(jd.debit);
                    await tx.chartOfAccounts.update({
                        where: { id: jd.akunId },
                        data: {
                            saldoBerjalan: {
                                increment: adjustment
                            }
                        }
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

        res.json({
            message: 'Transaksi berhasil dibatalkan',
            transaksi: result
        });
    } catch (error: unknown) {
        console.error(error);
        const err = error as Error;
        res.status(400).json({ message: err.message || 'Gagal membatalkan transaksi' });
    }
};
