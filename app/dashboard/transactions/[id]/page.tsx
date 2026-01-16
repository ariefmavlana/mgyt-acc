'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Printer, Trash2, FileText, Calendar, User, Hash } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useCompany } from '@/hooks/use-company';
import { format } from 'date-fns';
import { id as localeID } from 'date-fns/locale';
import { toast } from 'sonner';

interface TransactionLine {
    id: string;
    akunId: string;
    deskripsi: string;
    debit: number;
    kredit: number;
    akun: {
        kodeAkun: string;
        namaAkun: string;
    };
}

interface Transaction {
    id: string;
    nomorTransaksi: string;
    tanggal: string;
    tipe: string;
    deskripsi: string;
    total: number;
    isVoid: boolean;
    pengguna?: {
        namaLengkap: string;
    };
    detail?: TransactionLine[];
}

export default function TransactionDetailPage() {
    const { id } = useParams();
    const { currentCompany } = useCompany();
    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchTransaction = React.useCallback(async () => {
        if (!currentCompany || !id) return;
        try {
            setLoading(true);
            const res = await api.get(`/transactions`, {
                params: { perusahaanId: currentCompany.id }
            });
            // Since we don't have a single GET /id yet in backend for this specific test, 
            // we find it in the list (temporary workaround for speed)
            const found = res.data.transactions.find((t: Transaction) => t.id === id);
            if (found) {
                setTransaction(found);
            } else {
                toast.error('Transaksi tidak ditemukan');
            }
        } catch (error: unknown) {
            console.error('Failed to fetch transaction:', error);
        } finally {
            setLoading(false);
        }
    }, [currentCompany, id]);

    useEffect(() => {
        fetchTransaction();
    }, [fetchTransaction]);

    if (loading) return <div className="p-8">Memuat detail...</div>;
    if (!transaction) return <div className="p-8">Transaksi tidak ditemukan.</div>;

    const totalAmount = Number(transaction.total);

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-4">
                <Button
                    variant="ghost"
                    asChild
                    className="-ml-4 w-fit text-slate-500 hover:text-primary transition-colors"
                >
                    <Link href="/dashboard/transactions">
                        <ChevronLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar
                    </Link>
                </Button>
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                Detail Transaksi
                            </h1>
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                TERPOSTING
                            </Badge>
                        </div>
                        <p className="text-slate-500 mt-1">
                            Informasi lengkap jurnal dan entri akuntansi.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => window.print()}>
                            <Printer className="mr-2 h-4 w-4" /> Cetak Voucher
                        </Button>
                        {!transaction.isVoid && (
                            <Button
                                variant="outline"
                                className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                                onClick={async () => {
                                    if (!confirm('Apakah Anda yakin ingin membatalkan transaksi ini? Tindakan ini tidak dapat dibatalkan.')) return;

                                    try {
                                        setLoading(true);
                                        await api.delete(`/transactions/${id}/void`);
                                        toast.success('Transaksi berhasil dibatalkan');
                                        fetchTransaction();
                                    } catch (error: any) {
                                        toast.error(error.response?.data?.message || 'Gagal membatalkan transaksi');
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> Batalkan
                            </Button>
                        )}
                        {transaction.isVoid && (
                            <Badge variant="destructive">DIBATALKAN</Badge>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Entri Jurnal</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-4 bg-slate-50 rounded-lg">
                                <div className="space-y-1">
                                    <div className="text-xs text-slate-500 flex items-center gap-1 uppercase font-bold tracking-wider">
                                        <Hash className="h-3 w-3" /> No. Transaksi
                                    </div>
                                    <div className="font-mono text-sm">{transaction.nomorTransaksi}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-slate-500 flex items-center gap-1 uppercase font-bold tracking-wider">
                                        <Calendar className="h-3 w-3" /> Tanggal
                                    </div>
                                    <div className="text-sm">
                                        {format(new Date(transaction.tanggal), 'dd MMMM yyyy', { locale: localeID })}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-slate-500 flex items-center gap-1 uppercase font-bold tracking-wider">
                                        <FileText className="h-3 w-3" /> Tipe
                                    </div>
                                    <div className="text-sm capitalize">{transaction.tipe.toLowerCase().replace('_', ' ')}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-slate-500 flex items-center gap-1 uppercase font-bold tracking-wider">
                                        <User className="h-3 w-3" /> Dicatat Oleh
                                    </div>
                                    <div className="text-sm">{transaction.pengguna?.namaLengkap}</div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Deskripsi</h4>
                                <div className="p-4 border rounded-lg bg-white italic text-slate-700">
                                    &quot;{transaction.deskripsi}&quot;
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Ringkasan Nilai</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex justify-between items-center py-4 border-b">
                            <span className="text-slate-500">Mata Uang</span>
                            <span className="font-bold">IDR (Rupiah)</span>
                        </div>
                        <div className="flex justify-between items-center py-4 border-b">
                            <span className="text-slate-500">Status Posting</span>
                            <Badge className="bg-emerald-500">SUKSES</Badge>
                        </div>
                        <div className="pt-4">
                            <div className="text-xs text-slate-400 uppercase font-bold mb-2">Total Transaksi</div>
                            <div className="text-3xl font-extrabold text-primary">
                                {new Intl.NumberFormat('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR',
                                    minimumFractionDigits: 0
                                }).format(totalAmount)}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
