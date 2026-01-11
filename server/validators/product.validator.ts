import { z } from 'zod';

export const createProductSchema = z.object({
    kodeProduk: z.string().min(1, 'Kode produk harus diisi'),
    namaProduk: z.string().min(1, 'Nama produk harus diisi'),
    kategori: z.string().min(1, 'Kategori harus diisi'),
    subKategori: z.string().optional(),

    satuan: z.string().min(1, 'Satuan harus diisi'),
    isPPN: z.boolean().default(false),

    hargaJualEceran: z.coerce.number().min(0),
    hargaJualGrosir: z.coerce.number().min(0).optional(),
    hargaBeli: z.coerce.number().min(0).optional(),

    deskripsiSingkat: z.string().optional(),
    fotoUtama: z.string().optional(),

    // Inventory Settings
    stokMinimum: z.coerce.number().min(0).default(0),
    stokMaksimum: z.coerce.number().min(0).optional(),

    // Variants (Optional initial creation)
    variants: z.array(z.object({
        namaVariant: z.string().min(1),
        sku: z.string().min(1),
        hargaJual: z.coerce.number().min(0).optional(),
        atribut: z.string().optional(), // JSON string or object
    })).optional()
});

export const updateProductSchema = createProductSchema.partial();
