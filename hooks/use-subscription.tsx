'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Tier } from '@/lib/tier-config';

export interface Paket {
    id: string;
    kode: string;
    nama: string;
    tier: Tier;
    deskripsi?: string;
}

export interface SubscriptionRequest {
    id: string;
    perusahaanId: string;
    requester: {
        id: string;
        namaLengkap: string;
        email: string;
    };
    paketTarget: Paket;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    catatan?: string;
    tanggalApproval?: string;
    alasanPenolakan?: string;
    createdAt: string;
}

export function useSubscription() {
    const queryClient = useQueryClient();

    const useAvailablePackages = () => {
        return useQuery({
            queryKey: ['available-packages'],
            queryFn: async () => {
                const { data } = await api.get('/system/subscription/packages');
                return data as Paket[];
            }
        });
    };

    const useSubscriptionRequests = () => {
        return useQuery({
            queryKey: ['subscription-requests'],
            queryFn: async () => {
                const { data } = await api.get('/system/subscription/requests');
                return data as SubscriptionRequest[];
            }
        });
    };

    const createRequest = useMutation({
        mutationFn: async (payload: { paketTier: Tier; catatan?: string }) => {
            const { data } = await api.post('/system/subscription/requests', payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subscription-requests'] });
            toast.success('Permintaan upgrade berhasil dikirim');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Gagal mengirim permintaan');
        }
    });

    const approveRequest = useMutation({
        mutationFn: async ({ id, status, alasanPenolakan }: { id: string; status: 'APPROVED' | 'REJECTED'; alasanPenolakan?: string }) => {
            const { data } = await api.put(`/system/subscription/requests/${id}/approve`, { status, alasanPenolakan });
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['subscription-requests'] });
            queryClient.invalidateQueries({ queryKey: ['companies'] }); // Invalidate company to update tier UI
            toast.success(data.status === 'APPROVED' ? 'Permintaan disetujui' : 'Permintaan ditolak');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Gagal memproses permintaan');
        }
    });

    return {
        useAvailablePackages,
        useSubscriptionRequests,
        createRequest,
        approveRequest
    };
}
