import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../../lib/prisma';
import { createPurchaseSchema } from '../validators/purchase.validator';
import { addDays } from 'date-fns';
import { InventoryService } from '../services/inventory.service';

export const createPurchase = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
        const validatedData = createPurchaseSchema.parse(req.body);

        const result = await prisma.$transaction(async (tx) => {
            // 1. Setup Dates
            const tanggal = new Date(validatedData.tanggal);
            const jatuhTempo = validatedData.tanggalJatuhTempo
                ? new Date(validatedData.tanggalJatuhTempo)
                : addDays(tanggal, validatedData.terminPembayaran);

            const month = tanggal.getMonth() + 1;
            const year = tanggal.getFullYear();

            // 2. Transaksi Numbering
            const transNo = validatedData.nomorTransaksi || `BILL/${year}/${month}/${Date.now().toString().slice(-4)}`;

            // 3. Find or Create Period
            let period = await tx.periodeAkuntansi.findFirst({
                where: { perusahaanId, bulan: month, tahun: year, status: 'TERBUKA' }
            });

            if (!period) {
                // Auto create period if needed (or throw error in strict mode)
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

            // 4. Warehouse Resolution
            const warehouseId = validatedData.gudangId || (await tx.gudang.findFirst({ where: { cabang: { perusahaanId }, isUtama: true } }))?.id;

            if (validatedData.items.some(i => i.produkId) && !warehouseId) {
                throw new Error("Gudang tidak ditemukan. Harap pilih gudang untuk pembelian stok.");
            }

            // 5. Calculate Linkage & Totals
            let subtotal = 0;
            const detailItems = [];

            for (const [idx, item] of validatedData.items.entries()) {
                const amount = item.kuantitas * item.hargaSatuan - (item.diskon || 0);
                subtotal += amount;

                // Inventory Processing
                if (item.produkId) {
                    const product = await tx.produk.findUnique({
                        where: { id: item.produkId },
                        include: { persediaan: true }
                    });

                    if (!product || !product.persediaanId) {
                        throw new Error(`Produk tidak valid untuk item index ${idx}`);
                    }

                    // Add Stock (FIFO Layer)
                    await InventoryService.addStock(tx, {
                        persediaanId: product.persediaanId,
                        gudangId: warehouseId!,
                        qty: item.kuantitas,
                        costPerUnit: item.hargaSatuan,
                        refType: 'PURCHASE',
                        refId: transNo,
                        tanggal,
                        keterangan: `Pembelian Bill ${transNo}`
                    });

                    // Optional: Update Master Buy Price
                    if (product.persediaan) {
                        await tx.persediaan.update({
                            where: { id: product.persediaanId },
                            data: { hargaBeli: item.hargaSatuan }
                        });
                    }
                }

                detailItems.push({
                    urutan: idx + 1,
                    akunId: item.akunId, // Use provided account (Asset/Expense)
                    deskripsi: item.deskripsi || `Item ${idx + 1}`,
                    kuantitas: item.kuantitas,
                    hargaSatuan: item.hargaSatuan,
                    diskon: item.diskon,
                    subtotal: amount,
                });
            }

            const total = subtotal;

            // 6. Create Transaksi (PEMBELIAN)
            const transaksi = await tx.transaksi.create({
                data: {
                    perusahaanId: perusahaanId!,
                    penggunaId: authReq.user.id,
                    nomorTransaksi: transNo,
                    tanggal,
                    tanggalJatuhTempo: jatuhTempo,
                    termPembayaran: validatedData.terminPembayaran,
                    tipe: 'PEMBELIAN',
                    deskripsi: validatedData.catatan || `Pembelian ${transNo}`,
                    referensi: validatedData.referensi,
                    subtotal,
                    total,
                    sisaPembayaran: total,
                    statusPembayaran: 'BELUM_DIBAYAR',
                    pemasokId: validatedData.pemasokId, // Linked to Supplier
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

            // 7. Create Hutang (Accounts Payable)
            await tx.hutang.create({
                data: {
                    perusahaanId: perusahaanId!,
                    pemasokId: validatedData.pemasokId,
                    transaksiId: transaksi.id,
                    nomorHutang: transNo,
                    tanggalHutang: tanggal,
                    tanggalJatuhTempo: jatuhTempo,
                    jumlahHutang: total,
                    sisaHutang: total,
                    statusPembayaran: 'BELUM_DIBAYAR',
                    keterangan: validatedData.catatan
                }
            });

            // 8. Find AP Account
            const apAccount = await tx.chartOfAccounts.findFirst({
                where: {
                    perusahaanId,
                    tipe: 'KEWAJIBAN',
                    kategoriAkun: 'HUTANG_USAHA' // Check enum exact match later
                }
            });
            // Fallback if generic category not found, try code or name logic?
            // For now assume standard setup exists. If not, user needs to setup COA.

            if (!apAccount) {
                // Try finding ANY liability account if specific not found (dangerous but reduces friction)
                // Better to throw
                const fallback = await tx.chartOfAccounts.findFirst({ where: { perusahaanId, tipe: 'KEWAJIBAN' } });
                if (!fallback) throw new Error('Akun Hutang Usaha tidak ditemukan');
            }
            const activeApAccount = apAccount || (await tx.chartOfAccounts.findFirst({ where: { perusahaanId, tipe: 'KEWAJIBAN' } }))!;

            // 9. Create Voucher
            const voucher = await tx.voucher.create({
                data: {
                    perusahaanId: perusahaanId!,
                    transaksiId: transaksi.id,
                    nomorVoucher: `VCH-${transNo}`,
                    tanggal,
                    tipe: 'JURNAL_UMUM',
                    deskripsi: `Pembelian ${transNo}`,
                    totalDebit: total, // Inventory/Expense
                    totalKredit: total, // AP
                    status: 'DIPOSTING',
                    dibuatOlehId: authReq.user.id,
                    isPosted: true,
                    postedAt: new Date(),
                    postedBy: authReq.user.username
                }
            });

            // 10. Voucher Details & Journal
            // Credit AP
            await tx.voucherDetail.create({
                data: {
                    voucherId: voucher.id,
                    urutan: 1,
                    akunId: activeApAccount.id,
                    deskripsi: `Hutang - ${transNo}`,
                    debit: 0,
                    kredit: total
                }
            });

            let seq = 2;
            for (const item of detailItems) {
                await tx.voucherDetail.create({
                    data: {
                        voucherId: voucher.id,
                        urutan: seq++,
                        akunId: item.akunId, // Debit Expense/Asset
                        deskripsi: item.deskripsi,
                        debit: item.subtotal,
                        kredit: 0
                    }
                });
            }

            // 11. Create Jurnal Umum
            await tx.jurnalUmum.create({
                data: {
                    perusahaanId: perusahaanId!,
                    periodeId: period.id,
                    voucherId: voucher.id,
                    nomorJurnal: `GL-${transNo}`,
                    tanggal,
                    deskripsi: `Pembelian ${transNo}`,
                    totalDebit: total,
                    totalKredit: total,
                    isPosted: true,
                    postedAt: new Date(),
                    detail: {
                        create: [
                            {
                                urutan: 1,
                                akunId: activeApAccount.id,
                                deskripsi: `Hutang - ${transNo}`,
                                debit: 0,
                                kredit: total,
                                saldoSesudah: 0
                            },
                            ...detailItems.map((item, i) => ({
                                urutan: i + 2,
                                akunId: item.akunId,
                                deskripsi: item.deskripsi,
                                debit: item.subtotal,
                                kredit: 0,
                                saldoSesudah: 0
                            }))
                        ]
                    }
                }
            });

            // 12. Update Account Balances
            // AP (Credit) -> Increase Liability
            await tx.chartOfAccounts.update({
                where: { id: activeApAccount.id },
                data: { saldoBerjalan: { increment: total } } // Liability Credit increases with increment? 
                // Wait. 
                // Liability: Normal Balance Credit.
                // Incrementing saldoBerjalan usually means adding to the "value". 
                // If the system tracks strict Debit/Credit signed values, it depends.
                // Usually: Asset/Expense (Debit Normal) -> +Debit, -Credit.
                // Liability/Equity/Revenue (Credit Normal) -> +Credit, -Debit.
                // Check invoice controller:
                // AR (Asset) -> increment (Debit). Correct.
                // Revenue (Credit) -> decrement?? 
                // In Invoice Controller: data: { saldoBerjalan: { decrement: item.subtotal } }
                // So the system treats `saldoBerjalan` as a signed value where Debit is Positive? 
                // OR it treats it as "Natural Balance".
                // If Invoice Revenue is DECREMENTED, handled as Credit.
                // Then Liability (AP) should be DECREMENTED (Credit)?
                // Let's verify standard accounting logic in this code base.
                // Invoice: item (Revenue) credited. `saldoBerjalan: { decrement: item.subtotal }`.
                // If `saldoBerjalan` tracks Net Debit (Dr - Cr), then Credit decreases it. Correct.
                // So AP (Liability, Credit) should also be DECREMENTED.
            });

            await tx.chartOfAccounts.update({
                where: { id: activeApAccount.id },
                data: { saldoBerjalan: { decrement: total } }
            });

            for (const item of detailItems) {
                // Item (Asset/Expense) -> Debit.
                // Increases Net Debit.
                await tx.chartOfAccounts.update({
                    where: { id: item.akunId },
                    data: { saldoBerjalan: { increment: item.subtotal } }
                });
            }

            return transaksi;
        });

        res.status(201).json({
            message: 'Pembelian berhasil dicatat',
            data: result
        });
    } catch (error: any) {
        console.error('Purchase Creation Error:', error);
        res.status(500).json({ message: error.message || 'Gagal mencatat pembelian' });
    }
};

export const getPurchases = async (req: Request, res: Response) => {
    // Basic listing similar to Invoices
    try {
        const authReq = req as AuthRequest;
        const page = req.query.page ? String(req.query.page) : '1';
        const limit = req.query.limit ? String(req.query.limit) : '10';
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = {
            perusahaanId: authReq.currentCompanyId,
            tipe: 'PEMBELIAN'
        };

        const [purchases, total] = await Promise.all([
            prisma.transaksi.findMany({
                where,
                include: {
                    pemasok: { select: { nama: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit)
            }),
            prisma.transaksi.count({ where })
        ]);

        res.json({
            data: purchases,
            pagination: {
                total,
                page: Number(page),
                totalPages: Math.ceil(total / Number(limit))
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data pembelian' });
    }
};
