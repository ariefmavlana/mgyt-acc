'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ChevronLeft,
    RefreshCcw,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    AlertCircle,
    Calendar,
    Target,
    Activity,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useBudget } from '@/hooks/use-budget';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { formatCurrency, formatPersentase } from '@/lib/utils';
import Link from 'next/link';

export default function BudgetDetailPage() {
    useRequireAuth('/login', ['SUPERADMIN', 'ADMIN', 'MANAGER']);
    const params = useParams();
    const router = useRouter();
    const { useBudgetDetail, calculateRealization } = useBudget();

    const budgetId = params.id as string;
    const { data: budget, isLoading, refetch } = useBudgetDetail(budgetId);

    const handleRecalculate = async () => {
        try {
            await calculateRealization.mutateAsync(budgetId);
            refetch();
        } catch (error) {
            console.error('Recalculate error:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="h-[calc(100vh-100px)] flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-slate-500 font-medium font-outfit">Memuat detail anggaran...</p>
            </div>
        );
    }

    if (!budget) {
        return (
            <div className="p-8 text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
                <h2 className="text-2xl font-bold">Anggaran Tidak Ditemukan</h2>
                <Button onClick={() => router.push('/dashboard/budget')}>Kembali ke Daftar</Button>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
            {/* Header / Breadcrumb */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <Link href="/dashboard/budget" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors mb-4 group w-fit">
                        <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                        Kembali ke Dashboard
                    </Link>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit">{budget.nama}</h1>
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 uppercase text-[10px] tracking-widest">{budget.status}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-slate-500 text-sm mt-1">
                        <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {budget.tahun}</span>
                        <span className="text-slate-300">|</span>
                        <span className="flex items-center gap-1.5"><Target className="h-4 w-4" /> {budget.kode}</span>
                        <span className="text-slate-300">|</span>
                        <span className="flex items-center gap-1.5 uppercase font-semibold text-[11px] tracking-wide">{budget.tipe}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="bg-white" onClick={handleRecalculate} disabled={calculateRealization.isPending}>
                        <RefreshCcw className={cn("h-4 w-4 mr-2", calculateRealization.isPending && "animate-spin")} />
                        Hitung Ulang Realisasi
                    </Button>
                    <Button onClick={() => router.push(`/dashboard/budget/edit/${budgetId}`)} variant="secondary">Ubah Rencana</Button>
                </div>
            </div>

            {/* Quick Summary Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white">
                    <CardHeader className="p-4 pb-2 border-b border-slate-50">
                        <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                            Rencana Anggaran <Target className="h-3.5 w-3.5 text-slate-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-4">
                        <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">{formatCurrency(budget.totalBudget)}</div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white">
                    <CardHeader className="p-4 pb-2 border-b border-slate-50">
                        <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                            Realisasi Terkini <Activity className="h-3.5 w-3.5 text-emerald-500" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-4">
                        <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">{formatCurrency(budget.totalRealisasi)}</div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white">
                    <CardHeader className="p-4 pb-2 border-b border-slate-50">
                        <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                            Tingkat Pengeluaran <RefreshCcw className="h-3.5 w-3.5 text-primary" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-4">
                        <div className="flex flex-col gap-2">
                            <div className="text-2xl font-bold text-primary font-mono tracking-tight">{formatPersentase(budget.persentaseRealisasi)}%</div>
                            <Progress value={Number(budget.persentaseRealisasi)} className="h-1.5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white">
                    <CardHeader className="p-4 pb-2 border-b border-slate-50">
                        <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                            Varians (Variance) <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-4">
                        <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">{formatCurrency(budget.totalVariance)}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Line Items Breakdown Table */}
            <Card className="border-slate-200/60 shadow-sm bg-white overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-slate-50/40">
                    <CardTitle className="text-lg">Breakdown Detail Anggaran</CardTitle>
                    <CardDescription>Rincian alokasi per akun dan periode waktu beserta realisasinya.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50">
                                <TableHead className="font-semibold text-slate-900 px-6 h-12">Akun Keuangan</TableHead>
                                <TableHead className="font-semibold text-slate-900 px-6 h-12">Bulan</TableHead>
                                <TableHead className="font-semibold text-slate-900 text-right px-6 h-12">Alokasi Rencana</TableHead>
                                <TableHead className="font-semibold text-slate-900 text-right px-6 h-12">Realisasi (Actual)</TableHead>
                                <TableHead className="font-semibold text-slate-900 text-right px-6 h-12">Sisa (Variance)</TableHead>
                                <TableHead className="font-semibold text-slate-900 px-6 h-12">Status Capaian</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {budget.detail?.map((item: any) => (
                                <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{item.akun?.nama}</div>
                                        <div className="text-xs text-slate-400 font-mono uppercase tracking-tighter">{item.akun?.kode}</div>
                                    </TableCell>
                                    <TableCell className="px-6 py-4">
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-medium">Bulan {item.bulan}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right px-6 py-4 font-mono font-medium text-slate-700">
                                        {formatCurrency(item.jumlahBudget)}
                                    </TableCell>
                                    <TableCell className="text-right px-6 py-4 font-mono font-bold text-emerald-600">
                                        {formatCurrency(item.jumlahRealisasi)}
                                    </TableCell>
                                    <TableCell className="text-right px-6 py-4">
                                        <div className={cn(
                                            "font-mono font-bold",
                                            Number(item.variance) < 0 ? "text-rose-600" : "text-amber-600"
                                        )}>
                                            {formatCurrency(item.variance)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-24">
                                                <Progress value={Number(item.variancePersentase)} className="h-1.5 shadow-none" />
                                            </div>
                                            <span className="text-[11px] font-bold text-slate-500">{Number(item.variancePersentase).toFixed(0)}%</span>
                                            {Number(item.variancePersentase) > 100 ? (
                                                <ArrowUpRight className="h-3 w-3 text-rose-500" />
                                            ) : (
                                                <ArrowDownRight className="h-3 w-3 text-emerald-500" />
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
