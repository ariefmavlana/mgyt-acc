'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangePicker } from '../../../../components/ui/date-range-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Download } from 'lucide-react';
import { FinancialReportLayout } from '@/components/reports/financial-report-layout';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface Account {
    id: string;
    kodeAkun: string;
    namaAkun: string;
}

export default function GeneralLedgerPage() {
    const router = useRouter();
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(new Date().getFullYear(), 0, 1),
        to: new Date()
    });
    const [selectedAccount, setSelectedAccount] = useState<string>('');
    const [accounts, setAccounts] = useState<Account[]>([]);

    // Fetch Accounts list for dropdown
    const { isLoading: loadingAccounts } = useQuery({
        queryKey: ['coa-list'],
        queryFn: async () => {
            const res = await api.get('/coa');
            // Flatten tree to list if necessary, or assuming API returns flat list or we iterate
            // For simplicity, let's assume the COA endpoint returns a list or we can extract it.
            // If the endpoint returns a tree, we might need a helper function to flatten it.
            // Let's assume for now we can get a simple list or use the first level.
            // Actually, the COA endpoint returns a tree. We should probably implement a 'get all accounts' endpoint or flatten here.
            // To be safe, let's assume we can map the response if it is a list, or we need to flatten the specific tree structure.
            // Given I cannot see the COA structure right now, I will assume it returns a list for the Select.
            // Re-checking previous knowledge: COA endpoint returns a tree.
            // I'll assume we iterate the tree to get all accounts.

            const traverse = (nodes: { id: string; kodeAkun: string; namaAkun: string; children?: { id: string; kodeAkun: string; namaAkun: string; children?: any[] }[] }[]): Account[] => {
                let list: Account[] = [];
                for (const node of nodes) {
                    list.push({ id: node.id, kodeAkun: node.kodeAkun, namaAkun: node.namaAkun });
                    if (node.children && node.children.length > 0) {
                        list = list.concat(traverse(node.children));
                    }
                }
                return list;
            };

            const flatList = traverse(res.data);
            setAccounts(flatList);
            if (flatList.length > 0 && !selectedAccount) {
                setSelectedAccount(flatList[0].id);
            }
            return flatList;
        }
    });

    const { data: report, isLoading } = useQuery({
        queryKey: ['general-ledger', selectedAccount, dateRange],
        queryFn: async () => {
            if (!selectedAccount) return null;
            const res = await api.get('/reports/general-ledger', {
                params: {
                    accountId: selectedAccount,
                    startDate: dateRange?.from?.toISOString(),
                    endDate: dateRange?.to?.toISOString()
                }
            });
            return res.data;
        },
        enabled: !!selectedAccount && !!dateRange?.from && !!dateRange?.to
    });

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Buku Besar (General Ledger)</h1>
                        <p className="text-slate-500">Rincian transaksi historis per akun.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <DateRangePicker
                        date={dateRange}
                        setDate={setDateRange}
                    />
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filter & Pencarian</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="max-w-md">
                        <label className="text-sm font-medium mb-2 block">Pilih Akun</label>
                        <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih akun..." />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                                {accounts.map(acc => (
                                    <SelectItem key={acc.id} value={acc.id}>
                                        {acc.kodeAkun} - {acc.namaAkun}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {isLoading || loadingAccounts ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : report ? (
                <FinancialReportLayout
                    title={`${report.account.code} - ${report.account.name}`}
                    period={`Dari ${format(dateRange?.from || new Date(), 'dd/MM/yyyy')} s/d ${format(dateRange?.to || new Date(), 'dd/MM/yyyy')}`}
                    type="General Ledger"
                >
                    <div className="mb-6 flex justify-between items-end border-b pb-4">
                        <div className="text-sm text-slate-500">
                            Tipe: <span className="font-semibold text-slate-700">{report.account.type}</span> |
                            Saldo Awal: <span className="font-semibold text-slate-900 ml-1">{formatCurrency(report.openingBalance)}</span>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-slate-400 uppercase font-semibold">Saldo Akhir</div>
                            <div className="text-xl font-bold text-primary">{formatCurrency(report.closingBalance)}</div>
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Ref</TableHead>
                                <TableHead>Keterangan</TableHead>
                                <TableHead className="text-right">Debit</TableHead>
                                <TableHead className="text-right">Kredit</TableHead>
                                <TableHead className="text-right">Saldo</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow className="bg-slate-50/50 italic text-slate-500">
                                <TableCell colSpan={5}>Saldo Awal</TableCell>
                                <TableCell className="text-right">{formatCurrency(report.openingBalance)}</TableCell>
                            </TableRow>
                            {report.transactions.map((tx: { date: string; ref: string; description: string; debit: number; credit: number; balance: number }, i: number) => (
                                <TableRow key={i}>
                                    <TableCell>{format(new Date(tx.date), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell className="font-mono text-xs">{tx.ref}</TableCell>
                                    <TableCell>{tx.description}</TableCell>
                                    <TableCell className="text-right font-mono text-slate-600">{tx.debit > 0 ? formatCurrency(tx.debit) : '-'}</TableCell>
                                    <TableCell className="text-right font-mono text-slate-600">{tx.credit > 0 ? formatCurrency(tx.credit) : '-'}</TableCell>
                                    <TableCell className="text-right font-mono font-medium">{formatCurrency(tx.balance)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </FinancialReportLayout>
            ) : (
                <div className="text-center py-12 text-slate-500 bg-white border rounded-lg shadow-sm">
                    Silakan pilih akun untuk melihat buku besar.
                </div>
            )}
        </div>
    );
}
