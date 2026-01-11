'use client';

import { useCompany } from '@/hooks/use-company';
import { CompanyTable } from '@/components/companies/company-table';
import { Button } from '@/components/ui/button';
import { Plus, Building2, Search, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function CompaniesPage() {
    const { companies, loading } = useCompany();
    const router = useRouter();
    const [search, setSearch] = useState('');

    const filteredCompanies = companies.filter(c =>
        c.nama.toLowerCase().includes(search.toLowerCase()) ||
        c.kode.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Daftar Perusahaan</h1>
                    <p className="text-slate-500 text-sm mt-1">Kelola perusahan yang terdaftar di akun Anda.</p>
                </div>
                <Button onClick={() => router.push('/dashboard/companies/new')} className="shadow-lg shadow-primary/20">
                    <Plus className="mr-2 h-4 w-4" /> Tambah Perusahaan
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Cari nama atau kode perusahaan..."
                        className="pl-9 bg-white border-slate-200"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="border-slate-200 bg-white">
                    <Filter className="mr-2 h-4 w-4 text-slate-500" /> Filter
                </Button>
            </div>

            {loading ? (
                <div className="grid gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 w-full animate-pulse bg-slate-100 rounded-lg" />
                    ))}
                </div>
            ) : filteredCompanies.length > 0 ? (
                <CompanyTable data={filteredCompanies} />
            ) : (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-xl border-2 border-dashed border-slate-200">
                    <div className="bg-slate-50 p-6 rounded-full mb-6">
                        <Building2 className="h-12 w-12 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Belum ada perusahaan</h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-8">
                        Anda belum memiliki perusahaan lain atau tidak ada hasil pencarian.
                        Mulai dengan membuat perusahaan baru.
                    </p>
                    <Button variant="outline" onClick={() => router.push('/dashboard/companies/new')}>
                        Buat Perusahaan Pertama
                    </Button>
                </div>
            )}
        </div>
    );
}
