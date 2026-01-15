'use client';

import React from 'react';
import { AssetForm } from '@/components/assets/asset-form';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewAssetPage() {
    return (
        <div className="p-8 space-y-8 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/assets">
                    <Button variant="outline" size="icon" className="rounded-full w-10 h-10 border-slate-200">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Registrasi Aset Baru</h1>
                    <p className="text-slate-500">Tambahkan aset tetap baru ke dalam sistem untuk pelacakan dan penyusutan.</p>
                </div>
            </div>

            <AssetForm />
        </div>
    );
}
