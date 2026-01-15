import { z } from 'zod';
import { TipeBudget, StatusBudget } from '@prisma/client';

export const budgetDetailSchema = z.object({
    id: z.string().optional(),
    akunId: z.string().min(1, 'Akun harus dipilih'),
    periode: z.string().or(z.date()),
    jumlahBudget: z.number().min(0, 'Jumlah budget tidak boleh negatif'),
    keterangan: z.string().optional(),
});

export const createBudgetSchema = z.object({
    kode: z.string().min(1, 'Kode budget harus diisi'),
    nama: z.string().min(1, 'Nama budget harus diisi'),
    tahun: z.number().int().min(2000).max(2100),
    tipe: z.nativeEnum(TipeBudget),
    tanggalMulai: z.string().or(z.date()),
    tanggalAkhir: z.string().or(z.date()),
    departemenId: z.string().optional().nullable(),
    proyekId: z.string().optional().nullable(),
    deskripsi: z.string().optional().nullable(),
    details: z.array(budgetDetailSchema).min(1, 'Minimal satu detail budget harus diisi'),
});

export const updateBudgetSchema = createBudgetSchema.partial().extend({
    status: z.nativeEnum(StatusBudget).optional(),
});

export const budgetQuerySchema = z.object({
    perusahaanId: z.string().optional(),
    tahun: z.string().optional(),
    status: z.nativeEnum(StatusBudget).optional(),
    tipe: z.nativeEnum(TipeBudget).optional(),
});
