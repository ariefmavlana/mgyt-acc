'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Loader2, Building2, MoreHorizontal, Pencil, Trash2, X, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useOrganization, ProfitCenter } from '@/hooks/use-organization';
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

export default function ProfitCentersPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);

    const {
        useProfitCenters,
        createProfitCenter,
        updateProfitCenter,
        deleteProfitCenter
    } = useOrganization();

    const { data: profitCenters, isLoading, isError } = useProfitCenters();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedPC, setSelectedPC] = useState<ProfitCenter | null>(null);
    const [idToDelete, setIdToDelete] = useState<string | null>(null);

    const filteredPC = profitCenters?.filter(pc =>
        pc.nama.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        pc.kode.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    const handleCreate = () => {
        setSelectedPC(null);
        setIsFormOpen(true);
    };

    const handleEdit = (pc: ProfitCenter) => {
        setSelectedPC(pc);
        setIsFormOpen(true);
    };

    const handleDelete = async () => {
        if (!idToDelete) return;
        try {
            await deleteProfitCenter.mutateAsync(idToDelete);
        } catch (error) {
            console.error(error);
        } finally {
            setIdToDelete(null);
        }
    };

    const handleFormSubmit = async (data: any) => {
        if (selectedPC) {
            await updateProfitCenter.mutateAsync({ id: selectedPC.id, data });
        } else {
            await createProfitCenter.mutateAsync(data);
        }
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Profit Center</h1>
                    <p className="text-slate-500 mt-1">Kelola pusat laba untuk pemantauan pendapatan dan margin per unit.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" /> Tambah Profit Center
                    </Button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Cari nama atau kode profit center..."
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
                        <CardTitle className="text-lg font-bold text-slate-700">Daftar Profit Center</CardTitle>
                        <Badge variant="outline" className="bg-white text-slate-500 font-medium">
                            Total: {filteredPC?.length || 0}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/30">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[120px] font-semibold text-slate-900">Kode</TableHead>
                                    <TableHead className="font-semibold text-slate-900">Nama Profit Center</TableHead>
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
                                ) : filteredPC && filteredPC.length > 0 ? (
                                    filteredPC.map((pc) => (
                                        <TableRow key={pc.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="font-bold text-primary">{pc.kode}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-slate-900">{pc.nama}</span>
                                                    {pc.deskripsi && <span className="text-xs text-slate-400 truncate max-w-[250px]">{pc.deskripsi}</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-slate-600">{pc.parent?.nama || '-'}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-slate-600 font-medium">{pc.manager || '-'}</span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={cn(
                                                        "px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase",
                                                        pc.isAktif ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-100 text-slate-600 border-slate-200"
                                                    )}
                                                    variant="outline"
                                                >
                                                    {pc.isAktif ? 'Aktif' : 'Non-Aktif'}
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
                                                        <DropdownMenuItem onClick={() => handleEdit(pc)} className="cursor-pointer">
                                                            <Pencil className="mr-2 h-4 w-4" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => setIdToDelete(pc.id)} className="cursor-pointer text-rose-600 focus:text-rose-600">
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
                                                <BarChart3 className="h-10 w-10 opacity-20" />
                                                <p className="font-medium text-slate-500">Belum ada data profit center.</p>
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
                title={selectedPC ? 'Edit Profit Center' : 'Tambah Profit Center'}
                initialData={selectedPC}
                parents={profitCenters}
                onSubmit={handleFormSubmit}
                isLoading={createProfitCenter.isPending || updateProfitCenter.isPending}
            />

            <AlertDialog open={!!idToDelete} onOpenChange={(open) => !open && setIdToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Profit Center?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Pastikan tidak ada transaksi yang terhubung dengan profit center ini.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700">
                            {deleteProfitCenter.isPending ? 'Menghapus...' : 'Hapus'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
