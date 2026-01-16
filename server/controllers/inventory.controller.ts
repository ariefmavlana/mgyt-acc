import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import { InventoryService } from '../services/inventory.service';
import { stockMovementSchema } from '../validators/inventory.validator';

export const getStock = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const { warehouseId, productId } = req.query;
        const perusahaanId = authReq.currentCompanyId!;

        // 1. Fetch ALL Persediaan (Inventory Items) for the company
        const wherePersediaan: Prisma.PersediaanWhereInput = {
            perusahaanId,
            status: 'TERSEDIA'
        };

        if (productId) {
            const product = await prisma.produk.findUnique({
                where: { id: String(productId) },
                select: { persediaanId: true }
            });
            if (product?.persediaanId) wherePersediaan.id = product.persediaanId;
        }

        const items = await prisma.persediaan.findMany({
            where: wherePersediaan,
            include: {
                produk: { select: { id: true, namaProduk: true } },
                stok: {
                    where: warehouseId ? { gudangId: String(warehouseId) } : undefined,
                    include: { gudang: { select: { nama: true, kode: true } } }
                }
            },
            orderBy: { namaPersediaan: 'asc' }
        });

        // 2. Map to ProductStock format expected by frontend
        const formattedStocks = items.map((item: any) => {
            const stockRecord = item.stok[0];

            return {
                id: stockRecord?.id || `virtual-${item.id}`,
                persediaanId: item.id,
                gudangId: stockRecord?.gudangId || String(warehouseId || ''),
                kuantitas: stockRecord?.kuantitas || 0,
                nilaiStok: stockRecord?.nilaiStok || 0,
                persediaan: {
                    id: item.id,
                    kodePersediaan: item.kodePersediaan,
                    namaPersediaan: item.namaPersediaan,
                    satuan: item.satuan,
                    stokMinimum: item.stokMinimum || 0,
                    hargaBeli: item.hargaBeli || 0,
                    produk: item.produk
                },
                gudang: stockRecord?.gudang || { nama: 'Virtual', kode: 'VIRTUAL' }
            };
        });

        res.json(formattedStocks);
    } catch (error) {
        console.error('Get Stock Error:', error);
        res.status(500).json({ message: 'Gagal mengambil data stok' });
    }
};

export const getWarehouses = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;

        const warehouses = await prisma.gudang.findMany({
            where: {
                cabang: { perusahaanId }
            },
            include: {
                cabang: { select: { nama: true } }
            }
        });

        res.json(warehouses);
    } catch (error) {
        console.error('Get Warehouses Error:', error);
        res.status(500).json({ message: 'Gagal mengambil data gudang' });
    }
};

export const createWarehouse = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
        const { kode, nama, alamat, telepon, penanggungJawab, cabangId, isUtama } = req.body;

        if (!kode || !nama || !cabangId) {
            return res.status(400).json({ message: 'Kode, Nama, dan Cabang wajib diisi' });
        }

        // Verify cabang belongs to perusahaan
        const cabang = await prisma.cabang.findFirst({
            where: { id: cabangId, perusahaanId }
        });

        if (!cabang) {
            return res.status(403).json({ message: 'Cabang tidak valid' });
        }

        const warehouse = await prisma.gudang.create({
            data: {
                kode,
                nama,
                alamat,
                telepon,
                penanggungJawab,
                cabangId,
                isUtama: !!isUtama
            }
        });

        res.status(201).json(warehouse);
    } catch (error) {
        console.error('Create Warehouse Error:', error);
        res.status(500).json({ message: 'Gagal membuat gudang baru' });
    }
};

export const recordMovement = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId;
        const user = authReq.user;

        if (!perusahaanId || !user) {
            return res.status(401).json({ message: 'Akses tidak valid atau sesi berakhir' });
        }

        const validatedData = stockMovementSchema.parse(req.body);

        const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const results = [];

            // 1. PRE-FETCH ALL PRODUCTS
            const productIds = validatedData.items.map((i: any) => i.produkId);
            const products = await tx.produk.findMany({
                where: { id: { in: productIds } },
                include: { persediaan: true }
            });
            const productMap = new Map<string, (typeof products)[0]>(
                products.map((p: any) => [p.id, p])
            );

            // 2. PRE-FETCH ALL RELEVANT STOCK
            const persediaanIds = products
                .filter((p: any) => !!p.persediaanId)
                .map((p: any) => p.persediaanId!);
            const warehouseIds = [validatedData.gudangId];
            if (validatedData.tipe === 'TRANSFER') {
                warehouseIds.push(validatedData.gudangTujuanId!);
            }

            const currentStocks = await tx.stokPersediaan.findMany({
                where: {
                    persediaanId: { in: persediaanIds },
                    gudangId: { in: warehouseIds }
                }
            });

            const stockMap = new Map<string, number>(
                currentStocks.map((s: any) => [`${s.persediaanId}_${s.gudangId}`, Number(s.kuantitas)])
            );

            // 3. PREPARE BATCH ITEMS FOR SERVICE
            const timestamp = Date.now();

            for (const item of validatedData.items) {
                const product = productMap.get(item.produkId);
                if (!product || !product.persediaanId) {
                    throw new Error(`Produk ID ${item.produkId} tidak valid atau tidak memiliki data persediaan`);
                }

                const persediaanId = product.persediaanId;
                const costPrice = product.persediaan ? Number(product.persediaan.hargaBeli) : 0;
                const absQty = Math.abs(item.kuantitas);

                // 4. ACCOUNTING SYNC
                const journalEntries: { akunId: string, deskripsi: string, debit: number, kredit: number }[] = [];

                if (validatedData.tipe === 'TRANSFER') {
                    const targetGudangId = validatedData.gudangTujuanId!;

                    // Check Source Stock
                    const currentQty = stockMap.get(`${persediaanId}_${validatedData.gudangId}`) || 0;
                    if (currentQty < absQty) {
                        throw new Error(`Stok tidak mencukupi untuk produk ${product.namaProduk} di gudang asal. Stok saat ini: ${currentQty}, Dibutuhkan: ${absQty}`);
                    }

                    // TRANSFER OUT
                    const totalCostTransfer = await InventoryService.removeStock(tx, {
                        persediaanId,
                        gudangId: validatedData.gudangId,
                        qty: absQty,
                        refType: 'TRANSFER_OUT',
                        refId: `MUT-${timestamp}-OUT`,
                        tanggal: new Date(validatedData.tanggal),
                        keterangan: validatedData.keterangan || `Transfer ke Gudang ID: ${targetGudangId}`
                    });

                    const realUnitCost = totalCostTransfer / absQty;

                    // TRANSFER IN
                    await InventoryService.addStock(tx, {
                        persediaanId,
                        gudangId: targetGudangId,
                        qty: absQty,
                        costPerUnit: realUnitCost,
                        refType: 'TRANSFER_IN',
                        refId: `MUT-${timestamp}-IN`,
                        tanggal: new Date(validatedData.tanggal),
                        keterangan: validatedData.keterangan || `Transfer dari Gudang ID: ${validatedData.gudangId}`
                    });

                } else {
                    let isDecrement = false;
                    if (validatedData.tipe === 'ADJUSTMENT' && item.kuantitas < 0) {
                        isDecrement = true;
                    } else if (validatedData.tipe === 'KELUAR') {
                        isDecrement = true;
                    }

                    if (isDecrement) {
                        const currentQty = stockMap.get(`${persediaanId}_${validatedData.gudangId}`) || 0;
                        if (currentQty < absQty) {
                            throw new Error(`Stok tidak mencukupi untuk produk ${product.namaProduk}. Stok saat ini: ${currentQty}, Dibutuhkan: ${absQty}`);
                        }

                        const totalCostValue = await InventoryService.removeStock(tx, {
                            persediaanId,
                            gudangId: validatedData.gudangId,
                            qty: absQty,
                            refType: validatedData.tipe === 'ADJUSTMENT' ? 'ADJUSTMENT' : 'KELUAR',
                            refId: `MUT-${timestamp}`,
                            tanggal: new Date(validatedData.tanggal),
                            keterangan: validatedData.keterangan || 'Pengurangan Stok'
                        });

                        // Create Journal Entry for Reduction
                        if (product.persediaan?.akunPersediaanId && validatedData.akunId) {
                            journalEntries.push({
                                akunId: product.persediaan.akunPersediaanId,
                                deskripsi: `Pengurangan Stok: ${product.namaProduk} (${absQty} ${product.satuan})`,
                                debit: 0,
                                kredit: totalCostValue
                            });
                            journalEntries.push({
                                akunId: validatedData.akunId,
                                deskripsi: `Penyesuaian/Pengeluaran: ${product.namaProduk}`,
                                debit: totalCostValue,
                                kredit: 0
                            });
                        }
                    } else {
                        // INCREMENT (MASUK or ADJUSTMENT positive)
                        // For manual entry, we use costPrice from product record as default if none provided in item
                        const customCost = item.hargaSatuan || costPrice;
                        const totalCostValue = absQty * customCost;

                        await InventoryService.addStock(tx, {
                            persediaanId,
                            gudangId: validatedData.gudangId,
                            qty: absQty,
                            costPerUnit: customCost,
                            refType: validatedData.tipe === 'ADJUSTMENT' ? 'ADJUSTMENT' : 'MASUK',
                            refId: `MUT-${timestamp}-IN`,
                            tanggal: new Date(validatedData.tanggal),
                            keterangan: validatedData.keterangan || 'Penambahan Stok'
                        });

                        // Create Journal Entry for Addition
                        if (product.persediaan?.akunPersediaanId && validatedData.akunId) {
                            journalEntries.push({
                                akunId: product.persediaan.akunPersediaanId,
                                deskripsi: `Penambahan Stok: ${product.namaProduk} (${absQty} ${product.satuan})`,
                                debit: totalCostValue,
                                kredit: 0
                            });
                            journalEntries.push({
                                akunId: validatedData.akunId,
                                deskripsi: `Penyesuaian/Pemasukan: ${product.namaProduk}`,
                                debit: 0,
                                kredit: totalCostValue
                            });
                        }
                    }
                }

                // If we have journal entries, create a Voucher for this movement
                if (journalEntries.length > 0) {
                    const voucher = await tx.voucher.create({
                        data: {
                            perusahaanId: perusahaanId,
                            nomorVoucher: `VCH-STK-${timestamp}`,
                            tanggal: new Date(validatedData.tanggal),
                            tipe: 'JURNAL_UMUM',
                            deskripsi: validatedData.keterangan || `Penyesuaian Stok - ${validatedData.tipe}`,
                            totalDebit: journalEntries.reduce((sum, e) => sum + e.debit, 0),
                            totalKredit: journalEntries.reduce((sum, e) => sum + e.kredit, 0),
                            status: 'DIPOSTING',
                            dibuatOlehId: user.id,
                            isPosted: true,
                            postedAt: new Date(),
                            postedBy: user.username,
                            detail: {
                                create: journalEntries.map((e, idx) => ({
                                    urutan: idx + 1,
                                    akunId: e.akunId,
                                    deskripsi: e.deskripsi,
                                    debit: e.debit,
                                    kredit: e.kredit
                                }))
                            }
                        }
                    });

                    // 6. CREATE TransaksiPersediaan (Semantic Link)
                    await tx.transaksiPersediaan.create({
                        data: {
                            produkId: item.produkId,
                            voucherId: voucher.id,
                            tipe: validatedData.tipe,
                            tanggal: new Date(validatedData.tanggal),
                            kuantitas: absQty,
                            hargaSatuan: journalEntries.find(e => e.debit > 0 || e.kredit > 0)?.debit || 0, // Simplified
                            total: journalEntries.find(e => e.debit > 0 || e.kredit > 0)?.debit || journalEntries.find(e => e.kredit > 0)?.kredit || 0,
                            keterangan: validatedData.keterangan || `Transaksi Persediaan (${validatedData.tipe})`
                        }
                    });

                    results.push({ produk: product.namaProduk, status: 'OK', voucherId: voucher.id });
                } else {
                    results.push({ produk: product.namaProduk, status: 'OK' });
                }
            }

            return results;
        });

        res.status(201).json({ message: 'Pergerakan stok berhasil dicatat', data: result });
    } catch (error: unknown) {
        console.error('Stock Movement Error:', error);
        const message = error instanceof Error ? error.message : 'Gagal mencatat pemindahan stok';
        res.status(500).json({ message });
    }
};

export const getMovementHistory = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const { page = 1, limit = 20, warehouseId } = req.query;
        const perusahaanId = authReq.currentCompanyId!;
        const skip = (Number(page) - 1) * Number(limit);

        const where: Prisma.MutasiPersediaanWhereInput = {
            persediaan: { perusahaanId }
        };
        if (warehouseId) where.gudangId = String(warehouseId);

        const [movements, total] = await Promise.all([
            prisma.mutasiPersediaan.findMany({
                where,
                include: {
                    persediaan: { select: { namaPersediaan: true, kodePersediaan: true } },
                    gudang: { select: { nama: true } }
                },
                orderBy: { tanggal: 'desc' },
                skip,
                take: Number(limit)
            }),
            prisma.mutasiPersediaan.count({ where })
        ]);

        res.json({
            data: movements,
            pagination: {
                total,
                page: Number(page),
                totalPages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        console.error('Get Movement Error:', error);
        res.status(500).json({ message: 'Gagal mengambil riwayat mutasi' });
    }
};
