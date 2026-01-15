'use client';

import React from 'react';
import { WarehouseSettings } from '@/components/inventory/warehouse-settings';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { Button } from '@/components/ui/button';
import { ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';

export default function WarehousesPage() {
    useRequireAuth('/login', ['SUPERADMIN', 'ADMIN']);

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit">Manajemen Gudang</h1>
                    <p className="text-slate-500 mt-1">Kelola lokasi penyimpanan dan pusat distribusi stok barang.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 transition-all duration-200 shadow-sm" asChild>
                        <Link href="/dashboard/inventory/transfer">
                            <ArrowRightLeft className="mr-2 h-4 w-4" /> Transfer Stok
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="max-w-[1200px]">
                <WarehouseSettings />
            </div>
        </div>
    );
}
