'use client';

import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2, Percent, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import { useTax, MasterPajak } from '@/hooks/use-tax';
import { HelpIndicator } from '@/components/ui/help-indicator';

const taxSchema = z.object({
    kodePajak: z.string().min(2, 'Kode pajak minimal 2 karakter'),
    namaPajak: z.string().min(3, 'Nama pajak minimal 3 karakter'),
    jenis: z.string(),
    tarif: z.coerce.number().min(0, 'Tarif tidak boleh negatif').max(100, 'Tarif maksimal 100%'),
    akunPajak: z.string().default(''),
    isPemungut: z.boolean().default(false),
    keterangan: z.string().default(''),
});

type TaxFormValues = z.infer<typeof taxSchema>;

interface TaxFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tax?: MasterPajak | null;
}

export function TaxForm({ open, onOpenChange, tax }: TaxFormProps) {
    const { createTax, updateTax } = useTax();

    const form = useForm({
        resolver: zodResolver(taxSchema),
        defaultValues: {
            kodePajak: '',
            namaPajak: '',
            jenis: 'PPN_KELUARAN',
            tarif: 0,
            akunPajak: '',
            isPemungut: false,
            keterangan: '',
        },
    });

    useEffect(() => {
        if (tax) {
            form.reset({
                kodePajak: tax.kodePajak,
                namaPajak: tax.namaPajak,
                jenis: tax.jenis,
                tarif: Number(tax.tarif),
                akunPajak: tax.akunPajak || '',
                isPemungut: tax.isPemungut,
                keterangan: tax.keterangan || '',
            });
        } else {
            form.reset({
                kodePajak: '',
                namaPajak: '',
                jenis: 'PPN_KELUARAN',
                tarif: 0,
                akunPajak: '',
                isPemungut: false,
                keterangan: '',
            });
        }
    }, [tax, form]);

    const onSubmit: SubmitHandler<TaxFormValues> = async (values) => {
        try {
            if (tax) {
                await updateTax.mutateAsync({ id: tax.id, data: values });
                toast.success('Pajak berhasil diperbarui');
            } else {
                await createTax.mutateAsync(values);
                toast.success('Pajak berhasil ditambahkan');
            }
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error('Gagal menyimpan data pajak');
        }
    };

    const isLoading = createTax.isPending || updateTax.isPending;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-xl overflow-y-auto border-l border-slate-200">
                <SheetHeader className="mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Calculator className="w-5 h-5 text-primary" />
                        </div>
                        <div className="text-left">
                            <SheetTitle className="text-xl font-bold text-slate-900">
                                {tax ? 'Edit Master Pajak' : 'Tambah Master Pajak'}
                            </SheetTitle>
                            <SheetDescription className="text-slate-500">
                                Atur kode, tarif, dan jenis pajak sesuai peraturan perpajakan.
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <Form {...form}>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
                        <Card className="border-slate-200/60 shadow-sm overflow-hidden">
                            <CardContent className="p-5 space-y-4 bg-slate-50/50">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="kodePajak"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold">Kode Pajak</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Contoh: PPN11" {...field} value={(field.value as string) || ''} className="bg-white focus:ring-primary/20" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="tarif"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-xs flex items-center gap-1">
                                                    Tarif (%) <Percent className="w-3 h-3" />
                                                    <HelpIndicator content="Persentase pengali pajak (misal 11 untuk PPN). Sistem akan menghitung otomatis nominal pajak berdasarkan DPP." />
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        {...field}
                                                        value={(field.value as number) || 0}
                                                        className="bg-white focus:ring-primary/20"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="namaPajak"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700 font-semibold text-xs">Nama Pajak</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Contoh: PPN 11% Dalam Negeri" {...field} value={(field.value as string) || ''} className="bg-white focus:ring-primary/20" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="jenis"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700 font-semibold text-xs flex items-center gap-2">
                                                Jenis Pajak
                                                <HelpIndicator content="Klasifikasi pajak untuk pelaporan e-Faktur atau e-Bupot. Menentukan apakah pajak ini menambah pengeluaran atau pengurang pendapatan." />
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} value={(field.value as string) || ''}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-white">
                                                        <SelectValue placeholder="Pilih jenis pajak" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="PPN_KELUARAN">PPN Keluaran (Penjualan)</SelectItem>
                                                    <SelectItem value="PPN_MASUKAN">PPN Masukan (Pembelian)</SelectItem>
                                                    <SelectItem value="PPH_PASAL_21">PPh Pasal 21 (Gaji/Upah)</SelectItem>
                                                    <SelectItem value="PPH_PASAL_23">PPh Pasal 23 (Jasa/Sewa)</SelectItem>
                                                    <SelectItem value="PPH_PASAL_4_AYAT_2">PPh Pasal 4 Ayat 2 (Final)</SelectItem>
                                                    <SelectItem value="PPH_PASAL_22">PPh Pasal 22</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="isPemungut"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border bg-white p-3 shadow-sm">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-slate-700 font-semibold text-xs">Wajib Pungut (WAPU)</FormLabel>
                                                <FormDescription className="text-[10px]">
                                                    Aktifkan jika Anda bertindak sebagai pemungut pajak ini.
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={!!field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="keterangan"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700 font-semibold text-xs">Keterangan (Opsional)</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Tambahkan catatan tambahan..."
                                                    {...field}
                                                    value={(field.value as string) || ''}
                                                    className="bg-white min-h-[80px] focus:ring-primary/20"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="border-slate-200 text-slate-600 hover:bg-slate-50"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="px-8 shadow-md hover:shadow-lg transition-all"
                            >
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {tax ? 'Simpan Perubahan' : 'Tambah Pajak'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </SheetContent>
        </Sheet >
    );
}
