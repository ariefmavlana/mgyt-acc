'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    RefreshCw,
    Play,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2,
    History,
    CalendarDays,
    ArrowRight,
    Zap
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRecurring } from '@/hooks/use-recurring';
import { formatCurrency, cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { toast } from 'sonner';

export default function RecurringTransactionsPage() {
    const { useRecurringTransactions, triggerRecurring } = useRecurring();
    const { data: recurringData, isLoading, isError, refetch } = useRecurringTransactions();

    const handleTrigger = async () => {
        try {
            await triggerRecurring.mutateAsync();
            refetch();
        } catch (error) {
            console.error(error);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'SUCCESS': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case 'FAILED': return <AlertCircle className="w-4 h-4 text-rose-500" />;
            default: return <Clock className="w-4 h-4 text-amber-500" />;
        }
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Transaksi Berulang</h1>
                    <p className="text-slate-500 mt-1">Otomasi entri jurnal untuk transaksi rutin seperti sewa, asuransi, dan gaji.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        className="border-slate-200 hover:bg-slate-50"
                        onClick={() => refetch()}
                        disabled={isLoading}
                    >
                        <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} /> Segarkan
                    </Button>
                    <Button
                        className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                        onClick={handleTrigger}
                        disabled={triggerRecurring.isPending}
                    >
                        {triggerRecurring.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Zap className="mr-2 h-4 w-4 fill-white" />
                        )}
                        Jalankan Mesin (Trigger)
                    </Button>
                </div>
            </div>

            {/* Stats / Status Engine */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-slate-200 shadow-sm overflow-hidden bg-white group hover:border-primary/30 transition-all">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 flex items-center justify-between">
                            Status Terakhir
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-slate-900">Aktif</span>
                            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 text-[10px] uppercase font-bold">Auto-Cron</Badge>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 font-medium">Berjalan setiap hari pkl 00:01 WIB</p>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 shadow-sm overflow-hidden bg-white group hover:border-primary/30 transition-all">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Total Definisi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{recurringData?.length || 0}</div>
                        <p className="text-xs text-slate-400 mt-1 font-medium">Transaksi yang dijadwalkan</p>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 shadow-sm overflow-hidden bg-white group hover:border-primary/30 transition-all">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Eksekusi Mendatang</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary flex items-center gap-2">
                            <CalendarDays className="w-5 h-5" /> Besok
                        </div>
                        <p className="text-xs text-slate-400 mt-1 font-medium">Periode: {format(new Date(), 'MMMM yyyy', { locale: id })}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                <CardHeader className="bg-slate-50/50 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-lg font-bold text-slate-700 flex items-center gap-2">
                                <History className="w-5 h-5 text-primary" /> Riwayat Transaksi Berulang
                            </CardTitle>
                            <CardDescription>Daftar transaksi yang diatur untuk berulang secara otomatis.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/30">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="font-semibold text-slate-900">Deskripsi Transaksi</TableHead>
                                    <TableHead className="font-semibold text-slate-900">Frekuensi</TableHead>
                                    <TableHead className="font-semibold text-slate-900">Nilai</TableHead>
                                    <TableHead className="font-semibold text-slate-900 text-center">Tgl Terakhir</TableHead>
                                    <TableHead className="font-semibold text-slate-900 text-center">Tgl Berikutnya</TableHead>
                                    <TableHead className="font-semibold text-slate-900">Status</TableHead>
                                    <TableHead className="text-right font-semibold text-slate-900">Metode</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                <p className="font-medium text-slate-500">Memuat data transaksi rutin...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : recurringData && recurringData.length > 0 ? (
                                    recurringData.map((task) => (
                                        <TableRow key={task.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900">{task.deskripsi}</span>
                                                    <span className="text-[10px] text-slate-400 font-mono tracking-tighter">{task.id}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-slate-100/50 text-slate-600 border-slate-200 font-bold text-[10px]">
                                                    {task.frekuensi}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-bold text-slate-700">
                                                {formatCurrency(task.jumlah || 0)}
                                            </TableCell>
                                            <TableCell className="text-center font-medium text-slate-600 text-sm">
                                                {task.terakhirBerjalan ? format(new Date(task.terakhirBerjalan), 'dd/MM/yyyy') : '-'}
                                            </TableCell>
                                            <TableCell className="text-center font-bold text-primary text-sm">
                                                {task.berikutnyaBerjalan ? format(new Date(task.berikutnyaBerjalan), 'dd/MM/yyyy') : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(task.statusTerakhir || 'SUCCESS')}
                                                    <span className="text-xs font-semibold text-slate-600">{task.statusTerakhir || 'READY'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-slate-500 text-xs">
                                                {task.isAuto ? (
                                                    <span className="flex items-center justify-end gap-1.5 text-emerald-600 font-bold">
                                                        <Clock className="w-3 h-3" /> AUTO
                                                    </span>
                                                ) : 'MANUAL'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2 opacity-30">
                                                <RefreshCw className="h-10 w-10 text-slate-300" />
                                                <p className="font-bold text-slate-400">Tidak ada transaksi yang dijadwalkan.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                <CardFooter className="bg-slate-50/30 p-4 border-t border-slate-100 flex justify-between">
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Transaksi baru dapat ditambahkan melalui modul <strong>Kas & Bank</strong> atau <strong>Buku Besar</strong> dengan menandai sebagai 'Rutin'.
                    </p>
                    <Button variant="ghost" size="sm" className="text-[10px] font-bold text-primary hover:bg-primary/5">
                        LIHAT DOKUMENTASI OTOMASI <ArrowRight className="ml-1 w-3 h-3" />
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
