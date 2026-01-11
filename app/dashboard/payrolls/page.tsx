'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Search, Calculator, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useHR } from '@/hooks/use-hr';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { toast } from 'sonner';

export default function PayrollsPage() {
    const { usePayrolls, generatePayroll } = useHR();
    const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const { data: payrolls, isLoading, refetch } = usePayrolls(period);
    const mutation = generatePayroll;

    const handleGenerate = () => {
        toast.promise(
            mutation.mutateAsync({
                period,
                date: new Date().toISOString()
            }),
            {
                loading: 'Sedang memproses penggajian...',
                success: 'Penggajian berhasil digenerate!',
                error: 'Gagal generate penggajian'
            }
        );
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Penggajian (Payroll)</h1>
                    <p className="text-slate-500 mt-1">Kelola pembayaran gaji, slip gaji, dan perhitungan pajak.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleGenerate}
                        disabled={mutation.isPending}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        {mutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Calculator className="mr-2 h-4 w-4" />
                        )}
                        Hitung Gaji Bulan Ini
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Periode:</span>
                    <Input
                        type="month"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="w-[200px]"
                    />
                </div>
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input placeholder="Cari karyawan..." className="pl-10 border-slate-200" />
                </div>
            </div>

            {/* Payroll Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-emerald-600" />
                        Riwayat Pembayaran
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Karyawan</TableHead>
                                <TableHead>Jabatan</TableHead>
                                <TableHead>Total Pendapatan</TableHead>
                                <TableHead>Potongan</TableHead>
                                <TableHead>Gaji Bersih (Net)</TableHead>
                                <TableHead>Tanggal Bayar</TableHead>
                                <TableHead className="text-right">Slip Gaji</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                            <span>Memuat data payroll...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : payrolls && payrolls.length > 0 ? (
                                payrolls.map((payroll) => (
                                    <TableRow key={payroll.id}>
                                        <TableCell>
                                            <div className="font-medium">{payroll.karyawan.nama}</div>
                                            <div className="text-xs text-slate-500">{payroll.karyawan.nik}</div>
                                        </TableCell>
                                        <TableCell>{payroll.karyawan.jabatan}</TableCell>
                                        <TableCell className="text-green-600">
                                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(payroll.totalPenghasilan)}
                                        </TableCell>
                                        <TableCell className="text-red-500">
                                            ({new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(payroll.totalPotongan)})
                                        </TableCell>
                                        <TableCell className="font-bold">
                                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(payroll.netto)}
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(payroll.tanggalBayar), 'dd MMM yyyy', { locale: idLocale })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm">Download</Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                                        Tidak ada data penggajian untuk periode ini.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
