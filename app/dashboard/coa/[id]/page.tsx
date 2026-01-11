'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, RefreshCcw, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { AccountLedger } from '@/components/coa/account-ledger';
import api from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export default function AccountLedgerPage() {
    const params = useParams();
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();

    const fetchLedger = useCallback(async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (startDate) queryParams.append('startDate', startDate.toISOString());
            if (endDate) queryParams.append('endDate', endDate.toISOString());

            const res = await api.get(`/coa/${params.id}/transactions?${queryParams.toString()}`);
            setData(res.data);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Gagal memuat buku besar');
        } finally {
            setLoading(false);
        }
    }, [params.id, startDate, endDate]);

    useEffect(() => {
        if (params.id) {
            fetchLedger();
        }
    }, [params.id, fetchLedger]);

    if (loading && !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-slate-500">Memuat rincian buku besar...</p>
            </div>
        );
    }

    if (!data && !loading) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-500">Data buku besar tidak ditemukan</p>
                <Button variant="link" onClick={() => router.back()}>Kembali</Button>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded-full"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Buku Besar Akun</h1>
                        <p className="text-slate-500">Rincian mutasi dan saldo akun secara detail.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        "justify-start text-left font-normal",
                                        !startDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {startDate ? format(startDate, "dd/MM/yyyy") : <span>Mulai</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={setStartDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <span className="text-slate-300">-</span>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        "justify-start text-left font-normal",
                                        !endDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {endDate ? format(endDate, "dd/MM/yyyy") : <span>Selesai</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={endDate}
                                    onSelect={setEndDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <Button variant="ghost" size="sm" onClick={() => { setStartDate(undefined); setEndDate(undefined); }}>Reset</Button>
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchLedger} disabled={loading}>
                        <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
                    </Button>
                </div>
            </div>

            <AccountLedger
                data={data.ledger}
                accountName={data.account.namaAkun}
                accountCode={data.account.kodeAkun}
                initialBalance={Number(data.account.saldoAwal)}
            />
        </div>
    );
}
