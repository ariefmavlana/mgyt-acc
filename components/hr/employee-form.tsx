'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { useHR, Employee } from '@/hooks/use-hr';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const employeeSchema = z.object({
    nama: z.string().min(3, 'Nama harus minimal 3 karakter'),
    nik: z.string().min(5, 'NIK harus minimal 5 karakter'),
    email: z.string().email('Email tidak valid').optional().or(z.literal('')),
    telepon: z.string().optional(),
    alamat: z.string().optional(),

    // Employment
    departemen: z.string().min(2, 'Departemen harus diisi'),
    jabatan: z.string().min(2, 'Jabatan harus diisi'),
    tanggalMasuk: z.string().min(1, 'Tanggal masuk harus diisi'),
    status: z.enum(['AKTIF', 'NONAKTIF', 'CUTI']),

    // Payroll & Tax
    gajiPokok: z.coerce.number().min(0, 'Gaji pokok tidak boleh negatif'),
    statusPernikahan: z.string().min(1, 'Status pernikahan harus dipilih'), // TK/0, K/1 etc
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employee?: Employee | null;
}

export function EmployeeForm({ open, onOpenChange, employee }: EmployeeFormProps) {
    const { createEmployee } = useHR();

    const form = useForm<EmployeeFormValues>({
        resolver: zodResolver(employeeSchema),
        defaultValues: {
            nama: '',
            nik: '',
            email: '',
            telepon: '',
            alamat: '',
            departemen: '',
            jabatan: '',
            tanggalMasuk: new Date().toISOString().split('T')[0],
            status: 'AKTIF',
            gajiPokok: 0,
            statusPernikahan: 'TK/0',
        },
    });

    // Reset form when opening or when employee changes
    useEffect(() => {
        if (open) {
            if (employee) {
                form.reset({
                    nama: employee.nama,
                    nik: employee.nik,
                    // email: employee.email || '',
                    // telepon: employee.telepon || '',
                    // alamat: employee.alamat || '',
                    departemen: employee.departemen,
                    jabatan: employee.jabatan,
                    tanggalMasuk: employee.tanggalMasuk ? new Date(employee.tanggalMasuk).toISOString().split('T')[0] : '',
                    status: employee.status as 'AKTIF' | 'NONAKTIF' | 'CUTI',
                    gajiPokok: Number(employee.gajiPokok),
                    // statusPernikahan: employee.statusPernikahan || 'TK/0',
                });
            } else {
                form.reset({
                    nama: '',
                    nik: '',
                    email: '',
                    telepon: '',
                    alamat: '',
                    departemen: '',
                    jabatan: '',
                    tanggalMasuk: new Date().toISOString().split('T')[0],
                    status: 'AKTIF',
                    gajiPokok: 0,
                    statusPernikahan: 'TK/0',
                });
            }
        }
    }, [open, employee, form]);

    async function onSubmit(data: EmployeeFormValues) {
        try {
            if (employee) {
                // Update logic here (need to add updateEmployee to useHR first)
                toast.info('Fitur update belum tersedia di demo ini (gunakan create)');
            } else {
                await createEmployee.mutateAsync(data);
                toast.success('Karyawan berhasil ditambahkan');
                onOpenChange(false);
            }
        } catch (error) {
            toast.error('Gagal menyimpan data karyawan');
            console.error(error);
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-xl overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{employee ? 'Edit Karyawan' : 'Tambah Karyawan Baru'}</SheetTitle>
                    <SheetDescription>
                        Isi form berikut untuk data karyawan dan konfigurasi penggajian.
                    </SheetDescription>
                </SheetHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">

                        {/* Personal Info */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-slate-500 border-b pb-1">Informasi Pribadi</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="nama"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nama Lengkap</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Budi Santoso" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="nik"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>NIK (Nomor Induk)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="2024001" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email (Opsional)</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="budi@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="telepon"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>No. Telepon (Opsional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="0812..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Employment Info */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-slate-500 border-b pb-1">Informasi Kepegawaian</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="departemen"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Departemen</FormLabel>
                                            <FormControl>
                                                <Input placeholder="IT, Finance, HR..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="jabatan"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Jabatan / Role</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Staff, Manager..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="tanggalMasuk"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tanggal Bergabung</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status Karyawan</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="AKTIF">Aktif</SelectItem>
                                                    <SelectItem value="NONAKTIF">Non-Aktif</SelectItem>
                                                    <SelectItem value="CUTI">Cuti</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Payroll Info */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-slate-500 border-b pb-1">Konfigurasi Penggajian & Pajak</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="gajiPokok"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Gaji Pokok (Nominal)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="5000000" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="statusPernikahan"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status PTKP</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih status PTKP" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="TK/0">TK/0 (Tidak Kawin, 0 Tanggungan)</SelectItem>
                                                    <SelectItem value="K/0">K/0 (Kawin, 0 Tanggungan)</SelectItem>
                                                    <SelectItem value="K/1">K/1 (Kawin, 1 Tanggungan)</SelectItem>
                                                    <SelectItem value="K/2">K/2 (Kawin, 2 Tanggungan)</SelectItem>
                                                    <SelectItem value="K/3">K/3 (Kawin, 3 Tanggungan)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={createEmployee.isPending}>
                                {createEmployee.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Simpan Karyawan
                            </Button>
                        </div>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
}
