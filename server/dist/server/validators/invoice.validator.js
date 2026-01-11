"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoiceSchema = void 0;
const zod_1 = require("zod");
const transaction_validator_1 = require("./transaction.validator");
exports.createInvoiceSchema = zod_1.z.object({
    pelangganId: zod_1.z.string().min(1, 'Pelanggan harus dipilih'),
    tanggal: zod_1.z.string().or(zod_1.z.date()),
    nomorInvoice: zod_1.z.string().optional(), // If empty, auto-generate
    terminPembayaran: zod_1.z.number().min(0).default(30), // Days
    tanggalJatuhTempo: zod_1.z.string().or(zod_1.z.date()).optional(), // Override if needed
    referensi: zod_1.z.string().optional(),
    catatan: zod_1.z.string().optional(),
    mataUangId: zod_1.z.string().optional(), // Defaults to IDR
    kurs: zod_1.z.number().optional(), // Defaults to 1
    // Line items
    items: zod_1.z.array(transaction_validator_1.transactionLineSchema.omit({ kredit: true, debit: true }).extend({
        kuantitas: zod_1.z.number().min(1).default(1),
        hargaSatuan: zod_1.z.number().min(0),
        diskon: zod_1.z.number().min(0).optional().default(0),
        pajakId: zod_1.z.string().optional(), // If we implement tax logic later
    })).min(1, 'Invoice harus memiliki minimal 1 item'),
});
