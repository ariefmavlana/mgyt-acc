import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';
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
            const transNo = validatedData.nomorTransaksi || `BILL/${year}/${month}/${Date.now().toString().slice(-4)}`;

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

            // 3. Inventory Processing (Batch Prepare)
            const inventoryBatchAddItems: { persediaanId: string, gudangId: string, qty: number, costPerUnit: number }[] = [];
            const detailItems = [];

            for (const [idx, item] of validatedData.items.entries()) {
                const amount = item.kuantitas * item.hargaSatuan - (item.diskon || 0);

                if (item.produkId) {
                    const prod = productMap.get(item.produkId);
                    if (!prod?.persediaanId) throw new Error(`Produk tidak valid untuk item index ${idx}`);

                    inventoryBatchAddItems.push({
                        persediaanId: prod.persediaanId,
                        gudangId: warehouseId!,
                        qty: item.kuantitas,
                        costPerUnit: item.hargaSatuan
                    });
                }

                detailItems.push({
                    urutan: idx + 1,
                    akunId: item.akunId,
                    deskripsi: item.deskripsi || `Item ${idx + 1}`,
                    kuantitas: item.kuantitas,
                    hargaSatuan: item.hargaSatuan,
                    diskon: item.diskon,
                    subtotal: amount,
                });
            }

            // 4. Batch Inventory Add
            if (inventoryBatchAddItems.length > 0) {
                await InventoryService.batchAddStock(tx as any, inventoryBatchAddItems, {
                    refType: 'PURCHASE',
                    refId: transNo,
                    tanggal,
                    keterangan: `Pembelian Bill ${transNo}`
                });

                // Batch Update Master Buy Prices
                for (const item of inventoryBatchAddItems) {
                    await tx.persediaan.update({
                        where: { id: item.persediaanId },
                        data: { hargaBeli: item.costPerUnit }
                    });
                }
            }

            const total = detailItems.reduce((sum, item) => sum + item.subtotal, 0);

            // 5. Create Transaksi
            const transaksi = await tx.transaksi.create({
                data: {
                    perusahaanId: perusahaanId!,
                    penggunaId: authReq.user.id,
                    nomorTransaksi: transNo,
                    tanggal,
                    tanggalJatuhTempo: jatuhTempo,
                    termPembayaran: validatedData.terminPembayaran,
                    tipe: 'PEMBELIAN',
                    cabangId: validatedData.cabangId,
                    deskripsi: validatedData.catatan || `Pembelian ${transNo}`,
                    referensi: validatedData.referensi,
                    subtotal: total,
                    total: total,
                    sisaPembayaran: total,
                    statusPembayaran: 'BELUM_DIBAYAR',
                    pemasokId: validatedData.pemasokId,
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

            // 6. Hutang & Voucher
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

            const apAccount = await tx.chartOfAccounts.findFirst({
                where: { perusahaanId, tipe: 'LIABILITAS', kategoriLiabilitas: 'HUTANG_USAHA' }
            }) || await tx.chartOfAccounts.findFirst({ where: { perusahaanId, tipe: 'LIABILITAS' } });

            if (!apAccount) throw new Error('Akun Hutang Usaha tidak ditemukan');

            const voucher = await tx.voucher.create({
                data: {
                    perusahaanId: perusahaanId!,
                    transaksiId: transaksi.id,
                    nomorVoucher: `VCH-${transNo}`,
                    tanggal,
                    tipe: 'JURNAL_UMUM',
                    cabangId: validatedData.cabangId,
                    deskripsi: `Pembelian ${transNo}`,
                    totalDebit: total,
                    totalKredit: total,
                    status: 'DIPOSTING',
                    dibuatOlehId: authReq.user.id,
                    isPosted: true,
                    postedAt: new Date(),
                    postedBy: authReq.user.username
                }
            });

            // 7. BATCH DETAIL CREATION
            await tx.voucherDetail.createMany({
                data: [
                    { voucherId: voucher.id, urutan: 1, akunId: apAccount.id, deskripsi: `Hutang - ${transNo}`, debit: 0, kredit: total },
                    ...detailItems.map((item, i) => ({
                        voucherId: voucher.id,
                        urutan: i + 2,
                        akunId: item.akunId,
                        deskripsi: item.deskripsi,
                        debit: item.subtotal,
                        kredit: 0
                    }))
                ]
            });

            await tx.jurnalUmum.create({
                data: {
                    perusahaanId: perusahaanId!,
                    periodeId: period.id,
                    voucherId: voucher.id,
                    cabangId: validatedData.cabangId,
                    nomorJurnal: `GL-${transNo}`,
                    tanggal,
                    deskripsi: `Pembelian ${transNo}`,
                    totalDebit: total,
                    totalKredit: total,
                    isPosted: true,
                    postedAt: new Date(),
                    detail: {
                        create: [
                            { urutan: 1, akunId: apAccount.id, deskripsi: `Hutang - ${transNo}`, debit: 0, kredit: total, saldoSesudah: 0 },
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

            // 8. BATCH BALANCE UPDATES
            const balanceUpdates: Record<string, number> = {};

            // AP -> Decrement (Credit)
            balanceUpdates[apAccount.id] = (balanceUpdates[apAccount.id] || 0) - total;

            // Purchase Items -> Increment (Debit)
            for (const item of detailItems) {
                balanceUpdates[item.akunId] = (balanceUpdates[item.akunId] || 0) + item.subtotal;
            }

            for (const [accId, amount] of Object.entries(balanceUpdates)) {
                await tx.chartOfAccounts.update({
                    where: { id: accId },
                    data: { saldoBerjalan: { increment: amount } }
                });
            }

            return transaksi;
        });

        res.status(201).json({
            message: 'Pembelian berhasil dicatat',
            data: result
        });
    } catch (error: unknown) {
        console.error('Purchase Creation Error:', error);
        const message = error instanceof Error ? error.message : 'Gagal mencatat pembelian';
        res.status(500).json({ message });
    }
};

export const getPurchases = async (req: Request, res: Response) => {
    // Basic listing similar to Invoices
    try {
        const authReq = req as AuthRequest;
        const page = req.query.page ? String(req.query.page) : '1';
        const limit = req.query.limit ? String(req.query.limit) : '10';
        const skip = (Number(page) - 1) * Number(limit);

        const where: Prisma.TransaksiWhereInput = {
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

    } catch (error: unknown) {
        res.status(500).json({ message: 'Gagal mengambil data pembelian' });
    }
};
