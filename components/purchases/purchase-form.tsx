'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Trash2, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const purchaseFormSchema = z.object({
    pemasokId: z.string().min(1, 'Pemasok harus dipilih'),
    tanggal: z.date(),
    tanggalJatuhTempo: z.date().optional(),
    terminPembayaran: z.number().min(0).default(30),
    nomorTransaksi: z.string().optional(),
    referensi: z.string().optional(),
    catatan: z.string().optional(),
    items: z.array(z.object({
        akunId: z.string().min(1, 'Akun harus dipilih'),
        deskripsi: z.string().min(1, 'Deskripsi item harus diisi'),
        kuantitas: z.number().min(1, 'Qty minimal 1'),
        hargaSatuan: z.number().min(0, 'Harga tidak boleh negatif'),
        diskon: z.number().min(0).default(0),
    })).min(1, 'Minimal satu item harus ditambahkan'),
});

type PurchaseFormValues = z.infer<typeof purchaseFormSchema>;

interface Vendor {
    id: string;
    nama: string;
}

interface Account {
    id: string;
    kodeAkun: string;
    namaAkun: string;
    tipe: string;
    kategoriAset?: string;
    kategoriLiabilitas?: string;
    kategoriEkuitas?: string;
    kategori?: string;
}

export function PurchaseForm() {
    const router = useRouter();
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const form = useForm<PurchaseFormValues>({
        resolver: zodResolver(purchaseFormSchema),
        defaultValues: {
            tanggal: new Date(),
            terminPembayaran: 30,
            items: [
                { deskripsi: '', kuantitas: 1, hargaSatuan: 0, diskon: 0, akunId: '' }
            ]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'items'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [vendRes, accRes] = await Promise.all([
                    api.get('/contacts/vendors'),
                    api.get('/coa?flatten=true')
                ]);
                setVendors(vendRes.data);

                // Filter for Expense or Asset accounts
                const filteredAccounts = accRes.data.filter((a: Account) =>
                    ['BEBAN', 'BEBAN_LAINNYA', 'ASET_LANCAR', 'ASET_TETAP'].includes(a.tipe) ||
                    a.kategori === 'BEBAN'
                );
                setAccounts(filteredAccounts);
            } catch (error) {
                console.error('Failed to load data', error);
                toast.error('Gagal memuat data pemasok/akun');
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchData();
    }, []);

    const onSubmit = async (data: PurchaseFormValues) => {
        try {
            await api.post('/purchases', data);
            toast.success('Tagihan pembelian berhasil dicatat!');
            router.push('/dashboard/bills');
        } catch (error: unknown) {
            console.error('Submit error:', error);
            const errorMessage = error instanceof Error && 'response' in error
                ? (error as any).response?.data?.message
                : 'Gagal mencatat tagihan';
            toast.error(errorMessage || 'Gagal mencatat tagihan');
        }
    };

    const watchItems = form.watch('items');
    const totalAmount = watchItems.reduce((acc, item) => {
        const sub = (Number(item.kuantitas) * Number(item.hargaSatuan)) - (Number(item.diskon) || 0);
        return acc + sub;
    }, 0);

    if (isLoadingData) return <div className="text-center p-8">Memuat form...</div>;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-500">
                <Card className="border-slate-200">
                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="pemasokId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Pemasok</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="border-slate-200">
                                                    <SelectValue placeholder="Pilih Pemasok" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {vendors.map((v) => (
                                                    <SelectItem key={v.id} value={v.id}>{v.nama}</SelectItem>
                                                ))}
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
                                        <FormLabel>Referensi / No. Surat Jalan</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Contoh: SJ-001" {...field} className="border-slate-200" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="tanggal"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Tanggal Tagihan</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal border-slate-200",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP")
                                                            ) : (
                                                                <span>Pilih tanggal</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="terminPembayaran"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Termin (Hari)</FormLabel>
                                            <FormControl>
                                                <Input type="number" value={field.value} onChange={e => field.onChange(e.target.valueAsNumber)} className="border-slate-200" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="nomorTransaksi"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nomor Tagihan (Opsional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Auto-generate jika kosong" {...field} className="border-slate-200" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b border-slate-200 py-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Detail Tagihan</CardTitle>
                            <Button type="button" variant="outline" size="sm" onClick={() => append({ deskripsi: '', kuantitas: 1, hargaSatuan: 0, diskon: 0, akunId: '' })}>
                                <Plus className="w-4 h-4 mr-2" /> Tambah Baris
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="min-w-[800px]">
                            <div className="grid grid-cols-12 gap-2 p-3 bg-slate-50/50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b">
                                <div className="col-span-3">Akun / Kategori</div>
                                <div className="col-span-3">Penerangan / Deskripsi</div>
                                <div className="col-span-1 text-center">Qty</div>
                                <div className="col-span-2 text-right">Harga Satuan</div>
                                <div className="col-span-1 text-right">Disc</div>
                                <div className="col-span-2 text-right">Subtotal</div>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-12 gap-2 p-3 items-start group">
                                        <div className="col-span-3">
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.akunId`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="bg-transparent border-transparent group-hover:border-slate-200 h-9 transition-all">
                                                                    <SelectValue placeholder="Pilih Akun" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {accounts.map((acc) => (
                                                                    <SelectItem key={acc.id} value={acc.id}>
                                                                        <span className="text-xs font-mono mr-2">{acc.kodeAkun}</span>
                                                                        {acc.namaAkun}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
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
                                                            <Input placeholder="Deskripsi..." {...field} className="bg-transparent border-transparent group-hover:border-slate-200 h-9 transition-all" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.kuantitas`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input type="number" {...field} className="bg-transparent border-transparent group-hover:border-slate-200 h-9 transition-all text-center" onChange={e => field.onChange(e.target.valueAsNumber)} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.hargaSatuan`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input type="number" {...field} className="bg-transparent border-transparent group-hover:border-slate-200 h-9 transition-all text-right" onChange={e => field.onChange(e.target.valueAsNumber)} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.diskon`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input type="number" {...field} className="bg-transparent border-transparent group-hover:border-slate-200 h-9 transition-all text-right" onChange={e => field.onChange(e.target.valueAsNumber)} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="col-span-2 flex items-center justify-end gap-2 pr-2">
                                            <div className="text-sm font-semibold text-slate-700">
                                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
                                                    (watchItems[index].kuantitas * watchItems[index].hargaSatuan) - (watchItems[index].diskon || 0)
                                                )}
                                            </div>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end p-6 bg-slate-50/50 border-t items-center gap-8">
                            <div className="text-right space-y-1">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Tagihan</p>
                                <p className="text-3xl font-bold text-slate-900">
                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalAmount)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()} className="border-slate-200">Batal</Button>
                    <Button type="submit" disabled={form.formState.isSubmitting} className="min-w-[150px]">
                        {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                        Simpan Tagihan
                    </Button>
                </div>
            </form>
        </Form>
    );
}
