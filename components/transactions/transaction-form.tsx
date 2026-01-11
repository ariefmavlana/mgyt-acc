'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AccountSelector } from './account-selector';
import { Plus, Trash2, AlertCircle, Loader2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useCompany } from '@/hooks/use-company';

const transactionSchema = z.object({
    tanggal: z.string().min(1, 'Tanggal harus diisi'),
    tipe: z.string().min(1, 'Tipe transaksi harus dipilih'),
    deskripsi: z.string().min(1, 'Keterangan/Deskripsi harus diisi'),
    referensi: z.string().optional(),
    items: z.array(z.object({
        akunId: z.string().min(1, 'Akun harus dipilih'),
        deskripsi: z.string().optional(),
        debit: z.number().min(0),
        kredit: z.number().min(0),
    })).min(2, 'Minimal harus ada 2 baris transaksi'),
}).refine((data) => {
    const totalDebit = data.items.reduce((sum, item) => sum + item.debit, 0);
    const totalKredit = data.items.reduce((sum, item) => sum + item.kredit, 0);
    return Math.abs(totalDebit - totalKredit) < 0.01;
}, {
    message: 'Total Debit dan Total Kredit harus seimbang',
    path: ['items'],
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
    initialData?: TransactionFormValues;
    isEditing?: boolean;
}

export function TransactionForm({ initialData, isEditing }: TransactionFormProps) {
    const router = useRouter();
    const { currentCompany } = useCompany();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<TransactionFormValues>({
        resolver: zodResolver(transactionSchema),
        defaultValues: initialData || {
            tanggal: new Date().toISOString().split('T')[0],
            tipe: 'JURNAL_UMUM',
            deskripsi: '',
            referensi: '',
            items: [
                { akunId: '', deskripsi: '', debit: 0, kredit: 0 },
                { akunId: '', deskripsi: '', debit: 0, kredit: 0 },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'items',
    });

    const items = form.watch('items');
    const totalDebit = items.reduce((sum, item) => sum + (Number(item.debit) || 0), 0);
    const totalKredit = items.reduce((sum, item) => sum + (Number(item.kredit) || 0), 0);
    const isBalanced = Math.abs(totalDebit - totalKredit) < 0.01;

    async function onSubmit(data: TransactionFormValues) {
        if (!currentCompany) {
            toast.error('Perusahaan belum dipilih');
            return;
        }

        try {
            setIsSubmitting(true);
            const res = await api.post('/transactions', data, {
                params: { perusahaanId: currentCompany.id }
            });
            toast.success(res.data.message);
            router.push('/dashboard/transactions');
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: { message?: string } } };
            toast.error(axiosError.response?.data?.message || 'Gagal menyimpan transaksi');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Header Transaksi</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <FormField
                            control={form.control}
                            name="tanggal"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tanggal</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="tipe"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipe</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        disabled={isEditing}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih tipe" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="JURNAL_UMUM">Jurnal Umum</SelectItem>
                                            <SelectItem value="PENJUALAN">Penjualan</SelectItem>
                                            <SelectItem value="PEMBELIAN">Pembelian</SelectItem>
                                            <SelectItem value="BIAYA">Biaya</SelectItem>
                                            <SelectItem value="LAINNYA">Lainnya</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="referensi"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>No. Referensi (Opsional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Contoh: INV/2026/001" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="deskripsi"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Deskripsi Utama</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Keterangan transaksi..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-xl">Baris Jurnal</CardTitle>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => append({ akunId: '', deskripsi: '', debit: 0, kredit: 0 })}
                        >
                            <Plus className="mr-2 h-4 w-4" /> Tambah Baris
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="hidden md:grid grid-cols-12 gap-4 px-2 text-sm font-semibold text-muted-foreground">
                            <div className="col-span-4">Akun</div>
                            <div className="col-span-3">Keterangan (Opsional)</div>
                            <div className="col-span-2 text-right">Debit</div>
                            <div className="col-span-2 text-right">Kredit</div>
                            <div className="col-span-1"></div>
                        </div>

                        <div className="space-y-3">
                            {fields.map((field, index) => (
                                <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start border-b md:border-none pb-4 md:pb-0">
                                    <div className="col-span-4">
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.akunId`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <AccountSelector
                                                            value={field.value}
                                                            onChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.deskripsi`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input placeholder="Detail baris..." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.debit`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            className="text-right"
                                                            onChange={e => field.onChange(Number(e.target.value))}
                                                            value={field.value}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.kredit`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            className="text-right"
                                                            onChange={e => field.onChange(Number(e.target.value))}
                                                            value={field.value}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="col-span-1 flex justify-end">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => remove(index)}
                                            disabled={fields.length <= 2}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-6 border-t space-y-2">
                            <div className="flex justify-between items-center text-sm md:text-base font-bold">
                                <span className="text-muted-foreground">Total Keseluruhan</span>
                                <div className="flex gap-8">
                                    <div className="text-right min-w-[120px]">
                                        <div className="text-xs text-muted-foreground uppercase mb-1">Total Debit</div>
                                        <div className={cn(isBalanced ? "text-primary" : "text-red-600")}>
                                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalDebit)}
                                        </div>
                                    </div>
                                    <div className="text-right min-w-[120px]">
                                        <div className="text-xs text-muted-foreground uppercase mb-1">Total Kredit</div>
                                        <div className={cn(isBalanced ? "text-primary" : "text-red-600")}>
                                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalKredit)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {!isBalanced && (
                                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm font-medium mt-4 animate-in fade-in slide-in-from-top-1">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>Transaksi tidak seimbang. Selisih: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Math.abs(totalDebit - totalKredit))}</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        className="min-w-[150px]"
                        disabled={!isBalanced || isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Memproses...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Simpan Transaksi
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
