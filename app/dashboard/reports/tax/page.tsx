'use client';

import React, { useState } from 'react';
import { useTax } from '@/hooks/use-tax';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Download, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function TaxReportPage() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [startDate, setStartDate] = useState(format(firstDayOfMonth, 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(today, 'yyyy-MM-dd'));

    const { useTaxReport } = useTax();
    const { data, isLoading } = useTaxReport(startDate, endDate);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getStatusBadge = (jenis: string) => {
        switch (jenis) {
            case 'PPN_MASUKAN': return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">PPN Masukan</Badge>;
            case 'PPN_KELUARAN': return <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">PPN Keluaran</Badge>;
            case 'PPH_21': return <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">PPh 21</Badge>;
            case 'PPH_23': return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">PPh 23</Badge>;
            default: return <Badge variant="secondary">{jenis}</Badge>;
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit">Laporan Pajak</h1>
                    <p className="text-slate-500 mt-1">Ringkasan dan rincian transaksi pajak untuk pelaporan SPT Masa.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 transition-all duration-200 shadow-sm px-4">
                        <Printer className="mr-2 h-4 w-4" /> Cetak
                    </Button>
                    <Button className="bg-slate-900 text-white hover:bg-slate-800 transition-all duration-200 shadow-sm px-4">
                        <Download className="mr-2 h-4 w-4" /> Export CSV
                    </Button>
                </div>
            </div>

            <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
                <CardContent className="p-4 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-40 bg-white border-slate-200 focus:ring-slate-400 focus:border-slate-400"
                        />
                        <span className="text-slate-400 mx-1">-</span>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-40 bg-white border-slate-200 focus:ring-slate-400 focus:border-slate-400"
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-blue-100 bg-linear-to-br from-white to-blue-50/30 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-blue-600 font-semibold">Total PPN Masukan</CardDescription>
                        <CardTitle className="text-2xl font-bold text-slate-900">
                            {isLoading ? '...' : formatCurrency(data?.summary?.PPN_MASUKAN?.totalPajak || 0)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-slate-500">{data?.summary?.PPN_MASUKAN?.count || 0} transaksi terpantau</p>
                    </CardContent>
                </Card>
                <Card className="border-purple-100 bg-linear-to-br from-white to-purple-50/30 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-purple-600 font-semibold">Total PPN Keluaran</CardDescription>
                        <CardTitle className="text-2xl font-bold text-slate-900">
                            {isLoading ? '...' : formatCurrency(data?.summary?.PPN_KELUARAN?.totalPajak || 0)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-slate-500">{data?.summary?.PPN_KELUARAN?.count || 0} transaksi terpantau</p>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-slate-500 font-semibold">Pajak Kurang/Lebih Bayar</CardDescription>
                        <CardTitle className="text-2xl font-bold text-slate-900">
                            {isLoading ? '...' : formatCurrency((data?.summary?.PPN_KELUARAN?.totalPajak || 0) - (data?.summary?.PPN_MASUKAN?.totalPajak || 0))}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-slate-500">Estimasi setoran ke negara</p>
                    </CardContent>
                </Card>
                <Card className="border-green-100 bg-linear-to-br from-white to-green-50/30 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-green-600 font-semibold">Total PPh (21/23)</CardDescription>
                        <CardTitle className="text-2xl font-bold text-slate-900">
                            {isLoading ? '...' : formatCurrency((data?.summary?.PPH_21?.totalPajak || 0) + (data?.summary?.PPH_23?.totalPajak || 0))}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-slate-500">Total pemotongan pajak</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white">
                <CardHeader className="bg-slate-50/30 border-b border-slate-100/50 flex flex-row items-center justify-between p-4">
                    <div>
                        <CardTitle className="text-xl">Rincian Transaksi Pajak</CardTitle>
                        <CardDescription>Daftar semua transaksi yang mengandung unsur pajak.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead className="font-semibold text-slate-700">Tanggal</TableHead>
                                <TableHead className="font-semibold text-slate-700">No. Transaksi</TableHead>
                                <TableHead className="font-semibold text-slate-700">Jenis Pajak</TableHead>
                                <TableHead className="font-semibold text-slate-700">Keterangan</TableHead>
                                <TableHead className="font-semibold text-slate-700 text-right">DPP (Dasar)</TableHead>
                                <TableHead className="font-semibold text-slate-700 text-right">Nilai Pajak</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-slate-500">Memuat data...</TableCell>
                                </TableRow>
                            ) : data?.details?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-slate-500">Tidak ada transaksi pajak dalam periode ini.</TableCell>
                                </TableRow>
                            ) : data?.details?.map((dt: {
                                id: string;
                                transaksi: { tanggal: string; nomorTransaksi: string; deskripsi?: string };
                                pajak: { jenis: string };
                                dasar: number;
                                jumlah: number;
                            }) => (
                                <TableRow key={dt.id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell className="text-slate-600 font-medium whitespace-nowrap">
                                        {format(new Date(dt.transaksi.tanggal), 'dd MMM yyyy', { locale: id })}
                                    </TableCell>
                                    <TableCell className="font-semibold text-slate-900">{dt.transaksi.nomorTransaksi}</TableCell>
                                    <TableCell>{getStatusBadge(dt.pajak.jenis)}</TableCell>
                                    <TableCell className="max-w-xs truncate text-slate-500">{dt.transaksi.deskripsi}</TableCell>
                                    <TableCell className="text-right font-mono text-slate-600">{formatCurrency(dt.dasar)}</TableCell>
                                    <TableCell className="text-right font-bold text-slate-900">{formatCurrency(dt.jumlah)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
