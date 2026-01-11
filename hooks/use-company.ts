
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

export interface Company {
    id: string;
    nama: string;
    kode: string;
    alamat?: string;
    telepon?: string;
    email?: string;
    website?: string;
    npwp?: string;
    logoUrl?: string;
    userId: string; // Owner
}

export function useCompany(id?: string) {
    const queryClient = useQueryClient();

    // If ID is not provided, we might be fetching the "current" company from session or context, 
    // but the API expects an ID for specific operations. 
    // However, for "My Company" settings, usually we fetch the one from the active session context or a dedicated endpoint.
    // 'company.controller' has 'getCompany' which takes :id. 
    // For now, let's assume we pass the ID or fetch the first one if we want generic "current company" (which context provides).

    // Actually, in Settings page, we usually know the ID from the context `useRequireAuth` -> `user?.perusahaan?.id`.

    const useCompanyDetails = (companyId: string) => useQuery({
        queryKey: ['company', companyId],
        queryFn: async () => {
            const { data } = await api.get(`/companies/${companyId}`);
            return data as Company;
        },
        enabled: !!companyId
    });

    const updateCompany = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Company> }) => {
            const response = await api.put(`/companies/${id}`, data);
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['company', variables.id] });
            toast.success('Profil perusahaan berhasil diperbarui');
        },
        onError: () => {
            toast.error('Gagal memperbarui profil perusahaan');
        }
    });

    const updateSettings = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const response = await api.put(`/companies/${id}/settings`, data);
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['company', variables.id] });
            toast.success('Pengaturan berhasil disimpan');
        },
        onError: () => {
            toast.error('Gagal menyimpan pengaturan');
        }
    });

    return {
        useCompanyDetails,
        updateCompany,
        updateSettings
    };
}
