import { z } from 'zod';
import { transactionLineSchema } from './transaction.validator';

export const createInvoiceSchema = z.object({
    pelangganId: z.string().min(1, 'Pelanggan harus dipilih'),
    tanggal: z.string().or(z.date()),
    nomorInvoice: z.string().optional(), // If empty, auto-generate
    terminPembayaran: z.number().min(0).default(30), // Days
    tanggalJatuhTempo: z.string().or(z.date()).optional(), // Override if needed
    referensi: z.string().optional(),
    gudangId: z.string().optional(), // Warehouse selector
    catatan: z.string().optional(),
    mataUangId: z.string().optional(), // Defaults to IDR
    kurs: z.number().optional(), // Defaults to 1
    cabangId: z.string().optional(),

    // Line items
    items: z.array(transactionLineSchema.omit({ kredit: true, debit: true }).extend({
        produkId: z.string().optional(), // Link to Product
        kuantitas: z.number().min(1).default(1),
        hargaSatuan: z.number().min(0),
        diskon: z.number().min(0).optional().default(0),
        pajakId: z.string().optional(), // If we implement tax logic later
    })).min(1, 'Invoice harus memiliki minimal 1 item'),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
