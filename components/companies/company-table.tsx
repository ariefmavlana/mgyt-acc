'use client';

import * as React from 'react';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
} from '@tanstack/react-table';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { TierBadge } from './tier-badge';
import { Building2, MoreHorizontal, Settings, Trash2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';

interface CompanyData {
    id: string;
    nama: string;
    kode: string;
    tier: string;
    email: string | null;
    telepon: string | null;
    mataUangUtama: string;
}

interface CompanyTableProps {
    data: CompanyData[];
    onDelete?: (id: string) => void;
}

export function CompanyTable({ data, onDelete }: CompanyTableProps) {
    const router = useRouter();

    const columns = React.useMemo<ColumnDef<CompanyData>[]>(() => [
        {
            accessorKey: 'nama',
            header: 'Nama Perusahaan',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg">
                        <Building2 className="h-4 w-4 text-slate-500" />
                    </div>
                    <div>
                        <div className="font-medium text-slate-900">{row.getValue('nama')}</div>
                        <div className="text-xs text-slate-500">{row.original.kode}</div>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'tier',
            header: 'Paket',
            cell: ({ row }) => <TierBadge tier={row.getValue('tier') as string || 'UMKM'} />,
        },
        {
            accessorKey: 'email',
            header: 'Kontak',
            cell: ({ row }) => (
                <div className="text-sm">
                    <div>{row.getValue('email')}</div>
                    <div className="text-xs text-slate-500">{row.original.telepon}</div>
                </div>
            ),
        },
        {
            accessorKey: 'mataUangUtama',
            header: 'Mata Uang',
            cell: ({ row }) => <span className="text-sm font-mono">{row.getValue('mataUangUtama')}</span>,
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const company = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => router.push(`/companies/${company.id}`)}>
                                <Settings className="mr-2 h-4 w-4" />
                                <span className="ml-2">Pengaturan</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-50" onClick={() => onDelete?.(company.id)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span className="ml-2">Hapus</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ], [router, onDelete]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <div className="space-y-4">
            <div className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                    className="hover:bg-slate-50/50 transition-colors"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-slate-500">
                                    Tidak ada data perusahaan.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Sebelumnya
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Selanjutnya
                </Button>
            </div>
        </div>
    );
}
