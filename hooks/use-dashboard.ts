
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface DashboardStats {
    revenue: number;
    expense: number;
    netProfit: number;
    pendingApprovals: number;
    activeUsers: number;
    cashBalance: number;
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
