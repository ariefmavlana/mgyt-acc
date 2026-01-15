import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useCompany } from './use-company';

export interface BudgetDetail {
    id?: string;
    budgetId?: string;
    akunId: string;
    akun?: {
        kode: string;
        nama: string;
    };
    periode: string | Date;
    bulan: number;
    jumlahBudget: number;
    jumlahRealisasi: number;
    variance: number;
    variancePersentase: number;
    keterangan?: string | null;
}

export interface Budget {
    id: string;
    perusahaanId: string;
    kode: string;
    nama: string;
    tahun: number;
    tipe: 'OPERASIONAL' | 'MODAL' | 'KAS' | 'PROYEK' | 'DEPARTEMEN';
    tanggalMulai: string | Date;
    tanggalAkhir: string | Date;
    totalBudget: number;
    totalRealisasi: number;
    totalVariance: number;
    persentaseRealisasi: number;
    status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'AKTIF' | 'CLOSED' | 'REVISED';
    departemenId?: string | null;
    proyekId?: string | null;
    deskripsi?: string | null;
    detail?: BudgetDetail[];
    departemen?: { nama: string };
    proyek?: { namaProyek: string };
}

export interface BudgetVarianceReport {
    totalPlanned: number;
    totalActual: number;
    totalVariance: number;
    count: number;
    budgets: Partial<Budget>[];
}

export function useBudget() {
    const { currentCompany } = useCompany();
    const queryClient = useQueryClient();

    const useBudgets = (params?: { tahun?: number; status?: string; tipe?: string }) => {
        return useQuery({
            queryKey: ['budgets', currentCompany?.id, params],
            queryFn: async () => {
                if (!currentCompany?.id) return [];
                const searchParams = new URLSearchParams();
                searchParams.append('perusahaanId', currentCompany.id);
                if (params?.tahun) searchParams.append('tahun', params.tahun.toString());
                if (params?.status) searchParams.append('status', params.status);
                if (params?.tipe) searchParams.append('tipe', params.tipe);

                const { data } = await api.get(`/budgets?${searchParams.toString()}`);
                return data as Budget[];
            },
            enabled: !!currentCompany?.id,
        });
    };

    const useBudgetDetail = (id: string | undefined) => {
        return useQuery({
            queryKey: ['budget', id],
            queryFn: async () => {
                if (!id) return null;
                const { data } = await api.get(`/budgets/${id}`);
                return data as Budget;
            },
            enabled: !!id,
        });
    };

    const useVarianceReport = (tahun?: number) => {
        return useQuery({
            queryKey: ['budget-variance-report', currentCompany?.id, tahun],
            queryFn: async () => {
                if (!currentCompany?.id) return null;
                let url = `/budgets/report/variance`;
                if (tahun) url += `?tahun=${tahun}`;
                const { data } = await api.get(url);
                return data as BudgetVarianceReport;
            },
            enabled: !!currentCompany?.id,
        });
    };

    const createBudget = useMutation({
        mutationFn: async (newBudget: any) => {
            const { data } = await api.post('/budgets', newBudget);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
        },
    });

    const updateBudget = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const res = await api.put(`/budgets/${id}`, data);
            return res.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
            queryClient.invalidateQueries({ queryKey: ['budget', variables.id] });
        },
    });

    const deleteBudget = useMutation({
        mutationFn: async (id: string) => {
            const res = await api.delete(`/budgets/${id}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
        },
    });

    const calculateRealization = useMutation({
        mutationFn: async (id: string) => {
            const res = await api.post(`/budgets/${id}/realization`);
            return res.data;
        },
        onSuccess: (data, id) => {
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
            queryClient.invalidateQueries({ queryKey: ['budget', id] });
            queryClient.invalidateQueries({ queryKey: ['budget-variance-report'] });
        },
    });

    return {
        useBudgets,
        useBudgetDetail,
        useVarianceReport,
        createBudget,
        updateBudget,
        deleteBudget,
        calculateRealization,
    };
}
