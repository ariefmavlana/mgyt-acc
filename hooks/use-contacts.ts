import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Contact {
    id: string;
    nama: string;
    kodeKontak: string;
    email?: string | null;
    telepon?: string | null;
}

export function useContacts() {
    const useCustomers = () => {
        return useQuery({
            queryKey: ['customers'],
            queryFn: async () => {
                const { data } = await api.get('/contacts/customers');
                return data.data as Contact[];
            }
        });
    };

    const useVendors = () => {
        return useQuery({
            queryKey: ['vendors'],
            queryFn: async () => {
                const { data } = await api.get('/contacts/vendors');
                return data.data as Contact[];
            }
        });
    };

    return {
        useCustomers,
        useVendors
    };
}
