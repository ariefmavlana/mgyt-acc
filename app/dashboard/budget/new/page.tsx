'use client';

import React from 'react';
import { BudgetForm } from '@/components/budget/budget-form';
import { useCOA } from '@/hooks/use-coa';
import { useHR } from '@/hooks/use-hr';
import { useProject } from '@/hooks/use-project';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NewBudgetPage() {
    useRequireAuth('/login', ['SUPERADMIN', 'ADMIN', 'MANAGER']);

    const { useAccounts } = useCOA();
    const { useDepartments } = useHR();
    const { useProjects } = useProject();

    const { data: accounts, isLoading: accountsLoading } = useAccounts();
    const { data: departments, isLoading: deptsLoading } = useDepartments();
    const { data: projects, isLoading: projectsLoading } = useProjects();

    const isLoading = accountsLoading || deptsLoading || projectsLoading;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
            {/* Navigation & Title */}
            <div className="space-y-4">
                <Link href="/dashboard/budget">
                    <Button variant="ghost" size="sm" className="text-slate-500 hover:text-primary transition-colors gap-2 pl-0">
                        <ChevronLeft className="h-4 w-4" /> Kembali ke Dashboard Anggaran
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit">Buat Perencanaan Anggaran</h1>
                    <p className="text-slate-500 mt-1">Susun alokasi dana strategis untuk mendukung pertumbuhan bisnis Anda.</p>
                </div>
            </div>

            {isLoading ? (
                <div className="h-[400px] flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200/60 shadow-sm">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                    <p className="text-slate-500 font-medium">Mempersiapkan formulir anggaran...</p>
                </div>
            ) : (
                <BudgetForm
                    accounts={accounts?.filter(a => !a.isHeader) || []}
                    departments={departments || []}
                    projects={projects || []}
                />
            )}
        </div>
    );
}
