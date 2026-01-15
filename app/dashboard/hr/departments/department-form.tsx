'use client';

import React, { useEffect } from 'react';
import { useForm, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
    FormDescription,
} from '@/components/ui/form';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useHR, Department } from '@/hooks/use-hr';
import { toast } from 'sonner';
import { Loader2, Building2, Tag, User, AlignLeft, Activity } from 'lucide-react';

const departmentSchema = z.object({
    kode: z.string().min(2, 'Kode harus minimal 2 karakter'),
    nama: z.string().min(3, 'Nama harus minimal 3 karakter'),
    kepala: z.string().optional(),
    deskripsi: z.string().optional(),
    isAktif: z.boolean().default(true),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

interface DepartmentFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    department?: Department | null;
}

export function DepartmentForm({ open, onOpenChange, department }: DepartmentFormProps) {
    const { createDepartment, updateDepartment } = useHR();

    const form = useForm<DepartmentFormValues>({
        resolver: zodResolver(departmentSchema) as Resolver<DepartmentFormValues>,
        defaultValues: {
            kode: '',
            nama: '',
            kepala: '',
            deskripsi: '',
            isAktif: true,
        },
    });

    useEffect(() => {
        if (open) {
            if (department) {
                form.reset({
                    kode: department.kode,
                    nama: department.nama,
                    kepala: department.kepala || '',
                    deskripsi: department.deskripsi || '',
                    isAktif: department.isAktif,
                });
            } else {
                form.reset({
                    kode: '',
                    nama: '',
                    kepala: '',
                    deskripsi: '',
                    isAktif: true,
                });
            }
        }
    }, [open, department, form]);

    async function onSubmit(data: DepartmentFormValues) {
        try {
            if (department) {
                await updateDepartment.mutateAsync({ id: department.id, data });
                toast.success('Departemen berhasil diperbarui');
            } else {
                await createDepartment.mutateAsync(data);
                toast.success('Departemen berhasil ditambahkan');
            }
            onOpenChange(false);
        } catch (error) {
            toast.error('Gagal menyimpan data departemen');
            console.error(error);
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-lg overflow-y-auto border-l border-slate-200">
                <SheetHeader className="mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div className="text-left">
                            <SheetTitle className="text-xl font-bold text-slate-900">
                                {department ? 'Edit Departemen' : 'Tambah Departemen'}
                            </SheetTitle>
                            <SheetDescription className="text-slate-500">
                                Kelola informasi unit atau divisi organisasi Anda.
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <Card className="border-slate-200/60 shadow-sm overflow-hidden">
                            <CardContent className="p-5 space-y-4 bg-slate-50/50">
                                <FormField
                                    control={form.control}
                                    name="kode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-1.5 text-slate-600">
                                                <Tag className="w-3.5 h-3.5 text-slate-400" />
                                                Kode Departemen
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="Contoh: IT, HRD, FIN" {...field} value={field.value || ''} className="bg-white focus:ring-primary/20" />
                                            </FormControl>
                                            <FormDescription className="text-[10px]">Kode unik untuk identifikasi internal.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="nama"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-1.5 text-slate-600">
                                                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                                Nama Departemen
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="Contoh: Teknologi Informasi" {...field} value={field.value || ''} className="bg-white focus:ring-primary/20" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="kepala"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-1.5 text-slate-600">
                                                <User className="w-3.5 h-3.5 text-slate-400" />
                                                Kepala / Manager
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nama pengelola departemen" {...field} value={field.value || ''} className="bg-white focus:ring-primary/20" />
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
                                            <FormLabel className="flex items-center gap-1.5 text-slate-600">
                                                <AlignLeft className="w-3.5 h-3.5 text-slate-400" />
                                                Deskripsi (Opsional)
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Jelaskan fungsi departemen ini..."
                                                    {...field}
                                                    value={field.value || ''}
                                                    className="bg-white min-h-[100px] focus:ring-primary/20 resize-none"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="isAktif"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-1.5 text-slate-600">
                                                <Activity className="w-3.5 h-3.5 text-slate-400" />
                                                Status Aktif
                                            </FormLabel>
                                            <Select
                                                onValueChange={(val) => field.onChange(val === 'true')}
                                                defaultValue={String(field.value)}
                                                value={String(field.value)}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="focus:ring-primary/20">
                                                        <SelectValue placeholder="Pilih status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="true">Aktif</SelectItem>
                                                    <SelectItem value="false">Non-Aktif</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-500 hover:text-slate-700">
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                className="bg-primary hover:bg-primary/90 px-8 font-semibold shadow-md shadow-primary/20"
                                disabled={createDepartment.isPending || updateDepartment.isPending}
                            >
                                {(createDepartment.isPending || updateDepartment.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {department ? 'Simpan Perubahan' : 'Tambah Departemen'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
}
