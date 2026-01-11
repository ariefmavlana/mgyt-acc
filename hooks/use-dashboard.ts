
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface DashboardSummary {
    receivables: number;
    payables: number;
    netIncome: number;
    assets: number;
    liabilities: number;
    equity: number;
}

export function useDashboard() {
    // We can fetch multiple endpoints or a single dashboard endpoint.
    // Ideally, we'd have a specific /dashboard/summary endpoint, but we can compose it here.

    return useQuery({
        queryKey: ['dashboard-summary'],
        queryFn: async () => {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const endOfDay = new Date().toISOString();

            // Parallel fetch
            const [arRes, apRes, isRes, bsRes] = await Promise.all([
                api.get('/reports/aging/ar'),
                api.get('/reports/aging/ap'),
                api.get(`/reports/income-statement?startDate=${startOfMonth}&endDate=${endOfDay}`),
                api.get(`/reports/balance-sheet?endDate=${endOfDay}`)
            ]);

            return {
                receivables: arRes.data.totalReceivable || 0,
                payables: apRes.data.totalPayable || 0,
                netIncome: isRes.data.summary.netIncome || 0,
                assets: bsRes.data.summary.totalAssets || 0,
                liabilities: bsRes.data.summary.totalLiabilities || 0,
                equity: bsRes.data.summary.totalEquity || 0,
            } as DashboardSummary;
        }
    });
}
