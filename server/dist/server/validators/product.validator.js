"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductSchema = exports.createProductSchema = void 0;
const zod_1 = require("zod");
exports.createProductSchema = zod_1.z.object({
    kodeProduk: zod_1.z.string().min(1, 'Kode produk harus diisi'),
    namaProduk: zod_1.z.string().min(1, 'Nama produk harus diisi'),
    kategori: zod_1.z.string().min(1, 'Kategori harus diisi'),
    subKategori: zod_1.z.string().optional(),
    satuan: zod_1.z.string().min(1, 'Satuan harus diisi'),
    isPPN: zod_1.z.boolean().default(false),
    hargaJualEceran: zod_1.z.coerce.number().min(0),
    hargaJualGrosir: zod_1.z.coerce.number().min(0).optional(),
    hargaBeli: zod_1.z.coerce.number().min(0).optional(),
    deskripsiSingkat: zod_1.z.string().optional(),
    fotoUtama: zod_1.z.string().optional(),
    // Inventory Settings
    stokMinimum: zod_1.z.coerce.number().min(0).default(0),
    stokMaksimum: zod_1.z.coerce.number().min(0).optional(),
    // Variants (Optional initial creation)
    variants: zod_1.z.array(zod_1.z.object({
        namaVariant: zod_1.z.string().min(1),
        sku: zod_1.z.string().min(1),
        hargaJual: zod_1.z.coerce.number().min(0).optional(),
        atribut: zod_1.z.string().optional(), // JSON string or object
    })).optional()
});
exports.updateProductSchema = exports.createProductSchema.partial();
