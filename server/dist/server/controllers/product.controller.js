"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProduct = exports.getProducts = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const product_validator_1 = require("../validators/product.validator");
const getProducts = async (req, res) => {
    try {
        const authReq = req;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = req.query.search ? String(req.query.search) : undefined;
        const category = req.query.category ? String(req.query.category) : undefined;
        const skip = (page - 1) * limit;
        const where = {
            perusahaanId: authReq.user.perusahaanId,
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
            prisma_1.default.produk.findMany({
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
            prisma_1.default.produk.count({ where })
        ]);
        res.json({
            data: products,
            pagination: {
                total,
                page,
                totalPages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        console.error('Get Products Error:', error);
        res.status(500).json({ message: 'Gagal mengambil data produk' });
    }
};
exports.getProducts = getProducts;
const getProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const authReq = req;
        const product = await prisma_1.default.produk.findUnique({
            where: { id: String(id), perusahaanId: authReq.user.perusahaanId },
            include: {
                persediaan: { include: { stok: { include: { gudang: true } } } },
                variant: true
            }
        });
        if (!product)
            return res.status(404).json({ message: 'Produk tidak ditemukan' });
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ message: 'Gagal mengambil detail produk' });
    }
};
exports.getProduct = getProduct;
const createProduct = async (req, res) => {
    try {
        const authReq = req;
        const validatedData = product_validator_1.createProductSchema.parse(req.body);
        const perusahaanId = authReq.user.perusahaanId;
        // Transaction to create Product AND linked Persediaan (Inventory Item)
        const result = await prisma_1.default.$transaction(async (tx) => {
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
                    deskripsi: validatedData.deskripsiSingkat
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
    }
    catch (error) {
        console.error('Create Product Error:', error);
        res.status(500).json({ message: error.message || 'Gagal membuat produk' });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const authReq = req;
        const validatedData = product_validator_1.updateProductSchema.parse(req.body);
        const product = await prisma_1.default.produk.update({
            where: { id: String(id), perusahaanId: authReq.user.perusahaanId },
            data: Object.assign(Object.assign({}, validatedData), { variant: undefined // Handle variants separately if needed
             })
        });
        // Also update linked Persediaan basic info
        if (product.persediaanId) {
            await prisma_1.default.persediaan.update({
                where: { id: product.persediaanId },
                data: {
                    namaPersediaan: validatedData.namaProduk,
                    hargaJual: validatedData.hargaJualEceran,
                    hargaBeli: validatedData.hargaBeli
                }
            });
        }
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Gagal mengupdate produk' });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const authReq = req;
        // Soft delete
        await prisma_1.default.produk.update({
            where: { id: String(id), perusahaanId: authReq.user.perusahaanId },
            data: { isAktif: false }
        });
        res.json({ message: 'Produk dinonaktifkan' });
    }
    catch (error) {
        res.status(500).json({ message: 'Gagal menghapus produk' });
    }
};
exports.deleteProduct = deleteProduct;
