import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { ArrowRight, BarChart3, PieChart, Landmark, FileText, TrendingUp } from 'lucide-react';

const reports = [
    {
        title: 'Neraca Keuangan',
        description: 'Balance Sheet (Posisi Keuangan). Ringkasan Aset, Liabilitas, dan Ekuitas.',
        href: '/dashboard/reports/balance-sheet',
        icon: Landmark,
        color: 'text-blue-600'
    },
    {
        title: 'Laba Rugi',
        description: 'Income Statement. Pendapatan, Beban, dan Laba Bersih periode berjalan.',
        href: '/dashboard/reports/income-statement',
        icon: TrendingUp,
        color: 'text-green-600'
    },
    {
        title: 'Arus Kas',
        description: 'Cash Flow. Analisa aliran kas masuk dan keluar dari aktivitas operasi, investasi, dan pendanaan.',
        href: '/dashboard/reports/cash-flow',
        icon: PieChart,
        color: 'text-purple-600'
    },
    {
        title: 'Neraca Saldo',
        description: 'Trial Balance. Daftar saldo semua akun untuk memastikan keseimbangan Debit/Kredit.',
        href: '/dashboard/reports/trial-balance',
        icon: BarChart3,
        color: 'text-orange-600'
    },
    {
        title: 'Buku Besar',
        description: 'General Ledger. Detail transaksi per akun dalam rentang waktu tertentu.',
        href: '/dashboard/reports/general-ledger',
        icon: FileText,
        color: 'text-slate-600'
    }
];

export default function ReportsDashboard() {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Pusat Laporan</h1>
                <p className="text-muted-foreground">Akses semua laporan keuangan dan manajerial.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report) => {
                    const Icon = report.icon;
                    return (
                        <Card key={report.href} className="hover:shadow-md transition-shadow cursor-pointer group">
                            <Link href={report.href}>
                                <CardHeader>
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg bg-slate-50 group-hover:bg-slate-100 transition-colors ${report.color}`}>
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <CardTitle className="text-lg">{report.title}</CardTitle>
                                    </div>
                                    <CardDescription className="pt-2">
                                        {report.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button variant="ghost" className="w-full justify-between hover:bg-transparent pl-0 text-primary">
                                        Buka Laporan <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </CardContent>
                            </Link>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
