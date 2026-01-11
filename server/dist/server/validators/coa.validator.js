"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCOASchema = exports.createCOASchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createCOASchema = zod_1.z.object({
    kodeAkun: zod_1.z.string().min(1, 'Kode akun wajib diisi'),
    namaAkun: zod_1.z.string().min(1, 'Nama akun wajib diisi'),
    tipe: zod_1.z.nativeEnum(client_1.TipeAkun),
    parentId: zod_1.z.string().optional().nullable(),
    normalBalance: zod_1.z.enum(['DEBIT', 'KREDIT']).default('DEBIT'),
    isHeader: zod_1.z.boolean().default(false),
    isActive: zod_1.z.boolean().default(true),
    allowManualEntry: zod_1.z.boolean().default(true),
    kategoriAset: zod_1.z.string().optional().nullable(),
    kategoriLiabilitas: zod_1.z.string().optional().nullable(),
    kategoriEkuitas: zod_1.z.string().optional().nullable(),
    saldoAwal: zod_1.z.number().default(0),
    catatan: zod_1.z.string().optional().nullable(),
});
exports.updateCOASchema = exports.createCOASchema.partial();
