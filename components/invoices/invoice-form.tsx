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
import { Textarea } from '@/components/ui/textarea';
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
import { Card, CardContent } from '@/components/ui/card';
import { HelpIndicator } from '@/components/ui/help-indicator';

// Schema Validation (Frontend Mirror of Backend Validator)
const invoiceFormSchema = z.object({
    pelangganId: z.string().min(1, 'Pelanggan harus dipilih'),
    tanggal: z.date(),
    tanggalJatuhTempo: z.date().optional(),
    terminPembayaran: z.number().min(0).default(30),
    nomorInvoice: z.string().optional(),
    referensi: z.string().optional(),
    catatan: z.string().optional(),
    items: z.array(z.object({
        akunId: z.string().min(1, 'Akun pendapatan harus dipilih'),
        deskripsi: z.string().min(1, 'Deskripsi item harus diisi'),
        kuantitas: z.number().min(1, 'Qty minimal 1'),
        hargaSatuan: z.number().min(0, 'Harga tidak boleh negatif'),
        diskon: z.number().min(0).default(0),
    })).min(1, 'Minimal satu item harus ditambahkan'),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

export function InvoiceForm() {
    const router = useRouter();
    const [customers, setCustomers] = useState<any[]>([]);
    const [accounts, setAccounts] = useState<any[]>([]); // Revenue accounts
    const [isLoadingData, setIsLoadingData] = useState(true);

    const form = useForm<InvoiceFormValues>({
        resolver: zodResolver(invoiceFormSchema) as any,
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
                const [custRes, accRes] = await Promise.all([
                    api.get('/contacts/customers'),
                    api.get('/coa?type=PENDAPATAN') // Assuming endpoint supports type filter or returns all
                ]);
                setCustomers(custRes.data);

                // Filter accounts if API returns mixed (assuming tree or list)
                // If generic list:
                setAccounts(accRes.data.filter((a: any) => a.tipe === 'PENDAPATAN' || (a.tipe === 'EKUITAS' && a.kategori === 'PENDAPATAN')));
                // Adjust filter logic based on actual COA structure
            } catch (error) {
                console.error('Failed to load data', error);
                toast.error('Gagal memuat data pelanggan/akun');
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchData();
    }, []);

    const onSubmit = async (data: InvoiceFormValues) => {
        try {
            await api.post('/invoices', data);
            toast.success('Invoice berhasil dibuat!');
            router.push('/dashboard/invoices');
        } catch (error: any) {
            console.error('Submit error:', error);
            toast.error(error.response?.data?.message || 'Gagal membuat invoice');
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="pelangganId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Pelanggan</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih Pelanggan" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {customers.map((c) => (
                                                    <SelectItem key={c.id} value={c.id}>{c.nama}</SelectItem>
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
                                        <FormLabel>Referensi / PO Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Contoh: PO-001" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="tanggal"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Tanggal Invoice</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP")
                                                            ) : (
                                                                <span>Pick a date</span>
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
                                                        disabled={(date) =>
                                                            date > new Date() || date < new Date("1900-01-01")
                                                        }
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
                                            <FormLabel className="flex items-center gap-1">
                                                Termin (Hari)
                                                <HelpIndicator content="Jangka waktu pembayaran. Contoh: 30 hari untuk pembayaran 'Net 30'." />
                                            </FormLabel>
                                            <FormControl>
                                                <Input type="number" value={field.value} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="nomorInvoice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nomor Invoice (Opsional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Auto-generate jika kosong" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Line Items */}
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">Item Invoice</h3>
                            <Button type="button" variant="outline" size="sm" onClick={() => append({ deskripsi: '', kuantitas: 1, hargaSatuan: 0, diskon: 0, akunId: '' })}>
                                <Plus className="w-4 h-4 mr-2" /> Tambah Item
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="grid grid-cols-12 gap-4 items-end border-b pb-4">
                                    <div className="col-span-3">
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.akunId`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className={cn("flex items-center gap-1", index !== 0 && "sr-only")}>
                                                        Akun Pendapatan
                                                        {index === 0 && <HelpIndicator content="Pilih akun kategori 'Pendapatan' dari COA Anda." />}
                                                    </FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Pilih Akun" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {accounts.map((acc) => (
                                                                <SelectItem key={acc.id} value={acc.id}>{acc.namaAkun}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="col-span-4">
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.deskripsi`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className={index !== 0 ? "sr-only" : ""}>Deskripsi</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Nama Produk/Jasa" {...field} />
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
                                                    <FormLabel className={index !== 0 ? "sr-only" : ""}>Qty</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} />
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
                                                    <FormLabel className={index !== 0 ? "sr-only" : ""}>Harga</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} />
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
                                                    <FormLabel className={index !== 0 ? "sr-only" : ""}>Disc</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="col-span-1 flex justify-center">
                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-red-500">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end pt-4">
                            <div className="w-1/3 space-y-2">
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalAmount)}</span>
                                </div>
                            </div>
                        </div>

                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Simpan Invoice
                    </Button>
                </div>
            </form>
        </Form>
    );
}
