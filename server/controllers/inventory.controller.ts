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
                persediaan: { select: { namaPersediaan: true, kodePersediaan: true, satuan: true } },
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
                const costPrice = product.persediaan ? Number(product.persediaan.hargaBeli) : 0; // Use Moving Average later

                // 2. Handle Source Warehouse (OUT or TRANSFER)
                if (['KELUAR', 'TRANSFER'].includes(validatedData.tipe)) {
                    const currentStock = await tx.stokPersediaan.findUnique({
                        where: {
                            persediaanId_gudangId: {
                                persediaanId,
                                gudangId: validatedData.gudangId
                            }
                        }
                    });

                    const currentQty = currentStock ? Number(currentStock.kuantitas) : 0;
                    if (currentQty < item.kuantitas) {
                        throw new Error(`Stok tidak mencukupi untuk produk ${product.namaProduk} di gudang asal`);
                    }

                    // Decrement Source
                    await tx.stokPersediaan.upsert({
                        where: {
                            persediaanId_gudangId: { persediaanId, gudangId: validatedData.gudangId }
                        },
                        create: {
                            persediaanId,
                            gudangId: validatedData.gudangId,
                            kuantitas: -item.kuantitas,
                            nilaiStok: -item.kuantitas * costPrice, // Simplified
                        },
                        update: {
                            kuantitas: { decrement: item.kuantitas }
                        }
                    });

                    // Log Mutation OUT
                    await tx.mutasiPersediaan.create({
                        data: {
                            persediaanId,
                            gudangId: validatedData.gudangId,
                            nomorMutasi: `MUT-${Date.now()}`,
                            tanggal: new Date(validatedData.tanggal),
                            tipe: validatedData.tipe === 'TRANSFER' ? 'TRANSFER_OUT' : 'KELUAR',
                            kuantitas: item.kuantitas,
                            harga: costPrice,
                            nilai: item.kuantitas * costPrice,
                            saldoSebelum: currentQty,
                            saldoSesudah: currentQty - item.kuantitas,
                            referensi: validatedData.referensi,
                            keterangan: validatedData.keterangan || (validatedData.tipe === 'TRANSFER' ? `Transfer ke ${validatedData.gudangTujuanId}` : 'Pengeluaran Manual')
                        }
                    });
                }

                // 3. Handle Destination / Incoming (MASUK, ADJUSTMENT, TRANSFER)
                if (['MASUK', 'ADJUSTMENT', 'TRANSFER'].includes(validatedData.tipe)) {
                    // Start logic for destination
                    // If TRANSFER, destination is gudangTujuanId. If MASUK/ADJUST, it's gudangId.
                    const targetGudangId = validatedData.tipe === 'TRANSFER' ? validatedData.gudangTujuanId : validatedData.gudangId;

                    if (!targetGudangId) throw new Error('Gudang tujuan harus dipilih untuk Transfer');

                    const currentStockDest = await tx.stokPersediaan.findUnique({
                        where: {
                            persediaanId_gudangId: { persediaanId, gudangId: targetGudangId }
                        }
                    });
                    const beforeQty = currentStockDest ? Number(currentStockDest.kuantitas) : 0;

                    // Increment Destination
                    await tx.stokPersediaan.upsert({
                        where: {
                            persediaanId_gudangId: { persediaanId, gudangId: targetGudangId }
                        },
                        create: {
                            persediaanId,
                            gudangId: targetGudangId,
                            kuantitas: item.kuantitas,
                            nilaiStok: item.kuantitas * costPrice
                        },
                        update: {
                            kuantitas: { increment: item.kuantitas }
                        }
                    });

                    // Log Mutation IN
                    await tx.mutasiPersediaan.create({
                        data: {
                            persediaanId,
                            gudangId: targetGudangId,
                            nomorMutasi: `MUT-${Date.now()}-IN`,
                            tanggal: new Date(validatedData.tanggal),
                            tipe: validatedData.tipe === 'TRANSFER' ? 'TRANSFER_IN' : validatedData.tipe,
                            kuantitas: item.kuantitas,
                            harga: costPrice,
                            nilai: item.kuantitas * costPrice,
                            saldoSebelum: beforeQty,
                            saldoSesudah: beforeQty + item.kuantitas,
                            referensi: validatedData.referensi,
                            keterangan: validatedData.keterangan || (validatedData.tipe === 'TRANSFER' ? `Transfer dari ${validatedData.gudangId}` : 'Penerimaan Manual')
                        }
                    });
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
