'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Loader2, Building2, MoreHorizontal, Pencil, Trash2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useOrganization, CostCenter } from '@/hooks/use-organization';
import { useDebounce } from '@/hooks/use-debounce';
import { OrganizationForm } from '@/components/organization/organization-form';
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

export default function CostCentersPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);

    const {
        useCostCenters,
        createCostCenter,
        updateCostCenter,
        deleteCostCenter
    } = useOrganization();

    const { data: costCenters, isLoading, isError } = useCostCenters();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedCC, setSelectedCC] = useState<CostCenter | null>(null);
    const [idToDelete, setIdToDelete] = useState<string | null>(null);

    const filteredCC = costCenters?.filter(cc =>
        cc.nama.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        cc.kode.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    const handleCreate = () => {
        setSelectedCC(null);
        setIsFormOpen(true);
    };

    const handleEdit = (cc: CostCenter) => {
        setSelectedCC(cc);
        setIsFormOpen(true);
    };

    const handleDelete = async () => {
        if (!idToDelete) return;
        try {
            await deleteCostCenter.mutateAsync(idToDelete);
        } catch (error) {
            console.error(error);
        } finally {
            setIdToDelete(null);
        }
    };

    const handleFormSubmit = async (data: any) => {
        if (selectedCC) {
            await updateCostCenter.mutateAsync({ id: selectedCC.id, data });
        } else {
            await createCostCenter.mutateAsync(data);
        }
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Cost Center</h1>
                    <p className="text-slate-500 mt-1">Kelola pusat biaya untuk pemantauan pengeluaran departemen.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" /> Tambah Cost Center
                    </Button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Cari nama atau kode cost center..."
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
                        <CardTitle className="text-lg font-bold text-slate-700">Daftar Cost Center</CardTitle>
                        <Badge variant="outline" className="bg-white text-slate-500 font-medium">
                            Total: {filteredCC?.length || 0}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/30">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[120px] font-semibold text-slate-900">Kode</TableHead>
                                    <TableHead className="font-semibold text-slate-900">Nama Cost Center</TableHead>
                                    <TableHead className="font-semibold text-slate-900">Induk</TableHead>
                                    <TableHead className="font-semibold text-slate-900">Manager</TableHead>
                                    <TableHead className="font-semibold text-slate-900">Status</TableHead>
                                    <TableHead className="text-right font-semibold text-slate-900">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-48 text-center bg-white">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                <span className="text-slate-500 font-medium">Memuat data...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : isError ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-48 text-center bg-white">
                                            <div className="flex flex-col items-center justify-center gap-3 text-rose-500">
                                                <X className="h-8 w-8" />
                                                <span className="font-medium">Gagal memuat data.</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredCC && filteredCC.length > 0 ? (
                                    filteredCC.map((cc) => (
                                        <TableRow key={cc.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="font-bold text-primary">{cc.kode}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-slate-900">{cc.nama}</span>
                                                    {cc.deskripsi && <span className="text-xs text-slate-400 truncate max-w-[250px]">{cc.deskripsi}</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-slate-600">{cc.parent?.nama || '-'}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-slate-600 font-medium">{cc.manager || '-'}</span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={cn(
                                                        "px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase",
                                                        cc.isAktif ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-100 text-slate-600 border-slate-200"
                                                    )}
                                                    variant="outline"
                                                >
                                                    {cc.isAktif ? 'Aktif' : 'Non-Aktif'}
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
                                                        <DropdownMenuItem onClick={() => handleEdit(cc)} className="cursor-pointer">
                                                            <Pencil className="mr-2 h-4 w-4" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => setIdToDelete(cc.id)} className="cursor-pointer text-rose-600 focus:text-rose-600">
                                                            <Trash2 className="mr-2 h-4 w-4" /> Hapus
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-48 text-center bg-white">
                                            <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                                                <Building2 className="h-10 w-10 opacity-20" />
                                                <p className="font-medium text-slate-500">Belum ada data cost center.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <OrganizationForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                title={selectedCC ? 'Edit Cost Center' : 'Tambah Cost Center'}
                initialData={selectedCC}
                parents={costCenters}
                onSubmit={handleFormSubmit}
                isLoading={createCostCenter.isPending || updateCostCenter.isPending}
            />

            <AlertDialog open={!!idToDelete} onOpenChange={(open) => !open && setIdToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Cost Center?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Pastikan tidak ada transaksi yang terhubung dengan cost center ini.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700">
                            {deleteCostCenter.isPending ? 'Menghapus...' : 'Hapus'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
