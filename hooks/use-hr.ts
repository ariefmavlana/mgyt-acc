
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// Types
export interface Employee {
    id: string;
    nik: string;
    nama: string;
    jabatan: string;
    departemen: string;
    status: string;
    tanggalMasuk: string;
    gajiPokok: number;
}

export interface Payroll {
    id: string;
    periode: string;
    tanggalBayar: string;
    totalPenghasilan: number;
    totalPotongan: number;
    netto: number;
    karyawan: {
        nama: string;
        nik: string;
        jabatan: string;
    };
}

// Hook
export function useHR() {
    const queryClient = useQueryClient();

    // Fetch Employees
    const useEmployees = (filters?: { search?: string, department?: string }) => {
        return useQuery({
            queryKey: ['employees', filters],
            queryFn: async () => {
                const params = new URLSearchParams();
                if (filters?.search) params.append('search', filters.search);
                if (filters?.department) params.append('department', filters.department);

                const { data } = await api.get(`/hr/employees?${params.toString()}`);
                return data.data as Employee[];
            }
        });
    };

    // Fetch Payrolls
    const usePayrolls = (period?: string) => {
        return useQuery({
            queryKey: ['payrolls', period],
            queryFn: async () => {
                const params = new URLSearchParams();
                if (period) params.append('period', period);

                const { data } = await api.get(`/hr/payrolls?${params.toString()}`);
                return data.data as Payroll[];
            }
        });
    };

    // Create Employee
    const createEmployee = useMutation({
        mutationFn: async (newEmployee: any) => {
            const { data } = await api.post('/hr/employees', newEmployee);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
        }
    });

    // Generate Payroll
    const generatePayroll = useMutation({
        mutationFn: async (payload: { period: string, date: string }) => {
            const { data } = await api.post('/hr/payrolls/generate', payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payrolls'] });
        }
    });

    return {
        useEmployees,
        usePayrolls,
        createEmployee,
        generatePayroll
    };
}
