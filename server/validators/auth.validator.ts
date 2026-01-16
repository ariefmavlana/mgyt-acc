import { z } from 'zod';
import { UserRole } from '@prisma/client';

export const registerSchema = z.object({
    namaLengkap: z.string().min(3, 'Nama harus minimal 3 karakter'),
    username: z.string().min(3, 'Username harus minimal 3 karakter'),
    email: z.string().email('Format email tidak valid'),
    password: z.string()
        .min(8, 'Password harus minimal 8 karakter')
        .regex(/[A-Z]/, 'Password harus mengandung setidaknya satu huruf besar')
        .regex(/[a-z]/, 'Password harus mengandung setidaknya satu huruf kecil')
        .regex(/[0-9]/, 'Password harus mengandung setidaknya satu angka')
        .regex(/[^A-Za-z0-9]/, 'Password harus mengandung setidaknya satu karakter khusus'),
    confirmPassword: z.string(),
    role: z.nativeEnum(UserRole).optional().default(UserRole.STAFF),
    namaPerusahaan: z.string().min(2, 'Nama perusahaan harus minimal 2 karakter').optional(),
    paket: z.enum(['UMKM', 'SMALL', 'MEDIUM', 'ENTERPRISE']).optional().default('UMKM'),
    tahunBuku: z.number().int().optional(),
    bulanMulaiFiskal: z.number().int().min(1).max(12).optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
});

export const loginSchema = z.object({
    email: z.string().email('Format email tidak valid'),
    password: z.string().min(1, 'Password wajib diisi'),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Password saat ini wajib diisi'),
    newPassword: z.string()
        .min(8, 'Password baru harus minimal 8 karakter')
        .regex(/[A-Z]/, 'Password baru harus mengandung setidaknya satu huruf besar')
        .regex(/[a-z]/, 'Password baru harus mengandung setidaknya satu huruf kecil')
        .regex(/[0-9]/, 'Password baru harus mengandung setidaknya satu angka')
        .regex(/[^A-Za-z0-0]/, 'Password baru harus mengandung setidaknya satu karakter khusus'),
    confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Konfirmasi password baru tidak cocok",
    path: ["confirmNewPassword"],
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const updateProfileSchema = z.object({
    namaLengkap: z.string().min(3, 'Nama harus minimal 3 karakter').optional(),
    telepon: z.string().optional(),
    foto: z.string().url('URL foto tidak valid').optional().or(z.literal('')),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
