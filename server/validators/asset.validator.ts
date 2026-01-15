import { z } from 'zod';
import { MetodePenyusutan, StatusAsetTetap } from '@prisma/client';

export const createAssetSchema = z.object({
    kodeAset: z.string().min(1, 'Kode aset harus diisi'),
    namaAset: z.string().min(1, 'Nama aset harus diisi'),
    kategori: z.string().optional().nullable(),
    tanggalPerolehan: z.string().or(z.date()),
    hargaPerolehan: z.number().positive('Harga perolehan harus lebih dari 0'),
    nilaiResidu: z.number().min(0).default(0),
    masaManfaat: z.number().int().positive('Masa manfaat harus minimal 1 tahun'),
    metodePenyusutan: z.nativeEnum(MetodePenyusutan).default(MetodePenyusutan.GARIS_LURUS),
    status: z.nativeEnum(StatusAsetTetap).default(StatusAsetTetap.AKTIF),

    // COA Relations
    akunAsetId: z.string().min(1, 'Akun aset harus dipilih'),
    akunAkumulasiId: z.string().min(1, 'Akun akumulasi penyusutan harus dipilih'),
    akunBebanId: z.string().min(1, 'Akun beban penyusutan harus dipilih'),

    supplierId: z.string().optional().nullable(),
    lokasi: z.string().optional().nullable(),
    departemen: z.string().optional().nullable(),
    penanggungJawab: z.string().optional().nullable(),

    nomorSeri: z.string().optional().nullable(),
    merk: z.string().optional().nullable(),
    model: z.string().optional().nullable(),
    spesifikasi: z.string().optional().nullable(),

    catatan: z.string().optional().nullable(),
    fotoAset: z.string().optional().nullable(),
});

export const updateAssetSchema = createAssetSchema.partial();

export const depreciationSchema = z.object({
    tanggal: z.string().or(z.date()),
    keterangan: z.string().optional().nullable(),
});
