import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

export interface Project {
    id: string;
    kodeProyek: string;
    namaProyek: string;
    pelangganId?: string | null;
    pelanggan?: { nama: string } | null;
    tanggalMulai: string;
    tanggalSelesai?: string | null;
    targetSelesai?: string | null;
    nilaiKontrak?: number | null;
    totalBiaya: number;
    totalPendapatan: number;
    status: string;
    persentaseSelesai: number;
    manajerProyek?: string | null;
    lokasi?: string | null;
    deskripsi?: string | null;
}

export interface ProjectProfitability {
    id: string;
    namaProyek: string;
    totalRevenue: number;
    totalCost: number;
    grossProfit: number;
    margin: number;
}

export function useProject() {
    const queryClient = useQueryClient();

    const useProjects = () => {
        return useQuery({
            queryKey: ['projects'],
            queryFn: async () => {
                const { data } = await api.get('/projects');
                return data.data as Project[];
            }
        });
    };

    const useProjectDetails = (id: string) => {
        return useQuery({
            queryKey: ['projects', id],
            queryFn: async () => {
                const { data } = await api.get(`/projects/${id}`);
                return data.data as Project;
            },
            enabled: !!id
        });
    };

    const useProjectProfitability = (id: string) => {
        return useQuery({
            queryKey: ['projects', 'profitability', id],
            queryFn: async () => {
                const { data } = await api.get(`/projects/${id}/profitability`);
                return data.data as ProjectProfitability;
            },
            enabled: !!id
        });
    };

    const createProject = useMutation({
        mutationFn: async (payload: Partial<Project>) => {
            const { data } = await api.post('/projects', payload);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast.success('Proyek berhasil dibuat');
        },
        onError: (err: unknown) => {
            const error = err as any;
            toast.error(error.response?.data?.message || 'Gagal membuat proyek');
        }
    });

    const updateProject = useMutation({
        mutationFn: async ({ id, data }: { id: string, data: Partial<Project> }) => {
            const res = await api.put(`/projects/${id}`, data);
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast.success('Proyek berhasil diperbarui');
        },
        onError: (err: unknown) => {
            const error = err as any;
            toast.error(error.response?.data?.message || 'Gagal memperbarui proyek');
        }
    });

    const deleteProject = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/projects/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast.success('Proyek berhasil dihapus');
        },
        onError: (err: unknown) => {
            const error = err as any;
            toast.error(error.response?.data?.message || 'Gagal menghapus proyek');
        }
    });

    return {
        useProjects,
        useProjectDetails,
        useProjectProfitability,
        createProject,
        updateProject,
        deleteProject
    };
}
