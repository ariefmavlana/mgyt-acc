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
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Transaction {
    id: string;
    deskripsi: string;
    debit: number;
    kredit: number;
    runningBalance: number;
    jurnal: {
        nomorJurnal: string;
        tanggal: string;
    };
}

interface AccountLedgerProps {
    data: Transaction[];
    accountName: string;
    accountCode: string;
    initialBalance: number;
}

export function AccountLedger({ data, accountName, accountCode, initialBalance }: AccountLedgerProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">{accountName}</h2>
                    <p className="text-sm text-slate-500 font-mono">{accountCode}</p>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                    <FileDown className="h-4 w-4" />
                    Export Excel
                </Button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="w-[120px]">Tanggal</TableHead>
                            <TableHead className="w-[150px]">Referensi</TableHead>
                            <TableHead>Keterangan</TableHead>
                            <TableHead className="text-right w-[150px]">Debit</TableHead>
                            <TableHead className="text-right w-[150px]">Kredit</TableHead>
                            <TableHead className="text-right w-[180px]">Saldo</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow className="bg-slate-50/50 font-medium">
                            <TableCell colSpan={3} className="text-slate-500 italic">Saldo Awal</TableCell>
                            <TableCell className="text-right">-</TableCell>
                            <TableCell className="text-right">-</TableCell>
                            <TableCell className="text-right">{formatCurrency(initialBalance)}</TableCell>
                        </TableRow>

                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                                    Belum ada transaksi pada periode ini
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell className="text-sm">
                                        {format(new Date(row.jurnal.tanggal), 'dd MMM yyyy', { locale: id })}
                                    </TableCell>
                                    <TableCell className="text-sm font-mono text-slate-500 uppercase">
                                        {row.jurnal.nomorJurnal}
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-700">
                                        {row.deskripsi}
                                    </TableCell>
                                    <TableCell className="text-right text-sm font-medium text-slate-900 truncate">
                                        {row.debit > 0 ? formatCurrency(row.debit) : '-'}
                                    </TableCell>
                                    <TableCell className="text-right text-sm font-medium text-slate-900 truncate">
                                        {row.kredit > 0 ? formatCurrency(row.kredit) : '-'}
                                    </TableCell>
                                    <TableCell className={cn(
                                        "text-right text-sm font-bold truncate",
                                        row.runningBalance < 0 ? "text-red-600" : "text-slate-900"
                                    )}>
                                        {formatCurrency(row.runningBalance)}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
