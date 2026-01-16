'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Plus,
    Trash2,
    Save,
    Calendar,
    Briefcase,
    FileText,
    LayoutGrid,
    PieChart,
    Building2,
    DollarSign,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { createBudgetSchema } from '@/server/validators/budget.validator';
import { useBudget } from '@/hooks/use-budget';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { HelpIndicator } from '@/components/ui/help-indicator';

interface BudgetFormProps {
    initialData?: any;
    accounts: { id: string, kodeAkun: string, namaAkun: string }[];
    departments?: { id: string, nama: string }[];
    projects?: { id: string, kodeProyek: string, namaProyek: string }[];
}

export function BudgetForm({ initialData, accounts, departments, projects }: BudgetFormProps) {
    const router = useRouter();
    const { createBudget, updateBudget } = useBudget();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm({
        resolver: zodResolver(createBudgetSchema),
        defaultValues: initialData || {
            kode: '',
            nama: '',
            tahun: new Date().getFullYear(),
            tipe: 'OPERASIONAL',
            tanggalMulai: new Date(new Date().getFullYear(), 0, 1),
            tanggalAkhir: new Date(new Date().getFullYear(), 11, 31),
            deskripsi: '',
            details: [{ akunId: '', periode: new Date(new Date().getFullYear(), 0, 1), jumlahBudget: 0 }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "details"
    });

    const onSubmit = async (formData: any) => {
        setIsLoading(true);
        try {
            const payload = {
                ...formData,
                status: initialData?.id ? (formData.status || initialData.status) : 'AKTIF'
            };

            if (initialData?.id) {
                await updateBudget.mutateAsync({ id: initialData.id, data: payload });
                toast.success('Anggaran berhasil diperbarui');
            } else {
                await createBudget.mutateAsync(payload);
                toast.success('Anggaran baru berhasil dibuat dan diaktifkan');
            }
            router.push('/dashboard/budget');
        } catch (error: any) {
            console.error('Submit budget error:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Gagal menyimpan anggaran';
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const totalBudget = form.watch('details')?.reduce((sum: number, item: any) => sum + (Number(item.jumlahBudget) || 0), 0) || 0;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-20">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider">
                        <LayoutGrid className="w-4 h-4" />
                        Informasi Dasar
                    </div>
                    <Card className="border-slate-200/60 shadow-sm bg-white overflow-hidden">
                        <CardContent className="p-6 bg-slate-50/30">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="kode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-slate-400" /> Kode Budget
                                            </FormLabel>
                                            <FormControl><Input placeholder="BG-2026-OPR" {...field} className="bg-white" /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="nama"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <PieChart className="w-4 h-4 text-slate-400" /> Nama Budget
                                            </FormLabel>
                                            <FormControl><Input placeholder="Anggaran Operasional 2026" {...field} className="bg-white" /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="tahun"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-slate-400" /> Tahun
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={e => field.onChange(parseInt(e.target.value))}
                                                    className="bg-white"
                                                />
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
                                            <FormLabel className="flex items-center gap-2">
                                                Tipe Anggaran <HelpIndicator message="Operasional: Biaya rutin harian. Modal: Pengadaan aset besar. Departemen/Proyek: Anggaran khusus unit kerja." />
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger className="bg-white"><SelectValue placeholder="Pilih Tipe" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="OPERASIONAL">Operasional</SelectItem>
                                                    <SelectItem value="MODAL">Modal (Aset)</SelectItem>
                                                    <SelectItem value="KAS">Arus Kas</SelectItem>
                                                    <SelectItem value="DEPARTEMEN">Per Departemen</SelectItem>
                                                    <SelectItem value="PROYEK">Per Proyek</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {form.watch('tipe') === 'DEPARTEMEN' && (
                                    <FormField
                                        control={form.control}
                                        name="departemenId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <Building2 className="w-4 h-4 text-slate-400" /> Departemen
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                                                    <FormControl><SelectTrigger className="bg-white"><SelectValue placeholder="Pilih Departemen" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        {departments?.map(d => <SelectItem key={d.id} value={d.id}>{d.nama}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                                {form.watch('tipe') === 'PROYEK' && (
                                    <FormField
                                        control={form.control}
                                        name="proyekId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <Briefcase className="w-4 h-4 text-slate-400" /> Proyek
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                                                    <FormControl><SelectTrigger className="bg-white"><SelectValue placeholder="Pilih Proyek" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        {projects?.map(p => <SelectItem key={p.id} value={p.id}>{p.kodeProyek} - {p.namaProyek}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider">
                            <DollarSign className="w-4 h-4" />
                            Detail Alokasi Anggaran
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => append({ akunId: '', periode: new Date(form.getValues('tahun'), 0, 1), jumlahBudget: 0 })}
                            className="bg-white hover:bg-slate-50 border-slate-200"
                        >
                            <Plus className="w-4 h-4 mr-1.5 text-primary" /> Tambah Baris
                        </Button>
                    </div>

                    <Card className="border-slate-200/60 shadow-sm bg-white overflow-hidden">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-100 font-semibold text-slate-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left w-2/5">Akun Anggaran</th>
                                            <th className="px-6 py-3 text-left">Periode (Bulan)</th>
                                            <th className="px-6 py-3 text-right">Target Anggaran (Rp)</th>
                                            <th className="px-1 py-3 text-center w-12"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {fields.map((field, index) => (
                                            <tr key={field.id} className="hover:bg-slate-50/40 transition-colors">
                                                <td className="px-6 py-4">
                                                    <FormField
                                                        control={form.control}
                                                        name={`details.${index}.akunId`}
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-0">
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <FormControl><SelectTrigger className="h-9 bg-white"><SelectValue placeholder="Pilih Akun" /></SelectTrigger></FormControl>
                                                                    <SelectContent>
                                                                        {accounts.map(acc => (
                                                                            <SelectItem key={acc.id} value={acc.id}>{acc.kodeAkun} - {acc.namaAkun}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <FormField
                                                        control={form.control}
                                                        name={`details.${index}.periode`}
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-0">
                                                                <Input
                                                                    type="month"
                                                                    className="h-9 bg-white"
                                                                    value={field.value instanceof Date ? field.value.toISOString().slice(0, 7) : field.value}
                                                                    onChange={e => field.onChange(new Date(e.target.value))}
                                                                />
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <FormField
                                                        control={form.control}
                                                        name={`details.${index}.jumlahBudget`}
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-0">
                                                                <Input
                                                                    type="number"
                                                                    className="h-9 pl-3 text-right font-mono bg-white"
                                                                    {...field}
                                                                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                                                />
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </td>
                                                <td className="px-1 py-4 text-center">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-full"
                                                        onClick={() => remove(index)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-slate-50/50">
                                        <tr>
                                            <td colSpan={2} className="px-6 py-4 font-bold text-slate-800 text-right">TOTAL ANGGARAN:</td>
                                            <td className="px-6 py-4 font-bold text-slate-900 text-right text-lg font-mono">
                                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalBudget)}
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                    <p className="text-xs text-slate-400 italic font-medium px-2">* Anda dapat menambahkan baris baru untuk setiap akun dan periode yang berbeda.</p>
                </div>

                <div className="flex items-center justify-end gap-3 sticky bottom-4 bg-white/95 backdrop-blur-md p-3 px-5 rounded-2xl border border-slate-200/60 shadow-xl z-20 animate-in slide-in-from-bottom-8 duration-700 ease-out">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => router.push('/dashboard/budget')}
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
                        <span>{initialData?.id ? 'Perbarui Perencanaan' : 'Simpan & Aktifkan Anggaran'}</span>
                    </Button>
                </div>
            </form>
        </Form>
    );
}
