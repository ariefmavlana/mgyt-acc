'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Building2, Users, Settings, Shield, Save, Loader2 } from 'lucide-react';
import { useCompany } from '@/hooks/use-company';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import { PeriodSettings } from '@/components/settings/period-settings';
import { UsersTable } from '@/components/settings/users-table';
import { BranchSettings } from '@/components/settings/branch-settings';
import { FileUpload } from '@/components/ui/file-upload';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function SettingsPage() {
    useRequireAuth('/login', ['SUPERADMIN', 'ADMIN']);
    const { currentCompany: company, loading: isLoading, updateCompany: updateCompanyFn, updateSettings: updateSettingsFn } = useCompany();
    const companyId = company?.id;
    const [isSaving, setIsSaving] = useState(false);
    const searchParams = useSearchParams();
    const defaultTab = searchParams.get('tab') || 'company';

    const [form, setForm] = useState({
        nama: '',
        kode: '',
        npwp: '',
        email: '',
        telepon: '',
        alamat: '',
        logo: ''
    });

    const [systemForm, setSystemForm] = useState({
        mataUangUtama: 'IDR',
        tahunBuku: 12,
        bulanMulaiFiskal: 1
    });

    useEffect(() => {
        if (company) {
            setForm({
                nama: company.nama || '',
                kode: company.kode || '',
                npwp: company.npwp || '',
                email: company.email || '',
                telepon: company.telepon || '',
                alamat: company.alamat || '',
                logo: company.logoUrl || ''
            });

            setSystemForm({
                mataUangUtama: company.mataUangUtama || 'IDR',
                tahunBuku: company.tahunBuku || 12,
                bulanMulaiFiskal: company.bulanMulaiFiskal || 1
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
            const payload = { ...form };
            await updateCompanyFn(companyId, payload);
            toast.success('Profil perusahaan berhasil diperbarui');
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveSystem = async () => {
        if (!companyId) return;
        try {
            setIsSaving(true);
            await updateSettingsFn(companyId, systemForm);
            toast.success('Pengaturan sistem berhasil diperbarui');
        } catch (error) {
            console.error(error);
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
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit">Pengaturan</h1>
                <p className="text-slate-500 mt-1">Kelola preferensi dan konfigurasi sistem Mgyt Accounting.</p>
            </div>

            {/* Tabs Interface */}
            <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5 lg:w-[750px] mb-8">
                    <TabsTrigger value="company">Profil Perusahaan</TabsTrigger>
                    <TabsTrigger value="branches">Cabang</TabsTrigger>
                    <TabsTrigger value="users">Pengguna</TabsTrigger>
                    <TabsTrigger value="periods">Periode</TabsTrigger>
                    <TabsTrigger value="security">Keamanan</TabsTrigger>
                    <TabsTrigger value="system">Sistem</TabsTrigger>
                </TabsList>

                {/* Company Profile Tab */}
                <TabsContent value="company">
                    <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50/30 border-b border-slate-100/50">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Building2 className="h-5 w-5 text-primary" />
                                Profil Perusahaan
                            </CardTitle>
                            <CardDescription>
                                Informasi dasar mengenai entitas bisnis Anda yang akan tampil pada laporan dan invoice.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex flex-col md:flex-row gap-8 items-start mb-6">
                                <div className="space-y-2">
                                    <Label>Logo Perusahaan</Label>
                                    <FileUpload
                                        endpoint="imageUploader"
                                        value={form.logo || ''}
                                        onChange={(url) => setForm({ ...form, logo: url || '' })}
                                    />
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Max 4MB (PNG, JPG, SVG)</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                                    <div className="space-y-2">
                                        <Label htmlFor="nama">Nama Perusahaan</Label>
                                        <Input id="nama" value={form.nama} onChange={handleChange} placeholder="Contoh: PT Medina Giacarta" className="bg-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="npwp">NPWP</Label>
                                        <Input id="npwp" value={form.npwp} onChange={handleChange} placeholder="00.000.000.0-000.000" className="bg-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Resmi</Label>
                                        <Input id="email" type="email" value={form.email} onChange={handleChange} placeholder="finance@mavlana.com" className="bg-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="telepon">Telepon</Label>
                                        <Input id="telepon" value={form.telepon} onChange={handleChange} placeholder="+62 21 ..." className="bg-white" />
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <Label htmlFor="alamat">Alamat Lengkap</Label>
                                        <Input id="alamat" value={form.alamat} onChange={handleChange} placeholder="Jl. Sudirman No..." className="bg-white" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button
                                    type="button"
                                    className="bg-primary hover:bg-primary/90 shadow-sm transition-all"
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

                {/* Branches Tab */}
                <TabsContent value="branches">
                    <BranchSettings />
                </TabsContent>

                {/* Users Tab */}
                <TabsContent value="users">
                    <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50/30 border-b border-slate-100/50">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Users className="h-5 w-5 text-primary" />
                                Manajemen Pengguna
                            </CardTitle>
                            <CardDescription>
                                Kelola akses dan peran pengguna dalam sistem.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            {companyId ? (
                                <UsersTable companyId={companyId} />
                            ) : (
                                <div className="text-center py-10 text-red-500 font-medium">
                                    Data perusahaan tidak ditemukan.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Periods Tab */}
                <TabsContent value="periods">
                    <PeriodSettings />
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security">
                    <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50/30 border-b border-slate-100/50">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Shield className="h-5 w-5 text-primary" />
                                Keamanan & Akses
                            </CardTitle>
                            <CardDescription>
                                Konfigurasi keamanan akun dan kebijakan password.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between p-5 border border-slate-100 rounded-xl bg-slate-50/30 hover:bg-slate-50 transition-colors">
                                <div>
                                    <h4 className="font-semibold text-slate-800">Two-Factor Authentication (2FA)</h4>
                                    <p className="text-sm text-slate-500">Tambahkan lapisan keamanan ekstra dengan verifikasi tambahan.</p>
                                </div>
                                <Button variant="outline" className="bg-white border-slate-200 shadow-sm hover:bg-slate-50 transition-all duration-200">Aktifkan</Button>
                            </div>
                            <div className="flex items-center justify-between p-5 border border-slate-100 rounded-xl bg-slate-50/30 hover:bg-slate-50 transition-colors">
                                <div>
                                    <h4 className="font-semibold text-slate-800">Log Aktivitas</h4>
                                    <p className="text-sm text-slate-500">Lihat riwayat login dan aktivitas sensitif dari seluruh pengguna.</p>
                                </div>
                                <Button variant="outline" className="bg-white border-slate-200 shadow-sm hover:bg-slate-50 transition-all duration-200">Lihat Log</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* System Tab */}
                <TabsContent value="system">
                    <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50/30 border-b border-slate-100/50">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Settings className="h-5 w-5 text-primary" />
                                Preferensi Sistem
                            </CardTitle>
                            <CardDescription>
                                Pengaturan mata uang, periode buku, dan konfigurasi inti lainnya.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="mataUangUtama">Mata Uang Default</Label>
                                    <Input
                                        id="mataUangUtama"
                                        value={systemForm.mataUangUtama}
                                        onChange={(e) => setSystemForm({ ...systemForm, mataUangUtama: e.target.value })}
                                        placeholder="IDR"
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tahunBuku">Periode Buku (Bulan)</Label>
                                    <Input
                                        id="tahunBuku"
                                        type="number"
                                        value={systemForm.tahunBuku}
                                        onChange={(e) => setSystemForm({ ...systemForm, tahunBuku: parseInt(e.target.value) })}
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bulanMulaiFiskal">Bulan Mulai Fiskal</Label>
                                    <Select
                                        value={systemForm.bulanMulaiFiskal?.toString()}
                                        onValueChange={(val) => setSystemForm({ ...systemForm, bulanMulaiFiskal: parseInt(val) })}
                                    >
                                        <SelectTrigger className="bg-white">
                                            <SelectValue placeholder="Pilih Bulan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Januari</SelectItem>
                                            <SelectItem value="2">Februari</SelectItem>
                                            <SelectItem value="3">Maret</SelectItem>
                                            <SelectItem value="4">April</SelectItem>
                                            <SelectItem value="5">Mei</SelectItem>
                                            <SelectItem value="6">Juni</SelectItem>
                                            <SelectItem value="7">Juli</SelectItem>
                                            <SelectItem value="8">Agustus</SelectItem>
                                            <SelectItem value="9">September</SelectItem>
                                            <SelectItem value="10">Oktober</SelectItem>
                                            <SelectItem value="11">November</SelectItem>
                                            <SelectItem value="12">Desember</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button
                                    type="button"
                                    onClick={handleSaveSystem}
                                    className="bg-primary hover:bg-primary/90 shadow-sm transition-all"
                                    disabled={isSaving}
                                >
                                    {isSaving ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : (<Save className="mr-2 h-4 w-4" />)}
                                    Simpan Pengaturan
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
