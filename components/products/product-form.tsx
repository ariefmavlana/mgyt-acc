'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, Package, Tag, Layers, Settings2 } from 'lucide-react';

import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Form,
    FormControl,
    FormDescription,
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
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Frontend Schema
const productFormSchema = z.object({
    kodeProduk: z.string().min(1, 'Kode produk harus diisi'),
    namaProduk: z.string().min(1, 'Nama produk harus diisi'),
    kategori: z.string().min(1, 'Kategori harus diisi'),
    subKategori: z.string().optional(),

    satuan: z.string().min(1, 'Satuan harus diisi'),
    isPPN: z.boolean().default(false),

    hargaJualEceran: z.number().min(0, 'Harga jual harus >= 0'),
    hargaJualGrosir: z.number().min(0).optional(),
    hargaBeli: z.number().min(0).optional(),

    deskripsiSingkat: z.string().optional(),
    fotoUtama: z.string().optional(),

    // Inventory
    stokMinimum: z.number().min(0).default(0),
    stokMaksimum: z.number().min(0).optional(),

    // Variants
    variants: z.array(z.object({
        namaVariant: z.string().min(1, 'Nama varian wajib'),
        sku: z.string().min(1, 'SKU varian wajib'),
        hargaJual: z.number().min(0).optional(),
    })).optional()
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export function ProductForm() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("general");

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema) as any,
        defaultValues: {
            isPPN: false,
            stokMinimum: 0,
            variants: [],
            satuan: 'pcs'
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'variants'
    });

    const onSubmit = async (data: ProductFormValues) => {
        try {
            await api.post('/products', data);
            toast.success('Produk berhasil dibuat');
            router.push('/dashboard/products');
        } catch (error: any) {
            console.error('Submit Product Error:', error);
            toast.error(error.response?.data?.message || 'Gagal menyimpan produk');
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Katalog Produk</h2>
                        <p className="text-muted-foreground">Tamabah produk baru ke inventaris.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Simpan Produk
                        </Button>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="general" className="gap-2"><Package className="h-4 w-4" /> Informasi Dasar</TabsTrigger>
                        <TabsTrigger value="pricing" className="gap-2"><Tag className="h-4 w-4" /> Harga & Pajak</TabsTrigger>
                        <TabsTrigger value="inventory" className="gap-2"><Settings2 className="h-4 w-4" /> Inventaris</TabsTrigger>
                        <TabsTrigger value="variants" className="gap-2"><Layers className="h-4 w-4" /> Varian</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informasi Produk</CardTitle>
                                <CardDescription>Data utama identitas produk Anda.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="kodeProduk"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Kode Produk / SKU</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="PRD-001" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="namaProduk"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nama Produk</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Contoh: Kemeja Polos" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="kategori"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Kategori</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Pakaian, Elektronik, dll" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="subKategori"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Sub Kategori</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Opsional" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="deskripsiSingkat"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Deskripsi</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Penjelasan singkat produk..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="pricing">
                        <Card>
                            <CardHeader>
                                <CardTitle>Harga & Satuan</CardTitle>
                                <CardDescription>Atur harga jual, beli dan satuan unit.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-6">
                                <div className="grid grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="hargaJualEceran"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Harga Jual</FormLabel>
                                                <FormControl>
                                                    <Input type="number" value={field.value} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="hargaBeli"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Harga Beli (Modal)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" value={field.value} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="satuan"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Satuan</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Pilih satuan" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="pcs">Pcs</SelectItem>
                                                        <SelectItem value="kg">Kg</SelectItem>
                                                        <SelectItem value="box">Box</SelectItem>
                                                        <SelectItem value="unit">Unit</SelectItem>
                                                        <SelectItem value="set">Set</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="isPPN"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>
                                                    Barang Kena Pajak (PPN)
                                                </FormLabel>
                                                <FormDescription>
                                                    Centang jika produk ini dikenakan PPN.
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="inventory">
                        <Card>
                            <CardHeader>
                                <CardTitle>Pengaturan Stok</CardTitle>
                                <CardDescription>Batas aman stok dan peringatan.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="stokMinimum"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Stok Minimum Alert</FormLabel>
                                                <FormControl>
                                                    <Input type="number" value={field.value} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                                </FormControl>
                                                <FormDescription>Peringatkan jika stok dibawah level ini.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="stokMaksimum"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Stok Maksimum (Opsional)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" value={field.value} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="variants">
                        <Card>
                            <CardHeader>
                                <CardTitle>Varian Produk</CardTitle>
                                <CardDescription>Kelola varian seperti ukuran atau warna.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-12 gap-4 items-end border-b pb-4">
                                        <div className="col-span-5">
                                            <FormField
                                                control={form.control}
                                                name={`variants.${index}.namaVariant`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className={index !== 0 ? "sr-only" : ""}>Nama Varian</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Contoh: Merah - XL" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="col-span-3">
                                            <FormField
                                                control={form.control}
                                                name={`variants.${index}.sku`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className={index !== 0 ? "sr-only" : ""}>SKU Varian</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="SKU-VAR-01" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="col-span-3">
                                            <FormField
                                                control={form.control}
                                                name={`variants.${index}.hargaJual`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className={index !== 0 ? "sr-only" : ""}>Harga (+/-)</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" placeholder="Opsional" value={field.value} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-red-500">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                <Button type="button" variant="outline" onClick={() => append({ namaVariant: '', sku: '', hargaJual: 0 })} size="sm">
                                    <Plus className="w-4 h-4 mr-2" /> Tambah Varian
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </form>
        </Form>
    );
}
