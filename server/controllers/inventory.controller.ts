
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

            for (const item of validatedData.items) {
                // 1. Get Product & Persediaan Info
                const product = await tx.produk.findUnique({
                    where: { id: item.produkId },
                    include: { persediaan: true }
                });

                if (!product || !product.persediaanId) {
                    throw new Error(`Produk ID ${item.produkId} tidak valid atau tidak memiliki data persediaan`);
                }

                const persediaanId = product.persediaanId;
                const costPrice = product.persediaan ? Number(product.persediaan.hargaBeli) : 0;

                // LOGIC HANDLE NEGATIVE ADJUSTMENT
                // If Adjustment and Qty < 0 -> Treat as OUT
                // If Adjustment and Qty > 0 -> Treat as IN

                const absQty = Math.abs(item.kuantitas);

                if (validatedData.tipe === 'TRANSFER') {
                    // === TRANSFER LOGIC (ATOMIC OUT + IN) ===
                    const targetGudangId = validatedData.gudangTujuanId!;

                    // 1. CHECK SOURCE STOCK
                    const currentStock = await tx.stokPersediaan.findUnique({
                        where: {
                            persediaanId_gudangId: { persediaanId, gudangId: validatedData.gudangId }
                        }
                    });
                    const currentQty = currentStock ? Number(currentStock.kuantitas) : 0;
                    if (currentQty < absQty) {
                        throw new Error(`Stok tidak mencukupi untuk produk ${product.namaProduk} di gudang asal. Stok saat ini: ${currentQty}, Dibutuhkan: ${absQty}`);
                    }

                    // 2. DECREMENT SOURCE
                    await tx.stokPersediaan.upsert({
                        where: { persediaanId_gudangId: { persediaanId, gudangId: validatedData.gudangId } },
                        create: {
                            persediaanId, gudangId: validatedData.gudangId,
                            kuantitas: -absQty, nilaiStok: -absQty * costPrice,
                        },
                        update: { kuantitas: { decrement: absQty } }
                    });

                    await tx.mutasiPersediaan.create({
                        data: {
                            persediaanId, gudangId: validatedData.gudangId,
                            nomorMutasi: `MUT-${Date.now()}-OUT`,
                            tanggal: new Date(validatedData.tanggal),
                            tipe: 'TRANSFER_OUT',
                            kuantitas: absQty, harga: costPrice, nilai: absQty * costPrice,
                            saldoSebelum: currentQty, saldoSesudah: currentQty - absQty,
                            referensi: validatedData.referensi,
                            keterangan: validatedData.keterangan || `Transfer ke Gudang ID: ${targetGudangId}` // TODO: Fetch name if possible, or just ID
                        }
                    });

                    // 3. INCREMENT TARGET
                    const currentStockDest = await tx.stokPersediaan.findUnique({
                        where: { persediaanId_gudangId: { persediaanId, gudangId: targetGudangId } }
                    });
                    const beforeQtyDest = currentStockDest ? Number(currentStockDest.kuantitas) : 0;

                    await tx.stokPersediaan.upsert({
                        where: { persediaanId_gudangId: { persediaanId, gudangId: targetGudangId } },
                        create: {
                            persediaanId, gudangId: targetGudangId,
                            kuantitas: absQty, nilaiStok: absQty * costPrice
                        },
                        update: { kuantitas: { increment: absQty } }
                    });

                    await tx.mutasiPersediaan.create({
                        data: {
                            persediaanId, gudangId: targetGudangId,
                            nomorMutasi: `MUT-${Date.now()}-IN`,
                            tanggal: new Date(validatedData.tanggal),
                            tipe: 'TRANSFER_IN',
                            kuantitas: absQty, harga: costPrice, nilai: absQty * costPrice,
                            saldoSebelum: beforeQtyDest, saldoSesudah: beforeQtyDest + absQty,
                            referensi: validatedData.referensi,
                            keterangan: validatedData.keterangan || `Transfer dari Gudang ID: ${validatedData.gudangId}`
                        }
                    });

                } else {
                    // === NORMAL IN/OUT/ADJUSTMENT LOGIC ===
                    let isDecrement = false;
                    if (validatedData.tipe === 'ADJUSTMENT' && item.kuantitas < 0) {
                        isDecrement = true;
                    } else if (validatedData.tipe === 'KELUAR') {
                        isDecrement = true;
                    }

                    if (isDecrement) {
                        // CHECK STOCK
                        const currentStock = await tx.stokPersediaan.findUnique({
                            where: {
                                persediaanId_gudangId: {
                                    persediaanId,
                                    gudangId: validatedData.gudangId
                                }
                            }
                        });
                        const currentQty = currentStock ? Number(currentStock.kuantitas) : 0;
                        if (currentQty < absQty) {
                            throw new Error(`Stok tidak mencukupi untuk produk ${product.namaProduk}. Stok saat ini: ${currentQty}, Dibutuhkan: ${absQty}`);
                        }

                        // DECREMENT
                        await tx.stokPersediaan.upsert({
                            where: {
                                persediaanId_gudangId: { persediaanId, gudangId: validatedData.gudangId }
                            },
                            create: {
                                persediaanId,
                                gudangId: validatedData.gudangId,
                                kuantitas: -absQty,
                                nilaiStok: -absQty * costPrice,
                            },
                            update: {
                                kuantitas: { decrement: absQty }
                            }
                        });

                        // LOG
                        await tx.mutasiPersediaan.create({
                            data: {
                                persediaanId,
                                gudangId: validatedData.gudangId,
                                nomorMutasi: `MUT-${Date.now()}`,
                                tanggal: new Date(validatedData.tanggal),
                                tipe: validatedData.tipe === 'ADJUSTMENT' ? 'ADJUSTMENT_OUT' : 'KELUAR',
                                kuantitas: absQty,
                                harga: costPrice,
                                nilai: absQty * costPrice,
                                saldoSebelum: currentQty,
                                saldoSesudah: currentQty - absQty,
                                referensi: validatedData.referensi,
                                keterangan: validatedData.keterangan || 'Pengurangan Stok'
                            }
                        });

                    } else {
                        // INCREMENT (MASUK, ADJUSTMENT POSITIVE)
                        const targetGudangId = validatedData.gudangId;

                        const currentStockDest = await tx.stokPersediaan.findUnique({
                            where: {
                                persediaanId_gudangId: { persediaanId, gudangId: targetGudangId }
                            }
                        });
                        const beforeQty = currentStockDest ? Number(currentStockDest.kuantitas) : 0;

                        // Increment
                        await tx.stokPersediaan.upsert({
                            where: {
                                persediaanId_gudangId: { persediaanId, gudangId: targetGudangId }
                            },
                            create: {
                                persediaanId,
                                gudangId: targetGudangId,
                                kuantitas: absQty,
                                nilaiStok: absQty * costPrice
                            },
                            update: {
                                kuantitas: { increment: absQty }
                            }
                        });

                        // Log
                        await tx.mutasiPersediaan.create({
                            data: {
                                persediaanId,
                                gudangId: targetGudangId,
                                nomorMutasi: `MUT-${Date.now()}-IN`,
                                tanggal: new Date(validatedData.tanggal),
                                tipe: validatedData.tipe === 'ADJUSTMENT' ? 'ADJUSTMENT_IN' : 'MASUK',
                                kuantitas: absQty,
                                harga: costPrice,
                                nilai: absQty * costPrice,
                                saldoSebelum: beforeQty,
                                saldoSesudah: beforeQty + absQty,
                                referensi: validatedData.referensi,
                                keterangan: validatedData.keterangan || 'Penambahan Stok'
                            }
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
