'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

const registerSchema = z.object({
    namaLengkap: z.string().min(3, 'Nama harus minimal 3 karakter'),
    username: z.string().min(3, 'Username harus minimal 3 karakter'),
    email: z.string().email('Format email tidak valid'),
    namaPerusahaan: z.string().min(2, 'Nama perusahaan harus minimal 2 karakter'),
    password: z.string().min(8, 'Password harus minimal 8 karakter'),
    confirmPassword: z.string(),
    role: z.enum(['ADMIN', 'MANAGER', 'STAFF', 'VIEWER']),
    paket: z.enum(['UMKM', 'SMALL', 'MEDIUM', 'ENTERPRISE']),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
});

export const RegisterForm = () => {
    const { register } = useAuth();
    const [isPending, setIsPending] = React.useState(false);

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            namaLengkap: '',
            username: '',
            email: '',
            namaPerusahaan: '',
            password: '',
            confirmPassword: '',
            role: 'ADMIN', // Default to ADMIN for first user usually, or changes per business logic
            paket: 'UMKM',
        },
    });

    async function onSubmit(values: z.infer<typeof registerSchema>) {
        setIsPending(true);
        try {
            await register(values);
        } catch {
            // Error handled in AuthProvider toast
        } finally {
            setIsPending(false);
        }
    }

    return (
        <Card className="w-full max-w-lg mx-auto">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Daftar Akun Baru</CardTitle>
                <CardDescription className="text-center">
                    Lengkapi data di bawah ini untuk memulai sistem akuntansi Anda
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="namaLengkap"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama Lengkap</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Budi Santoso" {...field} disabled={isPending} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input placeholder="budisantoso" {...field} disabled={isPending} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="nama@perusahaan.com" {...field} disabled={isPending} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="namaPerusahaan"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Nama Perusahaan</FormLabel>
                                    <FormControl>
                                        <Input placeholder="PT Maju Bersama" {...field} disabled={isPending} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="paket"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Paket Usaha</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih paket usaha" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="UMKM">UMKM (Micro)</SelectItem>
                                            <SelectItem value="SMALL">Starter (Small Business)</SelectItem>
                                            <SelectItem value="MEDIUM">Growth (Medium Business)</SelectItem>
                                            <SelectItem value="ENTERPRISE">Enterprise (Corporate)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Peran Pengguna (Role)</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih peran pengguna" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="ADMIN">Administrator (Pemilik/Direktur)</SelectItem>
                                            <SelectItem value="MANAGER">Manager (Keuangan, Operasional)</SelectItem>
                                            <SelectItem value="STAFF">Staff (Input Data, Kasir)</SelectItem>
                                            <SelectItem value="VIEWER">Viewer (Hanya Melihat Laporan)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} disabled={isPending} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Konfirmasi Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} disabled={isPending} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full md:col-span-2 mt-2" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Daftar Sekarang
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
                <div className="text-sm text-center text-muted-foreground">
                    Sudah punya akun?{' '}
                    <Link href="/login" className="font-medium text-primary hover:underline">
                        Login di sini
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
};
