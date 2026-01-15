import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

export interface RecurringTransaction {
    id: string;
    kode: string;
    nama: string;
    tipe: string;
    frekuensi: string;
    tanggalExekusiBerikutnya: string;
    isAktif: boolean;
    autoPosting: boolean;
    jumlahEksekusi: number;
    jumlahBerhasil: number;
    jumlahGagal: number;
    riwayat?: RecurringHistory[];
}

export interface RecurringHistory {
    id: string;
    tanggalDijadwalkan: string;
    tanggalDiproses: string;
    status: string;
    errorMessage?: string | null;
}

export function useRecurring() {
    const queryClient = useQueryClient();

    const useRecurringTransactions = () => {
        return useQuery({
            queryKey: ['recurring-transactions'],
            queryFn: async () => {
                const { data } = await api.get('/recurring');
                return data.data as RecurringTransaction[];
            }
        });
    };

    const createRecurring = useMutation({
        mutationFn: async (payload: any) => {
            const { data } = await api.post('/recurring', payload);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] });
            toast.success('Transaksi rekuren berhasil dibuat');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Gagal membuat transaksi rekuren');
        }
    });

    const triggerRecurring = useMutation({
        mutationFn: async () => {
            const { data } = await api.post('/recurring/trigger');
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] });
            toast.success('Proses rekuren berhasil dipicu');
            console.log('Trigger Results:', data);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Gagal memicu proses rekuren');
        }
    });

    return {
        useRecurringTransactions,
        createRecurring,
        triggerRecurring
    };
}
