'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { toast } from 'sonner';
import { ArrowRightLeft, MoveRight, Plus, Trash2, Check, ChevronsUpDown, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/hooks/use-require-auth';

interface Warehouse {
    id: string;
    nama: string;
    kode: string;
}

interface ProductStock {
    id: string;
    persediaan: {
        id: string;
        kodePersediaan: string;
        namaPersediaan: string;
        satuan: string;
        produk?: { id: string; namaProduk: string };
    };
    kuantitas: number;
}

interface TransferItem {
    produkId: string;
    namaProduk: string;
    satuan: string;
    maxQty: number;
    transferQty: number;
}

export default function WarehouseTransferPage() {
    useRequireAuth('/login', ['SUPERADMIN', 'ADMIN', 'MANAGER', 'STAFF']);
    const router = useRouter();
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [stocks, setStocks] = useState<ProductStock[]>([]);

    // Form State
    const [sourceWarehouse, setSourceWarehouse] = useState<string>('');
    const [targetWarehouse, setTargetWarehouse] = useState<string>('');
    const [notes, setNotes] = useState<string>('');

    // Item Selection State
    const [openCombobox, setOpenCombobox] = useState(false);
    const [selectedProductStock, setSelectedProductStock] = useState<ProductStock | null>(null);
    const [quantityInput, setQuantityInput] = useState<string>('');

    // Cart State
    const [transferItems, setTransferItems] = useState<TransferItem[]>([]);

    const [loadingStocks, setLoadingStocks] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Fetch Warehouses
    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                const res = await api.get('/inventory/warehouses');
                setWarehouses(res.data);
            } catch (error) {
                console.error('Failed to fetch warehouses', error);
                toast.error('Gagal memuat data gudang');
            }
        };
        fetchWarehouses();
    }, []);

    // Fetch Stocks when Source Warehouse Changes
    useEffect(() => {
        if (!sourceWarehouse) {
            setStocks([]);
            setSelectedProductStock(null);
            setTransferItems([]); // Reset cart if warehouse changes
            return;
        }

        // Warning if cart has items
        if (transferItems.length > 0) {
            const confirmChange = window.confirm("Mengubah gudang asal akan menghapus item yang sudah dipilih. Lanjutkan?");
            if (!confirmChange) return; // This logic is tricky with controlled select, usually better to lock it.
            // For now, let's just clear it.
            setTransferItems([]);
        }

        const fetchStocks = async () => {
            setLoadingStocks(true);
            try {
                const res = await api.get(`/inventory/stock?warehouseId=${sourceWarehouse}`);
                setStocks(res.data);
            } catch (error) {
                toast.error('Gagal memuat stok produk');
            } finally {
                setLoadingStocks(false);
            }
        };

        fetchStocks();
    }, [sourceWarehouse]);

    const handleAddItem = () => {
        if (!selectedProductStock || !quantityInput) return;

        const qty = parseFloat(quantityInput);
        if (isNaN(qty) || qty <= 0) {
            toast.error('Kuantitas tidak valid');
            return;
        }

        if (qty > Number(selectedProductStock.kuantitas)) {
            toast.error('Stok tidak mencukupi');
            return;
        }

        const existingItemIndex = transferItems.findIndex(i => i.produkId === selectedProductStock.persediaan.produk?.id);

        if (existingItemIndex >= 0) {
            // Update existing
            const newItems = [...transferItems];
            const newTotal = newItems[existingItemIndex].transferQty + qty;

            if (newTotal > selectedProductStock.kuantitas) {
                toast.error('Total kuantitas melebihi stok tersedia');
                return;
            }

            newItems[existingItemIndex].transferQty = newTotal;
            setTransferItems(newItems);
        } else {
            // Add new
            if (!selectedProductStock.persediaan.produk?.id) {
                toast.error('Produk invalid (tidak memiliki ID)');
                return;
            }

            setTransferItems([
                ...transferItems,
                {
                    produkId: selectedProductStock.persediaan.produk.id,
                    namaProduk: selectedProductStock.persediaan.produk.namaProduk,
                    satuan: selectedProductStock.persediaan.satuan,
                    maxQty: Number(selectedProductStock.kuantitas),
                    transferQty: qty
                }
            ]);
        }

        // Reset inputs
        setSelectedProductStock(null);
        setQuantityInput('');
        toast.success('Item ditambahkan');
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...transferItems];
        newItems.splice(index, 1);
        setTransferItems(newItems);
    };

    const handleSubmit = async () => {
        if (!sourceWarehouse || !targetWarehouse || transferItems.length === 0) {
            toast.error('Mohon lengkapi data transfer');
            return;
        }

        if (sourceWarehouse === targetWarehouse) {
            toast.error('Gudang asal dan tujuan tidak boleh sama');
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/inventory/movement', {
                tipe: 'TRANSFER',
                tanggal: new Date().toISOString(),
                gudangId: sourceWarehouse,
                gudangTujuanId: targetWarehouse,
                items: transferItems.map(item => ({
                    produkId: item.produkId,
                    kuantitas: item.transferQty
                })),
                keterangan: notes || 'Transfer Stok Multi-Item'
            });

            toast.success('Transfer stok berhasil!');
            router.push('/dashboard/inventory'); // Redirect back to inventory dashboard or stay

            // Or just reset
            setTransferItems([]);
            setNotes('');
            setQuantityInput('');
            setSelectedProductStock(null);

        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal melakukan transfer');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary/10 p-2 rounded-lg">
                    <ArrowRightLeft className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Transfer Stok Multi-Item</h1>
                    <p className="text-muted-foreground text-sm">Pindahkan banyak produk antar gudang sekaligus.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT COLUMN: SOURCE & TARGET & ADD ITEM */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">1. Pilih Lokasi</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Gudang Asal</Label>
                                <Select value={sourceWarehouse} onValueChange={setSourceWarehouse} disabled={transferItems.length > 0}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Asal..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {warehouses.map(w => (
                                            <SelectItem key={w.id} value={w.id}>{w.nama}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {transferItems.length > 0 && <p className="text-xs text-amber-600">Dikunci karena ada item di keranjang.</p>}
                            </div>

                            <div className="flex justify-center">
                                <MoveRight className="text-muted-foreground rotate-90 md:rotate-0" />
                            </div>

                            <div className="space-y-2">
                                <Label>Gudang Tujuan</Label>
                                <Select value={targetWarehouse} onValueChange={setTargetWarehouse}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Tujuan..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {warehouses.filter(w => w.id !== sourceWarehouse).map(w => (
                                            <SelectItem key={w.id} value={w.id}>{w.nama}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className={cn("transition-opacity", !sourceWarehouse ? "opacity-50 pointer-events-none" : "opacity-100")}>
                        <CardHeader>
                            <CardTitle className="text-base">2. Tambah Produk</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Cari Produk</Label>
                                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openCombobox}
                                            className="w-full justify-between"
                                            disabled={loadingStocks}
                                        >
                                            {selectedProductStock
                                                ? selectedProductStock.persediaan.namaPersediaan
                                                : "Pilih produk..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] p-0">
                                        <Command>
                                            <CommandInput placeholder="Cari nama produk..." />
                                            <CommandList>
                                                <CommandEmpty>Produk tidak ditemukan.</CommandEmpty>
                                                <CommandGroup>
                                                    {stocks
                                                        .filter(s => s.kuantitas > 0 && s.persediaan.produk) // Only show items with stock
                                                        .map((stock) => (
                                                            <CommandItem
                                                                key={stock.id}
                                                                value={stock.persediaan.namaPersediaan}
                                                                onSelect={() => {
                                                                    setSelectedProductStock(stock);
                                                                    setOpenCombobox(false);
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        selectedProductStock?.id === stock.id ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                <div className="flex flex-col">
                                                                    <span>{stock.persediaan.namaPersediaan}</span>
                                                                    <span className="text-xs text-muted-foreground">Stok: {stock.kuantitas} {stock.persediaan.satuan}</span>
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
                                <div className="flex justify-between">
                                    <Label>Jumlah Transfer</Label>
                                    {selectedProductStock && (
                                        <span className="text-xs text-muted-foreground">Max: {selectedProductStock.kuantitas}</span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={quantityInput}
                                        onChange={(e) => setQuantityInput(e.target.value)}
                                        className="text-right"
                                        min="1"
                                    />
                                    <div className="flex items-center text-sm font-medium bg-secondary px-3 rounded-md min-w-[60px] justify-center">
                                        {selectedProductStock?.persediaan.satuan || '-'}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={handleAddItem} disabled={!selectedProductStock || !quantityInput}>
                                <Plus className="mr-2 h-4 w-4" /> Tambah Item
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* RIGHT COLUMN: REVIEW LIST */}
                <Card className="lg:col-span-2 flex flex-col h-full">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-base flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5" />
                                3. Daftar Transfer
                            </CardTitle>
                            <Badge variant="secondary">{transferItems.length} Item</Badge>
                        </div>
                        <CardDescription>Periksa kembali item sebelum konfirmasi.</CardDescription>
                    </CardHeader>

                    <CardContent className="flex-1 overflow-auto">
                        {transferItems.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Produk</TableHead>
                                        <TableHead className="text-right">Tersedia</TableHead>
                                        <TableHead className="text-right">Transfer</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transferItems.map((item, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell className="font-medium">
                                                {item.namaProduk}
                                                <div className="text-xs text-muted-foreground">{item.produkId.slice(0, 8)}...</div>
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground">
                                                {item.maxQty} {item.satuan}
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-primary">
                                                {item.transferQty} {item.satuan}
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleRemoveItem(idx)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground border-2 border-dashed rounded-lg">
                                <ShoppingCart className="h-10 w-10 mb-2 opacity-20" />
                                <p>Keranjang transfer kosong</p>
                                <p className="text-xs">Pilih produk disebelah kiri untuk menambahkan.</p>
                            </div>
                        )}
                    </CardContent>

                    <div className="p-6 bg-slate-50 border-t space-y-4">
                        <div className="space-y-2">
                            <Label>Catatan Transfer</Label>
                            <Textarea
                                placeholder="Contoh: Kiriman rutin minggu ke-2..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="bg-white"
                                rows={2}
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="outline" onClick={() => router.push('/dashboard/inventory')}>
                                Batal
                            </Button>
                            <Button size="lg" onClick={handleSubmit} disabled={submitting || transferItems.length === 0 || !targetWarehouse} className="min-w-[150px]">
                                {submitting ? 'Memproses...' : 'Konfirmasi Transfer'}
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
