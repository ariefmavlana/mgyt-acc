import { z } from 'zod';

export enum TierPaket {
    UMKM = 'UMKM',
    SMALL = 'SMALL',
    MEDIUM = 'MEDIUM',
    ENTERPRISE = 'ENTERPRISE',
    CUSTOM = 'CUSTOM'
}

export const createCompanySchema = z.object({
    nama: z.string().min(3, 'Nama perusahaan minimal 3 karakter'),
    email: z.string().email('Format email tidak valid'),
    tier: z.nativeEnum(TierPaket).default(TierPaket.UMKM),
    alamat: z.string().min(5, 'Alamat minimal 5 karakter').optional(),
    telepon: z.string().min(10, 'Nomor telepon minimal 10 digit').optional(),
    npwp: z.string().optional(),
    mataUangUtama: z.string().default('IDR'),
    tahunBuku: z.number().default(12),
});

export const updateCompanySchema = createCompanySchema.partial();

export const settingsSchema = z.object({
    mataUangUtama: z.string().optional(),
    tahunBuku: z.number().optional(),
    alamat: z.string().optional(),
    telepon: z.string().optional(),
});
