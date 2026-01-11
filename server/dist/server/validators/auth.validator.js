"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.registerSchema = zod_1.z.object({
    namaLengkap: zod_1.z.string().min(3, 'Nama harus minimal 3 karakter'),
    username: zod_1.z.string().min(3, 'Username harus minimal 3 karakter'),
    email: zod_1.z.string().email('Format email tidak valid'),
    password: zod_1.z.string().min(8, 'Password harus minimal 8 karakter'),
    confirmPassword: zod_1.z.string(),
    role: zod_1.z.nativeEnum(client_1.Role).optional().default(client_1.Role.STAFF),
    namaPerusahaan: zod_1.z.string().min(2, 'Nama perusahaan harus minimal 2 karakter').optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Format email tidak valid'),
    password: zod_1.z.string().min(1, 'Password wajib diisi'),
});
