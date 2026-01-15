import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useCompany } from './use-company';

export interface MasterPajak {
    id: string;
    kodePajak: string;
    namaPajak: string;
    jenis: string;
    tarif: number;
    akunPajak?: string | null;
    isPemungut: boolean;
    isAktif: boolean;
    keterangan?: string | null;
}

export function useTax() {
    const { currentCompany } = useCompany();
    const queryClient = useQueryClient();

    const useTaxes = () => {
        return useQuery({
            queryKey: ['taxes', currentCompany?.id],
            queryFn: async () => {
                if (!currentCompany?.id) return [];
                const { data } = await api.get(`/tax?perusahaanId=${currentCompany.id}`);
                return data as MasterPajak[];
            },
            enabled: !!currentCompany?.id,
        });
    };

    const createTax = useMutation({
        mutationFn: async (newTax: Partial<MasterPajak>) => {
            const { data } = await api.post('/tax', {
                ...newTax,
                perusahaanId: currentCompany?.id,
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['taxes'] });
        },
    });

    const updateTax = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<MasterPajak> }) => {
            const res = await api.put(`/tax/${id}`, data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['taxes'] });
        },
    });

    const deleteTax = useMutation({
        mutationFn: async (id: string) => {
            const res = await api.delete(`/tax/${id}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['taxes'] });
        },
    });

    const useTaxReport = (startDate?: string, endDate?: string) => {
        return useQuery({
            queryKey: ['tax-report', currentCompany?.id, startDate, endDate],
            queryFn: async () => {
                if (!currentCompany?.id) return { summary: {}, details: [] };
                const { data } = await api.get('/tax/report', {
                    params: {
                        perusahaanId: currentCompany.id,
                        startDate,
                        endDate,
                    }
                });
                return data;
            },
            enabled: !!currentCompany?.id,
        });
    };

    return {
        useTaxes,
        useTaxReport,
        createTax,
        updateTax,
        deleteTax,
    };
}
