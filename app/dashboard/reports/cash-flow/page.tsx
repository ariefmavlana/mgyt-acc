'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DateRangePicker } from '../../../../components/ui/date-range-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

export default function CashFlowPage() {
    const router = useRouter();
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(new Date().getFullYear(), 0, 1),
        to: new Date()
    });

    const { data: report, isLoading } = useQuery({
        queryKey: ['cash-flow', dateRange],
        queryFn: async () => {
            const res = await api.get('/reports/cash-flow', {
                params: {
                    startDate: dateRange?.from?.toISOString(),
                    endDate: dateRange?.to?.toISOString()
                }
            });
            return res.data;
        },
        enabled: !!dateRange?.from && !!dateRange?.to
    });

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Laporan Arus Kas</h1>
                        <p className="text-slate-500">Pergerakan kas masuk dan keluar (Metode Langsung).</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <DateRangePicker
                        date={dateRange}
                        setDate={setDateRange}
                    />
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid gap-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500">Arus Kas Operasional</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${report?.operating >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(report?.operating || 0)}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500">Arus Kas Investasi</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${report?.investing >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(report?.investing || 0)}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500">Arus Kas Pendanaan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${report?.financing >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(report?.financing || 0)}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-50 border-slate-200">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-900">Kenaikan Bersih Kas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${report?.netChange >= 0 ? 'text-primary' : 'text-red-600'}`}>
                                    {formatCurrency(report?.netChange || 0)}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Rincian Pergerakan</CardTitle>
                            <CardDescription>
                                Periode: {report?.period?.start ? format(new Date(report.period.start), 'dd MMM yyyy') : '-'} s/d {report?.period?.end ? format(new Date(report.period.end), 'dd MMM yyyy') : '-'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Kategori</TableHead>
                                        <TableHead className="text-right">Jumlah</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">Aktivitas Operasional</TableCell>
                                        <TableCell className="text-right">{formatCurrency(report?.operating || 0)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Aktivitas Investasi</TableCell>
                                        <TableCell className="text-right">{formatCurrency(report?.investing || 0)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Aktivitas Pendanaan</TableCell>
                                        <TableCell className="text-right">{formatCurrency(report?.financing || 0)}</TableCell>
                                    </TableRow>
                                    <TableRow className="bg-slate-50 font-bold">
                                        <TableCell>Total Kenaikan/Penurunan Kas</TableCell>
                                        <TableCell className="text-right">{formatCurrency(report?.netChange || 0)}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
