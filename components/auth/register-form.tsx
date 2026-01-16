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

import { OnboardingSurvey } from './onboarding-survey';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, Sparkles, ArrowLeft } from 'lucide-react';

export const RegisterForm = () => {
    const { register: authRegister } = useAuth();
    const [isPending, setIsPending] = React.useState(false);
    const [step, setStep] = React.useState<'survey' | 'form'>('survey');
    const [recommendedTier, setRecommendedTier] = React.useState<string | null>(null);

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            namaLengkap: '',
            username: '',
            email: '',
            namaPerusahaan: '',
            password: '',
            confirmPassword: '',
            role: 'ADMIN',
            paket: 'UMKM',
        },
    });

    const onSurveyComplete = (tier: string) => {
        setRecommendedTier(tier);
        form.setValue('paket', tier as "UMKM" | "SMALL" | "MEDIUM" | "ENTERPRISE");
        setStep('form');
    };

    if (step === 'survey') {
        return <OnboardingSurvey onComplete={onSurveyComplete} />;
    }

    async function onSubmit(values: z.infer<typeof registerSchema>) {
        setIsPending(true);
        try {
            await authRegister(values);
        } catch {
            // Error handled in AuthProvider toast
        } finally {
            setIsPending(false);
        }
    }

    return (
        <Card className="w-full max-w-lg mx-auto">
            <CardHeader className="space-y-1">
                <div className="flex justify-between items-center mb-2">
                    <Button variant="ghost" size="sm" onClick={() => setStep('survey')} className="text-xs">
                        <ArrowLeft className="mr-1 h-3 w-3" /> Ulangi Survey
                    </Button>
                    {recommendedTier && (
                        <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <Sparkles className="h-3 w-3" /> Rekomendasi: {recommendedTier}
                        </div>
                    )}
                </div>
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
                                        <Input placeholder="Arief Maulana" {...field} disabled={isPending} />
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
                                        <Input placeholder="ariefmavlana" {...field} disabled={isPending} />
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
                                    <FormLabel>Email Profesional</FormLabel>
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
                                        <Input placeholder="PT Medina Giacarta" {...field} disabled={isPending} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="md:col-span-2">
                            <Alert className="bg-blue-50 border-blue-200">
                                <InfoIcon className="h-4 w-4 text-blue-500" />
                                <AlertTitle className="text-blue-700 text-xs font-bold">Rencana Anda</AlertTitle>
                                <AlertDescription className="text-blue-600 text-xs">
                                    Berdasarkan survey, kami telah memilihkan paket **{recommendedTier}**. Anda dapat mengubahnya jika perlu.
                                </AlertDescription>
                            </Alert>
                        </div>

                        <FormField
                            control={form.control}
                            name="paket"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Paket yang Dipilih</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={isPending}>
                                        <FormControl>
                                            <SelectTrigger className="border-2 border-primary/20 focus:border-primary">
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="UMKM">UMKM (Free / Micro)</SelectItem>
                                            <SelectItem value="SMALL">Small Business</SelectItem>
                                            <SelectItem value="MEDIUM">Medium Business</SelectItem>
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
