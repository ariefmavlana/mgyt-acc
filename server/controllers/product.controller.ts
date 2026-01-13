import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import { createProductSchema, updateProductSchema } from '../validators/product.validator';
import { ZodError } from 'zod';

export const getProducts = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = req.query.search ? String(req.query.search) : undefined;
        const category = req.query.category ? String(req.query.category) : undefined;
        const skip = (page - 1) * limit;

        const where: Prisma.ProdukWhereInput = {
            perusahaanId: authReq.currentCompanyId!,
            isAktif: true
        };

        if (search) {
            where.OR = [
                { namaProduk: { contains: search, mode: 'insensitive' } },
                { kodeProduk: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (category) {
            where.kategori = category;
        }

        const [products, total] = await Promise.all([
            prisma.produk.findMany({
                where,
                include: {
                    persediaan: {
                        select: {
                            stok: { select: { kuantitas: true, gudang: { select: { nama: true } } } }
                        }
                    }
                },
                orderBy: { namaProduk: 'asc' },
                skip,
                take: limit
            }),
            prisma.produk.count({ where })
        ]);

        res.json({
            data: products,
            pagination: {
                total,
                page,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error: unknown) {
        console.error('Get Products Error:', error);
        res.status(500).json({ message: 'Gagal mengambil data produk' });
    }
};

export const getProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const authReq = req as AuthRequest;

        const product = await prisma.produk.findUnique({
            where: { id: String(id), perusahaanId: authReq.currentCompanyId },
            include: {
                persediaan: { include: { stok: { include: { gudang: true } } } },
                variant: true
            }
        });

        if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });

        res.json(product);
    } catch {
        res.status(500).json({ message: 'Gagal mengambil detail produk' });
    }
};

export const createProduct = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const validatedData = createProductSchema.parse(req.body);
        const perusahaanId = authReq.currentCompanyId!;

        // Transaction to create Product AND linked Persediaan (Inventory Item)
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Persediaan
            const persediaan = await tx.persediaan.create({
                data: {
                    perusahaanId,
                    kodePersediaan: validatedData.kodeProduk,
                    namaPersediaan: validatedData.namaProduk,
                    kategori: validatedData.kategori,
                    satuan: validatedData.satuan,
                    hargaJual: validatedData.hargaJualEceran,
                    hargaBeli: validatedData.hargaBeli || 0,
                    stokMinimum: validatedData.stokMinimum,
                    stokMaksimum: validatedData.stokMaksimum,
                    isPajakPPN: validatedData.isPPN,
                    fotoProduk: validatedData.fotoUtama,
                    deskripsi: validatedData.deskripsiSingkat,

                    // Account Mapping
                    akunPersediaanId: validatedData.akunPersediaanId,
                    akunHppId: validatedData.akunHppId,
                    akunPenjualanId: validatedData.akunPenjualanId,
                    akunReturPenjualanId: validatedData.akunReturPenjualanId
                }
            });

            // 2. Create Product linked to Persediaan
            const product = await tx.produk.create({
                data: {
                    perusahaanId,
                    persediaanId: persediaan.id,
                    kodeProduk: validatedData.kodeProduk,
                    namaProduk: validatedData.namaProduk,
                    kategori: validatedData.kategori,
                    subKategori: validatedData.subKategori,
                    hargaJualEceran: validatedData.hargaJualEceran,
                    hargaJualGrosir: validatedData.hargaJualGrosir,
                    hargaBeli: validatedData.hargaBeli,
                    isPPN: validatedData.isPPN,
                    satuan: validatedData.satuan,
                    deskripsiSingkat: validatedData.deskripsiSingkat,
                    fotoUtama: validatedData.fotoUtama,
                    variant: validatedData.variants ? {
                        create: validatedData.variants.map(v => ({
                            namaVariant: v.namaVariant,
                            sku: v.sku,
                            hargaJual: v.hargaJual,
                            atribut: v.atribut ? JSON.parse(v.atribut) : undefined
                        }))
                    } : undefined
                }
            });

            return product;
        });

        res.status(201).json(result);
    } catch (error: unknown) {
        if (error instanceof ZodError) {
            return res.status(400).json({ message: error.errors[0].message });
        }
        console.error('Create Product Error:', error);
        const message = error instanceof Error ? error.message : 'Gagal membuat produk';
        res.status(500).json({ message });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const authReq = req as AuthRequest;
        const validatedData = updateProductSchema.parse(req.body);

        const product = await prisma.produk.update({
            where: { id: String(id), perusahaanId: authReq.currentCompanyId },
            data: {
                ...validatedData,
                variant: undefined // Handle variants separately if needed
            }
        });

        // Also update linked Persediaan basic info
        if (product.persediaanId) {
            await prisma.persediaan.update({
                where: { id: product.persediaanId },
                data: {
                    namaPersediaan: validatedData.namaProduk,
                    hargaJual: validatedData.hargaJualEceran,
                    hargaBeli: validatedData.hargaBeli,

                    // Account Mapping (if provided)
                    ...(validatedData.akunPersediaanId && { akunPersediaanId: validatedData.akunPersediaanId }),
                    ...(validatedData.akunHppId && { akunHppId: validatedData.akunHppId }),
                    ...(validatedData.akunPenjualanId && { akunPenjualanId: validatedData.akunPenjualanId }),
                    ...(validatedData.akunReturPenjualanId && { akunReturPenjualanId: validatedData.akunReturPenjualanId })
                }
            });
        }

        res.json(product);
    } catch (error: unknown) {
        if (error instanceof ZodError) {
            return res.status(400).json({ message: error.errors[0].message });
        }
        const message = error instanceof Error ? error.message : 'Gagal mengupdate produk';
        res.status(500).json({ message });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const authReq = req as AuthRequest;

        // Soft delete
        await prisma.produk.update({
            where: { id: String(id), perusahaanId: authReq.currentCompanyId },
            data: { isAktif: false }
        });

        res.json({ message: 'Produk dinonaktifkan' });
    } catch {
        res.status(500).json({ message: 'Gagal menghapus produk' });
    }
};
