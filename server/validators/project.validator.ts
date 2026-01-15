import { z } from 'zod';

export const createProjectSchema = z.object({
    kodeProyek: z.string().min(1, 'Kode proyek harus diisi'),
    namaProyek: z.string().min(1, 'Nama proyek harus diisi'),
    pelangganId: z.string().optional().nullable(),
    tanggalMulai: z.string().or(z.date()),
    tanggalSelesai: z.string().or(z.date()).optional().nullable(),
    targetSelesai: z.string().or(z.date()).optional().nullable(),
    nilaiKontrak: z.number().optional().nullable(),
    manajerProyek: z.string().optional().nullable(),
    lokasi: z.string().optional().nullable(),
    deskripsi: z.string().optional().nullable(),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
    status: z.string().optional(),
    persentaseSelesai: z.number().optional(),
});
