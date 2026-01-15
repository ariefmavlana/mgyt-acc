'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    DollarSign,
    PieChart,
    BarChart3,
    Loader2,
    Briefcase,
    Calendar,
    Target,
    Calculator,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { useProject } from '@/hooks/use-project';
import { formatCurrency, cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function ProjectProfitabilityPage() {
    const { id } = useParams();
    const router = useRouter();
    const { useProjectDetails, useProjectProfitability } = useProject();

    const { data: project, isLoading: isLoadingProject } = useProjectDetails(id as string);
    const { data: profitability, isLoading: isLoadingProfit } = useProjectProfitability(id as string);

    const isLoading = isLoadingProject || isLoadingProfit;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-slate-500 font-medium animate-pulse">Menganalisis data finansial proyek...</p>
            </div>
        );
    }

    if (!project || !profitability) {
        return (
            <div className="p-8 text-center space-y-4">
                <div className="bg-rose-50 text-rose-600 p-4 rounded-xl border border-rose-100 inline-block">
                    Project not found or analysis failed.
                </div>
                <br />
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                </Button>
            </div>
        );
    }

    const { totalRevenue, totalCost, grossProfit, margin } = profitability;
    const isProfitable = grossProfit >= 0;

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Breadcrumbs & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded-full hover:bg-white hover:shadow-sm"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                            <Briefcase className="w-3 h-3" /> Analisis Proyek <ChevronRight className="w-3 h-3" /> {project.kodeProyek}
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{project.namaProyek}</h1>
                    </div>
                </div>
                <Badge variant="outline" className={cn(
                    "px-4 py-1.5 font-bold text-sm tracking-tight border-2",
                    isProfitable ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
                )}>
                    {isProfitable ? 'PROFITABLE' : 'LOSS POTENTIAL'}
                </Badge>
            </div>

            {/* Top Cards: Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                    <CardHeader className="pb-2 space-y-0">
                        <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <ArrowUpRight className="w-3 h-3 text-emerald-500" /> Total Pendapatan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 leading-none mb-1">
                            {formatCurrency(totalRevenue)}
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">Berdasarkan invoice terbit</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                    <CardHeader className="pb-2 space-y-0">
                        <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <ArrowDownRight className="w-3 h-3 text-rose-500" /> Total Biaya
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 leading-none mb-1">
                            {formatCurrency(totalCost)}
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">Mencakup BO, Gaji, dll</p>
                    </CardContent>
                </Card>

                <Card className={cn(
                    "border-2 shadow-sm overflow-hidden",
                    isProfitable ? "border-emerald-100 bg-emerald-50/10" : "border-rose-100 bg-rose-50/10"
                )}>
                    <CardHeader className="pb-2 space-y-0">
                        <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Laba Kotor (Gross Profit)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={cn(
                            "text-2xl font-bold leading-none mb-1",
                            isProfitable ? "text-emerald-600" : "text-rose-600"
                        )}>
                            {formatCurrency(grossProfit)}
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">Margin saat ini: {margin.toFixed(2)}%</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                    <CardHeader className="pb-2 space-y-0">
                        <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Nilai Kontrak
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary leading-none mb-1">
                            {formatCurrency(project.nilaiKontrak || 0)}
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium font-mono">IDR - Fixed Price</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Analysis Chart Area */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                        <CardHeader className="border-b border-slate-50 bg-slate-50/50">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5 text-primary" /> Visualisasi Struktur Finansial
                                    </CardTitle>
                                    <CardDescription>Perbandingan antara Pendapatan vs Pengeluaran.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-12">
                            <div className="relative h-48 w-full bg-slate-50 rounded-2xl flex items-end justify-around p-6 gap-8 border border-slate-100">
                                {/* Revenue Bar */}
                                <div className="flex flex-col items-center gap-3 h-full justify-end flex-1">
                                    <div
                                        className="w-full max-w-[100px] bg-emerald-500 rounded-t-xl group relative overflow-hidden transition-all duration-1000 shadow-lg shadow-emerald-200"
                                        style={{ height: '100%' }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Pendapatan</span>
                                </div>

                                {/* Cost Bar */}
                                <div className="flex flex-col items-center gap-3 h-full justify-end flex-1">
                                    <div
                                        className="w-full max-w-[100px] bg-rose-400 rounded-t-xl transition-all duration-1000 delay-300 shadow-lg shadow-rose-100"
                                        style={{ height: `${(totalCost / totalRevenue) * 100}%` }}
                                    />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Biaya</span>
                                </div>

                                {/* Profit Bar */}
                                <div className="flex flex-col items-center gap-3 h-full justify-end flex-1">
                                    <div
                                        className={cn(
                                            "w-full max-w-[100px] rounded-t-xl transition-all duration-1000 delay-500 shadow-lg",
                                            isProfitable ? "bg-primary shadow-primary/20" : "bg-slate-300"
                                        )}
                                        style={{ height: `${(grossProfit / totalRevenue) * 100}%` }}
                                    />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Profit</span>
                                </div>
                            </div>

                            <div className="mt-8 p-6 bg-slate-900 rounded-xl text-white shadow-xl">
                                <div className="flex items-center gap-4">
                                    <div className="bg-primary/20 p-3 rounded-lg border border-primary/30">
                                        <TrendingUp className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-slate-400 font-medium">Kesimpulan Analisis</p>
                                        <p className="text-sm font-semibold italic text-slate-200">
                                            {isProfitable
                                                ? `Proyek ini dalam kondisi sehat dengan margin ${margin.toFixed(2)}%. Efisiensi biaya tercapai 88% dari proyeksi.`
                                                : `Peringatan: Biaya operasional telah melebihi pendapatan. Segera lakukan review pengeluaran.`
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Breakdown Sections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <Target className="w-4 h-4 text-emerald-500" /> Alokasi Pendapatan
                                </CardTitle>
                                <Badge variant="secondary" className="text-[9px] font-bold">100%</Badge>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-semibold">
                                        <span className="text-slate-500">Service Fee</span>
                                        <span className="text-slate-900">85%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-400 w-[85%]" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-semibold">
                                        <span className="text-slate-500">Material Reimbursement</span>
                                        <span className="text-slate-900">15%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-300 w-[15%]" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <Calculator className="w-4 h-4 text-rose-500" /> Struktur Biaya
                                </CardTitle>
                                <Badge variant="secondary" className="text-[9px] font-bold text-rose-600">COST CENTER</Badge>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-semibold">
                                        <span className="text-slate-500">Gaji Pemain & Kru</span>
                                        <span className="text-slate-900">60%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-rose-400 w-[60%]" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-semibold">
                                        <span className="text-slate-500">Operasional Lapangan</span>
                                        <span className="text-slate-900">40%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-rose-300 w-[40%]" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Info Sidebar */}
                <div className="space-y-6">
                    <Card className="border-slate-200 shadow-sm bg-white">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold text-slate-800">Detail Kontrak</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="flex items-center gap-4">
                                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                    <Calendar className="w-5 h-5 text-slate-400" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Timeline</p>
                                    <p className="text-xs font-bold text-slate-700">
                                        {format(new Date(project.tanggalMulai), 'dd/MM/yyyy')} - {project.targetSelesai ? format(new Date(project.targetSelesai), 'dd/MM/yyyy') : 'Unscheduled'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                    <DollarSign className="w-5 h-5 text-slate-400" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Status Pembayaran</p>
                                    <p className="text-xs font-bold text-slate-700">Termin (Progress-based)</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-50">
                                <Button className="w-full bg-slate-900 hover:bg-black font-bold text-xs py-5 rounded-xl transition-all">
                                    UNDUH ANALISIS (PDF)
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-primary/20 bg-primary/5 shadow-none">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center space-y-3">
                                <div className="bg-primary p-3 rounded-full shadow-lg shadow-primary/30">
                                    <PieChart className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">Saran Optimasi</h4>
                                    <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                                        Gunakan data ini untuk negosiasi kontrak mendatang atau penyesuaian anggaran di fase berikutnya.
                                    </p>
                                </div>
                                <Button variant="link" className="text-primary font-bold text-xs">
                                    Pelajari Selengkapnya
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
