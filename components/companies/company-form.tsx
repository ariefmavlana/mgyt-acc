'use client';

import { useForm, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCompanySchema, TierPaket } from '@/server/validators/company.validator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

type CompanyFormData = z.infer<typeof createCompanySchema>;

interface CompanyFormProps {
    initialData?: Partial<CompanyFormData>;
    onSubmit: (data: CompanyFormData) => Promise<void>;
}

export function CompanyForm({ initialData, onSubmit }: CompanyFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<CompanyFormData>({
        resolver: zodResolver(createCompanySchema) as Resolver<CompanyFormData>,
        defaultValues: {
            nama: initialData?.nama || '',
            email: initialData?.email || '',
            tier: (initialData?.tier as TierPaket) || TierPaket.UMKM,
            alamat: initialData?.alamat || '',
            telepon: initialData?.telepon || '',
            npwp: initialData?.npwp || '',
            mataUangUtama: initialData?.mataUangUtama || 'IDR',
            tahunBuku: initialData?.tahunBuku || 12,
        }
    });

    const handleSubmit = async (data: CompanyFormData) => {
        try {
            setIsSubmitting(true);
            await onSubmit(data);
        } catch {
            // Handled by parent
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="nama"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nama Perusahaan</FormLabel>
                                <FormControl>
                                    <Input placeholder="Contoh: PT. Medina Giacarta" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email Perusahaan</FormLabel>
                                <FormControl>
                                    <Input placeholder="email@perusahaan.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="tier"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Paket (Tier)</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Paket" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value={TierPaket.UMKM}>UMKM (Gratis)</SelectItem>
                                        <SelectItem value={TierPaket.SMALL}>Small Business</SelectItem>
                                        <SelectItem value={TierPaket.MEDIUM}>Medium Enterprise</SelectItem>
                                        <SelectItem value={TierPaket.ENTERPRISE}>Large Enterprise</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="telepon"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nomor Telepon</FormLabel>
                                <FormControl>
                                    <Input placeholder="021-xxxxxxx" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="alamat"
                        render={({ field }) => (
                            <FormItem className="md:col-span-2">
                                <FormLabel>Alamat Lengkap</FormLabel>
                                <FormControl>
                                    <Input placeholder="Jl. Raya Utama No. 123..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="npwp"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>NPWP (Opsional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="00.000.000.0-000.000" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="mataUangUtama"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mata Uang Utama</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Mata Uang" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="IDR">IDR - Rupiah Indonesia</SelectItem>
                                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                                        <SelectItem value="SGD">SGD - Singapore Dollar</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" className="w-full md:w-auto min-w-[150px]" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Menyimpan...
                        </>
                    ) : (
                        initialData ? 'Perbarui Perusahaan' : 'Buat Perusahaan'
                    )}
                </Button>
            </form>
        </Form>
    );
}
