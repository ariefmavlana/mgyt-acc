import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

export interface CostCenter {
    id: string;
    kode: string;
    nama: string;
    deskripsi?: string | null;
    parentId?: string | null;
    parent?: { nama: string } | null;
    manager?: string | null;
    isAktif: boolean;
}

export interface ProfitCenter {
    id: string;
    kode: string;
    nama: string;
    deskripsi?: string | null;
    parentId?: string | null;
    parent?: { nama: string } | null;
    manager?: string | null;
    isAktif: boolean;
}

export function useOrganization() {
    const queryClient = useQueryClient();

    // --- Cost Centers ---
    const useCostCenters = () => {
        return useQuery({
            queryKey: ['cost-centers'],
            queryFn: async () => {
                const { data } = await api.get('/organization/cost-centers');
                return data.data as CostCenter[];
            }
        });
    };

    const createCostCenter = useMutation({
        mutationFn: async (payload: Partial<CostCenter>) => {
            const { data } = await api.post('/organization/cost-centers', payload);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cost-centers'] });
            toast.success('Cost Center berhasil dibuat');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Gagal membuat Cost Center');
        }
    });

    const updateCostCenter = useMutation({
        mutationFn: async ({ id, data }: { id: string, data: Partial<CostCenter> }) => {
            const res = await api.put(`/organization/cost-centers/${id}`, data);
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cost-centers'] });
            toast.success('Cost Center berhasil diperbarui');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Gagal memperbarui Cost Center');
        }
    });

    const deleteCostCenter = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/organization/cost-centers/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cost-centers'] });
            toast.success('Cost Center berhasil dihapus');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Gagal menghapus Cost Center');
        }
    });

    // --- Profit Centers ---
    const useProfitCenters = () => {
        return useQuery({
            queryKey: ['profit-centers'],
            queryFn: async () => {
                const { data } = await api.get('/organization/profit-centers');
                return data.data as ProfitCenter[];
            }
        });
    };

    const createProfitCenter = useMutation({
        mutationFn: async (payload: Partial<ProfitCenter>) => {
            const { data } = await api.post('/organization/profit-centers', payload);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profit-centers'] });
            toast.success('Profit Center berhasil dibuat');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Gagal membuat Profit Center');
        }
    });

    const updateProfitCenter = useMutation({
        mutationFn: async ({ id, data }: { id: string, data: Partial<ProfitCenter> }) => {
            const res = await api.put(`/organization/profit-centers/${id}`, data);
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profit-centers'] });
            toast.success('Profit Center berhasil diperbarui');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Gagal memperbarui Profit Center');
        }
    });

    const deleteProfitCenter = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/organization/profit-centers/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profit-centers'] });
            toast.success('Profit Center berhasil dihapus');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Gagal menghapus Profit Center');
        }
    });

    return {
        useCostCenters,
        createCostCenter,
        updateCostCenter,
        deleteCostCenter,
        useProfitCenters,
        createProfitCenter,
        updateProfitCenter,
        deleteProfitCenter
    };
}
