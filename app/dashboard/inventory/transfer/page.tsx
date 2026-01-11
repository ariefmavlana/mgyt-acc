'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { toast } from 'sonner';
import { ArrowRightLeft, MoveRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Warehouse {
    id: string;
    nama: string;
    kode: string;
}

interface ProductStock {
    id: string;
    persediaan: {
        id: string; // Persediaan ID
        kodePersediaan: string;
        namaPersediaan: string;
        satuan: string;
        produk?: { id: string; namaProduk: string };
    };
    kuantitas: number;
}

export default function WarehouseTransferPage() {
    const router = useRouter();
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [stocks, setStocks] = useState<ProductStock[]>([]);

    // Form State
    const [sourceWarehouse, setSourceWarehouse] = useState<string>('');
    const [targetWarehouse, setTargetWarehouse] = useState<string>('');
    const [selectedProduct, setSelectedProduct] = useState<string>('');
    const [quantity, setQuantity] = useState<string>('');
    const [notes, setNotes] = useState<string>('');

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Fetch Warehouses
    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                const res = await axios.get('/api/companies');
                const company = res.data;
                const gudangs: Warehouse[] = [];
                company.cabang?.forEach((c: any) => {
                    if (c.gudang) gudangs.push(...c.gudang);
                });
                setWarehouses(gudangs);
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
            setSelectedProduct('');
            return;
        }

        const fetchStocks = async () => {
            setLoading(true);
            try {
                // Fetch stocks for the source warehouse
                const res = await axios.get(`/api/inventory/stock?warehouseId=${sourceWarehouse}`);
                setStocks(res.data);
            } catch (error) {
                toast.error('Gagal memuat stok produk');
            } finally {
                setLoading(false);
            }
        };

        fetchStocks();
    }, [sourceWarehouse]);

    // Derived: Current max stock for selected product
    const maxQty = stocks.find(s => s.persediaan.produk?.id === selectedProduct)?.kuantitas || 0;
    const selectedStockUnit = stocks.find(s => s.persediaan.produk?.id === selectedProduct)?.persediaan.satuan || '';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!sourceWarehouse || !targetWarehouse || !selectedProduct || !quantity) {
            toast.error('Mohon lengkapi semua field');
            return;
        }

        if (sourceWarehouse === targetWarehouse) {
            toast.error('Gudang asal dan tujuan tidak boleh sama');
            return;
        }

        const qtyNum = parseFloat(quantity);
        if (isNaN(qtyNum) || qtyNum <= 0) {
            toast.error('Kuantitas harus lebih besar dari 0');
            return;
        }

        if (qtyNum > maxQty) {
            toast.error(`Stok tidak mencukupi (Tersedia: ${maxQty})`);
            return;
        }

        setSubmitting(true);
        try {
            await axios.post('/api/inventory/movement', {
                tipe: 'TRANSFER',
                tanggal: new Date().toISOString(),
                gudangId: sourceWarehouse,
                gudangTujuanId: targetWarehouse,
                items: [
                    {
                        produkId: selectedProduct,
                        kuantitas: qtyNum
                    }
                ],
                keterangan: notes || 'Transfer Stok Antar Gudang'
            });

            toast.success('Transfer stok berhasil!');

            // Reset form partly
            setQuantity('');
            setNotes('');
            // Refresh stocks
            const res = await axios.get(`/api/inventory/stock?warehouseId=${sourceWarehouse}`);
            setStocks(res.data);

        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal melakukan transfer');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto p-6">
            <div className="flex items-center gap-3 mb-2">
                <ArrowRightLeft className="h-8 w-8 text-primary" />
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Transfer Stok</h1>
                    <p className="text-muted-foreground text-sm">Pindahkan stok antar gudang secara instan</p>
                </div>
            </div>

            <Card className="border-t-4 border-t-primary shadow-md">
                <CardHeader>
                    <CardTitle className="text-lg">Formulir Transfer</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* WAREHOUSE SELECTION */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <div className="space-y-2">
                                <Label>Gudang Asal (Source)</Label>
                                <Select value={sourceWarehouse} onValueChange={setSourceWarehouse}>
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Pilih Gudang Asal..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {warehouses.map(w => (
                                            <SelectItem key={w.id} value={w.id}>{w.nama} ({w.kode})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="hidden md:flex justify-center pt-6">
                                <div className="bg-slate-100 p-2 rounded-full">
                                    <MoveRight className="h-6 w-6 text-slate-400" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Gudang Tujuan (Target)</Label>
                                <Select value={targetWarehouse} onValueChange={setTargetWarehouse}>
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Pilih Gudang Tujuan..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {warehouses
                                            .filter(w => w.id !== sourceWarehouse)
                                            .map(w => (
                                                <SelectItem key={w.id} value={w.id}>{w.nama} ({w.kode})</SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* PRODUCT SELECTION */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Produk</Label>
                                <Select
                                    value={selectedProduct}
                                    onValueChange={setSelectedProduct}
                                    disabled={!sourceWarehouse || loading}
                                >
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder={loading ? "Memuat stok..." : "Pilih Produk..."} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {stocks.filter(s => s.persediaan.produk).map(s => (
                                            <SelectItem key={s.persediaan.produk?.id} value={s.persediaan.produk?.id || ''}>
                                                {s.persediaan.produk?.namaProduk || s.persediaan.namaPersediaan} (Stok: {s.kuantitas} {s.persediaan.satuan})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Kuantitas Transfer</Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        placeholder="0"
                                        className="h-11 pr-12 text-right font-medium text-lg"
                                        min="0.01"
                                        step="any"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                        {selectedStockUnit}
                                    </div>
                                </div>
                                {selectedProduct && (
                                    <p className="text-xs text-right text-muted-foreground">
                                        Maksimal transfer: <span className="font-medium text-primary">{maxQty}</span>
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Keterangan (Opsional)</Label>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Contoh: Restock cabang pusat"
                                className="resize-none"
                            />
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button size="lg" disabled={submitting || !selectedProduct} className="w-full md:w-auto min-w-[200px]">
                                {submitting ? 'Memproses Transfer...' : (
                                    <>
                                        <ArrowRightLeft className="mr-2 h-4 w-4" />
                                        Konfirmasi Transfer
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
