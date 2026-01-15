
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
    email?: string | null;
    telepon?: string | null;
    alamat?: string | null;
    statusPernikahan?: string | null;
}

export interface Department {
    id: string;
    kode: string;
    nama: string;
    kepala?: string | null;
    deskripsi?: string | null;
    isAktif: boolean;
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
    const useEmployees = (filters?: { search?: string, department?: string, status?: string }) => {
        return useQuery({
            queryKey: ['employees', filters],
            queryFn: async () => {
                const params = new URLSearchParams();
                if (filters?.search) params.append('search', filters.search);
                if (filters?.department) params.append('department', filters.department);
                if (filters?.status) params.append('status', filters.status);

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
        mutationFn: async (newEmployee: Partial<Employee>) => {
            const { data } = await api.post('/hr/employees', newEmployee);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
        }
    });

    // Update Employee
    const updateEmployee = useMutation({
        mutationFn: async ({ id, data }: { id: string, data: Partial<Employee> }) => {
            const res = await api.put(`/hr/employees/${id}`, data);
            return res.data;
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

    // Departments
    const useDepartments = () => {
        return useQuery({
            queryKey: ['departments'],
            queryFn: async () => {
                const { data } = await api.get('/hr/departments');
                return data.data as Department[];
            }
        });
    };

    const createDepartment = useMutation({
        mutationFn: async (dept: Omit<Department, 'id'>) => {
            const { data } = await api.post('/hr/departments', dept);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments'] });
        }
    });

    const updateDepartment = useMutation({
        mutationFn: async ({ id, data }: { id: string, data: Partial<Omit<Department, 'id'>> }) => {
            const res = await api.put(`/hr/departments/${id}`, data);
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments'] });
        }
    });

    const deleteDepartment = useMutation({
        mutationFn: async (id: string) => {
            const res = await api.delete(`/hr/departments/${id}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments'] });
        }
    });

    return {
        useEmployees,
        usePayrolls,
        useDepartments,
        createEmployee,
        updateEmployee,
        createDepartment,
        updateDepartment,
        deleteDepartment,
        generatePayroll
    };
}
