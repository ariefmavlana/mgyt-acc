'use client';

import React from 'react';
import { TaxTable } from '@/components/tax/tax-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Percent } from 'lucide-react';
import { useRequireAuth } from '@/hooks/use-require-auth';

export default function TaxManagementPage() {
    useRequireAuth('/login', ['SUPERADMIN', 'ADMIN']);

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit">Master Pajak</h1>
                <p className="text-slate-500 mt-1">Kelola daftar jenis pajak (PPN, PPh) dan tarifnya untuk otomatisasi transaksi.</p>
            </div>

            <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white">
                <CardHeader className="bg-slate-50/30 border-b border-slate-100/50">
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <Percent className="h-5 w-5 text-primary" />
                        Daftar Pajak
                    </CardTitle>
                    <CardDescription>
                        Konfigurasi pajak yang berlaku untuk perusahaan Anda.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <TaxTable />
                </CardContent>
            </Card>
        </div>
    );
}
