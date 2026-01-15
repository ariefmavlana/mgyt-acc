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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Loader2, MoreHorizontal, Package } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Simple debounce/delay could be handled by just passing search to query directly
  // and letting react-query handle deduping, but debounce is better for UI.
  // For now, pass search directly to ensure responsiveness, backend is fast enough.

  const { data, isLoading } = useQuery({
    queryKey: ["products", page, search],
    queryFn: async () => {
      const res = await api.get(
        `/products?page=${page}&limit=10&search=${search}`
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Produk & Inventaris
          </h1>
          <p className="text-slate-500">Kelola katalog produk dan harga.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/products/new">
            <Plus className="mr-2 h-4 w-4" /> Tambah Produk
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Produk</CardTitle>
          <CardDescription>
            Semua produk yang terdaftar dalam sistem.
          </CardDescription>
          <div className="pt-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama atau kode produk..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produk</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-right">Harga Jual</TableHead>
                  <TableHead className="text-center">Stok Total</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="w-12.5"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Tidak ada produk ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product: any) => {
                    // Calculate total stock from all linked warehouses (nested via persediaan -> stok)
                    // Assuming payload structure from backend
                    // backend returns: persediaan: { stok: [ { kuantitas: ... } ] }
                    const stocks = product.persediaan?.stok || [];
                    const totalStock = stocks.reduce(
                      (acc: number, curr: any) => acc + Number(curr.kuantitas),
                      0
                    );
                    const minStock = Number(
                      product.persediaan?.stokMinimum || 0
                    );

                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {product.namaProduk}
                            </span>
                            <span className="text-xs text-muted-foreground uppercase">
                              {product.kodeProduk}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{product.kategori}</TableCell>
                        <TableCell className="text-right font-medium">
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
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
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

          {/* Simple Pagination */}
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
            >
              Previous
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {page} of {pagination?.totalPages || 1}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= (pagination?.totalPages || 1) || isLoading}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
