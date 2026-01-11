import { z } from 'zod';

export const stockMovementSchema = z.object({
    gudangId: z.string().min(1, 'Gudang asal harus dipilih'),
    gudangTujuanId: z.string().optional(), // Required for TRANSFER

    tipe: z.enum(['MASUK', 'KELUAR', 'TRANSFER', 'ADJUSTMENT']),
    tanggal: z.string().datetime().or(z.date()),

    referensi: z.string().optional(),
    keterangan: z.string().optional(),

    items: z.array(z.object({
        produkId: z.string().min(1, 'Produk harus dipilih'),
        kuantitas: z.coerce.number().gt(0, 'Kuantitas harus lebih dari 0'),
        // Optional override details
        hargaSatuan: z.coerce.number().optional(), // For valuation adjustment
    })).min(1, 'Minimal satu item harus dipilih')
});
