'use client';

import { CompanyForm } from '@/components/companies/company-form';
import { useCompany } from '@/hooks/use-company';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { z } from 'zod';
import { createCompanySchema } from '@/server/validators/company.validator';

export default function NewCompanyPage() {
    const { createCompany } = useCompany();
    const router = useRouter();

    const handleSubmit = async (data: z.infer<typeof createCompanySchema>) => {
        try {
            await createCompany(data);
            router.push('/dashboard/companies');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Tambah Perusahaan Baru</h1>
                    <p className="text-slate-500 text-sm mt-1">Lengkapi form berikut untuk mendaftarkan perusahaan baru.</p>
                </div>
            </div>

            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Informasi Dasar</CardTitle>
                            <CardDescription>Detail identitas dan domisili perusahaan.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    <CompanyForm onSubmit={handleSubmit} />
                </CardContent>
            </Card>
        </div>
    );
}
