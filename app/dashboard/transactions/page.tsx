"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Search,
  Filter,
  Download,
  Calendar as CalendarIcon,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useTransactions } from "@/hooks/use-transactions";
import { useDebounce } from "@/hooks/use-debounce";

const TransactionTable = React.lazy(() =>
  import("@/components/transactions/transaction-table").then((mod) => ({
    default: mod.TransactionTable,
  })),
);

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
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
  });

  const allTransactions =
    data?.pages.flatMap((page) => page.transactions) || [];

  return (
    <div className="p-6 max-w-full mx-auto space-y-8">
      <div className="bg-white flex flex-col gap-6 p-6 rounded-2xl">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Transaksi
            </h1>
            <p className="text-slate-500 mt-1">
              Kelola dan catat semua transaksi keuangan perusahaan.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="bg-emerald-500 hover:bg-emerald-600 border-none text-white cursor-pointer"
            >
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button
              asChild
              className="bg-orange-500 hover:bg-orange-600 border-none text-white cursor-pointer"
            >
              <Link href="/dashboard/transactions/new">
                <Plus className="h-4 w-4" /> Transaksi Baru
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
              className="pl-10 border border-slate-200 focus-visible:border-orange-500 focus-visible:ring-1 focus-visible:ring-orange-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-slate-200 hover:border-slate-400 cursor-pointer"
            >
              <CalendarIcon className="h-4 w-4 text-slate-400" />
              Bulan Ini
            </Button>
            <Button
              variant="outline"
              className="border-none bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-emerald-50 cursor-pointer"
            >
              <Filter className="h-4 w-4" />
              Filter
            </Button>
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
            <React.Suspense
              fallback={
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin" />
                </div>
              }
            >
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
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memuat
                      lainnya...
                    </>
                  ) : (
                    "Muat Lebih Banyak"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
