'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import api from '@/lib/api';

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

// Validation Schema mirroring backend
const movementSchema = z.object({
    tipe: z.enum(['MASUK', 'KELUAR', 'TRANSFER', 'ADJUSTMENT']),
    tanggal: z.date(),
    gudangId: z.string().min(1, 'Gudang asal wajib dipilih'),
    gudangTujuanId: z.string().optional(),
    referensi: z.string().optional(),
    keterangan: z.string().optional(),
    akunId: z.string().optional(),
    items: z.array(z.object({
        produkId: z.string().min(1, 'Produk wajib'),
        kuantitas: z.number().gt(0, 'Qty > 0'),
    })).min(1, 'Minimal 1 item'),
}).superRefine((data, ctx) => {
    if (data.tipe !== 'TRANSFER' && !data.akunId) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Akun penyesuaian/kas wajib dipilih",
            path: ["akunId"]
        });
    }
});

type MovementValues = z.infer<typeof movementSchema>;

interface Warehouse { id: string; nama: string; kode: string; cabang?: { nama: string } }
interface Product { id: string; namaProduk: string; kodeProduk: string; satuan: string;[key: string]: unknown }
interface Account { id: string; namaAkun: string; kodeAkun: string }

export function StockMovementForm({ onSuccess }: { onSuccess?: () => void }) {
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [whRes, prodRes, accRes] = await Promise.all([
                    api.get('/inventory/warehouses'),
                    api.get('/products?limit=100'),
                    api.get('/coa?flatten=true')
                ]);

                setProducts(prodRes.data.data || prodRes.data);
                setWarehouses(whRes.data);
                setAccounts(accRes.data);
            } catch (e) {
                console.error('Failed to load stock movement data:', e);
                toast.error('Gagal memuat data pendukung');
            }
        };

        loadData();
    }, []);

    const form = useForm<MovementValues>({
        resolver: zodResolver(movementSchema),
        defaultValues: {
            tipe: 'MASUK',
            tanggal: new Date(),
            items: [{ produkId: '', kuantitas: 1 }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'items'
    });

    const watchType = useWatch({
        control: form.control,
        name: 'tipe',
        defaultValue: 'MASUK'
    });

    const onSubmit = async (data: MovementValues) => {
        try {
            await api.post('/inventory/movement', data);
            toast.success('Pergerakan stok tercatat!');
            form.reset();
            if (onSuccess) onSuccess();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Gagal menyimpan');
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="tipe"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2">Tipe Mutasi <HelpIndicator message="Masuk: Stok baru/tambahan. Keluar: Pemakaian intern. Transfer: Pindah gudang. Penyesuaian: Hasil opname fisik." /></FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Tipe" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="MASUK">Stok Masuk</SelectItem>
                                        <SelectItem value="KELUAR">Stok Keluar</SelectItem>
                                        <SelectItem value="TRANSFER">Transfer Antar Gudang</SelectItem>
                                        <SelectItem value="ADJUSTMENT">Penyusutan / Penyesuaian</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="tanggal"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tanggal</FormLabel>
                                <FormControl>
                                    <Input
                                        type="date"
                                        value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value}
                                        onChange={e => field.onChange(new Date(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="gudangId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{watchType === 'TRANSFER' ? 'Gudang Asal' : 'Gudang'}</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Gudang" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {warehouses.map(wh => (
                                            <SelectItem key={wh.id} value={wh.id}>{wh.nama}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {watchType === 'TRANSFER' ? (
                        <FormField
                            control={form.control}
                            name="gudangTujuanId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Gudang Tujuan</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Gudang Tujuan" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {warehouses.map(wh => (
                                                <SelectItem key={wh.id} value={wh.id}>{wh.nama}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ) : (
                        <FormField
                            control={form.control}
                            name="akunId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        Akun Alokasi Biaya/Modal <HelpIndicator message="Akun lawan (offset) untuk menjaga keseimbangan pembukuan saat terjadi mutasi stok non-jual beli." />
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Akun" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {accounts.map(acc => (
                                                <SelectItem key={acc.id} value={acc.id}>
                                                    {acc.kodeAkun} - {acc.namaAkun}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    <FormField
                        control={form.control}
                        name="referensi"
                        render={({ field }) => (
                            <FormItem className="md:col-span-2">
                                <FormLabel>Referensi (No. SJ / PO / Opname)</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Masukkan nomor referensi..." />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-2">
                    <h3 className="text-sm font-medium">Item Mutasi</h3>
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex gap-2 items-end">
                            <FormField
                                control={form.control}
                                name={`items.${index}.produkId`}
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih Produk" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {products.map(p => (
                                                        <SelectItem key={p.id} value={p.id}>{p.namaProduk}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`items.${index}.kuantitas`}
                                render={({ field }) => (
                                    <FormItem className="w-24">
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Qty"
                                                value={field.value}
                                                onChange={e => field.onChange(e.target.valueAsNumber)}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ produkId: '', kuantitas: 1 })}>
                        <Plus className="h-4 w-4 mr-2" /> Tambah Item
                    </Button>
                </div>

                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Simpan Pergerakan
                </Button>
            </form>
        </Form>
    );
}
