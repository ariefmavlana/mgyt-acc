'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserPlus, Search, Download, Loader2, Filter, ChevronRight, X, Briefcase, Building2, Clock } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useHR } from '@/hooks/use-hr';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { EmployeeForm } from '@/components/hr/employee-form';
import { Employee } from '@/hooks/use-hr';
import { useDebounce } from '@/hooks/use-debounce';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import api from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function EmployeesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const debouncedSearch = useDebounce(searchTerm, 500);

    const { useEmployees, useDepartments } = useHR();
    const { data: employees, isLoading, isError } = useEmployees({
        search: debouncedSearch,
        department: departmentFilter,
        status: statusFilter
    });
    const { data: allDepartments } = useDepartments();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    // Get departments for the filter dropdown
    const departmentsList = useMemo(() => {
        if (!allDepartments) return [];
        return allDepartments.map(d => d.nama).sort();
    }, [allDepartments]);

    const handleExport = async () => {
        try {
            const toastId = toast.loading('Menyiapkan file ekspor...');
            const params = new URLSearchParams();
            if (debouncedSearch) params.append('search', debouncedSearch);
            if (departmentFilter !== 'ALL') params.append('department', departmentFilter);
            if (statusFilter !== 'ALL') params.append('status', statusFilter);

            const response = await api.get(`/hr/employees/export?${params.toString()}`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Karyawan-${format(new Date(), 'yyyyMMdd')}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.dismiss(toastId);
            toast.success('Ekspor data karyawan berhasil');
        } catch (error) {
            toast.error('Gagal mengekspor data karyawan');
            console.error(error);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const handleEdit = (emp: Employee) => {
        setSelectedEmployee(emp);
        setIsFormOpen(true);
    };

    const handleCreate = () => {
        setSelectedEmployee(null);
        setIsFormOpen(true);
    };

    const resetFilters = () => {
        setSearchTerm('');
        setDepartmentFilter('ALL');
        setStatusFilter('ALL');
    };

    const hasActiveFilters = searchTerm || departmentFilter !== 'ALL' || statusFilter !== 'ALL';

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Karyawan</h1>
                    <p className="text-slate-500 mt-1">Kelola data karyawan, kontrak, dan informasi penggajian.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-slate-200" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" /> Ekspor Data
                    </Button>
                    <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" onClick={handleCreate}>
                        <UserPlus className="mr-2 h-4 w-4" /> Tambah Karyawan
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Cari nama atau NIK..."
                        className="pl-10 h-11 bg-white border-slate-200 focus:border-primary focus:ring-primary/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 items-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant={departmentFilter !== 'ALL' ? "default" : "outline"} className="h-11 px-4 border-slate-200">
                                <Building2 className={cn("mr-2 h-4 w-4", departmentFilter !== 'ALL' ? "text-white" : "text-slate-400")} />
                                {departmentFilter === 'ALL' ? 'Semua Departemen' : departmentFilter}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Pilih Departemen</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup value={departmentFilter} onValueChange={setDepartmentFilter}>
                                <DropdownMenuRadioItem value="ALL" className="text-sm font-medium">Semua Departemen</DropdownMenuRadioItem>
                                {departmentsList.map((dept) => (
                                    <DropdownMenuRadioItem key={dept} value={dept} className="text-sm">
                                        {dept}
                                    </DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant={statusFilter !== 'ALL' ? "default" : "outline"} className="h-11 px-4 border-slate-200">
                                <Filter className={cn("mr-2 h-4 w-4", statusFilter !== 'ALL' ? "text-white" : "text-slate-400")} />
                                Status: {statusFilter === 'ALL' ? 'Semua' : statusFilter.charAt(0) + statusFilter.slice(1).toLowerCase()}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Pilih Status</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                                <DropdownMenuRadioItem value="ALL" className="text-sm font-medium">Semua Status</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="AKTIF" className="text-sm">Aktif</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="NONAKTIF" className="text-sm">Non-Aktif</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="CUTI" className="text-sm">Cuti</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-11 w-11 text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                            onClick={resetFilters}
                            title="Reset Semua Filter"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Employee Table */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold text-slate-700">Daftar Karyawan</CardTitle>
                        <Badge variant="outline" className="bg-white text-slate-500 font-medium">
                            Total: {employees?.length || 0}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/30">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[300px] font-semibold text-slate-900">Nama Karyawan</TableHead>
                                    <TableHead className="font-semibold text-slate-900">Jabatan</TableHead>
                                    <TableHead className="font-semibold text-slate-900">Departemen</TableHead>
                                    <TableHead className="font-semibold text-slate-900">Status</TableHead>
                                    <TableHead className="font-semibold text-slate-900">Bergabung</TableHead>
                                    <TableHead className="text-right font-semibold text-slate-900">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-48 text-center bg-white">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                <span className="text-slate-500 font-medium">Memuat data karyawan...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : isError ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-48 text-center bg-white">
                                            <div className="flex flex-col items-center justify-center gap-3 text-rose-500">
                                                <X className="h-8 w-8" />
                                                <span className="font-medium">Gagal memuat data karyawan.</span>
                                                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Coba Lagi</Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : employees && employees.length > 0 ? (
                                    employees.map((emp) => (
                                        <TableRow key={emp.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 border border-slate-200 shadow-sm">
                                                        <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">{getInitials(emp.nama)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-semibold text-slate-900">{emp.nama}</div>
                                                        <div className="text-xs text-slate-500 font-medium tracking-tight">NIK: {emp.nik}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="text-sm text-slate-600 font-medium">{emp.jabatan}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="text-sm text-slate-600 font-medium">{emp.departemen}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={cn(
                                                        "px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase",
                                                        emp.status === 'AKTIF' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                                            emp.status === 'CUTI' ? "bg-amber-50 text-amber-700 border-amber-100" :
                                                                "bg-slate-100 text-slate-600 border-slate-200"
                                                    )}
                                                    variant="outline"
                                                >
                                                    <div className="flex items-center gap-1.5">
                                                        <div className={cn(
                                                            "w-1 h-1 rounded-full",
                                                            emp.status === 'AKTIF' ? "bg-emerald-500" :
                                                                emp.status === 'CUTI' ? "bg-amber-500" :
                                                                    "bg-slate-400"
                                                        )} />
                                                        {emp.status}
                                                    </div>
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="text-sm text-slate-600 font-medium">
                                                        {emp.tanggalMasuk ?
                                                            format(new Date(emp.tanggalMasuk), 'dd MMM yyyy', { locale: idLocale })
                                                            : '-'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(emp)}
                                                    className="hover:bg-primary/10 hover:text-primary font-semibold transition-colors"
                                                >
                                                    Detail
                                                    <ChevronRight className="ml-1 h-3 w-3" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-48 text-center bg-white">
                                            <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                                                <Search className="h-10 w-10 opacity-20" />
                                                <p className="font-medium text-slate-500">Data karyawan tidak ditemukan.</p>
                                                {hasActiveFilters && (
                                                    <Button variant="link" onClick={resetFilters} className="text-primary text-xs">Reset Semua Filter</Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <EmployeeForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                employee={selectedEmployee}
            />
        </div>
    );
}
