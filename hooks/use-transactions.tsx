'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useCompany } from './use-company';

interface Transaction {
    id: string;
    nomorTransaksi: string;
    deskripsi: string;
    tanggal: string;
    tipe: string;
    total: number;
    statusPembayaran: string;
    isVoid: boolean;
}

interface TransactionsResponse {
    transactions: Transaction[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        nextCursor: string | null;
    };
}

interface UseTransactionsOptions {
    limit?: number;
    search?: string;
    startDate?: Date;
    endDate?: Date;
    type?: string;
}

export function useTransactions(options: UseTransactionsOptions = {}) {
    const { currentCompany } = useCompany();
    const { limit = 20, search, startDate, endDate, type } = options;

    return useInfiniteQuery({
        queryKey: ['transactions', currentCompany?.id, { limit, search, startDate, endDate, type }],
        queryFn: async ({ pageParam }) => {
            if (!currentCompany) throw new Error('No company selected');

            const params: any = {
                perusahaanId: currentCompany.id,
                limit,
                search,
                cursor: pageParam || undefined
            };

            if (startDate) params.startDate = startDate.toISOString();
            if (endDate) params.endDate = endDate.toISOString();
            if (type) params.type = type;

            const { data } = await api.get<TransactionsResponse>('/transactions', { params });
            return data;
        },
        initialPageParam: null as string | null,
        getNextPageParam: (lastPage) => lastPage.pagination.nextCursor || undefined,
        enabled: !!currentCompany,
        staleTime: 60 * 1000,
    });
}
