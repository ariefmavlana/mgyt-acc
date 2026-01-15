'use client';

import React from 'react';
import { PurchaseForm } from '@/components/purchases/purchase-form';
import { Receipt } from 'lucide-react';

export default function NewBillPage() {
    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Receipt className="h-6 w-6 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tagihan Pembelian Baru</h1>
                </div>
                <p className="text-slate-500 ml-11">
                    Catat tagihan dari pemasok (Vendor Bill) untuk memantau hutang usaha dan stok barang.
                </p>
            </div>

            <PurchaseForm />
        </div>
    );
}
