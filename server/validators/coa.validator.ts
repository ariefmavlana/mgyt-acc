import { z } from 'zod';
import { TipeAkun } from '@prisma/client';

export const createCOASchema = z.object({
    kodeAkun: z.string().min(1, 'Kode akun wajib diisi'),
    namaAkun: z.string().min(1, 'Nama akun wajib diisi'),
    tipe: z.nativeEnum(TipeAkun),
    parentId: z.string().optional().nullable(),
    normalBalance: z.enum(['DEBIT', 'KREDIT']).default('DEBIT'),
    isHeader: z.boolean().default(false),
    isActive: z.boolean().default(true),
    allowManualEntry: z.boolean().default(true),
    kategoriAset: z.string().optional().nullable(),
    kategoriLiabilitas: z.string().optional().nullable(),
    kategoriEkuitas: z.string().optional().nullable(),
    saldoAwal: z.number().default(0),
    catatan: z.string().optional().nullable(),
});

export const updateCOASchema = createCOASchema.partial();
