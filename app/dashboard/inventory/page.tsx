"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StockMovementForm } from "@/components/inventory/stock-movement-form";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRightLeft,
  TrendingUp,
  AlertTriangle,
  Package,
  Box,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { LuArrowRight, LuArrowRightToLine } from "react-icons/lu";

export default function InventoryPage() {
  const [isMovementOpen, setIsMovementOpen] = useState(false);

  const {
    data: stocks,
    isLoading: isLoadingStock,
    refetch: refetchStock,
  } = useQuery({
    queryKey: ["inventory-all"],
    queryFn: async () => {
      const res = await api.get("/inventory/stock");
      return res.data;
    },
  });

  const { data: warehouses } = useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => {
      const res = await api.get("/inventory/warehouses");
      return res.data;
    },
  });

  const {
    data: movements,
    isLoading: isLoadingMovements,
    refetch: refetchMovements,
  } = useQuery({
    queryKey: ["inventory-movements"],
    queryFn: async () => {
      const res = await api.get("/inventory/movement?limit=5");
      return res.data; // { data: [], pagination: {} }
    },
  });

  // Derived stats
  const totalValue =
    stocks?.reduce(
      (acc: number, item: any) => acc + Number(item.nilaiStok || 0),
      0
    ) || 0;
  const totalItems =
    stocks?.reduce(
      (acc: number, item: any) => acc + Number(item.kuantitas || 0),
      0
    ) || 0;

  // Find low stock items
  const lowStockItems =
    stocks?.filter((s: any) => {
      const qty = Number(s.kuantitas || 0);
      const min = Number(s.persediaan?.stokMinimum || 0);
      return min > 0 && qty <= min;
    }) || [];

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="p-6 max-w-full mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white flex flex-col gap-6 p-6 rounded-2xl">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Manajemen Inventaris
            </h1>
            <p className="text-muted-foreground">
              Monitoring stok dan valuasi aset.
            </p>
          </div>
          <Dialog open={isMovementOpen} onOpenChange={setIsMovementOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                <ArrowRightLeft className="h-4 w-4" /> Catat Mutasi
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-150">
              <DialogHeader>
                <DialogTitle>Catat Pergerakan Stok</DialogTitle>
              </DialogHeader>
              <StockMovementForm
                onSuccess={() => {
                  setIsMovementOpen(false);
                  refetchStock();
                  refetchMovements();
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-emerald-200 border-none shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Valuasi Aset
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalValue)}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalItems} unit total item
              </p>
            </CardContent>
          </Card>
          <Card className="bg-orange-200 border-none shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Peringatan Stok
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-600">
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  lowStockItems.length > 0 ? "text-red-600" : "text-slate-900"
                }`}
              >
                {lowStockItems.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Item dibawah batas minimum
              </p>
            </CardContent>
          </Card>
          <Card className="bg-blue-200 border-none shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Gudang Aktif
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
                <Box className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  lowStockItems.length > 0 ? "text-red-600" : "text-slate-900"
                }`}
              >
                {lowStockItems.length}
              </div>
              <a className="inline-flex items-center gap-4 text-sm text-muted-foreground">
                Kelola Lokasi & Stok{" "}
                <span>
                  <LuArrowRight />
                </span>
              </a>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Riwayat Mutasi */}
          <Card className="lg:col-span-2 border-none shadow-none">
            <CardHeader className="px-0">
              <CardTitle>Riwayat Mutasi Terakhir</CardTitle>
              <CardDescription>
                5 transaksi pergerakan stok terakhir.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-200">
                      <TableHead className="text-center">Tanggal</TableHead>
                      <TableHead className="text-center">Tipe</TableHead>
                      <TableHead className="text-center">Produk</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-center">Gudang</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingMovements ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          Memuat...
                        </TableCell>
                      </TableRow>
                    ) : movements?.data?.length > 0 ? (
                      movements.data.map((m: any) => (
                        <TableRow key={m.id}>
                          <TableCell>
                            {new Date(m.tanggal).toLocaleDateString("id-ID")}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                m.tipe.includes("IN") || m.tipe === "MASUK"
                                  ? "default"
                                  : "secondary"
                              }
                              className={
                                m.tipe.includes("IN") || m.tipe === "MASUK"
                                  ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                  : "bg-red-100 text-red-800 hover:bg-red-200"
                              }
                            >
                              {m.tipe}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {m.persediaan?.namaPersediaan}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {m.nomorMutasi}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono">
                            {Number(m.kuantitas)}
                          </TableCell>
                          <TableCell>{m.gudang?.nama}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-muted-foreground"
                        >
                          Belum ada mutasi.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Low Stock List */}
          <Card className="border border-neutral-200 shadow-none">
            <CardHeader>
              <CardTitle>Low Stock Alerts</CardTitle>
              <CardDescription>
                Item yang perlu re-stock segera.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStockItems.length > 0 ? (
                  lowStockItems.slice(0, 5).map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between border-b pb-2 last:border-0"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {item.persediaan?.namaPersediaan}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.gudang?.nama}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-red-600">
                          {Number(item.kuantitas)}
                        </span>
                        <p className="text-[10px] text-muted-foreground">
                          Min: {item.persediaan?.stokMinimum}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-emerald-600 flex flex-col items-center">
                    <Package className="h-8 w-8 mb-2 opacity-50" />
                    <span>Stok Aman</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
