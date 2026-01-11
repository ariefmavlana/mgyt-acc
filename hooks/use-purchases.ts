
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Purchase {
    id: string;
    nomorTransaksi: string;
    tanggal: string;
    tanggalJatuhTempo: string;
    pemasok?: {
        nama: string;
    };
    total: number;
    statusPembayaran: string;
    deskripsi: string;
}

export interface PurchaseResponse {
    data: Purchase[];
    pagination: {
        total: number;
        page: number;
        totalPages: number;
    };
}

export function usePurchases(params?: { page?: number; limit?: number }) {
    return useQuery({
        queryKey: ['purchases', params],
        queryFn: async () => {
            const searchParams = new URLSearchParams();
            if (params?.page) searchParams.append('page', String(params.page));
            if (params?.limit) searchParams.append('limit', String(params.limit));

            const { data } = await api.get(`/purchases?${searchParams.toString()}`);
            return data as PurchaseResponse;
        }
    });
}
