import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../../lib/prisma';
import { createInvoiceSchema } from '../validators/invoice.validator';
import { addDays, differenceInDays } from 'date-fns';
import PDFDocument from 'pdfkit';

export const createInvoice = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
        const validatedData = createInvoiceSchema.parse(req.body);

        const result = await prisma.$transaction(async (tx) => {
            // 1. Setup Dates
            const tanggal = new Date(validatedData.tanggal);
            const jatuhTempo = validatedData.tanggalJatuhTempo
                ? new Date(validatedData.tanggalJatuhTempo)
                : addDays(tanggal, validatedData.terminPembayaran);

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
                        perusahaanId: perusahaanId!,
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
                };
            });

            const total = subtotal;

            // 5. Create Transaksi
            const transaksi = await tx.transaksi.create({
                data: {
                    perusahaanId: perusahaanId!,
                    penggunaId: authReq.user.id,
                    nomorTransaksi: invNo,
                    tanggal,
                    tanggalJatuhTempo: jatuhTempo,
                    termPembayaran: validatedData.terminPembayaran,
                    tipe: 'PENJUALAN',
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
                            akunId: item.akunId,
                            deskripsi: item.deskripsi,
                            kuantitas: item.kuantitas,
                            hargaSatuan: item.hargaSatuan,
                            diskon: item.diskon,
                            subtotal: item.subtotal
                        }))
                    }
                }
            });

            // 6. Create Piutang
            await tx.piutang.create({
                data: {
                    perusahaanId: perusahaanId!,
                    pelangganId: validatedData.pelangganId,
                    transaksiId: transaksi.id,
                    nomorPiutang: invNo,
                    tanggalPiutang: tanggal,
                    tanggalJatuhTempo: jatuhTempo,
                    jumlahPiutang: total,
                    sisaPiutang: total,
                    statusPembayaran: 'BELUM_DIBAYAR',
                    keterangan: validatedData.catatan
                }
            });

            // 7. Create Voucher
            const voucher = await tx.voucher.create({
                data: {
                    perusahaanId: perusahaanId!,
                    transaksiId: transaksi.id,
                    nomorVoucher: `VCH-${invNo}`,
                    tanggal,
                    tipe: 'JURNAL_UMUM',
                    deskripsi: `Penjualan ${invNo}`,
                    totalDebit: total,
                    totalKredit: total,
                    status: 'DIPOSTING',
                    dibuatOlehId: authReq.user.id,
                    isPosted: true,
                    postedAt: new Date(),
                    postedBy: authReq.user.username
                }
            });

            // 8. Find AR account
            const arAccount = await tx.chartOfAccounts.findFirst({
                where: {
                    perusahaanId,
                    tipe: 'ASET',
                    kategoriAset: 'PIUTANG_USAHA'
                }
            });

            if (!arAccount) {
                throw new Error('Akun Piutang Usaha tidak ditemukan');
            }

            // 9. Voucher Details
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

            let seq = 2;
            for (const item of detailItems) {
                await tx.voucherDetail.create({
                    data: {
                        voucherId: voucher.id,
                        urutan: seq++,
                        akunId: item.akunId,
                        deskripsi: item.deskripsi,
                        debit: 0,
                        kredit: item.subtotal
                    }
                });
            }

            // 10. Jurnal Umum
            await tx.jurnalUmum.create({
                data: {
                    perusahaanId: perusahaanId!,
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
                                saldoSesudah: 0
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

            // 11. Update balances
            await tx.chartOfAccounts.update({
                where: { id: arAccount.id },
                data: { saldoBerjalan: { increment: total } }
            });

            for (const item of detailItems) {
                await tx.chartOfAccounts.update({
                    where: { id: item.akunId },
                    data: { saldoBerjalan: { decrement: item.subtotal } }
                });
            }

            return transaksi;
        });

        res.status(201).json({
            message: 'Invoice berhasil dibuat',
            data: result
        });
    } catch (error: any) {
        console.error('Invoice Creation Error:', error);
        res.status(500).json({ message: error.message || 'Gagal membuat invoice' });
    }
};

export const getInvoices = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const page = req.query.page ? String(req.query.page) : '1';
        const limit = req.query.limit ? String(req.query.limit) : '10';
        const status = req.query.status ? String(req.query.status) : undefined;
        const search = req.query.search ? String(req.query.search) : undefined;
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = {
            perusahaanId: authReq.currentCompanyId,
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
            prisma.transaksi.findMany({
                where,
                include: {
                    pelanggan: { select: { nama: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit)
            }),
            prisma.transaksi.count({ where })
        ]);

        res.json({
            data: invoices,
            pagination: {
                total,
                page: Number(page),
                totalPages: Math.ceil(total / Number(limit))
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data invoice' });
    }
};

export const getInvoiceDetail = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const authReq = req as AuthRequest;

        const invoice = await prisma.transaksi.findUnique({
            where: { id: String(id), perusahaanId: authReq.currentCompanyId },
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

        if (!invoice) return res.status(404).json({ message: 'Invoice tidak ditemukan' });

        res.json(invoice);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil detail invoice' });
    }
};

export const generateInvoicePDF = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const authReq = req as AuthRequest;

        const invoice: any = await prisma.transaksi.findUnique({
            where: { id: String(id), perusahaanId: authReq.currentCompanyId },
            include: {
                pelanggan: true,
                detail: {
                    include: { akun: true }
                },
                perusahaan: true // Need company info for header
            }
        });

        if (!invoice) return res.status(404).json({ message: 'Invoice tidak ditemukan' });

        const doc = new PDFDocument({ margin: 50 });

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
        doc.text(`Jatuh Tempo: ${invoice.tanggalJatuhTempo?.toLocaleDateString('id-ID') || '-'}`, 50, 110);

        // --- BILL TO ---
        doc.moveDown();
        doc.fontSize(12).text('Ditagihkan Kepada:', 50, 150);
        doc.fontSize(10).font('Helvetica-Bold').text(invoice.pelanggan?.nama || 'Umum');
        if (invoice.pelanggan?.alamat) doc.font('Helvetica').text(invoice.pelanggan.alamat);
        if (invoice.pelanggan?.email) doc.text(invoice.pelanggan.email);

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
        invoice.detail.forEach((item: any) => {
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

    } catch (error) {
        console.error('PDF Gen Error:', error);
        if (!res.headersSent) res.status(500).json({ message: 'Gagal membuat PDF' });
    }
};

export const getAgingSchedule = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;

        const piutangs = await prisma.piutang.findMany({
            where: {
                perusahaanId,
                sisaPiutang: { gt: 0 }
            },
            include: { pelanggan: { select: { id: true, nama: true } } }
        });

        const today = new Date();
        const customerAging: Record<string, any> = {};

        for (const p of piutangs) {
            // Safe check for relation
            if (!p.pelanggan) continue;

            const daysOverdue = differenceInDays(today, new Date(p.tanggalJatuhTempo));
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
            } else if (daysOverdue <= 30) {
                customerAging[customerId].days1_30 += amount;
            } else if (daysOverdue <= 60) {
                customerAging[customerId].days31_60 += amount;
            } else if (daysOverdue <= 90) {
                customerAging[customerId].days61_90 += amount;
            } else {
                customerAging[customerId].days90plus += amount;
            }
        }

        res.json(Object.values(customerAging));
    } catch (error: any) {
        console.error('Aging Schedule Error:', error);
        res.status(500).json({ message: `Gagal mengambil aging schedule: ${error.message}` });
    }
};

export const getInvoiceAging = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const authReq = req as AuthRequest;

        const piutang = await prisma.piutang.findFirst({
            where: {
                transaksiId: id as string,
                perusahaanId: authReq.currentCompanyId!
            }
        });

        if (!piutang) return res.status(404).json({ message: 'Data piutang tidak ditemukan' });

        const today = new Date();
        const daysOverdue = differenceInDays(today, new Date(piutang.tanggalJatuhTempo));

        res.json({
            daysOverdue: daysOverdue > 0 ? daysOverdue : 0,
            status: daysOverdue > 0 ? 'OVERDUE' : 'CURRENT',
            bucket: daysOverdue <= 0 ? 'Current' :
                daysOverdue <= 30 ? '1-30 Days' :
                    daysOverdue <= 60 ? '31-60 Days' :
                        daysOverdue <= 90 ? '61-90 Days' : '> 90 Days'
        });

    } catch (error: any) {
        console.error('Invoice Aging Error:', error);
        res.status(500).json({ message: `Gagal mengambil aging invoice: ${error.message}` });
    }
};
