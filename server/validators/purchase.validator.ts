import { z } from 'zod';
import { transactionLineSchema } from './transaction.validator';

export const createPurchaseSchema = z.object({
    pemasokId: z.string().min(1, 'Pemasok harus dipilih'),
    tanggal: z.string().or(z.date()),
    nomorTransaksi: z.string().optional(), // If empty, auto-generate (BILL/...)
    terminPembayaran: z.number().min(0).default(30),
    tanggalJatuhTempo: z.string().or(z.date()).optional(),
    referensi: z.string().optional(),
    gudangId: z.string().optional(),
    catatan: z.string().optional(),
    mataUangId: z.string().optional(),
    kurs: z.number().optional(),

    // Line items
    items: z.array(transactionLineSchema.omit({ kredit: true, debit: true }).extend({
        produkId: z.string().optional(), // Link to Product
        kuantitas: z.number().min(1).default(1),
        hargaSatuan: z.number().min(0),
        diskon: z.number().min(0).optional().default(0),
        pajakId: z.string().optional(),
    })).min(1, 'Pembelian harus memiliki minimal 1 item'),
});

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;
