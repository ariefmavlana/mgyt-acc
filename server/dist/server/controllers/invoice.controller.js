"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInvoiceAging = exports.getAgingSchedule = exports.generateInvoicePDF = exports.getInvoiceDetail = exports.getInvoices = exports.createInvoice = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const invoice_validator_1 = require("../validators/invoice.validator");
const date_fns_1 = require("date-fns");
const pdfkit_1 = __importDefault(require("pdfkit"));
const createInvoice = async (req, res) => {
    try {
        const authReq = req;
        const perusahaanId = authReq.user.perusahaanId;
        const validatedData = invoice_validator_1.createInvoiceSchema.parse(req.body);
        const result = await prisma_1.default.$transaction(async (tx) => {
            // 1. Setup Dates
            const tanggal = new Date(validatedData.tanggal);
            const jatuhTempo = validatedData.tanggalJatuhTempo
                ? new Date(validatedData.tanggalJatuhTempo)
                : (0, date_fns_1.addDays)(tanggal, validatedData.terminPembayaran);
            const month = tanggal.getMonth() + 1;
            const year = tanggal.getFullYear();
            // 2. Transaksi Numbering
            const invNo = validatedData.nomorInvoice || `INV/${year}/${month}/${Date.now().toString().slice(-4)}`;
            // 3. Find or Create Period
            let period = await tx.periodeAkuntansi.findFirst({
                where: { perusahaanId, bulan: month, tahun: year, status: 'TERBUKA' }
            });
            if (!period) {
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
            // 4. Calculate Totals
            let subtotal = 0;
            const detailItems = validatedData.items.map((item, idx) => {
                const amount = item.kuantitas * item.hargaSatuan - (item.diskon || 0);
                subtotal += amount;
                return {
                    urutan: idx + 1,
                    akunId: item.akunId,
                    deskripsi: item.deskripsi || `Item ${idx + 1}`,
                    kuantitas: item.kuantitas,
                    hargaSatuan: item.hargaSatuan,
                    diskon: item.diskon,
                    subtotal: amount,
                    // For TransaksiDetail (standardized)
                    // CREDIT side for Revenue (Sales)
                    // We store it as 'subtotal' here, but logic below handles GL
                };
            });
            // Assuming no tax for simplicity first (add tax logic later or if passed)
            const total = subtotal;
            // 5. Create Transaksi (The Invoice Header)
            const transaksi = await tx.transaksi.create({
                data: {
                    perusahaanId,
                    penggunaId: authReq.user.id,
                    nomorTransaksi: invNo,
                    tanggal,
                    tanggalJatuhTempo: jatuhTempo,
                    termPembayaran: validatedData.terminPembayaran,
                    tipe: 'PENJUALAN', // Mapping Invoice to Transaction Type
                    deskripsi: validatedData.catatan || `Invoice ${invNo}`,
                    referensi: validatedData.referensi,
                    subtotal,
                    total,
                    sisaPembayaran: total,
                    statusPembayaran: 'BELUM_DIBAYAR',
                    pelangganId: validatedData.pelangganId,
                    isPosted: true,
                    postedAt: new Date(),
                    postedBy: authReq.user.username,
                    detail: {
                        create: detailItems.map(item => ({
                            urutan: item.urutan,
                            akunId: item.akunId, // Revenue Account
                            deskripsi: item.deskripsi,
                            kuantitas: item.kuantitas,
                            hargaSatuan: item.hargaSatuan,
                            diskon: item.diskon,
                            subtotal: item.subtotal
                        }))
                    }
                }
            });
            // 6. Create Piutang Record
            await tx.piutang.create({
                data: {
                    perusahaanId,
                    pelangganId: validatedData.pelangganId,
                    transaksiId: transaksi.id,
                    nomorPiutang: invNo,
                    tanggalPiutang: tanggal,
                    tanggalJatuhTempo: jatuhTempo,
                    jumlahPiutang: total,
                    sisaPiutang: total, // Initially full amount
                    statusPembayaran: 'BELUM_DIBAYAR',
                    keterangan: validatedData.catatan
                }
            });
            // 7. Create Voucher (Accounting Record)
            const voucher = await tx.voucher.create({
                data: {
                    perusahaanId,
                    transaksiId: transaksi.id,
                    nomorVoucher: `VCH-${invNo}`, // Or auto-sequence
                    tanggal,
                    tipe: 'JURNAL_UMUM', // Or SALES_JOURNAL if available
                    deskripsi: `Penjualan ${invNo}`,
                    totalDebit: total,
                    totalKredit: total,
                    status: 'DIPOSTING',
                    dibuatOlehId: authReq.user.id,
                    isPosted: true,
                    postedAt: new Date(),
                    postedBy: authReq.user.username,
                    detail: {
                        create: [
                        // DEBIT: Accounts Receivable (Piutang Usaha)
                        // We need to fetch the AR Account from Settings or use a default
                        // For now, let's assume we look up via Pelanggan group OR default settings.
                        // fallback: Find first account with type 'PIUTANG_USAHA' or similar.
                        ]
                    }
                }
            });
            // WAIT: We need the AR Account ID.
            // Let's fetch the default AR account for the company.
            // If not found, we cannot post.
            const arAccount = await tx.chartOfAccounts.findFirst({
                where: {
                    perusahaanId,
                    tipe: 'ASET', // Or specific category
                    kategoriAset: 'PIUTANG_USAHA'
                }
            });
            if (!arAccount) {
                throw new Error('Akun Piutang Usaha tidak ditemukan (Default AR Account missing)');
            }
            // Populate Voucher Detail
            // 7.1 Debit AR
            await tx.voucherDetail.create({
                data: {
                    voucherId: voucher.id,
                    urutan: 1,
                    akunId: arAccount.id,
                    deskripsi: `Piutang - ${invNo}`,
                    debit: total,
                    kredit: 0
                }
            });
            // 7.2 Credit Revenue (Items)
            let seq = 2;
            for (const item of detailItems) {
                await tx.voucherDetail.create({
                    data: {
                        voucherId: voucher.id,
                        urutan: seq++,
                        akunId: item.akunId, // This comes from invalid form (Revenue Account)
                        deskripsi: item.deskripsi,
                        debit: 0,
                        kredit: item.subtotal
                    }
                });
            }
            // 8. Create Jurnal Umum
            await tx.jurnalUmum.create({
                data: {
                    perusahaanId,
                    periodeId: period.id,
                    voucherId: voucher.id,
                    nomorJurnal: `GL-${invNo}`,
                    tanggal,
                    deskripsi: `Penjualan ${invNo}`,
                    totalDebit: total,
                    totalKredit: total,
                    isPosted: true,
                    postedAt: new Date(),
                    detail: {
                        create: [
                            {
                                urutan: 1,
                                akunId: arAccount.id,
                                deskripsi: `Piutang - ${invNo}`,
                                debit: total,
                                kredit: 0,
                                saldoSesudah: 0 // Trigger update later
                            },
                            ...detailItems.map((item, i) => ({
                                urutan: i + 2,
                                akunId: item.akunId,
                                deskripsi: item.deskripsi,
                                debit: 0,
                                kredit: item.subtotal,
                                saldoSesudah: 0
                            }))
                        ]
                    }
                }
            });
            // 9. Update COA Balances
            // Update AR Account (Debit increases Asset)
            await tx.chartOfAccounts.update({
                where: { id: arAccount.id },
                data: { saldoBerjalan: { increment: total } }
            });
            // Update Revenue Accounts (Credit increases Revenue - normally credit balance)
            // If logic says "saldoBerjalan = debit - kredit", then revenue increases make it more negative?
            // Or if normalBalance is Credit, we handle it differently.
            // Standard approach: Saldo = Debit - Kredit. 
            // So Revenue (Credit) decreases the 'net number' if strictly D-K.
            // Let's stick to D-K simple math.
            for (const item of detailItems) {
                await tx.chartOfAccounts.update({
                    where: { id: item.akunId },
                    data: { saldoBerjalan: { decrement: item.subtotal } } // Credit decreases ( D - K )
                });
            }
            return transaksi;
        });
        res.status(201).json({
            message: 'Invoice berhasil dibuat',
            data: result
        });
    }
    catch (error) {
        console.error('Invoice Creation Error:', error);
        res.status(500).json({ message: error.message || 'Gagal membuat invoice' });
    }
};
exports.createInvoice = createInvoice;
const getInvoices = async (req, res) => {
    try {
        const authReq = req;
        const page = req.query.page ? String(req.query.page) : '1';
        const limit = req.query.limit ? String(req.query.limit) : '10';
        const status = req.query.status ? String(req.query.status) : undefined;
        const search = req.query.search ? String(req.query.search) : undefined;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {
            perusahaanId: authReq.user.perusahaanId,
            tipe: 'PENJUALAN'
        };
        if (status) {
            where.statusPembayaran = status;
        }
        if (search) {
            where.OR = [
                { nomorTransaksi: { contains: String(search), mode: 'insensitive' } },
                { pelanggan: { nama: { contains: String(search), mode: 'insensitive' } } }
            ];
        }
        const [invoices, total] = await Promise.all([
            prisma_1.default.transaksi.findMany({
                where,
                include: {
                    pelanggan: { select: { nama: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit)
            }),
            prisma_1.default.transaksi.count({ where })
        ]);
        res.json({
            data: invoices,
            pagination: {
                total,
                page: Number(page),
                totalPages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data invoice' });
    }
};
exports.getInvoices = getInvoices;
const getInvoiceDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const authReq = req;
        const invoice = await prisma_1.default.transaksi.findUnique({
            where: { id: String(id), perusahaanId: authReq.user.perusahaanId },
            include: {
                pelanggan: true,
                detail: {
                    include: { akun: true }
                },
                pembayaran: true,
                piutangs: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });
        if (!invoice)
            return res.status(404).json({ message: 'Invoice tidak ditemukan' });
        res.json(invoice);
    }
    catch (error) {
        res.status(500).json({ message: 'Gagal mengambil detail invoice' });
    }
};
exports.getInvoiceDetail = getInvoiceDetail;
const generateInvoicePDF = async (req, res) => {
    var _a, _b, _c, _d;
    try {
        const { id } = req.params;
        const authReq = req;
        const invoice = await prisma_1.default.transaksi.findUnique({
            where: { id: String(id), perusahaanId: authReq.user.perusahaanId },
            include: {
                pelanggan: true,
                detail: {
                    include: { akun: true }
                },
                perusahaan: true // Need company info for header
            }
        });
        if (!invoice)
            return res.status(404).json({ message: 'Invoice tidak ditemukan' });
        const doc = new pdfkit_1.default({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${invoice.nomorTransaksi.replace(/\//g, '-')}.pdf`);
        doc.pipe(res);
        // --- HEADER ---
        doc.fontSize(20).text(invoice.perusahaan.nama, { align: 'right' });
        doc.fontSize(10).text(invoice.perusahaan.alamat || '', { align: 'right' });
        doc.moveDown();
        doc.fontSize(20).text('INVOICE', 50, 50);
        doc.fontSize(10).text(`Nomor: ${invoice.nomorTransaksi}`, 50, 80);
        doc.text(`Tanggal: ${invoice.tanggal.toLocaleDateString('id-ID')}`, 50, 95);
        doc.text(`Jatuh Tempo: ${((_a = invoice.tanggalJatuhTempo) === null || _a === void 0 ? void 0 : _a.toLocaleDateString('id-ID')) || '-'}`, 50, 110);
        // --- BILL TO ---
        doc.moveDown();
        doc.fontSize(12).text('Ditagihkan Kepada:', 50, 150);
        doc.fontSize(10).font('Helvetica-Bold').text(((_b = invoice.pelanggan) === null || _b === void 0 ? void 0 : _b.nama) || 'Umum');
        if ((_c = invoice.pelanggan) === null || _c === void 0 ? void 0 : _c.alamat)
            doc.font('Helvetica').text(invoice.pelanggan.alamat);
        if ((_d = invoice.pelanggan) === null || _d === void 0 ? void 0 : _d.email)
            doc.text(invoice.pelanggan.email);
        // --- TABLE HEADER ---
        let y = 250;
        doc.font('Helvetica-Bold');
        doc.text('Deskripsi', 50, y);
        doc.text('Qty', 300, y, { width: 50, align: 'center' });
        doc.text('Harga', 350, y, { width: 90, align: 'right' });
        doc.text('Total', 440, y, { width: 100, align: 'right' });
        doc.moveTo(50, y + 15).lineTo(550, y + 15).stroke();
        y += 25;
        doc.font('Helvetica');
        // --- ITEMS ---
        invoice.detail.forEach((item) => {
            doc.text(item.deskripsi || item.akun.namaAkun, 50, y);
            doc.text(Number(item.kuantitas).toString(), 300, y, { width: 50, align: 'center' });
            doc.text(new Intl.NumberFormat('id-ID').format(Number(item.hargaSatuan)), 350, y, { width: 90, align: 'right' });
            doc.text(new Intl.NumberFormat('id-ID').format(Number(item.subtotal)), 440, y, { width: 100, align: 'right' });
            y += 20;
        });
        doc.moveTo(50, y).lineTo(550, y).stroke();
        y += 10;
        // --- TOTALS ---
        doc.font('Helvetica-Bold');
        doc.text('Total', 350, y, { width: 90, align: 'right' });
        doc.text(`Rp ${new Intl.NumberFormat('id-ID').format(Number(invoice.total))}`, 440, y, { width: 100, align: 'right' });
        // --- FOOTER ---
        doc.font('Helvetica').fontSize(10);
        doc.text('Terima kasih atas kepercayaan Anda.', 50, 700, { align: 'center', width: 500 });
        doc.end();
    }
    catch (error) {
        console.error('PDF Gen Error:', error);
        if (!res.headersSent)
            res.status(500).json({ message: 'Gagal membuat PDF' });
    }
};
exports.generateInvoicePDF = generateInvoicePDF;
const getAgingSchedule = async (req, res) => {
    try {
        const authReq = req;
        const perusahaanId = authReq.user.perusahaanId;
        const piutangs = await prisma_1.default.piutang.findMany({
            where: {
                perusahaanId,
                sisaPiutang: { gt: 0 }
            },
            include: { pelanggan: { select: { id: true, nama: true } } }
        });
        const today = new Date();
        const customerAging = {};
        for (const p of piutangs) {
            // Safe check for relation
            if (!p.pelanggan)
                continue;
            const daysOverdue = (0, date_fns_1.differenceInDays)(today, new Date(p.tanggalJatuhTempo));
            const amount = Number(p.sisaPiutang);
            const customerId = p.pelangganId;
            const customerName = p.pelanggan.nama;
            if (!customerAging[customerId]) {
                customerAging[customerId] = {
                    pelangganId: customerId,
                    pelangganNama: customerName,
                    current: 0,
                    days1_30: 0,
                    days31_60: 0,
                    days61_90: 0,
                    days90plus: 0,
                    total: 0
                };
            }
            customerAging[customerId].total += amount;
            if (daysOverdue <= 0) {
                customerAging[customerId].current += amount;
            }
            else if (daysOverdue <= 30) {
                customerAging[customerId].days1_30 += amount;
            }
            else if (daysOverdue <= 60) {
                customerAging[customerId].days31_60 += amount;
            }
            else if (daysOverdue <= 90) {
                customerAging[customerId].days61_90 += amount;
            }
            else {
                customerAging[customerId].days90plus += amount;
            }
        }
        res.json(Object.values(customerAging));
    }
    catch (error) {
        console.error('Aging Schedule Error:', error);
        res.status(500).json({ message: `Gagal mengambil aging schedule: ${error.message}` });
    }
};
exports.getAgingSchedule = getAgingSchedule;
const getInvoiceAging = async (req, res) => {
    try {
        const { id } = req.params;
        const authReq = req;
        const piutang = await prisma_1.default.piutang.findFirst({
            where: {
                transaksiId: id,
                perusahaanId: authReq.user.perusahaanId
            }
        });
        if (!piutang)
            return res.status(404).json({ message: 'Data piutang tidak ditemukan' });
        const today = new Date();
        const daysOverdue = (0, date_fns_1.differenceInDays)(today, new Date(piutang.tanggalJatuhTempo));
        res.json({
            daysOverdue: daysOverdue > 0 ? daysOverdue : 0,
            status: daysOverdue > 0 ? 'OVERDUE' : 'CURRENT',
            bucket: daysOverdue <= 0 ? 'Current' :
                daysOverdue <= 30 ? '1-30 Days' :
                    daysOverdue <= 60 ? '31-60 Days' :
                        daysOverdue <= 90 ? '61-90 Days' : '> 90 Days'
        });
    }
    catch (error) {
        console.error('Invoice Aging Error:', error);
        res.status(500).json({ message: `Gagal mengambil aging invoice: ${error.message}` });
    }
};
exports.getInvoiceAging = getInvoiceAging;
