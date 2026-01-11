'use client';

import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, MoreHorizontal, FileText } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { id as localeID } from 'date-fns/locale';
import Link from 'next/link';

interface Transaction {
    id: string;
    nomorTransaksi: string;
    tanggal: string;
    tipe: string;
    deskripsi: string;
    total: number;
    statusPembayaran: string;
    isVoid: boolean;
}

interface TransactionTableProps {
    transactions: Transaction[];
    isLoading?: boolean;
}

export function TransactionTable({ transactions, isLoading }: TransactionTableProps) {
    if (isLoading) {
        return (
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 w-full bg-slate-100 animate-pulse rounded-lg" />
                ))}
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-lg border border-dashed">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900">Belum ada transaksi</h3>
                <p className="text-slate-500 mt-1">Mulai dengan membuat transaksi baru.</p>
                <Button asChild variant="outline" className="mt-6">
                    <Link href="/dashboard/transactions/new">Buat Transaksi</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50/50">
                        <TableHead className="w-[120px]">Tanggal</TableHead>
                        <TableHead className="w-[150px]">No. Transaksi</TableHead>
                        <TableHead>Deskripsi</TableHead>
                        <TableHead className="w-[120px]">Tipe</TableHead>
                        <TableHead className="text-right w-[150px]">Nilai (IDR)</TableHead>
                        <TableHead className="w-[100px]">Status</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map((transaction) => (
                        <TableRow key={transaction.id} className="hover:bg-slate-50/50 transition-colors group">
                            <TableCell className="font-medium">
                                {format(new Date(transaction.tanggal), 'dd MMM yyyy', { locale: localeID })}
                            </TableCell>
                            <TableCell className="font-mono text-xs text-slate-500">
                                {transaction.nomorTransaksi}
                            </TableCell>
                            <TableCell>
                                <div className="text-sm font-medium text-slate-900 line-clamp-1">
                                    {transaction.deskripsi}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="font-normal capitalize bg-slate-50">
                                    {transaction.tipe.toLowerCase().replace('_', ' ')}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right font-bold text-slate-900">
                                {new Intl.NumberFormat('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR',
                                    minimumFractionDigits: 0
                                }).format(transaction.total)}
                            </TableCell>
                            <TableCell>
                                {transaction.isVoid ? (
                                    <Badge variant="destructive" className="animate-pulse">Dibatalkan</Badge>
                                ) : (
                                    <Badge variant="default" className="bg-emerald-500 text-white hover:bg-emerald-600">Terposting</Badge>
                                )}
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40">
                                        <DropdownMenuItem asChild>
                                            <Link href={`/dashboard/transactions/${transaction.id}`} className="cursor-pointer">
                                                <Eye className="mr-2 h-4 w-4" /> Detail
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600 cursor-pointer">
                                            Batalkan
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
