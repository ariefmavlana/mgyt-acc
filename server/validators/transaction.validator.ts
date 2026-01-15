import { z } from 'zod';

export enum TipeTransaksi {
    JURNAL_UMUM = 'JURNAL_UMUM',
    PENJUALAN = 'PENJUALAN',
    PEMBELIAN = 'PEMBELIAN',
    BIAYA = 'BIAYA',
    GAJI = 'GAJI',
    PEMBAYARAN_HUTANG = 'PEMBAYARAN_HUTANG',
    PENERIMAAN_PIUTANG = 'PENERIMAAN_PIUTANG',
    INVESTASI = 'INVESTASI',
    PENYUSUTAN = 'PENYUSUTAN',
    AMORTISASI = 'AMORTISASI',
    REVALUASI = 'REVALUASI',
    PENYISIHAN = 'PENYISIHAN',
    JURNAL_PENYESUAIAN = 'JURNAL_PENYESUAIAN',
    JURNAL_PENUTUP = 'JURNAL_PENUTUP',
    JURNAL_PEMBALIK = 'JURNAL_PEMBALIK',
    JURNAL_KOREKSI = 'JURNAL_KOREKSI',
    LAINNYA = 'LAINNYA',
}

export const transactionLineSchema = z.object({
    akunId: z.string().min(1, 'Akun harus dipilih'),
    deskripsi: z.string().optional(),
    debit: z.number().min(0).default(0),
    kredit: z.number().min(0).default(0),
    costCenterId: z.string().optional(),
    profitCenterId: z.string().optional(),
    pajakId: z.string().optional(),
});

export const createTransactionSchema = z.object({
    tanggal: z.string().or(z.date()),
    nomorTransaksi: z.string().optional(), // Can be auto-generated
    tipe: z.nativeEnum(TipeTransaksi),
    referensi: z.string().optional(),
    deskripsi: z.string().min(1, 'Deskripsi harus diisi'),
    mataUangId: z.string().optional(),
    kurs: z.number().optional(),
    pelangganId: z.string().optional(),
    pemasokId: z.string().optional(),
    cabangId: z.string().optional(),
    lampiran: z.string().optional(),
    items: z.array(transactionLineSchema).min(2, 'Transaksi minimal harus memiliki 2 baris (Debit & Kredit)'),
}).refine((data) => {
    const totalDebit = data.items.reduce((sum, item) => sum + item.debit, 0);
    const totalKredit = data.items.reduce((sum, item) => sum + item.kredit, 0);
    // Allow for small decimal differences if using float, but since we use numbers here, 
    // we should be careful. In a real app, we might use cents or a decimal library.
    return Math.abs(totalDebit - totalKredit) < 0.01;
}, {
    message: 'Total Debit harus sama dengan Total Kredit (Transaksi Tidak Seimbang)',
    path: ['items'],
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type TransactionLineInput = z.infer<typeof transactionLineSchema>;
