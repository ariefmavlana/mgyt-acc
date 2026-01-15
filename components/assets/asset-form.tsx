'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAssetSchema } from '@/server/validators/asset.validator';
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAsset } from '@/hooks/use-asset';
import { useCOA } from '@/hooks/use-coa';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    Building2,
    Calendar,
    CircleDollarSign,
    History,
    Settings,
    Layers,
    MapPin,
    User,
    Tag,
    Camera,
    Save,
    X,
    Loader2
} from 'lucide-react';
import { FileUpload } from '@/components/ui/file-upload';

export function AssetForm({ initialData }: { initialData?: any }) {
    const router = useRouter();
    const { createAsset } = useAsset();
    const { useAccounts } = useCOA();
    const { data: accounts } = useAccounts();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm({
        resolver: zodResolver(createAssetSchema),
        defaultValues: initialData || {
            kodeAset: '',
            namaAset: '',
            kategori: '',
            tanggalPerolehan: new Date().toISOString().split('T')[0],
            hargaPerolehan: 0,
            nilaiResidu: 0,
            masaManfaat: 1,
            metodePenyusutan: 'GARIS_LURUS',
            status: 'AKTIF',
            akunAsetId: '',
            akunAkumulasiId: '',
            akunBebanId: '',
        }
    });

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            await createAsset.mutateAsync(data);
            toast.success('Aset berhasil didaftarkan');
            router.push('/dashboard/assets');
        } catch (error: any) {
            console.error('Submit asset error:', error);
            toast.error(error.response?.data?.message || 'Gagal menyimpan aset');
        } finally {
            setIsLoading(false);
        }
    };

    // Filter accounts by type for selection
    const assetAccounts = accounts?.filter((a: any) => a.tipe === 'ASET' && !a.isHeader) || [];
    const expenseAccounts = accounts?.filter((a: any) => a.tipe === 'BEBAN' && !a.isHeader) || [];

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Basic & Financial */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Basic Info */}
                        <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                        <Tag className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Informasi Dasar Aset</CardTitle>
                                        <CardDescription>Identitas utama aset tetap Anda.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="kodeAset"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Kode Aset</FormLabel>
                                            <FormControl><Input placeholder="Contoh: AST-VEH-001" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="namaAset"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nama Aset</FormLabel>
                                            <FormControl><Input placeholder="Contoh: Honda CRV - B 1234 ABC" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="kategori"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Kategori</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Pilih Kategori" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="TANAH">Tanah</SelectItem>
                                                    <SelectItem value="BANGUNAN">Bangunan</SelectItem>
                                                    <SelectItem value="KENDARAAN">Kendaraan</SelectItem>
                                                    <SelectItem value="PERALATAN">Peralatan Kantor</SelectItem>
                                                    <SelectItem value="MESIN">Mesin & Pabrik</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status Operasional</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Pilih Status" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="AKTIF">Aktif</SelectItem>
                                                    <SelectItem value="RUSAK">Rusak</SelectItem>
                                                    <SelectItem value="DIJUAL">Dijual</SelectItem>
                                                    <SelectItem value="IDLE">Idle (Tidak Digunakan)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Financial Details */}
                        <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600">
                                        <CircleDollarSign className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Detail Keuangan & Penyusutan</CardTitle>
                                        <CardDescription>Atur nilai perolehan dan parameter perhitungan beban.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <FormField
                                        control={form.control}
                                        name="hargaPerolehan"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Harga Perolehan (IDR)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="nilaiResidu"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nilai Residu (Estimasi Sisa)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                                </FormControl>
                                                <FormDescription>Nilai sisa aset di akhir masa manfaat.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="tanggalPerolehan"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tanggal Perolehan</FormLabel>
                                                <FormControl><Input type="date" {...field} value={typeof field.value === 'string' ? field.value : ''} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="masaManfaat"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Masa Manfaat (Tahun)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
                                    <History className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                    <div className="text-sm text-amber-900">
                                        <p className="font-semibold">Metode Penyusutan: Garis Lurus</p>
                                        <p className="mt-1 opacity-80">Nilai aset akan disusutkan secara merata setiap bulan selama masa manfaat yang ditentukan.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Technical Metadata */}
                        <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-500/10 rounded-lg text-slate-600">
                                        <Settings className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Informasi Tambahan & Teknis</CardTitle>
                                        <CardDescription>Detail pendukung untuk manajemen fisik aset.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="lokasi"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Lokasi</FormLabel>
                                            <FormControl><Input placeholder="Gudang A, Kantor Pusat, dll" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="penanggungJawab"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2"><User className="w-4 h-4" /> Penanggung Jawab</FormLabel>
                                            <FormControl><Input placeholder="Nama Pemegang Aset" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="merk"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Merk / Brand</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="nomorSeri"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nomor Seri / VIN</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="md:col-span-2">
                                    <FormField
                                        control={form.control}
                                        name="spesifikasi"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Spesifikasi & Deskripsi</FormLabel>
                                                <FormControl><Textarea rows={4} placeholder="Detail teknis aset..." {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Accounting & Tools */}
                    <div className="space-y-8">
                        {/* Accounting Relations */}
                        <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white sticky top-24">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600">
                                        <Layers className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Mapping Akuntansi</CardTitle>
                                        <CardDescription>Hubungkan ke Chart of Accounts.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <FormField
                                    control={form.control}
                                    name="akunAsetId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Akun Aset (Neraca)</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Pilih Akun" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {assetAccounts.map((acc: any) => (
                                                        <SelectItem key={acc.id} value={acc.id}>{acc.kodeAkun} - {acc.namaAkun}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="akunAkumulasiId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Akun Akumulasi Penyusutan</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Pilih Akun" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {assetAccounts.map((acc: any) => (
                                                        <SelectItem key={acc.id} value={acc.id}>{acc.kodeAkun} - {acc.namaAkun}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="akunBebanId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Akun Beban Penyusutan</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Pilih Akun" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {expenseAccounts.map((acc: any) => (
                                                        <SelectItem key={acc.id} value={acc.id}>{acc.kodeAkun} - {acc.namaAkun}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="pt-4 border-t border-slate-100">
                                    <FormField
                                        control={form.control}
                                        name="fotoAset"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2"><Camera className="w-4 h-4" /> Foto Aset</FormLabel>
                                                <FormControl>
                                                    <FileUpload
                                                        endpoint="imageUploader"
                                                        value={field.value || ''}
                                                        onChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Klik atau seret gambar untuk mengunggah foto aset.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-3 sticky bottom-4 bg-white/95 backdrop-blur-md p-3 px-5 rounded-2xl border border-slate-200/60 shadow-xl z-20 animate-in slide-in-from-bottom-8 duration-700 ease-out">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => router.push('/dashboard/assets')}
                        disabled={isLoading}
                        className="font-semibold text-slate-500 hover:text-rose-500 hover:bg-rose-50 transition-all px-4 h-10"
                    >
                        Batalkan
                    </Button>
                    <div className="h-6 w-px bg-slate-200 mx-1" />
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 px-6 h-10 rounded-xl transition-all active:scale-[0.97] flex items-center gap-2 group"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        )}
                        <span>{initialData?.id ? 'Perbarui Data Aset' : 'Daftarkan Aset Tetap'}</span>
                    </Button>
                </div>
            </form>
        </Form>
    );
}
