"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.receivePayment = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const zod_1 = require("zod");
const createPaymentSchema = zod_1.z.object({
    invoiceId: zod_1.z.string().min(1, 'Invoice ID harus diisi'),
    tanggal: zod_1.z.string().or(zod_1.z.date()),
    jumlah: zod_1.z.number().min(1, 'Jumlah pembayaran harus > 0'),
    metodePembayaran: zod_1.z.enum(['TUNAI', 'TRANSFER_BANK', 'CEK', 'GIRO', 'KARTU_KREDIT', 'KARTU_DEBIT', 'E_WALLET', 'VIRTUAL_ACCOUNT']),
    bankRekeningId: zod_1.z.string().optional(), // If Transfer
    nomorReferensi: zod_1.z.string().optional(),
    catatan: zod_1.z.string().optional(),
});
const receivePayment = async (req, res) => {
    try {
        const authReq = req;
        const perusahaanId = authReq.user.perusahaanId;
        const validatedData = createPaymentSchema.parse(req.body);
        // 1. Validate Invoice & Piutang
        const invoice = await prisma_1.default.transaksi.findUnique({
            where: { id: validatedData.invoiceId, perusahaanId },
            include: { piutangs: true }
        });
        if (!invoice)
            return res.status(404).json({ message: 'Invoice tidak ditemukan' });
        // Find main Piutang record (assuming 1 active)
        const piutang = invoice.piutangs[0];
        if (!piutang)
            return res.status(404).json({ message: 'Data piutang tidak ditemukan untuk invoice ini' });
        if (Number(piutang.sisaPiutang) < validatedData.jumlah) {
            return res.status(400).json({
                message: `Jumlah pembayaran melebihi sisa piutang (Sisa: ${piutang.sisaPiutang})`
            });
        }
        const result = await prisma_1.default.$transaction(async (tx) => {
            var _a;
            const tanggal = new Date(validatedData.tanggal);
            // 2. Create PembayaranPiutang
            const pembayaran = await tx.pembayaranPiutang.create({
                data: {
                    piutangId: piutang.id,
                    tanggalBayar: tanggal,
                    jumlahBayar: validatedData.jumlah,
                    mataUangId: invoice.mataUangId || 'IDR', // Simplified fallback
                    tipePembayaran: validatedData.metodePembayaran,
                    nomorReferensi: validatedData.nomorReferensi,
                    keterangan: validatedData.catatan,
                }
            });
            // 3. Update Piutang Balance & Status
            const newPaid = Number(piutang.jumlahDibayar) + validatedData.jumlah;
            const newRemaining = Number(piutang.jumlahPiutang) - newPaid;
            let status = newRemaining <= 0 ? 'LUNAS' : 'DIBAYAR_SEBAGIAN';
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
            let debitAccountId;
            if (validatedData.bankRekeningId) {
                // Future: Link BankRekening to COA. For now, use default Cash/Bank account.
            }
            if (!debitAccountId) {
                // Fallback: Find a Cash Account
                const cashAccount = await tx.chartOfAccounts.findFirst({
                    where: { perusahaanId, kategoriAset: 'KAS_DAN_SETARA_KAS', tipe: 'ASET' }
                });
                debitAccountId = cashAccount === null || cashAccount === void 0 ? void 0 : cashAccount.id;
            }
            if (!debitAccountId)
                throw new Error('Akun Kas/Bank tidak ditemukan untuk penerimaan pembayaran');
            // Credit Account: Piutang (use same logic as Invoice creation - find AR account)
            const creditAccount = await tx.chartOfAccounts.findFirst({
                where: {
                    perusahaanId,
                    tipe: 'ASET',
                    kategoriAset: 'PIUTANG_USAHA'
                }
            });
            if (!creditAccount)
                throw new Error('Akun Piutang tidak ditemukan');
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
                                akunId: debitAccountId,
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
                    periodeId: (_a = (await tx.periodeAkuntansi.findFirst({ where: { perusahaanId, status: 'TERBUKA' } }))) === null || _a === void 0 ? void 0 : _a.id, // Safe-ish assumption
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
                            { urutan: 1, akunId: debitAccountId, debit: validatedData.jumlah, kredit: 0 },
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
    }
    catch (error) {
        console.error('Payment Error:', error);
        res.status(500).json({ message: error.message || 'Gagal mencatat pembayaran' });
    }
};
exports.receivePayment = receivePayment;
