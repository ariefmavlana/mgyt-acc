'use client';

import React from 'react';
import { useForm, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    LayoutGrid,
    Tag,
    Layers,
    Anchor,
    DollarSign,
    StickyNote,
    Settings,
    Building2,
    Briefcase
} from 'lucide-react';
import { createCOASchema } from '@/server/validators/coa.validator';
import { TipeAkun } from '@prisma/client';
import { cn } from '@/lib/utils';

type AccountFormData = z.infer<typeof createCOASchema>;

interface AccountFormProps {
    initialData?: Partial<AccountFormData>;
    parents: { id: string, namaAkun: string, kodeAkun: string }[];
    onSubmit: (data: AccountFormData) => void;
    isLoading?: boolean;
}

export function AccountForm({ initialData, parents, onSubmit, isLoading }: AccountFormProps) {
    const form = useForm<AccountFormData>({
        resolver: zodResolver(createCOASchema) as Resolver<AccountFormData>,
        defaultValues: {
            kodeAkun: initialData?.kodeAkun || '',
            namaAkun: initialData?.namaAkun || '',
            tipe: (initialData?.tipe as TipeAkun) || TipeAkun.ASET,
            parentId: initialData?.parentId || null,
            normalBalance: initialData?.normalBalance || 'DEBIT',
            isHeader: initialData?.isHeader || false,
            isActive: initialData?.isActive ?? true,
            allowManualEntry: initialData?.allowManualEntry ?? true,
            saldoAwal: initialData?.saldoAwal || 0,
            catatan: initialData?.catatan || '',
        },
    });

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'ASET': return 'text-blue-600 bg-blue-50 border-blue-100';
            case 'LIABILITAS': return 'text-red-600 bg-red-50 border-red-100';
            case 'EKUITAS': return 'text-purple-600 bg-purple-50 border-purple-100';
            case 'PENDAPATAN': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            case 'BEBAN': return 'text-orange-600 bg-orange-50 border-orange-100';
            default: return 'text-slate-600 bg-slate-50 border-slate-100';
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Section 1: Dasar */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider">
                        <LayoutGrid className="w-4 h-4" />
                        Informasi Dasar
                    </div>
                    <Card className="border-slate-100 shadow-sm overflow-hidden">
                        <CardContent className="p-4 space-y-4 bg-slate-50/30">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                <div className="md:col-span-4">
                                    <FormField
                                        control={form.control}
                                        name="kodeAkun"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-1.5">
                                                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                                                    Kode Akun
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="1-1001" {...field} className="bg-white" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="md:col-span-8">
                                    <FormField
                                        control={form.control}
                                        name="namaAkun"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-1.5">
                                                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                                                    Nama Akun
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Contoh: Kas Utama / Piutang Usaha" {...field} className="bg-white" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Section 2: Klasifikasi */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider">
                        <Layers className="w-4 h-4" />
                        Klasifikasi & Saldo
                    </div>
                    <Card className="border-slate-100 shadow-sm overflow-hidden">
                        <CardContent className="p-4 space-y-4 bg-slate-50/30">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="tipe"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-1.5">
                                                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                                Tipe Akun
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-white">
                                                        <SelectValue placeholder="Pilih Tipe" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Object.values(TipeAkun).map((type) => (
                                                        <SelectItem key={type} value={type}>
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="outline" className={cn("text-[10px] h-5", getTypeColor(type))}>
                                                                    {type}
                                                                </Badge>
                                                                <span className="text-sm">{type.replace(/_/g, ' ')}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="normalBalance"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-1.5">
                                                <Anchor className="w-3.5 h-3.5 text-slate-400" />
                                                Saldo Normal
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-white">
                                                        <SelectValue placeholder="Pilih Saldo Normal" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="DEBIT">
                                                        <span className="text-blue-600 font-medium">DEBIT</span>
                                                    </SelectItem>
                                                    <SelectItem value="KREDIT">
                                                        <span className="text-red-600 font-medium">KREDIT</span>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="saldoAwal"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-1.5">
                                            <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                                            Saldo Awal
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">Rp</span>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    className="pl-9 bg-white font-mono"
                                                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Section 3: Hierarki & Konfigurasi */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider">
                        <Settings className="w-4 h-4" />
                        Konfigurasi & Hierarki
                    </div>
                    <Card className="border-slate-100 shadow-sm overflow-hidden">
                        <CardContent className="p-4 space-y-6 bg-slate-50/30">
                            <FormField
                                control={form.control}
                                name="parentId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-1.5 text-slate-600">
                                            Induk Akun (Header / Group)
                                        </FormLabel>
                                        <Select
                                            onValueChange={(val) => field.onChange(val === "root" ? null : val)}
                                            value={field.value || "root"}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="bg-white h-11 border-slate-200">
                                                    <SelectValue placeholder="Tanpa Induk (Root)" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="max-h-64">
                                                <SelectItem value="root" className="font-medium text-primary">Tanpa Induk (Root)</SelectItem>
                                                <Separator className="my-1" />
                                                {parents.map((p) => (
                                                    <SelectItem key={p.id} value={p.id}>
                                                        <div className="flex flex-col py-0.5">
                                                            <span className="font-mono text-xs text-slate-400">{p.kodeAkun}</span>
                                                            <span className="text-sm">{p.namaAkun}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 gap-4">
                                <FormField
                                    control={form.control}
                                    name="isHeader"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0 rounded-lg border border-slate-200 p-4 bg-white shadow-sm transition-all hover:border-primary/30">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base font-semibold text-slate-900">Akun Header</FormLabel>
                                                <FormDescription className="text-xs">
                                                    Hanya untuk pengelompokan (Folder), tidak ada transaksi.
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    className="w-6 h-6 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="allowManualEntry"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0 rounded-lg border border-slate-200 p-4 bg-white shadow-sm transition-all hover:border-primary/30">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base font-semibold text-slate-900">Input Manual</FormLabel>
                                                <FormDescription className="text-xs">
                                                    Apakah akun ini muncul saat membuat Jurnal Umum?
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    className="w-6 h-6 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="catatan"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-1.5">
                                            <StickyNote className="w-3.5 h-3.5 text-slate-400" />
                                            Catatan Internal
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Keterangan tambahan untuk akun ini..."
                                                className="resize-none bg-white min-h-[80px] focus-visible:ring-primary"
                                                {...field}
                                                value={field.value || ''}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Actions at the bottom of form */}
                <div className="flex gap-3 pt-6 border-t border-slate-100 mt-8">
                    <Button type="submit" disabled={isLoading} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98] h-11 text-base">
                        {isLoading ? 'Menyimpan...' : (initialData?.kodeAkun ? 'Perbarui Akun' : 'Selesaikan & Simpan')}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
