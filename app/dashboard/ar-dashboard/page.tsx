'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AgingChart } from '@/components/invoices/aging-chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Loader2, TrendingUp, AlertTriangle, Wallet } from 'lucide-react';
import { format } from 'date-fns';

export default function ARDashboardPage() {
    const { data: agingData, isLoading: loadingAging } = useQuery({
        queryKey: ['aging-schedule'],
        queryFn: async () => {
            const res = await api.get('/invoices/aging-schedule');
            return res.data;
        }
    });

    const { data: invoices, isLoading: loadingInvoices } = useQuery({
        queryKey: ['invoices-outstanding'],
        queryFn: async () => {
            const res = await api.get('/invoices?status=BELUM_DIBAYAR&limit=20'); // Fetch unpaid
            // Note: Currently getInvoices in controller might handle status 'BELUM_DIBAYAR' implicitly or need explicit filter.
            // The controller supports `status` query param. The status enums are 'BELUM_DIBAYAR', 'DIBAYAR_SEBAGIAN', 'LUNAS', 'OVERDUE'.
            return res.data.data;
        }
    });

    if (loadingAging || loadingInvoices) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8" /></div>;
    }

    // Calculate IsKPIs
    const totalReceivables = agingData?.reduce((acc: number, curr: any) => acc + curr.total, 0) || 0;
    const totalOverdue = agingData?.reduce((acc: number, curr: any) =>
        acc + curr.days1_30 + curr.days31_60 + curr.days61_90 + curr.days90plus, 0) || 0;

    const overduePercentage = totalReceivables > 0 ? (totalOverdue / totalReceivables) * 100 : 0;

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">AR Dashboard</h1>
                    <p className="text-slate-500">Analisis Piutang Usaha & Aging Schedule</p>
                </div>
            </div>

            <Separator />

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Piutang</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalReceivables)}</div>
                        <p className="text-xs text-muted-foreground">Total tagihan belum lunas</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Overdue</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{formatCurrency(totalOverdue)}</div>
                        <p className="text-xs text-muted-foreground">
                            {overduePercentage.toFixed(1)}% dari total piutang
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Aging  +90 Hari</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(agingData?.reduce((acc: number, curr: any) => acc + curr.days90plus, 0) || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">Piutang macet potensial</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Charts area */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Aging Overview</CardTitle>
                        <CardDescription>Distribusi piutang berdasarkan umur jatuh tempo.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <AgingChart data={agingData || []} />
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Top Customers (Piutang)</CardTitle>
                        <CardDescription>Pelanggan dengan saldo piutang tertinggi.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableBody>
                                {agingData?.sort((a: any, b: any) => b.total - a.total).slice(0, 5).map((customer: any) => (
                                    <TableRow key={customer.pelangganId}>
                                        <TableCell className="font-medium">{customer.pelangganNama}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(customer.total)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Outstanding List Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Invoice Belum Lunas Terakhir</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No Invoice</TableHead>
                                <TableHead>Pelanggan</TableHead>
                                <TableHead>Jatuh Tempo</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="text-right">Sisa</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices?.map((inv: any) => (
                                <TableRow key={inv.id}>
                                    <TableCell>{inv.nomorTransaksi}</TableCell>
                                    <TableCell>{inv.pelanggan?.nama}</TableCell>
                                    <TableCell>{format(new Date(inv.tanggalJatuhTempo), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(inv.total)}</TableCell>
                                    <TableCell className="text-right font-medium text-red-600">{formatCurrency(inv.sisaPembayaran)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
