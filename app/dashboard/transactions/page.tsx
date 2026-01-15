'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter, Download, Calendar as CalendarIcon, Loader2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { useTransactions } from '@/hooks/use-transactions';
import { useDebounce } from '@/hooks/use-debounce';
import { startOfMonth, endOfMonth, format, addMonths, subMonths, isSameMonth } from 'date-fns';
import { id } from 'date-fns/locale';
import api from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { TipeTransaksi } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

const TransactionTable = React.lazy(() =>
    import('@/components/transactions/transaction-table').then(mod => ({ default: mod.TransactionTable }))
);

export default function TransactionsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [startDate, setStartDate] = useState<Date | undefined>(startOfMonth(new Date()));
    const [endDate, setEndDate] = useState<Date | undefined>(endOfMonth(new Date()));
    const [transactionType, setTransactionType] = useState<string>('ALL');
    const [isCustomRange, setIsCustomRange] = useState(false);

    const debouncedSearch = useDebounce(searchTerm, 500);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
    } = useTransactions({
        limit: 20,
        search: debouncedSearch,
        startDate,
        endDate,
        type: transactionType === 'ALL' ? undefined : transactionType
    });

    const handleExport = async () => {
        try {
            const toastId = toast.loading('Menyiapkan file ekspor...');
            const params: any = {
                search: debouncedSearch,
                startDate: startDate?.toISOString(),
                endDate: endDate?.toISOString(),
                type: transactionType === 'ALL' ? undefined : transactionType
            };

            const response = await api.get('/transactions/export', {
                params,
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Transactions-${format(new Date(), 'yyyyMMdd')}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.dismiss(toastId);
            toast.success('Ekspor berhasil');
        } catch (error) {
            toast.error('Gagal mengekspor data');
            console.error(error);
        }
    };

    const handlePrevMonth = () => {
        const nextDate = subMonths(currentDate, 1);
        setCurrentDate(nextDate);
        setStartDate(startOfMonth(nextDate));
        setEndDate(endOfMonth(nextDate));
        setIsCustomRange(false);
    };

    const handleNextMonth = () => {
        const nextDate = addMonths(currentDate, 1);
        setCurrentDate(nextDate);
        setStartDate(startOfMonth(nextDate));
        setEndDate(endOfMonth(nextDate));
        setIsCustomRange(false);
    };

    const handleThisMonth = () => {
        const now = new Date();
        setCurrentDate(now);
        setStartDate(startOfMonth(now));
        setEndDate(endOfMonth(now));
        setIsCustomRange(false);
    };

    const dateLabel = useMemo(() => {
        if (isCustomRange && startDate && endDate) {
            return `${format(startDate, 'dd MMM')} - ${format(endDate, 'dd MMM yyyy')}`;
        }
        return format(currentDate, 'MMMM yyyy', { locale: id });
    }, [currentDate, startDate, endDate, isCustomRange]);

    const isCurrentMonth = useMemo(() => {
        return !isCustomRange && isSameMonth(currentDate, new Date());
    }, [currentDate, isCustomRange]);

    const allTransactions = data?.pages.flatMap((page) => page.transactions) || [];

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Transaksi</h1>
                    <p className="text-slate-500 mt-1">Kelola dan catat semua transaksi keuangan perusahaan.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-slate-200" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" /> Ekspor
                    </Button>
                    <Button asChild className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                        <Link href="/dashboard/transactions/new">
                            <Plus className="mr-2 h-4 w-4" /> Tambah Kas
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Filters and search */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Cari deskripsi atau nomor transaksi..."
                        className="pl-10 h-11 bg-white border-slate-200 focus:border-primary focus:ring-primary/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 items-center">
                    <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden h-11 shadow-sm">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-full w-10 text-slate-400 hover:text-slate-600 hover:bg-slate-50 border-r border-slate-100 rounded-none"
                            onClick={handlePrevMonth}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <div className="px-4 min-w-[140px] text-center">
                            <span className="text-sm font-semibold text-slate-700 capitalize">
                                {dateLabel}
                                {isCurrentMonth && (
                                    <Badge variant="outline" className="ml-2 bg-primary/5 text-primary border-primary/20 text-[10px] font-bold px-1 py-0 h-4">
                                        SAAT INI
                                    </Badge>
                                )}
                            </span>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-full w-10 text-slate-400 hover:text-slate-600 hover:bg-slate-50 border-l border-slate-100 rounded-none"
                            onClick={handleNextMonth}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="h-11 px-4 border-slate-200 bg-white">
                                <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                                Pilih Periode
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                <span className="text-sm font-semibold text-slate-700">Filter Tanggal</span>
                                {!isCurrentMonth && (
                                    <Button variant="ghost" size="sm" onClick={handleThisMonth} className="text-primary text-xs font-bold hover:bg-primary/5">
                                        KEMBALI KE BULAN INI
                                    </Button>
                                )}
                            </div>
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={startDate}
                                selected={{ from: startDate, to: endDate }}
                                onSelect={(range) => {
                                    if (range?.from) {
                                        setStartDate(range.from);
                                        setEndDate(range.to || range.from);
                                        setIsCustomRange(true);
                                    }
                                }}
                                numberOfMonths={2}
                                className="p-3"
                            />
                        </PopoverContent>
                    </Popover>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant={transactionType !== 'ALL' ? "default" : "outline"} className="h-11 px-4 border-slate-200">
                                <Filter className={cn("mr-2 h-4 w-4", transactionType !== 'ALL' ? "text-white" : "text-slate-400")} />
                                {transactionType === 'ALL' ? 'Tipe' : transactionType.replace(/_/g, ' ')}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 max-h-[400px] overflow-y-auto">
                            <DropdownMenuLabel className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Pilih Filter</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup value={transactionType} onValueChange={setTransactionType}>
                                <DropdownMenuRadioItem value="ALL" className="text-sm font-medium">Semua</DropdownMenuRadioItem>
                                {Object.values(TipeTransaksi).map((type) => (
                                    <DropdownMenuRadioItem key={type} value={type} className="text-sm">
                                        {type.replace(/_/g, ' ')}
                                    </DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {(isCustomRange || searchTerm || transactionType !== 'ALL') && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-11 w-11 text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                            onClick={() => {
                                handleThisMonth();
                                setSearchTerm('');
                                setTransactionType('ALL');
                            }}
                            title="Reset Semua Filter"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Data section */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    <p className="text-slate-500 font-medium">Memuat data...</p>
                </div>
            ) : isError ? (
                <div className="text-center py-10 text-red-500">
                    Gagal memuat transaksi. Silakan coba lagi.
                </div>
            ) : (
                <>
                    <React.Suspense fallback={<div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>}>
                        <TransactionTable transactions={allTransactions} />
                    </React.Suspense>

                    {/* Infinite Scroll Trigger */}
                    {hasNextPage && (
                        <div className="flex justify-center mt-6">
                            <Button
                                variant="outline"
                                onClick={() => fetchNextPage()}
                                disabled={isFetchingNextPage}
                            >
                                {isFetchingNextPage ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memuat lainnya...
                                    </>
                                ) : (
                                    'Muat Lebih Banyak'
                                )}
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
