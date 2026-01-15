
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

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

export function useDashboard() {
    return useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const { data } = await axios.get<DashboardStats>('/api/dashboard/stats');
            return data;
        }
    });
}
