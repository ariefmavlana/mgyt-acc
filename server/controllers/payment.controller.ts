import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../../lib/prisma';
import { z } from 'zod';

const createPaymentSchema = z.object({
    invoiceId: z.string().min(1, 'Invoice ID harus diisi'),
    tanggal: z.string().or(z.date()),
    jumlah: z.number().min(1, 'Jumlah pembayaran harus > 0'),
    metodePembayaran: z.enum(['TUNAI', 'TRANSFER_BANK', 'CEK', 'GIRO', 'KARTU_KREDIT', 'KARTU_DEBIT', 'E_WALLET', 'VIRTUAL_ACCOUNT']),
    bankRekeningId: z.string().optional(), // If Transfer
    nomorReferensi: z.string().optional(),
    catatan: z.string().optional(),
});

export const receivePayment = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.user.perusahaanId;
        const validatedData = createPaymentSchema.parse(req.body);

        // 1. Validate Invoice & Piutang
        const invoice = await prisma.transaksi.findUnique({
            where: { id: validatedData.invoiceId, perusahaanId },
            include: { piutangs: true }
        });

        if (!invoice) return res.status(404).json({ message: 'Invoice tidak ditemukan' });

        // Find main Piutang record (assuming 1 active)
        const piutang = invoice.piutangs[0];
        if (!piutang) return res.status(404).json({ message: 'Data piutang tidak ditemukan untuk invoice ini' });

        if (Number(piutang.sisaPiutang) < validatedData.jumlah) {
            return res.status(400).json({
                message: `Jumlah pembayaran melebihi sisa piutang (Sisa: ${piutang.sisaPiutang})`
            });
        }

        const result = await prisma.$transaction(async (tx) => {
            const tanggal = new Date(validatedData.tanggal);

            // 2. Create PembayaranPiutang
            const pembayaran = await tx.pembayaranPiutang.create({
                data: {
                    piutangId: piutang.id,
                    tanggalBayar: tanggal,
                    jumlahBayar: validatedData.jumlah,
                    mataUangId: invoice.mataUangId || 'IDR', // Simplified fallback
                    tipePembayaran: validatedData.metodePembayaran as any,
                    nomorReferensi: validatedData.nomorReferensi,
                    keterangan: validatedData.catatan,
                }
            });

            // 3. Update Piutang Balance & Status
            const newPaid = Number(piutang.jumlahDibayar) + validatedData.jumlah;
            const newRemaining = Number(piutang.jumlahPiutang) - newPaid;
            let status: 'LUNAS' | 'DIBAYAR_SEBAGIAN' = newRemaining <= 0 ? 'LUNAS' : 'DIBAYAR_SEBAGIAN';

            await tx.piutang.update({
                where: { id: piutang.id },
                data: {
                    jumlahDibayar: newPaid,
                    sisaPiutang: newRemaining,
                    statusPembayaran: status
                }
            });

            // 4. Update Transaksi Status
            await tx.transaksi.update({
                where: { id: invoice.id },
                data: {
                    totalDibayar: { increment: validatedData.jumlah },
                    sisaPembayaran: newRemaining,
                    statusPembayaran: status
                }
            });

            // 5. Create Accounting Voucher (Receipt)
            // DEBIT: Kas/Bank
            // CREDIT: Piutang Usaha

            // Need Accounts
            // Debit Account: Depends on Payment Method.
            // If Cash -> Kas Account. If Bank -> Bank Account.
            // For MVP, if BankRekeningId provided, use that account. If Cash, find default Kas.
            let debitAccountId: string | undefined;

            if (validatedData.bankRekeningId) {
                // Fetch Bank Account linked COA
                const bank = await tx.bankRekening.findUnique({ where: { id: validatedData.bankRekeningId } });
                if (bank) debitAccountId = bank.akunId;
            }

            if (!debitAccountId) {
                // Fallback: Find a Cash Account
                const cashAccount = await tx.chartOfAccounts.findFirst({
                    where: { perusahaanId, kategoriAset: 'KAS_DAN_SETARA_KAS', tipe: 'ASET' }
                });
                debitAccountId = cashAccount?.id;
            }

            if (!debitAccountId) throw new Error('Akun Kas/Bank tidak ditemukan untuk penerimaan pembayaran');

            // Credit Account: Piutang (use same logic as Invoice creation - find AR account)
            const creditAccount = await tx.chartOfAccounts.findFirst({
                where: {
                    perusahaanId,
                    tipe: 'ASET',
                    kategoriAset: 'PIUTANG_USAHA'
                }
            });
            if (!creditAccount) throw new Error('Akun Piutang tidak ditemukan');

            const voucher = await tx.voucher.create({
                data: {
                    perusahaanId,
                    nomorVoucher: `RCP-${pembayaran.id.slice(-6)}`,
                    tanggal,
                    tipe: 'KAS_MASUK',
                    deskripsi: `Pembayaran Invoice ${invoice.nomorTransaksi}`,
                    totalDebit: validatedData.jumlah,
                    totalKredit: validatedData.jumlah,
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
                                deskripsi: `Terima Pembayaran ${invoice.nomorTransaksi}`,
                                debit: validatedData.jumlah,
                                kredit: 0
                            },
                            {
                                urutan: 2,
                                akunId: creditAccount.id,
                                deskripsi: `Pelunasan Piutang ${invoice.nomorTransaksi}`,
                                debit: 0,
                                kredit: validatedData.jumlah
                            }
                        ]
                    }
                }
            });

            // 6. Create GL
            // Similar to above... omitted for brevity but should be created here for full system.
            // (Assuming Voucher automatically triggers GL optional, but manual here means reliable)
            await tx.jurnalUmum.create({
                data: {
                    perusahaanId,
                    periodeId: (await tx.periodeAkuntansi.findFirst({ where: { perusahaanId, status: 'TERBUKA' } }))?.id!, // Safe-ish assumption
                    voucherId: voucher.id,
                    nomorJurnal: `GL-RCP-${pembayaran.id.slice(-6)}`,
                    tanggal,
                    deskripsi: `Pembayaran ${invoice.nomorTransaksi}`,
                    totalDebit: validatedData.jumlah,
                    totalKredit: validatedData.jumlah,
                    isPosted: true,
                    postedAt: new Date(),
                    detail: {
                        create: [
                            { urutan: 1, akunId: debitAccountId!, debit: validatedData.jumlah, kredit: 0 },
                            { urutan: 2, akunId: creditAccount.id, debit: 0, kredit: validatedData.jumlah }
                        ]
                    }
                }
            });

            // 7. Update COA
            await tx.chartOfAccounts.update({
                where: { id: debitAccountId },
                data: { saldoBerjalan: { increment: validatedData.jumlah } }
            });
            await tx.chartOfAccounts.update({
                where: { id: creditAccount.id },
                data: { saldoBerjalan: { decrement: validatedData.jumlah } }
            });

            return pembayaran;
        });

        res.status(201).json({ message: 'Pembayaran berhasil dicatat', data: result });

    } catch (error: any) {
        console.error('Payment Error:', error);
        res.status(500).json({ message: error.message || 'Gagal mencatat pembayaran' });
    }
};
