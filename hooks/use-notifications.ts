import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Notification {
    id: string;
    judul: string;
    pesan: string;
    tipe: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
    kategori?: string | null;
    referensiId?: string | null;
    urlAction?: string | null;
    dibaca: boolean;
    tanggalDibaca?: string | null;
    createdAt: string;
}

export function useNotifications() {
    const queryClient = useQueryClient();

    const useLatestNotifications = () => {
        return useQuery({
            queryKey: ['notifications'],
            queryFn: async () => {
                const { data } = await api.get('/notifications');
                return data.data as Notification[];
            }
        });
    };

    const useUnreadCount = () => {
        return useQuery({
            queryKey: ['notifications', 'unread-count'],
            queryFn: async () => {
                const { data } = await api.get('/notifications/unread-count');
                return data.count as number;
            },
            refetchInterval: 60000 // Poll every minute
        });
    };

    const markAsRead = useMutation({
        mutationFn: async (id: string) => {
            await api.put(`/notifications/${id}/read`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    const markAllAsRead = useMutation({
        mutationFn: async () => {
            await api.post('/notifications/read-all');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    return {
        useLatestNotifications,
        useUnreadCount,
        markAsRead,
        markAllAsRead
    };
}
