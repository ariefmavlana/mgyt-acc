'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { id } from 'date-fns/locale';

export default function TrialBalancePage() {
    const router = useRouter();
    const [date, setDate] = useState<Date>(new Date());

    const { data: report, isLoading } = useQuery({
        queryKey: ['trial-balance', date],
        queryFn: async () => {
            const res = await api.get('/reports/trial-balance', {
                params: {
                    date: date.toISOString()
                }
            });
            return res.data;
        }
    });

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Neraca Saldo</h1>
                        <p className="text-slate-500">Ringkasan saldo debit dan kredit semua akun.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-[240px] justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP", { locale: id }) : <span>Pilih Tanggal</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={(d) => d && setDate(d)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Neraca Saldo (Trial Balance)</CardTitle>
                        <CardDescription>
                            Per Tanggal: {format(date, 'dd MMMM yyyy', { locale: id })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Kode</TableHead>
                                    <TableHead>Nama Akun</TableHead>
                                    <TableHead className="text-right">Debit</TableHead>
                                    <TableHead className="text-right">Kredit</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {report?.data?.map((item: any) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-mono">{item.kode}</TableCell>
                                        <TableCell>{item.nama}</TableCell>
                                        <TableCell className="text-right font-mono">{item.debit > 0 ? formatCurrency(item.debit) : '-'}</TableCell>
                                        <TableCell className="text-right font-mono">{item.kredit > 0 ? formatCurrency(item.kredit) : '-'}</TableCell>
                                    </TableRow>
                                ))}
                                <TableRow className="bg-slate-50 font-bold border-t-2 border-slate-200">
                                    <TableCell colSpan={2} className="text-right">TOTAL</TableCell>
                                    <TableCell className="text-right text-primary">{formatCurrency(report?.summary?.totalDebit || 0)}</TableCell>
                                    <TableCell className="text-right text-primary">{formatCurrency(report?.summary?.totalCredit || 0)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                        {report?.summary && (
                            <div className={`mt-4 p-4 rounded-lg flex items-center justify-between text-sm font-medium ${report.summary.isBalanced ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                <span>Status Keseimbangan:</span>
                                <span>{report.summary.isBalanced ? 'SEIMBANG (BALANCED)' : 'TIDAK SEIMBANG'}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
