'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { ArrowRight, BarChart3, PieChart, Landmark, FileText, TrendingUp, Download } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const reports = [
    {
        title: 'Neraca Keuangan',
        description: 'Balance Sheet (Posisi Keuangan). Ringkasan Aset, Liabilitas, dan Ekuitas.',
        href: '/dashboard/reports/balance-sheet',
        type: 'balance-sheet',
        icon: Landmark,
        color: 'text-blue-600'
    },
    {
        title: 'Laba Rugi',
        description: 'Income Statement. Pendapatan, Beban, dan Laba Bersih periode berjalan.',
        href: '/dashboard/reports/income-statement',
        type: 'income-statement',
        icon: TrendingUp,
        color: 'text-green-600'
    },
    {
        title: 'Arus Kas',
        description: 'Cash Flow. Analisa aliran kas masuk dan keluar dari aktivitas operasi, investasi, dan pendanaan.',
        href: '/dashboard/reports/cash-flow',
        type: 'cash-flow',
        icon: PieChart,
        color: 'text-purple-600'
    },
    {
        title: 'Neraca Saldo',
        description: 'Trial Balance. Daftar saldo semua akun untuk memastikan keseimbangan Debit/Kredit.',
        href: '/dashboard/reports/trial-balance',
        type: 'trial-balance',
        icon: BarChart3,
        color: 'text-orange-600'
    },
    {
        title: 'Buku Besar',
        description: 'General Ledger. Detail transaksi per akun dalam rentang waktu tertentu.',
        href: '/dashboard/reports/general-ledger',
        type: 'general-ledger',
        icon: FileText,
        color: 'text-slate-600'
    }
];

export default function ReportsDashboard() {

    const handleDownload = async (type: string, format: 'pdf' | 'excel') => {
        try {
            const toastId = toast.loading(`Menyiapkan ${format.toUpperCase()}...`);
            const response = await axios.post('/api/reports/export', {
                type,
                format,
            }, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const ext = format === 'pdf' ? 'pdf' : 'xlsx';
            link.setAttribute('download', `${type}-${new Date().toISOString().slice(0, 10)}.${ext}`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.dismiss(toastId);
            toast.success('Download berhasil');
        } catch (error) {
            toast.dismiss();
            toast.error('Gagal mengunduh laporan');
            console.error(error);
        }
    };

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
                        <Card key={report.href} className="hover:shadow-md transition-shadow group flex flex-col">
                            <Link href={report.href} className="flex-1">
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
                            </Link>

                            <CardContent className="pt-0 pb-2">
                                <Link href={report.href}>
                                    <Button variant="ghost" className="w-full justify-between hover:bg-transparent pl-0 text-primary mb-2">
                                        Buka Laporan <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </Link>
                            </CardContent>

                            <CardFooter className="pt-2 border-t flex gap-2 justify-end bg-slate-50/50">
                                {['balance-sheet', 'income-statement'].includes(report.type) && (
                                    <>
                                        <Button variant="outline" size="sm" onClick={() => handleDownload(report.type, 'pdf')}>
                                            <Download className="h-3 w-3 mr-1" /> PDF
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => handleDownload(report.type, 'excel')}>
                                            <Download className="h-3 w-3 mr-1" /> Excel
                                        </Button>
                                    </>
                                )}
                                {!['balance-sheet', 'income-statement'].includes(report.type) && (
                                    <span className="text-xs text-muted-foreground italic">Export segera hadir</span>
                                )}
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
