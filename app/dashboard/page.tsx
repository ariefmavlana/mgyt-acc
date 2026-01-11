'use client';

import { useRequireAuth } from '@/hooks/use-require-auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useDashboard } from '@/hooks/use-dashboard';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function DashboardPage() {
    const { user, loading: authLoading } = useRequireAuth();
    const { logout } = useAuth();
    const { data: stats, isLoading: statsLoading } = useDashboard();

    if (authLoading || statsLoading) return (
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
                        Ringkasan keuangan {user?.perusahaan?.nama} per {format(new Date(), 'dd MMMM yyyy', { locale: id })}
                    </p>
                </div>
                <Button variant="outline" onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" /> Keluar
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Assets */}
                <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-700">Total Aset</CardTitle>
                        <Wallet className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-900">{formatCurrency(stats?.assets || 0)}</div>
                        <p className="text-xs text-blue-600/80 mt-1">
                            Posisi keuangan saat ini
                        </p>
                    </CardContent>
                </Card>

                {/* Net Income */}
                <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-700">Laba Bersih (Bulan Ini)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-900">{formatCurrency(stats?.netIncome || 0)}</div>
                        <p className="text-xs text-emerald-600/80 mt-1">
                            Pendapatan dikurangi beban
                        </p>
                    </CardContent>
                </Card>

                {/* Receivables */}
                <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-amber-700">Total Piutang</CardTitle>
                        <DollarSign className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-900">{formatCurrency(stats?.receivables || 0)}</div>
                        <p className="text-xs text-amber-600/80 mt-1">
                            Uang yang akan diterima
                        </p>
                    </CardContent>
                </Card>

                {/* Payables */}
                <Card className="bg-gradient-to-br from-rose-50 to-white border-rose-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-rose-700">Total Hutang</CardTitle>
                        <TrendingDown className="h-4 w-4 text-rose-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-rose-900">{formatCurrency(stats?.payables || 0)}</div>
                        <p className="text-xs text-rose-600/80 mt-1">
                            Kewajiban yang harus dibayar
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Status Sistem</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                <span className="text-sm font-medium text-slate-600">Perusahaan</span>
                                <span className="font-semibold text-slate-900">{user?.perusahaan?.nama}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                <span className="text-sm font-medium text-slate-600">Peran Pengguna</span>
                                <span className="font-semibold text-slate-900">{user?.role}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                <span className="text-sm font-medium text-slate-600">Tier Paket</span>
                                <span className="font-semibold text-slate-900">{user?.perusahaan?.tier || 'FREE'}</span>
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
                            + Transaksi Baru
                        </Button>
                        <Button variant="secondary" className="w-full justify-start" onClick={() => window.location.href = '/dashboard/invoices/new'}>
                            + Invoice Baru
                        </Button>
                        <Button variant="secondary" className="w-full justify-start" onClick={() => window.location.href = '/dashboard/bills'}>
                            + Tagihan (Bill)
                        </Button>
                        <Button variant="secondary" className="w-full justify-start" onClick={() => window.location.href = '/dashboard/employees'}>
                            + Karyawan
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
