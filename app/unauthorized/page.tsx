'use client';

import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function UnauthorizedPage() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 p-4">
            <div className="flex flex-col items-center text-center space-y-4 max-w-md">
                <div className="bg-red-100 p-4 rounded-full">
                    <ShieldAlert className="h-12 w-12 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Akses Ditolak</h1>
                <p className="text-slate-600">
                    Maaf, Anda tidak memiliki izin untuk mengakses halaman ini.
                    Silakan hubungi Administrator jika Anda yakin ini adalah kesalahan.
                </p>
                <div className="pt-4">
                    <Button asChild>
                        <Link href="/dashboard">Kembali ke Dashboard</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
