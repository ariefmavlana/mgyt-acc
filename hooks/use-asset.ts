import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export const useAsset = () => {
    const queryClient = useQueryClient();

    const useAssets = () => {
        return useQuery({
            queryKey: ['assets'],
            queryFn: async () => {
                const response = await api.get('/assets');
                return response.data;
            }
        });
    };

    const useAssetDetail = (id: string) => {
        return useQuery({
            queryKey: ['assets', id],
            queryFn: async () => {
                const response = await api.get(`/assets/${id}`);
                return response.data;
            },
            enabled: !!id
        });
    };

    const createAsset = useMutation({
        mutationFn: async (data: any) => {
            const response = await api.post('/assets', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assets'] });
        }
    });

    const calculateDepreciation = useMutation({
        mutationFn: async ({ id, tanggal }: { id: string; tanggal: string }) => {
            const response = await api.post(`/assets/${id}/depreciate`, { tanggal });
            return response.data;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['assets'] });
            queryClient.invalidateQueries({ queryKey: ['assets', id] });
        }
    });

    const deleteAsset = useMutation({
        mutationFn: async (id: string) => {
            const response = await api.delete(`/assets/${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assets'] });
        }
    });

    return {
        useAssets,
        useAssetDetail,
        createAsset,
        calculateDepreciation,
        deleteAsset
    };
};
