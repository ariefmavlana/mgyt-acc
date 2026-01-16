
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface DashboardStats {
    revenue: number;
    expense: number;
    netProfit: number;
    pendingApprovals: number;
    activeUsers: number;
    usersByRole: Record<string, number>;
    cashBalance: number;
    activePeriod: {
        nama: string;
        tahun: number;
        bulan: number;
    } | null;
}

export function useDashboard(cabangId?: string) {
    return useQuery({
        queryKey: ['dashboard-stats', cabangId],
        queryFn: async () => {
            const { data } = await api.get<DashboardStats>('/dashboard/stats', {
                params: { cabangId }
            });
            return data;
        }
    });
}
