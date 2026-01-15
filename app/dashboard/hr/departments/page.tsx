'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Loader2, Building2, ChevronRight, MoreHorizontal, Pencil, Trash2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useHR, Department } from '@/hooks/use-hr';
import { useDebounce } from '@/hooks/use-debounce';
import { DepartmentForm } from './department-form';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DepartmentsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);

    const { useDepartments, deleteDepartment } = useHR();
    const { data: departments, isLoading, isError } = useDepartments();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
    const [idToDelete, setIdToDelete] = useState<string | null>(null);

    const filteredDepartments = departments?.filter(dept =>
        dept.nama.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        dept.kode.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    const handleCreate = () => {
        setSelectedDepartment(null);
        setIsFormOpen(true);
    };

    const handleEdit = (dept: Department) => {
        setSelectedDepartment(dept);
        setIsFormOpen(true);
    };

    const handleDelete = async () => {
        if (!idToDelete) return;
        try {
            await deleteDepartment.mutateAsync(idToDelete);
            toast.success('Departemen berhasil dihapus');
        } catch (error) {
            toast.error('Gagal menghapus departemen');
            console.error(error);
        } finally {
            setIdToDelete(null);
        }
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Departemen</h1>
                    <p className="text-slate-500 mt-1">Kelola struktur departemen dan divisi perusahaan Anda.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" /> Tambah Departemen
                    </Button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Cari nama atau kode departemen..."
                        className="pl-10 h-11 bg-white border-slate-200 focus:border-primary focus:ring-primary/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold text-slate-700">Daftar Departemen</CardTitle>
                        <Badge variant="outline" className="bg-white text-slate-500 font-medium">
                            Total: {filteredDepartments?.length || 0}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/30">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[120px] font-semibold text-slate-900">Kode</TableHead>
                                    <TableHead className="font-semibold text-slate-900">Nama Departemen</TableHead>
                                    <TableHead className="font-semibold text-slate-900">Kepala / Manager</TableHead>
                                    <TableHead className="font-semibold text-slate-900">Status</TableHead>
                                    <TableHead className="text-right font-semibold text-slate-900">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-48 text-center bg-white">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                <span className="text-slate-500 font-medium">Memuat data...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : isError ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-48 text-center bg-white">
                                            <div className="flex flex-col items-center justify-center gap-3 text-rose-500">
                                                <X className="h-8 w-8" />
                                                <span className="font-medium">Gagal memuat data.</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredDepartments && filteredDepartments.length > 0 ? (
                                    filteredDepartments.map((dept) => (
                                        <TableRow key={dept.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="font-bold text-primary">{dept.kode}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-slate-900">{dept.nama}</span>
                                                    {dept.deskripsi && <span className="text-xs text-slate-400 truncate max-w-[250px]">{dept.deskripsi}</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-slate-600 font-medium">{dept.kepala || '-'}</span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={cn(
                                                        "px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase",
                                                        dept.isAktif ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-100 text-slate-600 border-slate-200"
                                                    )}
                                                    variant="outline"
                                                >
                                                    {dept.isAktif ? 'Aktif' : 'Non-Aktif'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100">
                                                            <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-40">
                                                        <DropdownMenuItem onClick={() => handleEdit(dept)} className="cursor-pointer">
                                                            <Pencil className="mr-2 h-4 w-4" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => setIdToDelete(dept.id)} className="cursor-pointer text-rose-600 focus:text-rose-600">
                                                            <Trash2 className="mr-2 h-4 w-4" /> Hapus
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-48 text-center bg-white">
                                            <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                                                <Building2 className="h-10 w-10 opacity-20" />
                                                <p className="font-medium text-slate-500">Belum ada data departemen.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <DepartmentForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                department={selectedDepartment}
            />

            <AlertDialog open={!!idToDelete} onOpenChange={(open) => !open && setIdToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Departemen?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Pastikan tidak ada karyawan yang masih terhubung dengan departemen ini.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700">
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
