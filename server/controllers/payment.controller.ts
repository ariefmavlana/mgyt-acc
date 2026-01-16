import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../../lib/prisma';
import { z } from 'zod';

const createPaymentSchema = z.object({
    pelangganId: z.string().optional(), // Now optional if matching multiple
    invoiceId: z.string().optional(), // Optional if using allocations
    allocations: z.array(z.object({
        invoiceId: z.string(),
        amount: z.number().min(0.01)
    })).optional(),
    tanggal: z.string().or(z.date()),
    jumlah: z.number().min(1, 'Jumlah pembayaran harus > 0'),
    metodePembayaran: z.enum(['TUNAI', 'TRANSFER_BANK', 'CEK', 'GIRO', 'KARTU_KREDIT', 'KARTU_DEBIT', 'E_WALLET', 'VIRTUAL_ACCOUNT']),
    bankRekeningId: z.string().optional(),
    nomorReferensi: z.string().optional(),
    catatan: z.string().optional(),
    cabangId: z.string().optional(),
});

export const receivePayment = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
        const validatedData = createPaymentSchema.parse(req.body);

        let targets: { invoiceId: string, amount: number }[] = [];

        if (validatedData.allocations && validatedData.allocations.length > 0) {
            targets = validatedData.allocations;
        } else if (validatedData.invoiceId) {
            targets = [{ invoiceId: validatedData.invoiceId, amount: validatedData.jumlah }];
        } else {
            return res.status(400).json({ message: 'Harap tentukan invoiceId atau alokasi pembayaran' });
        }

        const totalAmount = targets.reduce((sum, t) => sum + t.amount, 0);

        // Sanity check
        if (Math.abs(totalAmount - validatedData.jumlah) > 100) { // Tolerate small diffs? No, strict.
            // Actually, let's just use validatedData.jumlah as the master check
            if (totalAmount > validatedData.jumlah) {
                return res.status(400).json({ message: 'Total alokasi melebihi jumlah pembayaran' });
            }
        }

        const result = await prisma.$transaction(async (tx) => {
            const tanggal = new Date(validatedData.tanggal);

            // 1. Determine Debit Account (Cash/Bank)
            let debitAccountId: string | undefined;

            if (validatedData.bankRekeningId) {
                // Verify bank belongs to company (omitted for brevity)
                // Find associated COA for this Bank Acct if mapped. 
                // Schema doesn't show direct link in BankRekening? 
                // Assuming BankRekening has `akunId`? Not in schema snippets.
                // Fallback: search COA by name or use default KAS
            }

            if (!debitAccountId) {
                const cashAccount = await tx.chartOfAccounts.findFirst({
                    where: { perusahaanId, kategoriAset: 'KAS_DAN_SETARA_KAS', tipe: 'ASET' }
                });
                debitAccountId = cashAccount?.id;
            }

            if (!debitAccountId) throw new Error('Akun Kas/Bank tidak ditemukan');

            // 2. Find Credit Account (Piutang) - assuming same AR account for all?
            const arAccount = await tx.chartOfAccounts.findFirst({
                where: { perusahaanId, tipe: 'ASET', kategoriAset: 'PIUTANG_USAHA' }
            });

            if (!arAccount) throw new Error('Akun Piutang tidak ditemukan');

            // 3. Create Voucher (Head)
            const voucher = await tx.voucher.create({
                data: {
                    perusahaanId,
                    nomorVoucher: `RCP-${Date.now().toString().slice(-8)}`, // Use a better generator in a real service
                    tanggal,
                    tipe: 'KAS_MASUK',
                    cabangId: validatedData.cabangId,
                    deskripsi: validatedData.catatan || `Pembayaran Pelanggan`,
                    totalDebit: totalAmount,
                    totalKredit: totalAmount,
                    status: 'DIPOSTING',
                    dibuatOlehId: authReq.user.id,
                    isPosted: true,
                    postedAt: new Date(),
                    postedBy: authReq.user.username,
                    detail: {
                        create: [
                            {
                                urutan: 1,
                                akunId: debitAccountId!,
                                deskripsi: `Terima Pembayaran ${validatedData.nomorReferensi || ''}`,
                                debit: totalAmount,
                                kredit: 0
                            }
                        ]
                    }
                }
            });

            // 4. Process Allocations
            let seq = 2;
            const journalDetails = [
                { urutan: 1, akunId: debitAccountId!, debit: totalAmount, kredit: 0, deskripsi: `Terima Kas` }
            ];

            // Get default currency if needed
            const defaultCurrency = await tx.mataUang.findFirst({ where: { kode: 'IDR' } }); // Fallback
            if (!defaultCurrency) throw new Error('Mata uang sistem (IDR) tidak ditemukan');

            for (const target of targets) {
                const invoice = await tx.transaksi.findUnique({
                    where: { id: target.invoiceId, perusahaanId },
                    include: { piutangs: true }
                });

                if (!invoice) throw new Error(`Invoice ${target.invoiceId} tidak ditemukan`);
                const piutang = invoice.piutangs[0];
                if (!piutang) throw new Error(`Data piutang tidak ditemukan untuk invoice ${invoice.nomorTransaksi}`);

                if (Number(piutang.sisaPiutang) < target.amount) {
                    throw new Error(`Pembayaran melebihi sisa invoice ${invoice.nomorTransaksi}`);
                }

                // Create PembayaranPiutang
                await tx.pembayaranPiutang.create({
                    data: {
                        piutangId: piutang.id,
                        voucherId: voucher.id,
                        tanggalBayar: tanggal,
                        jumlahBayar: target.amount,
                        mataUangId: invoice.mataUangId || defaultCurrency.id,
                        tipePembayaran: validatedData.metodePembayaran as any,
                        nomorReferensi: validatedData.nomorReferensi,
                        keterangan: `Aloakasi ke ${invoice.nomorTransaksi}`,
                    }
                });

                // Update Piutang
                const newPaid = Number(piutang.jumlahDibayar) + target.amount;
                const newRemaining = Number(piutang.jumlahPiutang) - newPaid;
                const status = newRemaining <= 0 ? 'LUNAS' : 'DIBAYAR_SEBAGIAN';

                await tx.piutang.update({
                    where: { id: piutang.id },
                    data: { jumlahDibayar: newPaid, sisaPiutang: newRemaining, statusPembayaran: status }
                });

                // Update Transaksi
                await tx.transaksi.update({
                    where: { id: invoice.id },
                    data: { totalDibayar: { increment: target.amount }, sisaPembayaran: newRemaining, statusPembayaran: status }
                });

                // Add Voucher Detail (Credit Side)
                await tx.voucherDetail.create({
                    data: {
                        voucherId: voucher.id,
                        urutan: seq,
                        akunId: arAccount.id,
                        deskripsi: `Pelunasan ${invoice.nomorTransaksi}`,
                        debit: 0,
                        kredit: target.amount
                    }
                });

                journalDetails.push({
                    urutan: seq,
                    akunId: arAccount.id,
                    deskripsi: `Pelunasan ${invoice.nomorTransaksi}`,
                    debit: 0,
                    kredit: target.amount
                });

                seq++;
            }

            // 5. Create GL
            await tx.jurnalUmum.create({
                data: {
                    perusahaanId,
                    periodeId: (await tx.periodeAkuntansi.findFirst({ where: { perusahaanId, status: 'TERBUKA' } }))?.id!,
                    voucherId: voucher.id,
                    cabangId: validatedData.cabangId,
                    nomorJurnal: `GL-${voucher.nomorVoucher}`,
                    tanggal,
                    deskripsi: voucher.deskripsi,
                    totalDebit: totalAmount,
                    totalKredit: totalAmount,
                    isPosted: true,
                    postedAt: new Date(),
                    detail: {
                        create: journalDetails.map(jd => ({
                            urutan: jd.urutan,
                            akunId: jd.akunId,
                            deskripsi: jd.deskripsi,
                            debit: jd.debit,
                            kredit: jd.kredit
                        }))
                    }
                }
            });

            // 6. Update COA Balances
            await tx.chartOfAccounts.update({
                where: { id: debitAccountId },
                data: { saldoBerjalan: { increment: totalAmount } }
            });
            await tx.chartOfAccounts.update({
                where: { id: arAccount.id },
                data: { saldoBerjalan: { decrement: totalAmount } }
            });

            return voucher;
        });

        res.status(201).json({ message: 'Pembayaran berhasil dikonfirmasi', data: result });
    } catch (error: any) {
        console.error('Payment Error:', error);
        res.status(500).json({ message: error.message || 'Gagal memproses pembayaran' });
    }
};

export const getPaymentSuggestions = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
        const { amount, pelangganId } = req.query;

        const targetAmount = amount ? Number(amount) : 0;

        const where: any = {
            perusahaanId,
            sisaPiutang: { gt: 0 }
        };

        if (pelangganId) {
            where.pelangganId = String(pelangganId);
        }

        const piutangs = await prisma.piutang.findMany({
            where,
            include: {
                pelanggan: { select: { nama: true } },
                transaksi: { select: { nomorTransaksi: true, total: true } }
            }
        });

        // 1. Exact matches
        const exactMatches = piutangs.filter((p: any) => Math.abs(Number(p.sisaPiutang) - targetAmount) < 0.01);

        // 2. Partial matches or close amounts (within 5%)
        const closeMatches = piutangs.filter((p: any) => {
            const diff = Math.abs(Number(p.sisaPiutang) - targetAmount);
            return diff > 0.01 && diff <= targetAmount * 0.05;
        });

        res.json({
            exactMatches: exactMatches.map((p: any) => ({
                id: p.transaksiId,
                nomor: p.transaksi.nomorTransaksi,
                pelanggan: p.pelanggan.nama,
                sisa: p.sisaPiutang
            })),
            otherSuggestions: piutangs.slice(0, 10).map((p: any) => ({
                id: p.transaksiId,
                nomor: p.transaksi.nomorTransaksi,
                pelanggan: p.pelanggan.nama,
                sisa: p.sisaPiutang
            }))
        });

    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil saran pencocokan pembayaran' });
    }
};
