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
import { HelpIndicator } from '@/components/ui/help-indicator';
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

interface Vendor { id: string; nama: string; }
interface Account {
    id: string;
    kodeAkun: string;
    namaAkun: string;
    tipe: string;
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
            items: [{ deskripsi: '', kuantitas: 1, hargaSatuan: 0, diskon: 0, akunId: '' }]
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
                const filteredAccounts = accRes.data.filter((a: Account) =>
                    ['BEBAN', 'BEBAN_LAINNYA', 'ASET_LANCAR', 'ASET_TETAP'].includes(a.tipe) || a.kategori === 'BEBAN'
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
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal mencatat tagihan');
        }
    };

    const watchItems = form.watch('items');
    const totalAmount = watchItems.reduce((acc, item) => {
        return acc + ((item.kuantitas * item.hargaSatuan) - (item.diskon || 0));
    }, 0);

    if (isLoadingData) return <div className="text-center p-8">Memuat form...</div>;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card className="border-slate-200">
                    <CardHeader className="bg-slate-50 border-b">
                        <CardTitle className="text-lg">Detail Tagihan & Vendor</CardTitle>
                    </CardHeader>
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
                                                <SelectTrigger><SelectValue placeholder="Pilih Pemasok" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {vendors.map((v) => <SelectItem key={v.id} value={v.id}>{v.nama}</SelectItem>)}
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
                                        <FormControl><Input placeholder="Contoh: SJ-001" {...field} /></FormControl>
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
                                                        <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                            {field.value ? format(field.value, "PPP") : <span>Pilih tanggal</span>}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
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
                                            <FormLabel className="flex items-center gap-2">Termin (Hari) <HelpIndicator message="Jangka waktu pelunasan sejak tanggal tagihan. Digunakan untuk menghitung Tanggal Jatuh Tempo secara otomatis." /></FormLabel>
                                            <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b">
                        <CardTitle className="text-lg">Item Pembelian</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100">
                            {fields.map((field, index) => (
                                <div key={field.id} className="grid grid-cols-12 gap-2 p-4 items-start group hover:bg-slate-50/50">
                                    <div className="col-span-3">
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.akunId`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className={index > 0 ? "sr-only" : "text-xs font-semibold flex items-center gap-1"}>
                                                        Akun / Kategori <HelpIndicator message="Alokasi biaya atau aset. Untuk pembelian operasional pilih akun BEBAN, untuk aset tetap pilih akun ASET." />
                                                    </FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger className="h-9"><SelectValue placeholder="Pilih Akun" /></SelectTrigger></FormControl>
                                                        <SelectContent>{accounts.map((acc) => <SelectItem key={acc.id} value={acc.id}><span className="text-xs font-mono mr-2">{acc.kodeAkun}</span>{acc.namaAkun}</SelectItem>)}</SelectContent>
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
                                                    <FormLabel className={index > 0 ? "sr-only" : "text-xs font-semibold"}>Deskripsi</FormLabel>
                                                    <FormControl><Input placeholder="Barang/Jasa..." {...field} className="h-9" /></FormControl>
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
                                                    <FormLabel className={index > 0 ? "sr-only" : "text-xs font-semibold"}>Qty</FormLabel>
                                                    <FormControl><Input type="number" {...field} className="h-9 text-center" onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl>
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
                                                    <FormLabel className={index > 0 ? "sr-only" : "text-xs font-semibold"}>Harga Satuan</FormLabel>
                                                    <FormControl><Input type="number" {...field} className="h-9 text-right" onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl>
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
                                                    <FormLabel className={index > 0 ? "sr-only" : "text-xs font-semibold"}>Diskon</FormLabel>
                                                    <FormControl><Input type="number" {...field} className="h-9 text-right" onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="col-span-2 flex items-end justify-end gap-2 pr-2 pb-1">
                                        <div className="text-sm font-semibold text-slate-700">
                                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
                                                (watchItems[index].kuantitas * watchItems[index].hargaSatuan) - (watchItems[index].diskon || 0)
                                            )}
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                </div>
                            ))}
                            <div className="p-4 bg-slate-50/30">
                                <Button type="button" variant="outline" size="sm" onClick={() => append({ deskripsi: '', kuantitas: 1, hargaSatuan: 0, diskon: 0, akunId: '' })} className="text-primary border-primary/20 hover:bg-primary/5">
                                    <Plus className="w-4 h-4 mr-2" /> Tambah Item
                                </Button>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50/50 border-t flex flex-col items-end gap-1">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Pembelian</p>
                            <p className="text-3xl font-bold text-slate-900">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalAmount)}</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
                    <Button type="submit" disabled={form.formState.isSubmitting} className="min-w-[150px]">
                        {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                        Simpan Tagihan
                    </Button>
                </div>
            </form>
        </Form>
    );
}
