'use client';

import { useRequireAuth } from '@/hooks/use-require-auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard } from 'lucide-react';

export default function DashboardPage() {
    const { user, loading } = useRequireAuth();
    const { logout } = useAuth();

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-pulse text-xl">Memuat...</div>
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <Button variant="outline" onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" /> Keluar
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Selamat Datang</CardTitle>
                        <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{user?.namaLengkap}</div>
                        <p className="text-xs text-muted-foreground">
                            Login sebagai {user?.role} di {user?.perusahaan?.nama}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 text-center">
                    Sistem Akuntansi Indonesia Siap Digunakan
                </h2>
                <p className="text-muted-foreground text-center max-w-2xl mx-auto">
                    Gunakan menu di sidebar untuk mulai mengelola transaksi, jurnal, dan laporan keuangan perusahaan Anda.
                </p>
            </div>
        </div>
    );
}
