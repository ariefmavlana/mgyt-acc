'use client';

import { useRequireAuth } from '@/hooks/use-require-auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useDashboard } from '@/hooks/use-dashboard';
import { useCompany } from '@/hooks/use-company';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, DollarSign, Activity, Loader2, Plus, ArrowRightLeft } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { DashboardCharts } from '@/components/dashboard/dashboard-charts';
import { HelpIndicator } from '@/components/ui/help-indicator';

export default function DashboardPage() {
    const { user, loading: authLoading } = useRequireAuth();
    const { currentCompany: company, loading: companyLoading } = useCompany();
    const { data: stats, isLoading: statsLoading } = useDashboard();

    if (authLoading || statsLoading || companyLoading) return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
                    <p className="text-slate-500 mt-1">
                        Ringkasan keuangan {company?.nama} per {format(new Date(), 'dd MMMM yyyy', { locale: id })}
                    </p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Revenue */}
                <Card className="bg-linear-to-br from-indigo-50 to-white border-indigo-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-700 flex items-center gap-2">
                            Total Pendapatan
                            <HelpIndicator content="Total semua pendapatan yang telah diposting ke buku besar." />
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-indigo-900">{formatCurrency(stats?.revenue || 0)}</div>
                        <p className="text-xs text-indigo-600/80 mt-1">
                            Akumulasi pendapatan terposting
                        </p>
                    </CardContent>
                </Card>

                {/* Expenses */}
                <Card className="bg-linear-to-br from-rose-50 to-white border-rose-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-rose-700 flex items-center gap-2">
                            Total Beban
                            <HelpIndicator content="Total biaya operasional dan non-operasional." />
                        </CardTitle>
                        <TrendingDown className="h-4 w-4 text-rose-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-rose-900">{formatCurrency(stats?.expense || 0)}</div>
                        <p className="text-xs text-rose-600/80 mt-1">
                            Akumulasi beban operasional
                        </p>
                    </CardContent>
                </Card>

                {/* Net Profit */}
                <Card className="bg-linear-to-br from-emerald-50 to-white border-emerald-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-700 flex items-center gap-2">
                            Laba Bersih
                            <HelpIndicator content="Pendapatan dikurangi total beban (Net Profit)." />
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-900">{formatCurrency(stats?.netProfit || 0)}</div>
                        <p className="text-xs text-emerald-600/80 mt-1">
                            Pendapatan - Beban
                        </p>
                    </CardContent>
                </Card>

                {/* Active Users/Pending Approvals Mix */}
                <Card className="bg-linear-to-br from-amber-50 to-white border-amber-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-amber-700 flex items-center gap-2">
                            Pending Approval
                            <HelpIndicator content="Jumlah transaksi yang menunggu persetujuan Manager." />
                        </CardTitle>
                        <Activity className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-900">{stats?.pendingApprovals || 0}</div>
                        <p className="text-xs text-amber-600/80 mt-1">
                            Menunggu persetujuan
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            {stats && <DashboardCharts stats={stats} />}

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Status Sistem</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                <span className="text-sm font-medium text-slate-600">Perusahaan</span>
                                <div className="text-right">
                                    <div className="font-semibold text-slate-900">{company?.nama}</div>
                                    <div className="text-[10px] text-primary font-bold uppercase">{company?.tier} Plan</div>
                                </div>
                            </div>

                            {/* Active Users Section with Breakdown */}
                            <div className="p-3 bg-slate-50 rounded-lg space-y-2">
                                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                                    <span className="text-sm font-medium text-slate-600">Pengguna Aktif</span>
                                    <span className="font-semibold text-slate-900">{stats?.activeUsers || 0} User</span>
                                </div>
                                {stats?.usersByRole && Object.keys(stats.usersByRole).length > 0 ? (
                                    <div className="grid grid-cols-2 gap-2 pt-1">
                                        {Object.entries(stats.usersByRole).map(([role, count]) => (
                                            <div key={role} className="flex justify-between text-xs">
                                                <span className="text-slate-500 capitalize">{role.toLowerCase()}</span>
                                                <span className="font-medium text-slate-700">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-xs text-slate-400 italic text-center">Tidak ada data role</div>
                                )}
                            </div>

                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                <span className="text-sm font-medium text-slate-600">Saldo Kas</span>
                                <span className="font-semibold text-slate-900">{formatCurrency(stats?.cashBalance || 0)}</span>
                            </div>

                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border-l-4 border-primary">
                                <span className="text-sm font-medium text-slate-600">Periode Aktif</span>
                                <span className="font-bold text-primary italic">{stats?.activePeriod?.nama || 'Tidak Ada'}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1 bg-slate-900 text-slate-50">
                    <CardHeader>
                        <CardTitle className="text-slate-50">Aksi Cepat</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <Button variant="secondary" className="w-full justify-start" onClick={() => window.location.href = '/dashboard/transactions/new'}>
                            <Plus className="mr-2 h-4 w-4" /> Tambah Kas
                        </Button>
                        <Button variant="secondary" className="w-full justify-start" onClick={() => window.location.href = '/dashboard/employees'}>
                            <Plus className="mr-2 h-4 w-4" /> Tambah Karyawan
                        </Button>
                        <Button variant="secondary" className="w-full justify-start" onClick={() => window.location.href = '/dashboard/hr/departments'}>
                            <Plus className="mr-2 h-4 w-4" /> Tambah Departemen
                        </Button>
                        <Button variant="secondary" className="w-full justify-start" onClick={() => window.location.href = '/dashboard/inventory/transfer'}>
                            <ArrowRightLeft className="mr-2 h-4 w-4" /> Transfer Stok
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
