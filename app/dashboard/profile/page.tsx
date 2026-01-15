'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from 'sonner';
import { Loader2, Save, UserCircle } from 'lucide-react';
import api from '@/lib/api';
import { FileUpload } from '@/components/ui/file-upload';

const profileSchema = z.object({
    namaLengkap: z.string().min(3, 'Nama harus minimal 3 karakter'),
    telepon: z.string().optional(),
    foto: z.string().optional().or(z.literal('')),
});

export default function ProfilePage() {
    const { user, checkAuth } = useAuth(); // Assuming checkAuth re-fetches user data
    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            namaLengkap: '',
            telepon: '',
            foto: '',
        },
    });

    useEffect(() => {
        if (user) {
            form.reset({
                namaLengkap: user.namaLengkap || '',
                telepon: user.telepon || '',
                foto: user.foto || '',
            });
        }
    }, [user, form]);

    async function onSubmit(values: z.infer<typeof profileSchema>) {
        setLoading(true);
        try {
            await api.put('/auth/profile', values);
            toast.success('Profil berhasil diperbarui');
            if (checkAuth) await checkAuth(); // Refresh user context
        } catch (error) {
            console.error(error);
            toast.error('Gagal memperbarui profil');
        } finally {
            setLoading(false);
        }
    }

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Pengaturan Profil</h1>
                <p className="text-muted-foreground">Kelola informasi pribadi dan keamanan akun Anda.</p>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="general">Informasi Umum</TabsTrigger>
                    <TabsTrigger value="security" disabled>Keamanan (Segera)</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="mt-6">
                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Profile Card */}
                        <Card className="md:col-span-1 h-fit">
                            <CardHeader>
                                <CardTitle className="text-lg">Foto Profil</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center gap-4">
                                <Avatar className="h-32 w-32 border-4 border-slate-100">
                                    <AvatarImage src={user.foto || ''} alt={user.namaLengkap} />
                                    <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                                        {user.namaLengkap ? user.namaLengkap.substring(0, 2).toUpperCase() : 'US'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="text-center space-y-1">
                                    <h3 className="font-semibold">{user.namaLengkap}</h3>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                    <div className="flex items-center justify-center gap-2 mt-2">
                                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                            {user.role}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Edit Form */}
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-lg">Edit Informasi</CardTitle>
                                <CardDescription>Perbarui detail informasi pribadi Anda di sini.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="namaLengkap"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nama Lengkap</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <UserCircle className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                            <Input className="pl-9" placeholder="Nama Lengkap" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <FormLabel>Email</FormLabel>
                                                <Input value={user.email} disabled className="bg-slate-50" />
                                                <FormDescription>Email tidak dapat diubah.</FormDescription>
                                            </div>
                                            <div className="space-y-2">
                                                <FormLabel>Username</FormLabel>
                                                <Input value={user.username} disabled className="bg-slate-50" />
                                            </div>
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="telepon"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nomor Telepon</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="+62..." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="foto"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Foto Profil</FormLabel>
                                                    <FormControl>
                                                        <FileUpload
                                                            endpoint="imageUploader"
                                                            value={field.value || ''}
                                                            onChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Klik atau seret gambar untuk mengunggah foto profil Anda.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="pt-4 flex justify-end">
                                            <Button type="submit" disabled={loading}>
                                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                <Save className="mr-2 h-4 w-4" />
                                                Simpan Perubahan
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
