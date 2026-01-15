import { z } from 'zod';

export const organizationSchema = z.object({
    kode: z.string().min(1, 'Kode wajib diisi'),
    nama: z.string().min(1, 'Nama wajib diisi'),
    deskripsi: z.string().optional().nullable(),
    parentId: z.string().optional().nullable(),
    manager: z.string().optional().nullable(),
    isAktif: z.boolean().default(true)
});

export type OrganizationInput = z.infer<typeof organizationSchema>;
