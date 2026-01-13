'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, MapPin, Phone, User, Loader2, Warehouse } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

interface Gudang {
    id: string;
    kode: string;
    nama: string;
    alamat: string | null;
    telepon: string | null;
    penanggungJawab: string | null;
    isUtama: boolean;
    cabang: {
        nama: string;
    };
}

interface Cabang {
    id: string;
    nama: string;
}

export function WarehouseSettings() {
    const [warehouses, setWarehouses] = useState<Gudang[]>([]);
    const [branches, setBranches] = useState<Cabang[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const [form, setForm] = useState({
        kode: '',
        nama: '',
        alamat: '',
        telepon: '',
        penanggungJawab: '',
        cabangId: '',
        isUtama: false
    });

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [wRes, bRes] = await Promise.all([
                api.get('/inventory/warehouses'),
                api.get('/companies/branches')
            ]);
            setWarehouses(wRes.data);
            setBranches(bRes.data);
        } catch (error) {
            console.error('Fetch Data Error:', error);
            toast.error('Gagal mengambil data gudang dan cabang');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            await api.post('/inventory/warehouses', form);
            toast.success('Gudang berhasil ditambahkan');
            setIsOpen(false);
            setForm({
                kode: '',
                nama: '',
                alamat: '',
                telepon: '',
                penanggungJawab: '',
                cabangId: '',
                isUtama: false
            });
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal menyimpan gudang');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <Warehouse className="h-5 w-5 text-primary" />
                        Manajemen Gudang
                    </CardTitle>
                    <CardDescription>
                        Kelola lokasi penyimpanan stok barang Anda.
                    </CardDescription>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90">
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah Gudang
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>Tambah GudangBaru</DialogTitle>
                                <DialogDescription>
                                    Lengkapi data gudang penyimpanan stok.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="kode">Kode Gudang</Label>
                                        <Input
                                            id="kode"
                                            value={form.kode}
                                            onChange={(e) => setForm({ ...form, kode: e.target.value })}
                                            placeholder="GUD-01"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="nama">Nama Gudang</Label>
                                        <Input
                                            id="nama"
                                            value={form.nama}
                                            onChange={(e) => setForm({ ...form, nama: e.target.value })}
                                            placeholder="Gudang Utama"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cabang">Cabang</Label>
                                    <Select
                                        value={form.cabangId}
                                        onValueChange={(value) => setForm({ ...form, cabangId: value })}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Cabang" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {branches.map((b) => (
                                                <SelectItem key={b.id} value={b.id}>
                                                    {b.nama}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="penanggungJawab">Penanggung Jawab</Label>
                                    <Input
                                        id="penanggungJawab"
                                        value={form.penanggungJawab}
                                        onChange={(e) => setForm({ ...form, penanggungJawab: e.target.value })}
                                        placeholder="Nama Staff"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="telepon">Telepon</Label>
                                        <Input
                                            id="telepon"
                                            value={form.telepon}
                                            onChange={(e) => setForm({ ...form, telepon: e.target.value })}
                                            placeholder="021-..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="alamat">Alamat</Label>
                                        <Input
                                            id="alamat"
                                            value={form.alamat}
                                            onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                                            placeholder="Jl. ..."
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Simpan Gudang
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {warehouses.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">
                        <p>Belum ada gudang yang terdaftar.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {warehouses.map((w) => (
                            <div key={w.id} className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-slate-900">{w.nama}</h3>
                                        <span className="text-xs font-mono text-slate-500">{w.kode}</span>
                                    </div>
                                    {w.isUtama && (
                                        <span className="px-2 py-0.5 rounded text-[10px] bg-primary/10 text-primary font-bold">UTAMA</span>
                                    )}
                                </div>
                                <div className="space-y-1 text-sm text-slate-600">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-3 w-3" />
                                        <span className="truncate">{w.alamat || 'Tidak ada alamat'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <User className="h-3 w-3" />
                                        <span>{w.penanggungJawab || '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-3 w-3" />
                                        <span>{w.telepon || '-'}</span>
                                    </div>
                                    <div className="mt-2 text-xs font-medium text-primary">
                                        Cabang: {w.cabang.nama}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
