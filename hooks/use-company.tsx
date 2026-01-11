'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from './use-auth';

interface Company {
    id: string;
    kode: string;
    nama: string;
    email: string | null;
    telepon: string | null;
    alamat: string | null;
    website: string | null;
    npwp: string | null;
    logoUrl: string | null;
    tier: string;
    mataUangUtama: string;
}

interface CompanyContextType {
    companies: Company[];
    currentCompany: Company | null;
    loading: boolean;
    fetchCompanies: () => Promise<void>;
    switchCompany: (id: string) => Promise<void>;
    createCompany: (data: Record<string, unknown>) => Promise<unknown>;
    updateCompany: (id: string, data: Partial<Company>) => Promise<unknown>;
    updateSettings: (id: string, data: any) => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchCompanies = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            const res = await api.get('/companies');
            setCompanies(res.data.companies);

            // Auto-set current company if not set
            if (!currentCompany && res.data.companies.length > 0) {
                const savedId = localStorage.getItem('activeCompanyId');
                const active = res.data.companies.find((c: Company) => c.id === savedId) || res.data.companies[0];
                setCurrentCompany(active);
            }
        } catch (err) {
            console.error('Failed to fetch companies', err);
        } finally {
            setLoading(false);
        }
    }, [user, currentCompany]);

    useEffect(() => {
        if (user) {
            fetchCompanies();
        } else {
            setCompanies([]);
            setCurrentCompany(null);
        }
    }, [user, fetchCompanies]);

    const switchCompany = async (id: string) => {
        const target = companies.find(c => c.id === id);
        if (target) {
            setCurrentCompany(target);
            localStorage.setItem('activeCompanyId', id);
            toast.success(`Beralih ke perusahaan: ${target.nama}`);
            // Optionally reload page or update relevant context
            window.location.reload();
        }
    };

    const createNewCompany = async (data: Record<string, unknown>) => {
        try {
            const res = await api.post('/companies', data);
            toast.success('Perusahaan baru berhasil dibuat!');
            await fetchCompanies();
            return res.data;
        } catch (err: unknown) {
            const axiosError = err as { response?: { data?: { message?: string } } };
            toast.error(axiosError.response?.data?.message || 'Gagal membuat perusahaan');
            throw err;
        }
    };

    const updateCompany = async (id: string, data: Partial<Company>) => {
        try {
            const res = await api.put(`/companies/${id}`, data);
            toast.success('Profil perusahaan berhasil diperbarui');
            await fetchCompanies();
            // If updating current company, update state
            if (currentCompany?.id === id) {
                setCurrentCompany({ ...currentCompany, ...res.data });
            }
            return res.data;
        } catch (err: unknown) {
            const axiosError = err as { response?: { data?: { message?: string } } };
            toast.error(axiosError.response?.data?.message || 'Gagal memperbarui profil perusahaan');
            throw err;
        }
    };

    const updateSettings = async (id: string, data: any) => {
        try {
            await api.put(`/companies/${id}/settings`, data);
            toast.success('Pengaturan berhasil disimpan');
            await fetchCompanies();
        } catch (err: unknown) {
            const axiosError = err as { response?: { data?: { message?: string } } };
            toast.error(axiosError.response?.data?.message || 'Gagal menyimpan pengaturan');
            throw err;
        }
    };

    return (
        <CompanyContext.Provider value={{
            companies,
            currentCompany,
            loading,
            fetchCompanies,
            switchCompany,
            createCompany: createNewCompany,
            updateCompany,
            updateSettings
        }}>
            {children}
        </CompanyContext.Provider>
    );
};

export const useCompany = () => {
    const context = useContext(CompanyContext);
    if (context === undefined) {
        throw new Error('useCompany must be used within a CompanyProvider');
    }
    return context;
};
