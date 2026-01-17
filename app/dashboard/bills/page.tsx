"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Receipt, Plus, Search, Filter, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { usePurchases } from "@/hooks/use-purchases";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { LuArrowLeft, LuArrowRight } from "react-icons/lu";

export default function BillsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = usePurchases({ page, limit: 10 });

  const bills = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="p-6 max-w-full mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white flex flex-col gap-6 p-6 rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Tagihan Pembelian
            </h1>
            <p className="text-slate-500 mt-1">
              Kelola hutang usaha dan tagihan dari pemasok (Vendor Bills).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <Plus className="h-4 w-4" /> Buat Tagihan Baru
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nomor tagihan atau pemasok..."
              className="pl-10 border border-slate-200 focus-visible:border-orange-500 focus-visible:ring-1 focus-visible:ring-orange-400"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-slate-200">
              <Filter className="mr-2 h-4 w-4 text-slate-400" />
              Status
            </Button>
          </div>
        </div>

        {/* Bills Table */}
        <Card className="border-none shadow-none">
          <CardHeader className="px-0">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-orange-500" />
              Daftar Tagihan
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-200">
                    <TableHead>Nomor Tagihan</TableHead>
                    <TableHead>Pemasok</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Jatuh Tempo</TableHead>
                    <TableHead>Total Tagihan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span>Memuat data tagihan...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : bills.length > 0 ? (
                    bills.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell className="font-medium">
                          {bill.nomorTransaksi}
                        </TableCell>
                        <TableCell>{bill.pemasok?.nama || "-"}</TableCell>
                        <TableCell>
                          {format(new Date(bill.tanggal), "dd MMM yyyy", {
                            locale: idLocale,
                          })}
                        </TableCell>
                        <TableCell>
                          <span className="text-red-500 font-medium">
                            {format(
                              new Date(bill.tanggalJatuhTempo),
                              "dd MMM yyyy",
                              { locale: idLocale },
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="font-bold">
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          }).format(bill.total)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              bill.statusPembayaran === "LUNAS"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {bill.statusPembayaran.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Detail
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-24 text-center text-slate-500"
                      >
                        Belum ada tagihan pembelian.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        {pagination && (
          <div className="flex justify-between items-center text-sm text-slate-500">
            <div>
              Halaman {pagination.page} dari {pagination.totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <LuArrowLeft />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <LuArrowRight />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
