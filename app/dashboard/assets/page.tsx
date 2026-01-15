'use client';

import React from 'react';
import { useAsset } from '@/hooks/use-asset';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Building2, TrendingDown, PieChart, MoreVertical, FileText, Trash2, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function AssetsPage() {
    const { useAssets, deleteAsset } = useAsset();
    const { data: assets, isLoading } = useAssets();

    const stats = React.useMemo(() => {
        if (!assets) return { totalValue: 0, totalDepreciation: 0, netValue: 0 };
        const totalValue = assets.reduce((sum: number, a: any) => sum + Number(a.hargaPerolehan), 0);
        const totalDepreciation = assets.reduce((sum: number, a: any) => sum + Number(a.akumulasiPenyusutan), 0);
        return {
            totalValue,
            totalDepreciation,
            netValue: totalValue - totalDepreciation
        };
    }, [assets]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(val);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'AKTIF': return <Badge className="bg-emerald-500 hover:bg-emerald-600">Aktif</Badge>;
            case 'RUSAK': return <Badge variant="destructive">Rusak</Badge>;
            case 'DIJUAL': return <Badge className="bg-blue-500 hover:bg-blue-600">Dijual</Badge>;
            case 'IDLE': return <Badge variant="outline" className="text-slate-500 border-slate-300">Idle</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="p-8 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Manajemen Aset Tetap</h1>
                    <p className="text-slate-500 mt-1">Kelola, lacak, dan hitung penyusutan aset perusahaan Anda secara otomatis.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="hidden sm:flex items-center gap-2 border-slate-200">
                        <PieChart className="w-4 h-4" />
                        Laporan Aset
                    </Button>
                    <Link href="/dashboard/assets/new">
                        <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2 h-11 px-5 rounded-xl font-bold transition-all active:scale-[0.98]">
                            <Plus className="w-5 h-5" />
                            Daftar Aset Baru
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-slate-200/60 shadow-sm bg-linear-to-br from-white to-slate-50/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Total Harga Perolehan</CardTitle>
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600">
                            <Building2 className="w-4 h-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalValue)}</div>
                        <p className="text-xs text-slate-400 mt-1">Total nilai aset yang terdaftar</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/60 shadow-sm bg-linear-to-br from-white to-slate-50/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Akumulasi Penyusutan</CardTitle>
                        <div className="p-2 bg-rose-500/10 rounded-lg text-rose-600">
                            <TrendingDown className="w-4 h-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalDepreciation)}</div>
                        <p className="text-xs text-slate-400 mt-1">Total beban penyusutan hingga saat ini</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/60 shadow-sm border-l-4 border-l-primary bg-linear-to-br from-white to-primary/5">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-primary">Nilai Buku Bersih (Net)</CardTitle>
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <PieChart className="w-4 h-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">{formatCurrency(stats.netValue)}</div>
                        <p className="text-xs text-primary/60 mt-1">Sisa nilai ekonomis aset</p>
                    </CardContent>
                </Card>
            </div>

            {/* Asset List */}
            <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white">
                <CardHeader className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Daftar Aset Tetap</CardTitle>
                            <CardDescription>Menampilkan semua aset yang dimiliki oleh perusahaan.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-slate-50/80 text-slate-500 border-y border-slate-100 font-bold">
                                <tr>
                                    <th className="px-6 py-4">Informasi Aset</th>
                                    <th className="px-6 py-4">Kategori</th>
                                    <th className="px-6 py-4 text-right">Harga Perolehan</th>
                                    <th className="px-6 py-4 text-right">Akum. Penyusutan</th>
                                    <th className="px-6 py-4 text-right font-bold text-primary">Nilai Buku</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoading ? (
                                    [...Array(3)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={7} className="px-6 py-8"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                                        </tr>
                                    ))
                                ) : assets?.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="p-3 bg-slate-50 rounded-full"><Building2 className="w-8 h-8 opacity-20" /></div>
                                                <p>Belum ada aset tetap yang terdaftar.</p>
                                                <Link href="/dashboard/assets/new"><Button variant="link" className="font-bold">Daftarkan Aset Pertama</Button></Link>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    assets?.map((asset: any) => (
                                        <tr key={asset.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900">{asset.namaAset}</div>
                                                <div className="text-xs text-slate-500 mt-0.5">{asset.kodeAset} • Perolehan: {format(new Date(asset.tanggalPerolehan), 'dd MMM yyyy', { locale: id })}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="secondary" className="capitalize">{asset.kategori?.toLowerCase() || 'N/A'}</Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-slate-700">{formatCurrency(Number(asset.hargaPerolehan))}</td>
                                            <td className="px-6 py-4 text-right text-rose-600 font-medium">-{formatCurrency(Number(asset.akumulasiPenyusutan))}</td>
                                            <td className="px-6 py-4 text-right font-bold text-primary">{formatCurrency(Number(asset.nilaiBuku))}</td>
                                            <td className="px-6 py-4 text-center">
                                                {getStatusBadge(asset.status)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100"><MoreVertical className="w-4 h-4" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 p-1">
                                                        <Link href={`/dashboard/assets/${asset.id}`}>
                                                            <DropdownMenuItem className="gap-2 cursor-pointer font-medium"><FileText className="w-4 h-4" /> Detail & Riwayat</DropdownMenuItem>
                                                        </Link>
                                                        <DropdownMenuItem className="gap-2 cursor-pointer font-medium text-rose-600 focus:text-rose-600 focus:bg-rose-50" onClick={async () => {
                                                            if (confirm('Apakah Anda yakin ingin menghapus aset ini?')) {
                                                                await deleteAsset.mutateAsync(asset.id);
                                                            }
                                                        }}><Trash2 className="w-4 h-4" /> Hapus Aset</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
