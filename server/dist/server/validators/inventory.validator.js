"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stockMovementSchema = void 0;
const zod_1 = require("zod");
exports.stockMovementSchema = zod_1.z.object({
    gudangId: zod_1.z.string().min(1, 'Gudang asal harus dipilih'),
    gudangTujuanId: zod_1.z.string().optional(), // Required for TRANSFER
    tipe: zod_1.z.enum(['MASUK', 'KELUAR', 'TRANSFER', 'ADJUSTMENT']),
    tanggal: zod_1.z.string().datetime().or(zod_1.z.date()),
    referensi: zod_1.z.string().optional(),
    keterangan: zod_1.z.string().optional(),
    items: zod_1.z.array(zod_1.z.object({
        produkId: zod_1.z.string().min(1, 'Produk harus dipilih'),
        kuantitas: zod_1.z.coerce.number().gt(0, 'Kuantitas harus lebih dari 0'),
        // Optional override details
        hargaSatuan: zod_1.z.coerce.number().optional(), // For valuation adjustment
    })).min(1, 'Minimal satu item harus dipilih')
});
