"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransactionSchema = exports.transactionLineSchema = exports.TipeTransaksi = void 0;
const zod_1 = require("zod");
var TipeTransaksi;
(function (TipeTransaksi) {
    TipeTransaksi["PENJUALAN"] = "PENJUALAN";
    TipeTransaksi["PEMBELIAN"] = "PEMBELIAN";
    TipeTransaksi["BIAYA"] = "BIAYA";
    TipeTransaksi["GAJI"] = "GAJI";
    TipeTransaksi["PEMBAYARAN_HUTANG"] = "PEMBAYARAN_HUTANG";
    TipeTransaksi["PENERIMAAN_PIUTANG"] = "PENERIMAAN_PIUTANG";
    TipeTransaksi["INVESTASI"] = "INVESTASI";
    TipeTransaksi["PENYUSUTAN"] = "PENYUSUTAN";
    TipeTransaksi["AMORTISASI"] = "AMORTISASI";
    TipeTransaksi["REVALUASI"] = "REVALUASI";
    TipeTransaksi["PENYISIHAN"] = "PENYISIHAN";
    TipeTransaksi["JURNAL_PENYESUAIAN"] = "JURNAL_PENYESUAIAN";
    TipeTransaksi["JURNAL_PENUTUP"] = "JURNAL_PENUTUP";
    TipeTransaksi["JURNAL_PEMBALIK"] = "JURNAL_PEMBALIK";
    TipeTransaksi["JURNAL_KOREKSI"] = "JURNAL_KOREKSI";
    TipeTransaksi["LAINNYA"] = "LAINNYA";
})(TipeTransaksi || (exports.TipeTransaksi = TipeTransaksi = {}));
exports.transactionLineSchema = zod_1.z.object({
    akunId: zod_1.z.string().min(1, 'Akun harus dipilih'),
    deskripsi: zod_1.z.string().optional(),
    debit: zod_1.z.number().min(0).default(0),
    kredit: zod_1.z.number().min(0).default(0),
    costCenterId: zod_1.z.string().optional(),
    profitCenterId: zod_1.z.string().optional(),
});
exports.createTransactionSchema = zod_1.z.object({
    tanggal: zod_1.z.string().or(zod_1.z.date()),
    nomorTransaksi: zod_1.z.string().optional(), // Can be auto-generated
    tipe: zod_1.z.nativeEnum(TipeTransaksi),
    referensi: zod_1.z.string().optional(),
    deskripsi: zod_1.z.string().min(1, 'Deskripsi harus diisi'),
    mataUangId: zod_1.z.string().optional(),
    kurs: zod_1.z.number().optional(),
    pelangganId: zod_1.z.string().optional(),
    pemasokId: zod_1.z.string().optional(),
    cabangId: zod_1.z.string().optional(),
    items: zod_1.z.array(exports.transactionLineSchema).min(2, 'Transaksi minimal harus memiliki 2 baris (Debit & Kredit)'),
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
