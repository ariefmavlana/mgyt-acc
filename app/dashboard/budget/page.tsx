'use client';

import React, { useState } from 'react';
import {
    Plus,
    Search,
    RefreshCcw,
    Filter,
    TrendingUp,
    TrendingDown,
    Target,
    ArrowUpRight,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useBudget } from '@/hooks/use-budget';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { formatCurrency, cn } from '@/lib/utils';
import Link from 'next/link';

export default function BudgetDashboard() {
    useRequireAuth('/login', ['SUPERADMIN', 'ADMIN', 'MANAGER']);
    const { useBudgets, useVarianceReport, calculateRealization } = useBudget();
    const [tahun] = useState(new Date().getFullYear());

    const { data: budgets, isLoading: isBudgetsLoading, refetch: refetchBudgets } = useBudgets({ tahun });
    const { data: report } = useVarianceReport(tahun);

    const handleRecalculate = async (id: string) => {
        try {
            await calculateRealization.mutateAsync(id);
        } catch (error) {
            console.error('Failed to recalculate:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'AKTIF': return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
            case 'APPROVED': return 'bg-blue-500/10 text-blue-600 border-blue-200';
            case 'DRAFT': return 'bg-slate-500/10 text-slate-600 border-slate-200';
            case 'CLOSED': return 'bg-rose-500/10 text-rose-600 border-rose-200';
            default: return 'bg-slate-500/10 text-slate-600 border-slate-200';
        }
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit">Anggaran & Planning</h1>
                    <p className="text-slate-500 mt-1">Pantau perencanaan keuangan dan realisasi pengeluaran secara real-time.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="bg-white" onClick={() => refetchBudgets()}>
                        <RefreshCcw className="h-4 w-4 mr-2" /> Segarkan
                    </Button>
                    <Link href="/dashboard/budget/new">
                        <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95">
                            <Plus className="h-4 w-4 mr-2" /> Anggaran Baru
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Summary Information Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Anggaran ({tahun})</CardTitle>
                        <Target className="h-5 w-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{formatCurrency(report?.totalPlanned || 0)}</div>
                        <p className="text-xs text-slate-500 mt-1">Total alokasi dana yang direncanakan</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Realisasi</CardTitle>
                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{formatCurrency(report?.totalActual || 0)}</div>
                        <div className="flex items-center mt-1">
                            <span className="text-emerald-600 text-xs font-medium flex items-center">
                                {report?.totalPlanned ? ((report.totalActual / report.totalPlanned) * 100).toFixed(1) : 0}%
                                <ArrowUpRight className="h-3 w-3 ml-0.5" />
                            </span>
                            <span className="text-slate-400 text-xs ml-1">dari total anggaran</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Selisih (Variance)</CardTitle>
                        <TrendingDown className="h-5 w-5 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{formatCurrency(report?.totalVariance || 0)}</div>
                        <p className="text-xs text-slate-500 mt-1">Sisa limit anggaran yang tersedia</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Area */}
            <Card className="border-slate-200/60 shadow-sm bg-white overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-slate-50/30">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Daftar Anggaran</CardTitle>
                            <CardDescription>Kelola dan tinjau performa anggaran berdasarkan departemen atau proyek.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input placeholder="Cari budget..." className="pl-9 w-64 bg-white" />
                            </div>
                            <Button variant="outline" size="icon">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isBudgetsLoading ? (
                        <div className="p-20 flex flex-col items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                            <p className="text-slate-500 font-medium">Memuat data anggaran...</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow>
                                    <TableHead className="font-semibold text-slate-900">Nama Anggaran</TableHead>
                                    <TableHead className="font-semibold text-slate-900">Tipe</TableHead>
                                    <TableHead className="font-semibold text-slate-900 text-right">Total Anggaran</TableHead>
                                    <TableHead className="font-semibold text-slate-900 text-right">Realisasi</TableHead>
                                    <TableHead className="font-semibold text-slate-900">Persentase</TableHead>
                                    <TableHead className="font-semibold text-slate-900">Status</TableHead>
                                    <TableHead className="w-[100px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {budgets?.map((budget) => (
                                    <TableRow key={budget.id} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell>
                                            <div className="font-medium text-slate-900">{budget.nama}</div>
                                            <div className="text-xs text-slate-500">{budget.kode}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">{budget.tipe.toLowerCase()}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-mono font-medium">
                                            {formatCurrency(budget.totalBudget)}
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-emerald-600 font-medium">
                                            {formatCurrency(budget.totalRealisasi)}
                                        </TableCell>
                                        <TableCell className="w-[180px]">
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-tighter">
                                                    <span>{Number(budget.persentaseRealisasi).toFixed(1)}%</span>
                                                    <span>Limit</span>
                                                </div>
                                                <Progress
                                                    value={Number(budget.persentaseRealisasi)}
                                                    className="h-1.5"
                                                    indicatorClassName={Number(budget.persentaseRealisasi) > 90 ? 'bg-rose-500' : 'bg-primary'}
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={cn("border shadow-none", getStatusColor(budget.status))}>
                                                {budget.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRecalculate(budget.id)}
                                                    disabled={calculateRealization.isPending}
                                                    title="Hitung Ulang Realisasi"
                                                >
                                                    <RefreshCcw className={cn("h-4 w-4 text-slate-400", calculateRealization.isPending && "animate-spin")} />
                                                </Button>
                                                <Link href={`/dashboard/budget/${budget.id}`}>
                                                    <Button variant="ghost" size="sm" className="font-medium text-primary hover:text-primary hover:bg-primary/10">Detail</Button>
                                                </Link>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {(!budgets || budgets.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                <div className="p-4 bg-slate-50 rounded-full mb-4">
                                                    <TrendingUp className="h-8 w-8 text-slate-300" />
                                                </div>
                                                <h3 className="font-semibold text-slate-900">Belum Ada Anggaran</h3>
                                                <p className="text-slate-500 text-sm max-w-xs mx-auto mt-1">Anda belum membuat perencanaan anggaran untuk periode ini.</p>
                                                <Link href="/dashboard/budget/new" className="mt-4">
                                                    <Button variant="outline" className="bg-white">Buat Sekarang</Button>
                                                </Link>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
