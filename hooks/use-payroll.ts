import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

export function usePayroll() {
    const queryClient = useQueryClient();

    const useHistory = (period?: string) => {
        return useQuery({
            queryKey: ['payroll-history', period],
            queryFn: async () => {
                const response = await api.get('/payroll/history', {
                    params: { period }
                });
                return response.data;
            }
        });
    };

    const processPayroll = useMutation({
        mutationFn: async (data: { period: string; employeeId?: string; tanggalBayar: string | Date }) => {
            const response = await api.post('/payroll/process', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payroll-history'] });
            toast.success('Payroll berhasil diproses');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Gagal memproses payroll');
        }
    });

    const postToJournal = useMutation({
        mutationFn: async (data: { period: string }) => {
            const response = await api.post('/payroll/post', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payroll-history'] });
            toast.success('Payroll berhasil diposting ke jurnal');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Gagal melakukan posting payroll');
        }
    });

    return {
        useHistory,
        processPayroll,
        postToJournal
    };
}
