'use client';

import React, { useState, useEffect } from 'react';
import { TransactionTable } from '@/components/transactions/transaction-table';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter, Download, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCompany } from '@/hooks/use-company';
import api from '@/lib/api';
import { Input } from '@/components/ui/input';

interface Transaction {
    id: string;
    nomorTransaksi: string;
    deskripsi: string;
    tanggal: string;
    tipe: string;
    total: number;
    statusPembayaran: string;
    isVoid: boolean;
}

export default function TransactionsPage() {
    const { currentCompany } = useCompany();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchTransactions = React.useCallback(async () => {
        if (!currentCompany) return;
        try {
            setLoading(true);
            const res = await api.get('/transactions', {
                params: { perusahaanId: currentCompany.id }
            });
            setTransactions(res.data.transactions);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setLoading(false);
        }
    }, [currentCompany]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const filteredTransactions = transactions.filter((t) =>
        t.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.nomorTransaksi.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Transaksi</h1>
                    <p className="text-slate-500 mt-1">Kelola dan catat semua transaksi keuangan perusahaan.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-slate-200">
                        <Download className="mr-2 h-4 w-4" /> Ekspor
                    </Button>
                    <Button asChild className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                        <Link href="/dashboard/transactions/new">
                            <Plus className="mr-2 h-4 w-4" /> Transaksi Baru
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Filters and search */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Cari deskripsi atau nomor transaksi..."
                        className="pl-10 h-11 bg-white border-slate-200 focus:border-primary focus:ring-primary/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="h-11 px-4 border-slate-200">
                        <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                        Bulan Ini
                    </Button>
                    <Button variant="outline" className="h-11 px-4 border-slate-200">
                        <Filter className="mr-2 h-4 w-4 text-slate-400" />
                        Filter
                    </Button>
                </div>
            </div>

            {/* Data section */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    <p className="text-slate-500 font-medium">Memproses data...</p>
                </div>
            ) : (
                <TransactionTable transactions={filteredTransactions} />
            )}
        </div>
    );
}
