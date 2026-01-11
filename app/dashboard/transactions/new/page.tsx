'use client';

import React from 'react';
import { TransactionForm } from '@/components/transactions/transaction-form';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewTransactionPage() {
    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
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
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Catat Transaksi Baru</h1>
                    <p className="text-slate-500 mt-1">Gunakan formulir di bawah ini untuk mencatat jurnal akuntansi.</p>
                </div>
            </div>

            <TransactionForm />
        </div>
    );
}
