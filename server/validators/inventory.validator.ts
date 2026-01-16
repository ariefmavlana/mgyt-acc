import { z } from 'zod';

export const stockMovementSchema = z.object({
    gudangId: z.string().min(1, 'Gudang asal harus dipilih'),
    gudangTujuanId: z.string().optional(), // Required for TRANSFER

    tipe: z.enum(['MASUK', 'KELUAR', 'TRANSFER', 'ADJUSTMENT']),
    tanggal: z.string().datetime().or(z.date()),

    referensi: z.string().optional(),
    keterangan: z.string().optional(),

    // Accounting Integration
    akunId: z.string().optional(), // The contra-account for adjustments (e.g. Adjustment Expense/Loss)

    items: z.array(z.object({
        produkId: z.string().min(1, 'Produk harus dipilih'),
        kuantitas: z.coerce.number().refine(val => val !== 0, 'Kuantitas tidak boleh 0'),
        // Optional override details
        hargaSatuan: z.coerce.number().optional(), // For valuation adjustment
    })).min(1, 'Minimal satu item harus dipilih')
}).superRefine((data, ctx) => {
    if (data.tipe === 'TRANSFER' && !data.gudangTujuanId) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Gudang tujuan wajib dipilih untuk Transfer Stok",
            path: ["gudangTujuanId"]
        });
    }
    if (data.tipe === 'TRANSFER' && data.gudangId === data.gudangTujuanId) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Gudang asal dan tujuan tidak boleh sama",
            path: ["gudangTujuanId"]
        });
    }
});
