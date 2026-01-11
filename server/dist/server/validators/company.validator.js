"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsSchema = exports.updateCompanySchema = exports.createCompanySchema = exports.TierPaket = void 0;
const zod_1 = require("zod");
var TierPaket;
(function (TierPaket) {
    TierPaket["UMKM"] = "UMKM";
    TierPaket["SMALL"] = "SMALL";
    TierPaket["MEDIUM"] = "MEDIUM";
    TierPaket["ENTERPRISE"] = "ENTERPRISE";
    TierPaket["CUSTOM"] = "CUSTOM";
})(TierPaket || (exports.TierPaket = TierPaket = {}));
exports.createCompanySchema = zod_1.z.object({
    nama: zod_1.z.string().min(3, 'Nama perusahaan minimal 3 karakter'),
    email: zod_1.z.string().email('Format email tidak valid'),
    tier: zod_1.z.nativeEnum(TierPaket).default(TierPaket.UMKM),
    alamat: zod_1.z.string().min(5, 'Alamat minimal 5 karakter').optional(),
    telepon: zod_1.z.string().min(10, 'Nomor telepon minimal 10 digit').optional(),
    npwp: zod_1.z.string().optional(),
    mataUangUtama: zod_1.z.string().default('IDR'),
    tahunBuku: zod_1.z.number().default(12),
});
exports.updateCompanySchema = exports.createCompanySchema.partial();
exports.settingsSchema = zod_1.z.object({
    mataUangUtama: zod_1.z.string().optional(),
    tahunBuku: zod_1.z.number().optional(),
    alamat: zod_1.z.string().optional(),
    telepon: zod_1.z.string().optional(),
});
