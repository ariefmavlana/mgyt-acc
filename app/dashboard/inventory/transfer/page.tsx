"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowRightLeft,
  Plus,
  Trash2,
  ChevronsUpDown,
  ShoppingCart,
  ArrowLeftRight,
} from "lucide-react";

import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { useRequireAuth } from "@/hooks/use-require-auth";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";

interface Warehouse {
  id: string;
  nama: string;
}

interface ProductStock {
  id: string;
  kuantitas: number;
  persediaan: {
    satuan: string;
    namaPersediaan: string;
    produk?: {
      id: string;
      namaProduk: string;
    };
  };
}

interface TransferItem {
  produkId: string;
  namaProduk: string;
  satuan: string;
  maxQty: number;
  transferQty: number;
}

export default function WarehouseTransferPage() {
  useRequireAuth("/login", ["SUPERADMIN", "ADMIN", "MANAGER", "STAFF"]);

  const router = useRouter();

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stocks, setStocks] = useState<ProductStock[]>([]);

  const [sourceWarehouse, setSourceWarehouse] = useState("");
  const [targetWarehouse, setTargetWarehouse] = useState("");
  const [notes, setNotes] = useState("");

  const [openProduct, setOpenProduct] = useState(false);
  const [selectedStock, setSelectedStock] = useState<ProductStock | null>(null);
  const [qty, setQty] = useState("");

  const [items, setItems] = useState<TransferItem[]>([]);
  const [loadingStock, setLoadingStock] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get("/inventory/warehouses")
      .then((res) => setWarehouses(res.data))
      .catch(() => toast.error("Gagal memuat gudang"));
  }, []);

  useEffect(() => {
    if (!sourceWarehouse) {
      setStocks([]);
      setItems([]);
      return;
    }

    setLoadingStock(true);
    api
      .get(`/inventory/stock?warehouseId=${sourceWarehouse}`)
      .then((res) => setStocks(res.data))
      .catch(() => toast.error("Gagal memuat stok"))
      .finally(() => setLoadingStock(false));
  }, [sourceWarehouse]);

  const addItem = () => {
    if (!selectedStock) return;

    const jumlah = Number(qty);
    if (jumlah <= 0 || isNaN(jumlah)) {
      toast.error("Jumlah tidak valid");
      return;
    }

    if (jumlah > selectedStock.kuantitas) {
      toast.error("Stok tidak cukup");
      return;
    }

    const produk = selectedStock.persediaan.produk;
    if (!produk) {
      toast.error("Produk tidak valid");
      return;
    }

    const exist = items.find((i) => i.produkId === produk.id);
    if (exist) {
      if (exist.transferQty + jumlah > exist.maxQty) {
        toast.error("Melebihi stok tersedia");
        return;
      }
      exist.transferQty += jumlah;
      setItems([...items]);
    } else {
      setItems([
        ...items,
        {
          produkId: produk.id,
          namaProduk: produk.namaProduk,
          satuan: selectedStock.persediaan.satuan,
          maxQty: selectedStock.kuantitas,
          transferQty: jumlah,
        },
      ]);
    }

    setSelectedStock(null);
    setQty("");
    toast.success("Item ditambahkan");
  };

  const submit = async () => {
    if (!sourceWarehouse || !targetWarehouse || items.length === 0) {
      toast.error("Data belum lengkap");
      return;
    }

    if (sourceWarehouse === targetWarehouse) {
      toast.error("Gudang tidak boleh sama");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/inventory/movement", {
        tipe: "TRANSFER",
        tanggal: new Date().toISOString(),
        gudangId: sourceWarehouse,
        gudangTujuanId: targetWarehouse,
        keterangan: notes,
        items: items.map((i) => ({
          produkId: i.produkId,
          kuantitas: i.transferQty,
        })),
      });

      toast.success("Transfer berhasil");
      router.push("/dashboard/inventory");
    } catch {
      toast.error("Transfer gagal");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-full mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white flex flex-col gap-6 p-6 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-primary/10 text-primary">
            <ArrowRightLeft />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Transfer Stok</h1>
            <p className="text-xs text-muted-foreground">
              Transfer multi item antar gudang
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 bg-white border-neutral-200 shadow-none flex flex-col">
            <CardHeader>
              <CardTitle className="text-base">Sumber dan Item</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 flex-1">
              <div className="flex gap-4 justify-between items-center">
                <div className="space-y-2">
                  <Label>Gudang Asal</Label>
                  <Select
                    value={sourceWarehouse}
                    onValueChange={setSourceWarehouse}
                    disabled={items.length > 0}
                  >
                    <SelectTrigger className="border border-slate-400">
                      <SelectValue placeholder="Pilih gudang" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="bg-emerald-200 p-2 rounded-full">
                    <ArrowLeftRight className="text-emerald-800" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Gudang Tujuan</Label>
                  <Select
                    value={targetWarehouse}
                    onValueChange={setTargetWarehouse}
                    disabled={!sourceWarehouse}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih gudang" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses
                        .filter((w) => w.id !== sourceWarehouse)
                        .map((w) => (
                          <SelectItem key={w.id} value={w.id}>
                            {w.nama}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Produk</Label>
                <Popover open={openProduct} onOpenChange={setOpenProduct}>
                  <PopoverTrigger asChild className="border border-slate-400">
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      disabled={loadingStock}
                    >
                      {selectedStock
                        ? selectedStock.persediaan.namaPersediaan
                        : "Pilih produk"}
                      <ChevronsUpDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-72">
                    <Command>
                      <CommandInput placeholder="Cari produk" />
                      <CommandList>
                        <CommandEmpty>Tidak ditemukan</CommandEmpty>
                        <CommandGroup>
                          {stocks
                            .filter(
                              (s) => s.kuantitas > 0 && s.persediaan.produk,
                            )
                            .map((s) => (
                              <CommandItem
                                key={s.id}
                                onSelect={() => {
                                  setSelectedStock(s);
                                  setOpenProduct(false);
                                }}
                              >
                                <div className="flex flex-col">
                                  <span>{s.persediaan.namaPersediaan}</span>
                                  <span className="text-xs text-muted-foreground">
                                    Stok {s.kuantitas} {s.persediaan.satuan}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Jumlah</Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={qty}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^0-9]/g, "");
                      setQty(v);
                    }}
                    className="border border-slate-400 focus-visible:border-orange-500 focus-visible:ring-1 focus-visible:ring-orange-400"
                  />

                  <div className="px-3 flex items-center bg-muted rounded-md text-sm">
                    {selectedStock?.persediaan.satuan || "satuan"}
                  </div>
                </div>
              </div>
            </CardContent>

            <div className="w-full h-px bg-neutral-200"></div>

            <CardFooter className="mt-auto">
              <Button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                onClick={addItem}
                disabled={!selectedStock || !qty}
              >
                <Plus className="h-4 w-4" />
                Tambah
              </Button>
            </CardFooter>
          </Card>

          <Card className="lg:col-span-2 flex flex-col border border-neutral-200 shadow-none bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base text-emerald-800 flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Daftar Transfer
              </CardTitle>
              <Badge variant="secondary" className="bg-emerald-500 text-white">
                {items.length} item
              </Badge>
            </CardHeader>

            <CardContent className="flex-1 overflow-auto">
              {items.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-sm text-muted-foreground border-2 border-dashed rounded-md border-red-500">
                  Keranjang kosong
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produk</TableHead>
                      <TableHead className="text-right">Stok</TableHead>
                      <TableHead className="text-right">Transfer</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((i, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{i.namaProduk}</TableCell>
                        <TableCell className="text-right">
                          {i.maxQty} {i.satuan}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {i.transferQty} {i.satuan}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              setItems(items.filter((_, x) => x !== idx))
                            }
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              <Textarea
                placeholder="Catatan transfer"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="bg-emerald-50 border border-emerald-400 text-emerald-900 ring-1 ring-emerald-500"
              />
              <div className="flex w-full justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push("/dashboard/inventory")}
                  className="border-none bg-neutral-100 text-neutral-600 hover:bg-neutral-200 cursor-pointer"
                >
                  Batal
                </Button>
                <Button
                  onClick={submit}
                  disabled={submitting || items.length === 0}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {submitting ? "Memproses" : "Konfirmasi"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
