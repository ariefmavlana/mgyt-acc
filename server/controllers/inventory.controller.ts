
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../../lib/prisma';
import { stockMovementSchema } from '../validators/inventory.validator';

export const getStock = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const { warehouseId, productId } = req.query;
        const perusahaanId = authReq.currentCompanyId!;

        const where: any = {
            persediaan: { perusahaanId }
        };

        if (warehouseId) where.gudangId = String(warehouseId);
        if (productId) {
            const product = await prisma.produk.findUnique({
                where: { id: String(productId) },
                select: { persediaanId: true }
            });
            if (product?.persediaanId) where.persediaanId = product.persediaanId;
        }

        const stocks = await prisma.stokPersediaan.findMany({
            where,
            include: {
                persediaan: {
                    select: {
                        namaPersediaan: true,
                        kodePersediaan: true,
                        satuan: true,
                        produk: { select: { id: true } } // Get Product ID
                    }
                },
                gudang: { select: { nama: true, kode: true } }
            }
        });

        res.json(stocks);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data stok' });
    }
};

export const recordMovement = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const validatedData = stockMovementSchema.parse(req.body);
        const perusahaanId = authReq.currentCompanyId!;

        const result = await prisma.$transaction(async (tx) => {
            const results = [];

            // 1. PRE-FETCH ALL PRODUCTS
            const productIds = validatedData.items.map(i => i.produkId);
            const products = await tx.produk.findMany({
                where: { id: { in: productIds } },
                include: { persediaan: true }
            });
            const productMap = new Map(products.map(p => [p.id, p]));

            // 2. PRE-FETCH ALL RELEVANT STOCK
            const persediaanIds = products.filter(p => !!p.persediaanId).map(p => p.persediaanId!);
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

            const stockMap = new Map(currentStocks.map(s => [`${s.persediaanId}_${s.gudangId}`, Number(s.kuantitas)]));

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

                if (validatedData.tipe === 'TRANSFER') {
                    const targetGudangId = validatedData.gudangTujuanId!;

                    // Check Source Stock
                    const currentQty = stockMap.get(`${persediaanId}_${validatedData.gudangId}`) || 0;
                    if (currentQty < absQty) {
                        throw new Error(`Stok tidak mencukupi untuk produk ${product.namaProduk} di gudang asal. Stok saat ini: ${currentQty}, Dibutuhkan: ${absQty}`);
                    }

                    // TRANSFER OUT
                    await InventoryService.removeStock(tx as any, {
                        persediaanId,
                        gudangId: validatedData.gudangId,
                        qty: absQty,
                        refType: 'TRANSFER_OUT',
                        refId: `MUT-${timestamp}-OUT`,
                        tanggal: new Date(validatedData.tanggal),
                        keterangan: validatedData.keterangan || `Transfer ke Gudang ID: ${targetGudangId}`
                    });

                    // TRANSFER IN
                    await InventoryService.addStock(tx as any, {
                        persediaanId,
                        gudangId: targetGudangId,
                        qty: absQty,
                        costPerUnit: costPrice,
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

                        await InventoryService.removeStock(tx as any, {
                            persediaanId,
                            gudangId: validatedData.gudangId,
                            qty: absQty,
                            refType: validatedData.tipe === 'ADJUSTMENT' ? 'ADJUSTMENT' : 'KELUAR',
                            refId: `MUT-${timestamp}`,
                            tanggal: new Date(validatedData.tanggal),
                            keterangan: validatedData.keterangan || 'Pengurangan Stok'
                        });
                    } else {
                        await InventoryService.addStock(tx as any, {
                            persediaanId,
                            gudangId: validatedData.gudangId,
                            qty: absQty,
                            costPerUnit: costPrice,
                            refType: validatedData.tipe === 'ADJUSTMENT' ? 'ADJUSTMENT' : 'MASUK',
                            refId: `MUT-${timestamp}-IN`,
                            tanggal: new Date(validatedData.tanggal),
                            keterangan: validatedData.keterangan || 'Penambahan Stok'
                        });
                    }
                }

                results.push({ produk: product.namaProduk, status: 'OK' });
            }

            return results;
        });

        res.status(201).json({ message: 'Pergerakan stok berhasil dicatat', data: result });
    } catch (error: any) {
        console.error('Stock Movement Error:', error);
        res.status(500).json({ message: error.message || 'Gagal mencatat pemindahan stok' });
    }
};

export const getMovementHistory = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const { page = 1, limit = 20, warehouseId } = req.query;
        const perusahaanId = authReq.currentCompanyId!;
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = {
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
