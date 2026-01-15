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
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useHR, Employee } from '@/hooks/use-hr';
import { toast } from 'sonner';
import {
    Loader2,
    User,
    Mail,
    Phone,
    Briefcase,
    Building2,
    Calendar as CalendarIcon,
    Activity,
    DollarSign,
    CreditCard,
    IdCard,
    Contact,
    Users
} from 'lucide-react';

const employeeSchema = z.object({
    nama: z.string().min(3, 'Nama harus minimal 3 karakter'),
    nik: z.string().min(3, 'NIK harus minimal 3 karakter'),
    email: z.string().email('Email tidak valid').optional().or(z.literal('')),
    telepon: z.string().optional(),
    alamat: z.string().optional(),

    // Employment
    departemen: z.string().min(2, 'Departemen harus diisi'),
    jabatan: z.string().min(2, 'Jabatan harus diisi'),
    tanggalMasuk: z.string().min(1, 'Tanggal masuk harus diisi'),
    status: z.enum(['AKTIF', 'NONAKTIF', 'CUTI']),

    // Payroll & Tax
    gajiPokok: z.number().min(0, 'Gaji pokok tidak boleh negatif'),
    statusPernikahan: z.string().min(1, 'Status pernikahan harus dipilih'),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employee?: Employee | null;
}

export function EmployeeForm({ open, onOpenChange, employee }: EmployeeFormProps) {
    const { createEmployee, updateEmployee, useDepartments } = useHR();
    const { data: departments, isLoading: isLoadingDepts } = useDepartments();

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

    useEffect(() => {
        if (open) {
            if (employee) {
                form.reset({
                    nama: employee.nama,
                    nik: employee.nik,
                    email: employee.email || '',
                    telepon: employee.telepon || '',
                    alamat: employee.alamat || '',
                    departemen: employee.departemen,
                    jabatan: employee.jabatan,
                    tanggalMasuk: employee.tanggalMasuk ? new Date(employee.tanggalMasuk).toISOString().split('T')[0] : '',
                    status: employee.status as 'AKTIF' | 'NONAKTIF' | 'CUTI',
                    gajiPokok: Number(employee.gajiPokok),
                    statusPernikahan: employee.statusPernikahan || 'TK/0',
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
                await updateEmployee.mutateAsync({ id: employee.id, data });
                toast.success('Data karyawan berhasil diperbarui');
            } else {
                await createEmployee.mutateAsync(data);
                toast.success('Karyawan berhasil ditambahkan');
            }
            onOpenChange(false);
        } catch (error) {
            toast.error('Gagal menyimpan data karyawan');
            console.error(error);
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-2xl overflow-y-auto border-l border-slate-200">
                <SheetHeader className="mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div className="text-left">
                            <SheetTitle className="text-xl font-bold text-slate-900">
                                {employee ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
                            </SheetTitle>
                            <SheetDescription className="text-slate-500">
                                Kelola profil, jabatan, dan informasi penggajian karyawan.
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                        {/* Section 1: Data Pribadi */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
                                <Contact className="w-4 h-4" />
                                Informasi Pribadi
                            </div>
                            <Card className="border-slate-200 shadow-sm overflow-hidden">
                                <CardContent className="p-5 space-y-4 bg-white">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="nama"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-1.5 text-slate-600">
                                                        <User className="w-3.5 h-3.5 text-slate-400" />
                                                        Nama Lengkap
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Arief Maulana" {...field} className="bg-white focus:ring-primary/20" />
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
                                                    <FormLabel className="flex items-center gap-1.5 text-slate-600">
                                                        <IdCard className="w-3.5 h-3.5 text-slate-400" />
                                                        NIK (Nomor Induk)
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="2024001" {...field} className="bg-white focus:ring-primary/20" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-1.5 text-slate-600">
                                                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                                                        Alamat Email
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input type="email" placeholder="arief@example.com" {...field} className="bg-white focus:ring-primary/20" />
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
                                                    <FormLabel className="flex items-center gap-1.5 text-slate-600">
                                                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                                                        No. Telepon
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="081234567890" {...field} className="bg-white focus:ring-primary/20" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Section 2: Kepegawaian */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
                                <Briefcase className="w-4 h-4" />
                                Informasi Kepegawaian
                            </div>
                            <Card className="border-slate-200 shadow-sm overflow-hidden">
                                <CardContent className="p-5 space-y-4 bg-white">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="departemen"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-1.5 text-slate-600">
                                                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                                        Departemen
                                                    </FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="focus:ring-primary/20">
                                                                <SelectValue placeholder={isLoadingDepts ? "Memuat..." : "Pilih departemen"} />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {departments?.map((dept) => (
                                                                <SelectItem key={dept.id} value={dept.nama}>
                                                                    {dept.nama}
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
                                            name="jabatan"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-1.5 text-slate-600">
                                                        <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                                                        Jabatan / Role
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Contoh: Software Engineer, Manager" {...field} className="focus:ring-primary/20" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="tanggalMasuk"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-1.5 text-slate-600">
                                                        <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                                                        Tanggal Bergabung
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} className="focus:ring-primary/20" />
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
                                                    <FormLabel className="flex items-center gap-1.5 text-slate-600">
                                                        <Activity className="w-3.5 h-3.5 text-slate-400" />
                                                        Status Karyawan
                                                    </FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="focus:ring-primary/20">
                                                                <SelectValue placeholder="Pilih status" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="AKTIF">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                                    Aktif
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="NONAKTIF">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                                                    Non-Aktif
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="CUTI">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                                    Cuti
                                                                </div>
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Section 3: Payroll */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
                                <DollarSign className="w-4 h-4" />
                                Payroll & Perpajakan
                            </div>
                            <Card className="border-slate-200 shadow-sm overflow-hidden bg-primary/2">
                                <CardContent className="p-5 space-y-4 bg-white">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="gajiPokok"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-1.5 text-slate-600">
                                                        <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                                                        Gaji Pokok (Nominal)
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium border-r pr-2">Rp</div>
                                                            <Input
                                                                type="number"
                                                                placeholder="5000000"
                                                                className="pl-12 focus:ring-primary/20"
                                                                {...field}
                                                                onChange={(e) => {
                                                                    const val = e.target.valueAsNumber;
                                                                    field.onChange(isNaN(val) ? 0 : val);
                                                                }}
                                                            />
                                                        </div>
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
                                                    <FormLabel className="flex items-center gap-1.5 text-slate-600">
                                                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                                                        Status PTKP (Pajak)
                                                    </FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="focus:ring-primary/20">
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
                                </CardContent>
                            </Card>
                        </div>

                        <Separator className="bg-slate-200" />

                        <div className="flex justify-end gap-3 pb-4">
                            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-500 hover:text-slate-700">
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                className="bg-primary hover:bg-primary/90 px-8 font-semibold shadow-md shadow-primary/20"
                                disabled={createEmployee.isPending || updateEmployee.isPending}
                            >
                                {(createEmployee.isPending || updateEmployee.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {employee ? 'Simpan Perubahan' : 'Tambah Karyawan'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
}
