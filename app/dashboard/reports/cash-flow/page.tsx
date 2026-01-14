'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { DateRangePicker } from '../../../../components/ui/date-range-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Download } from 'lucide-react';
import { FinancialReportLayout } from '@/components/reports/financial-report-layout';
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
                <FinancialReportLayout
                    title="Laporan Arus Kas"
                    period={`${report?.period?.start ? format(new Date(report.period.start), 'dd MMM yyyy') : '-'} s/d ${report?.period?.end ? format(new Date(report.period.end), 'dd MMM yyyy') : '-'}`}
                    type="Cash Flow"
                >
                    <div className="grid gap-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div className="p-4 border rounded-lg bg-slate-50">
                                <div className="text-xs font-medium text-slate-500 uppercase mb-1">Operasional</div>
                                <div className={`text-xl font-bold ${report?.operating >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(report?.operating || 0)}
                                </div>
                            </div>
                            <div className="p-4 border rounded-lg bg-slate-50">
                                <div className="text-xs font-medium text-slate-500 uppercase mb-1">Investasi</div>
                                <div className={`text-xl font-bold ${report?.investing >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(report?.investing || 0)}
                                </div>
                            </div>
                            <div className="p-4 border rounded-lg bg-slate-50">
                                <div className="text-xs font-medium text-slate-500 uppercase mb-1">Pendanaan</div>
                                <div className={`text-xl font-bold ${report?.financing >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(report?.financing || 0)}
                                </div>
                            </div>
                            <div className="p-4 border rounded-lg bg-primary/5 border-primary/20">
                                <div className="text-xs font-medium text-primary uppercase mb-1">Kenaikan Bersih</div>
                                <div className={`text-xl font-bold ${report?.netChange >= 0 ? 'text-primary' : 'text-red-600'}`}>
                                    {formatCurrency(report?.netChange || 0)}
                                </div>
                            </div>
                        </div>

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
                                <TableRow className="bg-slate-100 font-bold border-t-2 border-slate-800">
                                    <TableCell>Total Kenaikan/Penurunan Kas</TableCell>
                                    <TableCell className="text-right">{formatCurrency(report?.netChange || 0)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </FinancialReportLayout>
            )}
        </div>
    );
}
