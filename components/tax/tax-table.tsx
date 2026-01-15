'use client';

import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    MoreHorizontal,
    Edit,
    Trash2,
    Plus,
    Search,
    Percent,
    Calculator,
    AlertCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { TaxForm } from './tax-form';
import { useTax, MasterPajak } from '@/hooks/use-tax';
import { toast } from 'sonner';

export function TaxTable() {
    const { useTaxes, deleteTax } = useTax();
    const { data: taxes, isLoading } = useTaxes();
    const [search, setSearch] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedTax, setSelectedTax] = useState<MasterPajak | null>(null);

    const filteredTaxes = taxes?.filter(t =>
        t.namaPajak.toLowerCase().includes(search.toLowerCase()) ||
        t.kodePajak.toLowerCase().includes(search.toLowerCase())
    );

    const handleEdit = (tax: MasterPajak) => {
        setSelectedTax(tax);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Apakah Anda yakin ingin menonaktifkan pajak ini?')) {
            try {
                await deleteTax.mutateAsync(id);
                toast.success('Pajak berhasil dinonaktifkan');
            } catch (error) {
                console.error('Failed to deactivate tax:', error);
                toast.error('Gagal menonaktifkan pajak');
            }
        }
    };

    const handleAdd = () => {
        setSelectedTax(null);
        setIsFormOpen(true);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
                <Calculator className="w-10 h-10 text-slate-300 animate-pulse" />
                <p className="text-slate-500 text-sm italic">Memuat data pajak...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Cari kode atau nama pajak..."
                        className="pl-9 bg-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button onClick={handleAdd} className="w-full md:w-auto shadow-sm">
                    <Plus className="mr-2 h-4 w-4" /> Tambah Pajak
                </Button>
            </div>

            <div className="border rounded-xl overflow-hidden bg-white shadow-sm border-slate-200/60">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead className="font-semibold text-slate-700">Kode</TableHead>
                            <TableHead className="font-semibold text-slate-700">Nama Pajak</TableHead>
                            <TableHead className="font-semibold text-slate-700">Jenis</TableHead>
                            <TableHead className="font-semibold text-slate-700 text-right">Tarif</TableHead>
                            <TableHead className="font-semibold text-slate-700">Status</TableHead>
                            <TableHead className="w-[80px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!filteredTaxes || filteredTaxes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 h-32">
                                    <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                                        <AlertCircle className="w-8 h-8" />
                                        <p>Data pajak tidak ditemukan.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredTaxes.map((tax) => (
                                <TableRow key={tax.id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell className="font-medium text-slate-900">
                                        <Badge variant="outline" className="bg-slate-50 font-mono">
                                            {tax.kodePajak}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-slate-600 font-medium">
                                        {tax.namaPajak}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100">
                                            {tax.jenis.replace(/_/g, ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end font-bold text-slate-700">
                                            {Number(tax.tarif)}<Percent className="w-3 h-3 ml-0.5" />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={tax.isAktif ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}>
                                            {tax.isAktif ? 'Aktif' : 'Nonaktif'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-36">
                                                <DropdownMenuItem onClick={() => handleEdit(tax)}>
                                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(tax.id)}
                                                    className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" /> Nonaktifkan
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <TaxForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                tax={selectedTax}
            />
        </div>
    );
}
