import { z } from 'zod';
import { Role } from '@prisma/client';

export const registerSchema = z.object({
    namaLengkap: z.string().min(3, 'Nama harus minimal 3 karakter'),
    username: z.string().min(3, 'Username harus minimal 3 karakter'),
    email: z.string().email('Format email tidak valid'),
    password: z.string().min(8, 'Password harus minimal 8 karakter'),
    confirmPassword: z.string(),
    role: z.nativeEnum(Role).optional().default(Role.STAFF),
    namaPerusahaan: z.string().min(2, 'Nama perusahaan harus minimal 2 karakter').optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
});

export const loginSchema = z.object({
    email: z.string().email('Format email tidak valid'),
    password: z.string().min(1, 'Password wajib diisi'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
