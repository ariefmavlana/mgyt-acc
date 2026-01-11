'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCompany } from '@/hooks/use-company';
import api from '@/lib/api';
import { CompanyForm } from '@/components/companies/company-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Settings, Shield, CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { createCompanySchema } from '@/server/validators/company.validator';

interface CompanyData extends z.infer<typeof createCompanySchema> {
    id: string;
}

export default function CompanySettingsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { fetchCompanies } = useCompany();
    const [company, setCompany] = useState<CompanyData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCompany = async () => {
            try {
                const res = await api.get(`/companies/${id}`);
                setCompany(res.data);
            } catch {
                toast.error('Gagal memuat data perusahaan');
                router.push('/dashboard/companies');
            } finally {
                setLoading(false);
            }
        };
        loadCompany();
    }, [id, router]);

    const handleUpdate = async (data: z.infer<typeof createCompanySchema>) => {
        try {
            await api.put(`/companies/${id}`, data);
            toast.success('Informasi perusahaan diperbarui');
            await fetchCompanies();
        } catch (err: unknown) {
            const axiosError = err as { response?: { data?: { message?: string } } };
            toast.error(axiosError.response?.data?.message || 'Gagal memperbarui data');
        }
    };

    if (loading) return (
        <div className="p-8 flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );

    return (
        <div className="p-8 space-y-8 max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{company?.nama}</h1>
                    <p className="text-slate-500 text-sm mt-1">Kelola informasi dan preferensi perusahaan.</p>
                </div>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="bg-slate-100/50 p-1 border border-slate-200">
                    <TabsTrigger value="general" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Settings className="mr-2 h-4 w-4" /> Umum
                    </TabsTrigger>
                    <TabsTrigger value="subscription" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Shield className="mr-2 h-4 w-4" /> Paket & Fitur
                    </TabsTrigger>
                    <TabsTrigger value="billing" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <CreditCard className="mr-2 h-4 w-4" /> Penagihan
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="mt-6">
                    <Card className="border-slate-200">
                        <CardHeader>
                            <CardTitle>Profil Perusahaan</CardTitle>
                            <CardDescription>Informasi legal dan kontak operasional.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CompanyForm initialData={company || undefined} onSubmit={handleUpdate} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="subscription" className="mt-6">
                    <Card className="border-slate-200">
                        <CardHeader>
                            <CardTitle>Paket Saat Ini</CardTitle>
                            <CardDescription>Status langganan dan batas penggunaan fitur.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <h3 className="text-lg font-bold text-primary mb-1 uppercase tracking-wider">{company?.tier || 'UMKM'}</h3>
                                    <p className="text-slate-600">Sesuai dengan skala bisnis kecil dan menengah.</p>
                                </div>
                                <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
                                    Upgrade Paket
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="billing" className="mt-6">
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-slate-200">
                        <CreditCard className="h-12 w-12 text-slate-300 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900">Histori Penagihan</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mt-2">
                            Semua invoice dan bukti pembayaran akan muncul di sini setelah Anda melakukan transaksi.
                        </p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
