'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserPlus, Search, Download, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useHR } from '@/hooks/use-hr';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { EmployeeForm } from '@/components/hr/employee-form';
import { Employee } from '@/hooks/use-hr';

export default function EmployeesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const { useEmployees } = useHR();
    const { data: employees, isLoading } = useEmployees({ search: searchTerm });
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    // Function to get initials for avatar
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

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Karyawan</h1>
                    <p className="text-slate-500 mt-1">Kelola data karyawan, kontrak, dan informasi penggajian.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-slate-200">
                        <Download className="mr-2 h-4 w-4" /> Ekspor Data
                    </Button>
                    <Button className="bg-primary hover:bg-primary/90" onClick={handleCreate}>
                        <UserPlus className="mr-2 h-4 w-4" /> Tambah Karyawan
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-slate-200">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Cari nama atau NIK..."
                        className="pl-10 border-slate-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">Semua Departemen</Button>
                    <Button variant="outline">Status: Aktif</Button>
                </div>
            </div>

            {/* Employee Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Daftar Karyawan</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[300px]">Nama Karyawan</TableHead>
                                <TableHead>Posisi / Role</TableHead>
                                <TableHead>Departemen</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Tanggal Bergabung</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                            <span>Memuat data karyawan...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : employees && employees.length > 0 ? (
                                employees.map((emp) => (
                                    <TableRow key={emp.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarFallback>{getInitials(emp.nama)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{emp.nama}</div>
                                                    <div className="text-sm text-slate-500">NIK: {emp.nik}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{emp.jabatan}</TableCell>
                                        <TableCell>{emp.departemen}</TableCell>
                                        <TableCell>
                                            <Badge variant={emp.status === 'AKTIF' ? 'default' : 'secondary'}>
                                                {emp.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {emp.tanggalMasuk ?
                                                format(new Date(emp.tanggalMasuk), 'dd MMM yyyy', { locale: idLocale })
                                                : '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={() => handleEdit(emp)}>Detail</Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                        Data karyawan tidak ditemukan. Silakan tambah karyawan baru.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
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
