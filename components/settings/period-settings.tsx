'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Lock, Unlock, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import axios from 'axios';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Period {
    id: string;
    tahun: number;
    bulan: number;
    nama: string;
    tanggalMulai: string;
    tanggalAkhir: string;
    status: 'TERBUKA' | 'DITUTUP_PERMANEN';
    tanggalDitutup?: string;
    ditutupOleh?: string;
}

export const PeriodSettings = () => {
    const [periods, setPeriods] = useState<Period[]>([]);
    const [loading, setLoading] = useState(true);
    const [isActionPending, setIsActionPending] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [newPeriod, setNewPeriod] = useState({
        tahun: new Date().getFullYear(),
        bulan: new Date().getMonth() + 1,
        nama: '',
        tanggalMulai: '',
        tanggalAkhir: ''
    });

    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    useEffect(() => {
        fetchPeriods();
    }, []);

    useEffect(() => {
        // Auto-generate name and dates when year/month changes
        const monthName = months[newPeriod.bulan - 1];
        const lastDay = new Date(newPeriod.tahun, newPeriod.bulan, 0).getDate();

        setNewPeriod(prev => ({
            ...prev,
            nama: `${monthName} ${prev.tahun}`,
            tanggalMulai: `${prev.tahun}-${String(prev.bulan).padStart(2, '0')}-01`,
            tanggalAkhir: `${prev.tahun}-${String(prev.bulan).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
        }));
    }, [newPeriod.tahun, newPeriod.bulan]);

    const fetchPeriods = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/periods');
            setPeriods(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Gagal memuat daftar periode');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePeriod = async () => {
        try {
            setIsActionPending(true);
            const csrfRes = await axios.get('/api/csrf-token');
            await axios.post('/api/periods', newPeriod, {
                headers: { 'x-csrf-token': csrfRes.data.csrfToken }
            });
            toast.success('Periode baru berhasil dibuka');
            setIsDialogOpen(false);
            fetchPeriods();
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Gagal membuka periode baru');
        } finally {
            setIsActionPending(false);
        }
    };

    const handleClosePeriod = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menutup periode ini secara permanen? Setelah ditutup, transaksi tidak dapat diubah atau ditambahkan.')) return;

        try {
            setIsActionPending(true);
            const csrfRes = await axios.get('/api/csrf-token');
            await axios.post(`/api/periods/${id}/close`, {}, {
                headers: { 'x-csrf-token': csrfRes.data.csrfToken }
            });
            toast.success('Periode berhasil ditutup');
            fetchPeriods();
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Gagal menutup periode');
        } finally {
            setIsActionPending(false);
        }
    };

    if (loading) {
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
                        <Calendar className="h-5 w-5 text-primary" />
                        Periode Akuntansi
                    </CardTitle>
                    <CardDescription>
                        Kelola periode fiskal untuk mengunci transaksi bulanan.
                    </CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90">
                            <Plus className="mr-2 h-4 w-4" /> Buka Periode Baru
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Buka Periode Akuntansi Baru</DialogTitle>
                            <DialogDescription>
                                Masukkan detail periode yang ingin Anda buka.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="tahun">Tahun</Label>
                                    <Input
                                        id="tahun"
                                        type="number"
                                        value={newPeriod.tahun}
                                        onChange={(e) => setNewPeriod({ ...newPeriod, tahun: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bulan">Bulan</Label>
                                    <Select
                                        value={String(newPeriod.bulan)}
                                        onValueChange={(v) => setNewPeriod({ ...newPeriod, bulan: parseInt(v) })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Bulan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {months.map((m, i) => (
                                                <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nama">Nama Periode</Label>
                                <Input id="nama" value={newPeriod.nama} readOnly className="bg-slate-50" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="mulai">Tanggal Mulai</Label>
                                    <Input id="mulai" type="date" value={newPeriod.tanggalMulai} readOnly className="bg-slate-50" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="akhir">Tanggal Akhir</Label>
                                    <Input id="akhir" type="date" value={newPeriod.tanggalAkhir} readOnly className="bg-slate-50" />
                                </div>
                            </div>
                            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg text-amber-800 text-sm">
                                <AlertCircle className="h-4 w-4 mt-0.5" />
                                <p>Pastikan periode sebelumnya telah ditutup sebelum membuka periode baru untuk menjaga konsistensi laporan.</p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isActionPending}>Batal</Button>
                            <Button onClick={handleCreatePeriod} disabled={isActionPending}>
                                {isActionPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Konfirmasi & Buka
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nama Periode</TableHead>
                            <TableHead>Rentang Tanggal</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Info Penutupan</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {periods.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                                    Belum ada periode yang terdaftar.
                                </TableCell>
                            </TableRow>
                        ) : (
                            periods.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell className="font-medium text-slate-900">{p.nama}</TableCell>
                                    <TableCell className="text-slate-600">
                                        {format(new Date(p.tanggalMulai), 'dd MMM yyyy', { locale: id })} - {format(new Date(p.tanggalAkhir), 'dd MMM yyyy', { locale: id })}
                                    </TableCell>
                                    <TableCell>
                                        {p.status === 'TERBUKA' ? (
                                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 flex items-center gap-1 w-fit">
                                                <Unlock className="h-3 w-3" /> Terbuka
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 flex items-center gap-1 w-fit">
                                                <Lock className="h-3 w-3" /> Ditutup
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-slate-500 text-xs">
                                        {p.status === 'DITUTUP_PERMANEN' ? (
                                            <>
                                                Oleh: {p.ditutupOleh}<br />
                                                Tgl: {format(new Date(p.tanggalDitutup!), 'dd/MM/yy HH:mm')}
                                            </>
                                        ) : '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {p.status === 'TERBUKA' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-amber-600 border-amber-200 hover:bg-amber-50"
                                                onClick={() => handleClosePeriod(p.id)}
                                                disabled={isActionPending}
                                            >
                                                Tutup Periode
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};
