import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useCompany } from './use-company';

export interface Project {
    id: string;
    kodeProyek: string;
    namaProyek: string;
    status: string;
}

export function useProject() {
    const { currentCompany } = useCompany();

    const useProjects = () => {
        return useQuery({
            queryKey: ['projects', currentCompany?.id],
            queryFn: async () => {
                if (!currentCompany?.id) return [];
                const { data } = await api.get('/projects');
                return data.data as Project[];
            },
            enabled: !!currentCompany?.id,
        });
    };

    return {
        useProjects
    };
}
