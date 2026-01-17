"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Loader2, MoreHorizontal, Box } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LuArrowLeft, LuArrowRight } from "react-icons/lu";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["products", page, search],
    queryFn: async () => {
      const res = await api.get(
        `/products?page=${page}&limit=${limit}&search=${search}`,
      );
      return res.data;
    },
  });

  const products = data?.data || [];
  const pagination = data?.pagination;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="p-6 max-w-full mx-auto space-y-8">
      <div className="bg-white flex flex-col gap-6 p-6 rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Produk & Inventaris
            </h1>
            <p className="text-slate-500">Kelola katalog produk dan harga.</p>
          </div>
          <Button
            asChild
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Link href="/dashboard/products/new">
              <Plus className="h-4 w-4" /> Tambah Produk
            </Link>
          </Button>
        </div>

        <Card className="border-none shadow-none">
          <CardHeader className="px-0">
            <CardTitle className="flex items-center gap-2">
              <Box className="h-5 w-5 text-orange-500" />
              Daftar Produk
            </CardTitle>
            <div className="pt-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama atau kode produk..."
                  className="pl-10 border border-slate-200 focus-visible:border-orange-500 focus-visible:ring-1 focus-visible:ring-orange-400"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-0">
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="text-center w-12">No</TableHead>
                    <TableHead className="text-center">Kode Produk</TableHead>
                    <TableHead className="text-center">Produk</TableHead>
                    <TableHead className="text-center">Kategori</TableHead>
                    <TableHead className="text-center">Harga Jual</TableHead>
                    <TableHead className="text-center">Stok Total</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : products.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="h-24 text-center text-muted-foreground"
                      >
                        Tidak ada produk ditemukan.
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product: any, index: number) => {
                      const stocks = product.persediaan?.stok || [];
                      const totalStock = stocks.reduce(
                        (acc: number, curr: any) =>
                          acc + Number(curr.kuantitas),
                        0,
                      );
                      const minStock = Number(
                        product.persediaan?.stokMinimum || 0,
                      );

                      const nomor = (page - 1) * limit + index + 1;

                      return (
                        <TableRow key={product.id}>
                          <TableCell className="text-center">{nomor}</TableCell>
                          <TableCell className="text-center text-xs uppercase">
                            {product.kodeProduk}
                          </TableCell>
                          <TableCell className="text-center font-medium">
                            {product.namaProduk}
                          </TableCell>
                          <TableCell className="text-center">
                            {product.kategori}
                          </TableCell>
                          <TableCell className="text-center font-medium">
                            {formatCurrency(Number(product.hargaJualEceran))}
                          </TableCell>
                          <TableCell className="text-center">
                            {totalStock} {product.satuan}
                          </TableCell>
                          <TableCell className="text-center">
                            {totalStock <= 0 ? (
                              <Badge variant="destructive">Habis</Badge>
                            ) : totalStock <= minStock ? (
                              <Badge
                                variant="secondary"
                                className="bg-yellow-100 text-yellow-800"
                              >
                                Menipis
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700 border-green-200"
                              >
                                Tersedia
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/dashboard/products/${product.id}`}
                                  >
                                    Detail Produk
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  Hapus Produk
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between py-4 pl-4">
              <div className="text-sm text-neutral-400">
                Halaman {page} dari {pagination?.totalPages || 1}
              </div>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoading}
                >
                  <LuArrowLeft />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= (pagination?.totalPages || 1) || isLoading}
                >
                  <LuArrowRight />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
