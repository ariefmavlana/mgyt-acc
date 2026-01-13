import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import { createInvoiceSchema } from '../validators/invoice.validator';
import { addDays, differenceInDays, format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import PDFDocument from 'pdfkit';
import { InventoryService } from '../services/inventory.service';

interface JournalItem {
    akunId: string;
    deskripsi: string;
    debit: number;
    kredit: number;
}

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
            const invNo = validatedData.nomorInvoice || `INV/${year}/${month}/${Date.now().toString().slice(-4)}`;

            // 2. PRE-FETCH DATA
            const productIds = validatedData.items.filter(i => i.produkId).map(i => i.produkId!);

            const [products, periodResolved, warehouseResolved] = await Promise.all([
                tx.produk.findMany({
                    where: { id: { in: productIds } },
                    include: { persediaan: true }
                }),
                tx.periodeAkuntansi.findFirst({
                    where: { perusahaanId, bulan: month, tahun: year, status: 'TERBUKA' }
                }),
                validatedData.gudangId ? Promise.resolve({ id: validatedData.gudangId }) : tx.gudang.findFirst({
                    where: { cabang: { perusahaanId }, isUtama: true }
                })
            ]);

            const productMap = new Map(products.map(p => [p.id, p]));
            let period = periodResolved;
            let warehouseId = warehouseResolved?.id;

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

            if (productIds.length > 0 && !warehouseId) {
                const fallbackWarehouse = await tx.gudang.findFirst({ where: { cabang: { perusahaanId } } });
                if (!fallbackWarehouse) throw new Error("Gudang tidak ditemukan.");
                warehouseId = fallbackWarehouse.id;
            }

            // 3. Calculate Totals & Group Inventory Items
            let subtotal = 0;
            const inventoryBatchItems: { persediaanId: string, gudangId: string, qty: number }[] = [];

            const detailItems = validatedData.items.map((item, idx) => {
                const amount = item.kuantitas * item.hargaSatuan - (item.diskon || 0);
                subtotal += amount;

                if (item.produkId) {
                    const prod = productMap.get(item.produkId);
                    if (prod?.persediaanId) {
                        inventoryBatchItems.push({
                            persediaanId: prod.persediaanId,
                            gudangId: warehouseId!,
                            qty: item.kuantitas
                        });
                    }
                }

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

            // 4. Batch Stock Removal & COGS Aggregation
            const inventoryJournalDetails: JournalItem[] = [];
            if (inventoryBatchItems.length > 0) {
                const cogsResults = await InventoryService.batchRemoveStock(tx as any, inventoryBatchItems, {
                    refType: 'SALES',
                    refId: invNo,
                    tanggal,
                    keterangan: `Penjualan Invoice ${invNo}`
                });

                for (const item of validatedData.items) {
                    if (item.produkId) {
                        const prod = productMap.get(item.produkId);
                        const cogs = cogsResults[`${prod?.persediaanId}_${warehouseId}`] || 0;

                        if (prod?.persediaan?.akunHppId && prod?.persediaan?.akunPersediaanId) {
                            inventoryJournalDetails.push({
                                akunId: prod.persediaan.akunHppId,
                                deskripsi: `HPP - ${item.deskripsi}`,
                                debit: cogs,
                                kredit: 0
                            });
                            inventoryJournalDetails.push({
                                akunId: prod.persediaan.akunPersediaanId,
                                deskripsi: `Persediaan - ${item.deskripsi}`,
                                debit: 0,
                                kredit: cogs
                            });
                        }
                    }
                }
            }

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

            // 6. Piutang & Voucher
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

            // 7. ACCOUNT UPDATES (BATCH RESOLUTION)
            const arAccount = await tx.chartOfAccounts.findFirst({
                where: { perusahaanId, tipe: 'ASET', kategoriAset: 'PIUTANG_USAHA' }
            });
            if (!arAccount) throw new Error('Akun Piutang Usaha tidak ditemukan');

            // Voucher Details
            const voucherDetailsData = [
                { voucherId: voucher.id, urutan: 1, akunId: arAccount.id, deskripsi: `Piutang - ${invNo}`, debit: total, kredit: 0 },
                ...detailItems.map((item, i) => ({
                    voucherId: voucher.id,
                    urutan: i + 2,
                    akunId: item.akunId,
                    deskripsi: item.deskripsi,
                    debit: 0,
                    kredit: item.subtotal
                }))
            ];
            await tx.voucherDetail.createMany({ data: voucherDetailsData });

            // Jurnal Umum
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
                            { urutan: 1, akunId: arAccount.id, deskripsi: `Piutang - ${invNo}`, debit: total, kredit: 0, saldoSesudah: 0 },
                            ...detailItems.map((item, i) => ({
                                urutan: i + 2,
                                akunId: item.akunId,
                                deskripsi: item.deskripsi,
                                debit: 0,
                                kredit: item.subtotal,
                                saldoSesudah: 0
                            })),
                            ...inventoryJournalDetails.map((item, i) => ({
                                urutan: detailItems.length + 2 + i,
                                akunId: item.akunId,
                                deskripsi: item.deskripsi,
                                debit: item.debit,
                                kredit: item.kredit,
                                saldoSesudah: 0
                            }))
                        ]
                    }
                }
            });

            // 8. BATCH BALANCE UPDATES
            const balanceUpdates: Record<string, number> = {}; // { accountId: netAmount }

            // AR -> Increment (+total)
            balanceUpdates[arAccount.id] = (balanceUpdates[arAccount.id] || 0) + total;

            // Sales Items -> Decrement (-subtotal)
            for (const item of detailItems) {
                balanceUpdates[item.akunId] = (balanceUpdates[item.akunId] || 0) - item.subtotal;
            }

            // Inventory COGS processing
            for (const item of inventoryJournalDetails) {
                if (item.debit > 0) {
                    balanceUpdates[item.akunId] = (balanceUpdates[item.akunId] || 0) + item.debit;
                } else {
                    balanceUpdates[item.akunId] = (balanceUpdates[item.akunId] || 0) - item.kredit;
                }
            }

            // Commit all balance updates in individual optimized queries (Prisma doesn't batch updates well by ID)
            // But we filter by unique ID to avoid redundant hits.
            for (const [accId, amount] of Object.entries(balanceUpdates)) {
                await tx.chartOfAccounts.update({
                    where: { id: accId },
                    data: { saldoBerjalan: { increment: amount } }
                });
            }

            return transaksi;
        });

        res.status(201).json({
            message: 'Invoice berhasil dibuat',
            data: result
        });
    } catch (error: unknown) {
        console.error('Invoice Creation Error:', error);
        const message = error instanceof Error ? error.message : 'Gagal membuat invoice';
        res.status(500).json({ message });
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

        const where: Prisma.TransaksiWhereInput = {
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
        console.error('Get Invoices Error:', error);
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
        console.error('Get Invoice Detail Error:', error);
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

        const doc = new PDFDocument({ margin: 50, size: 'A4' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${invoice.nomorTransaksi.replace(/\//g, '-')}.pdf`);

        doc.pipe(res);

        // --- COLORS & STYLES ---
        const primaryColor = '#1e293b';
        const secondaryColor = '#64748b';
        const accentColor = '#3b82f6';
        const borderColor = '#e2e8f0';

        // --- HEADER / LETTERHEAD ---
        if (invoice.perusahaan.logoUrl) {
            // If we had a local path for logo
            // doc.image(path.join(process.cwd(), 'public', invoice.perusahaan.logoUrl), 50, 45, { width: 50 });
        }

        doc.fillColor(primaryColor).fontSize(20).font('Helvetica-Bold').text(invoice.perusahaan.nama, 200, 50, { align: 'right' });
        doc.fillColor(secondaryColor).fontSize(10).font('Helvetica').text(invoice.perusahaan.alamat || '', 200, 75, { align: 'right' });
        doc.text(`Telp: ${invoice.perusahaan.telepon || '-'} | Email: ${invoice.perusahaan.email || '-'}`, 200, 90, { align: 'right' });

        doc.rect(50, 110, 500, 2).fill(accentColor);
        doc.moveDown(2);

        // --- INVOICE INFO ---
        const infoY = 130;
        doc.fillColor(primaryColor).fontSize(24).font('Helvetica-Bold').text('INVOICE', 50, infoY);

        doc.fontSize(10).font('Helvetica-Bold').text('Nomor:', 50, infoY + 35);
        doc.font('Helvetica').text(invoice.nomorTransaksi, 120, infoY + 35);

        doc.font('Helvetica-Bold').text('Tanggal:', 50, infoY + 50);
        // Fix: Use imported idLocale
        doc.font('Helvetica').text(format(new Date(invoice.tanggal), 'dd MMMM yyyy', { locale: idLocale }), 120, infoY + 50);

        doc.font('Helvetica-Bold').text('Jatuh Tempo:', 50, infoY + 65);
        doc.fillColor('#ef4444').font('Helvetica-Bold').text(invoice.tanggalJatuhTempo ? format(new Date(invoice.tanggalJatuhTempo), 'dd MMMM yyyy', { locale: idLocale }) : '-', 120, infoY + 65);

        // --- BILL TO ---
        const billToY = 130;
        doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('Ditagihkan Kepada:', 350, billToY + 35);
        doc.fontSize(12).text(invoice.pelanggan?.nama || 'Pelanggan Umum', 350, billToY + 50);
        doc.fontSize(10).font('Helvetica').fillColor(secondaryColor).text(invoice.pelanggan?.alamat || '', 350, billToY + 65, { width: 200 });
        doc.text(invoice.pelanggan?.email || '', 350, doc.y);

        // --- TABLE HEADER ---
        let tableY = 250;
        doc.rect(50, tableY, 500, 20).fill(primaryColor);
        doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10);
        doc.text('DISKREPSI', 60, tableY + 5);
        doc.text('QTY', 300, tableY + 5, { width: 50, align: 'center' });
        doc.text('HARGA', 350, tableY + 5, { width: 90, align: 'right' });
        doc.text('TOTAL', 440, tableY + 5, { width: 100, align: 'right' });

        tableY += 25;
        doc.fillColor(primaryColor).font('Helvetica');

        // --- ITEMS ---
        invoice.detail.forEach((item: any, index: number) => {
            if (tableY > 700) {
                doc.addPage();
                tableY = 50;
            }

            // Alternating row background
            if (index % 2 !== 0) {
                doc.rect(50, tableY - 2, 500, 18).fill('#f8fafc');
                doc.fillColor(primaryColor);
            }

            doc.text(item.deskripsi || item.akun.namaAkun, 60, tableY);
            doc.text(Number(item.kuantitas).toString(), 300, tableY, { width: 50, align: 'center' });
            doc.text(new Intl.NumberFormat('id-ID').format(Number(item.hargaSatuan)), 350, tableY, { width: 90, align: 'right' });
            doc.text(new Intl.NumberFormat('id-ID').format(Number(item.subtotal)), 440, tableY, { width: 100, align: 'right' });

            doc.moveTo(50, tableY + 14).lineTo(550, tableY + 14).strokeColor(borderColor).lineWidth(0.5).stroke();
            tableY += 20;
        });

        // --- SUMMARY ---
        if (tableY > 600) {
            doc.addPage();
            tableY = 50;
        }

        const summaryY = tableY + 10;
        doc.font('Helvetica-Bold');
        doc.text('Subtotal', 350, summaryY, { width: 90, align: 'right' });
        doc.text(`Rp ${new Intl.NumberFormat('id-ID').format(Number(invoice.subtotal))}`, 440, summaryY, { width: 100, align: 'right' });

        doc.text('Pajak (0%)', 350, summaryY + 15, { width: 90, align: 'right' });
        doc.text('Rp 0', 440, summaryY + 15, { width: 100, align: 'right' });

        doc.rect(350, summaryY + 32, 200, 25).fill(accentColor);
        doc.fillColor('#ffffff').fontSize(12).text('TOTAL', 350, summaryY + 38, { width: 90, align: 'right' });
        doc.text(`Rp ${new Intl.NumberFormat('id-ID').format(Number(invoice.total))}`, 440, summaryY + 38, { width: 100, align: 'right' });

        // --- PAYMENT TERMS ---
        doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('Informasi Pembayaran:', 50, summaryY + 10);
        doc.font('Helvetica').fillColor(secondaryColor).text('Silakan transfer ke rekening berikut:');
        doc.text('Bank BCA: 1234567890 a/n PT MAVA');
        doc.moveDown();
        doc.text('Harap sertakan nomor invoice pada berita transfer.');

        // --- FOOTER ---
        const pages = doc.bufferedPageRange();
        for (let i = 0; i < pages.count; i++) {
            doc.switchToPage(i);
            doc.fillColor(secondaryColor).fontSize(8);
            doc.text(
                `Halaman ${i + 1} dari ${pages.count} | Dicetak pada ${format(new Date(), 'dd/MM/yyyy HH:mm')}`,
                50,
                780,
                { align: 'center', width: 500 }
            );
        }

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
    } catch (error: unknown) {
        console.error('Aging Schedule Error:', error);
        const message = error instanceof Error ? error.message : 'Gagal mengambil aging schedule';
        res.status(500).json({ message });
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

    } catch (error: unknown) {
        console.error('Invoice Aging Error:', error);
        const message = error instanceof Error ? error.message : 'Gagal mengambil aging invoice';
        res.status(500).json({ message });
    }
};
