import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useCompany } from './use-company';

export interface Account {
    id: string;
    kodeAkun: string;
    namaAkun: string;
    tipe: string;
    isHeader: boolean;
}

export function useCOA() {
    const { currentCompany } = useCompany();

    const useAccounts = () => {
        return useQuery({
            queryKey: ['coa-accounts', currentCompany?.id],
            queryFn: async () => {
                if (!currentCompany?.id) return [];
                const { data } = await api.get('/coa');
                // We need a flat list for dropdowns, coa might return a tree
                const flattenNodes = (nodes: any[]): Account[] => {
                    return nodes.reduce((acc, node) => {
                        const { children, ...rest } = node;
                        acc.push(rest);
                        if (children && children.length > 0) {
                            acc.push(...flattenNodes(children));
                        }
                        return acc;
                    }, [] as Account[]);
                };
                return flattenNodes(data);
            },
            enabled: !!currentCompany?.id,
        });
    };

    return {
        useAccounts
    };
}
