'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Building2, Users, Settings, Shield, Save, Loader2, Warehouse } from 'lucide-react';
import { useCompany } from '@/hooks/use-company';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import { PeriodSettings } from '@/components/settings/period-settings';
import { WarehouseSettings } from '@/components/inventory/warehouse-settings';

export default function SettingsPage() {
    const { user } = useRequireAuth();
    const companyId = user?.perusahaan?.id;
    const { currentCompany: company, loading: isLoading, updateCompany: updateCompanyFn } = useCompany();
    const [isSaving, setIsSaving] = useState(false);
    const searchParams = useSearchParams();
    const defaultTab = searchParams.get('tab') || 'company';

    const [form, setForm] = useState({
        nama: '',
        kode: '',
        npwp: '',
        email: '',
        telepon: '',
        alamat: ''
    });

    useEffect(() => {
        if (company) {
            setForm({
                nama: company.nama || '',
                kode: company.kode || '',
                npwp: company.npwp || '',
                email: company.email || '',
                telepon: company.telepon || '',
                alamat: company.alamat || ''
            });
        }
    }, [company]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.id]: e.target.value });
    };

    const handleSave = async () => {
        if (!companyId) return;
        try {
            setIsSaving(true);

            // Clean payload: remove empty strings to avoid Zod validation errors (e.g. min(5))
            // and ensure we don't send invalid data formats
            const payload: Record<string, string> = { ...form };

            Object.keys(payload).forEach(key => {
                if (payload[key] === '') {
                    // For now, we remove the key so it doesn't update (keeps existing value)
                    // If we need to clear (set to null), the validator needs .nullable() and we send null
                    delete payload[key];
                }
            });

            await updateCompanyFn(companyId, payload);
            toast.success('Profil perusahaan berhasil diperbarui');
        } catch (error) {
            console.error(error);
            toast.error('Gagal memperbarui profil perusahaan');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Pengaturan</h1>
                <p className="text-slate-500 mt-1">Kelola preferensi dan konfigurasi sistem Mavlana Accounting.</p>
            </div>

            {/* Tabs Interface */}
            <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className="grid w-full grid-cols-6 lg:w-[900px] mb-8">
                    <TabsTrigger value="company">Profil Perusahaan</TabsTrigger>
                    <TabsTrigger value="users">Pengguna</TabsTrigger>
                    <TabsTrigger value="periods">Periode</TabsTrigger>
                    <TabsTrigger value="warehouse" className="gap-2"><Warehouse className="h-4 w-4" /> Gudang</TabsTrigger>
                    <TabsTrigger value="security">Keamanan</TabsTrigger>
                    <TabsTrigger value="system">Sistem</TabsTrigger>
                </TabsList>

                {/* Company Profile Tab */}
                <TabsContent value="company">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-primary" />
                                Profil Perusahaan
                            </CardTitle>
                            <CardDescription>
                                Informasi dasar mengenai entitas bisnis Anda yang akan tampil pada laporan dan invoice.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="nama">Nama Perusahaan</Label>
                                    <Input id="nama" value={form.nama} onChange={handleChange} placeholder="Contoh: PT Mavlana Teknologi" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="npwp">NPWP</Label>
                                    <Input id="npwp" value={form.npwp} onChange={handleChange} placeholder="00.000.000.0-000.000" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Resmi</Label>
                                    <Input id="email" type="email" value={form.email} onChange={handleChange} placeholder="finance@mavlana.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="telepon">Telepon</Label>
                                    <Input id="telepon" value={form.telepon} onChange={handleChange} placeholder="+62 21 ..." />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="alamat">Alamat Lengkap</Label>
                                    <Input id="alamat" value={form.alamat} onChange={handleChange} placeholder="Jl. Sudirman No..." />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    className="bg-primary hover:bg-primary/90"
                                    onClick={() => {
                                        if (!companyId) {
                                            toast.error('Data perusahaan tidak ditemukan');
                                            return;
                                        }
                                        handleSave();
                                    }}
                                    disabled={isSaving}
                                >
                                    {isSaving ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : (<Save className="mr-2 h-4 w-4" />)}
                                    Simpan Perubahan
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Users Tab */}
                <TabsContent value="users">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                Manajemen Pengguna
                            </CardTitle>
                            <CardDescription>
                                Kelola akses dan peran pengguna dalam sistem.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-10 text-slate-500">
                                <p>Daftar pengguna akan ditampilkan di sini.</p>
                                <Button variant="outline" className="mt-4">Tambah Pengguna</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Periods Tab */}
                <TabsContent value="periods">
                    <PeriodSettings />
                </TabsContent>

                {/* Warehouse Tab */}
                <TabsContent value="warehouse">
                    <WarehouseSettings />
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-primary" />
                                Keamanan & Akses
                            </CardTitle>
                            <CardDescription>
                                Konfigurasi keamanan akun dan kebijakan password.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <h4 className="font-medium">Two-Factor Authentication (2FA)</h4>
                                    <p className="text-sm text-slate-500">Tambahkan lapisan keamanan ekstra.</p>
                                </div>
                                <Button variant="outline">Aktifkan</Button>
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <h4 className="font-medium">Log Aktivitas</h4>
                                    <p className="text-sm text-slate-500">Lihat riwayat login dan aktivitas sensitif.</p>
                                </div>
                                <Button variant="outline">Lihat Log</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* System Tab */}
                <TabsContent value="system">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5 text-primary" />
                                Preferensi Sistem
                            </CardTitle>
                            <CardDescription>
                                Pengaturan mata uang, bahasa, dan format tanggal.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Mata Uang Default</Label>
                                    <Input value="IDR (Rupiah)" disabled />
                                </div>
                                <div className="space-y-2">
                                    <Label>Zona Waktu</Label>
                                    <Input value="Asia/Jakarta (GMT+7)" disabled />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
