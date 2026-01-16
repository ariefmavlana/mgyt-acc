'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import axios from 'axios';
import { toast } from 'sonner';
import { Save, RefreshCcw } from 'lucide-react';

interface Warehouse {
    id: string;
    nama: string;
    kode: string;
}

interface ProductStock {
    id: string; // StockPersediaan ID
    persediaanId: string;
    gudangId: string;
    kuantitas: number;
    persediaan: {
        id: string;
        kodePersediaan: string;
        namaPersediaan: string;
        satuan: string;
        produk?: {
            id: string;
            namaProduk: string;
        };
    };
    gudang: {
        id: string;
        nama: string;
        kode: string;
    }
}

interface Account {
    id: string;
    namaAkun: string;
    kodeAkun: string;
}

export default function StockOpnamePage() {
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<string>('');
    const [stocks, setStocks] = useState<ProductStock[]>([]);
    const [opnameItems, setOpnameItems] = useState<Record<string, number>>({}); // stockId -> actualQty
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [whRes, accRes] = await Promise.all([
                    api.get('/inventory/warehouses'),
                    api.get('/coa?flatten=true')
                ]);
                setWarehouses(whRes.data);
                setAccounts(accRes.data);
            } catch (error) {
                console.error('Failed to load initial data', error);
                toast.error('Gagal memuat data pendukung');
            }
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        if (selectedWarehouse) {
            fetchStock(selectedWarehouse);
        } else {
            setStocks([]);
            setOpnameItems({});
        }
    }, [selectedWarehouse]);

    const fetchStock = async (warehouseId: string) => {
        setLoading(true);
        try {
            const res = await api.get(`/inventory/stock?warehouseId=${warehouseId}`);
            setStocks(res.data);
            const initialOpname: Record<string, number> = {};
            res.data.forEach((s: ProductStock) => {
                initialOpname[s.id] = Number(s.kuantitas);
            });
            setOpnameItems(initialOpname);
        } catch {
            toast.error('Gagal memuat stok');
        } finally {
            setLoading(false);
        }
    };

    const handleQtyChange = (stockId: string, val: string) => {
        const qty = parseFloat(val);
        if (!isNaN(qty)) {
            setOpnameItems(prev => ({ ...prev, [stockId]: qty }));
        }
    };

    const handleSubmit = async () => {
        if (!selectedWarehouse) return;
        if (!selectedAccount) {
            toast.error('Pilih Akun Penyesuaian terlebih dahulu');
            return;
        }
        setSubmitting(true);

        try {
            const itemsToAdjust = stocks.map(stock => {
                const actual = opnameItems[stock.id] ?? Number(stock.kuantitas);
                const system = Number(stock.kuantitas);
                const diff = actual - system;

                if (diff === 0) return null;
                if (!stock.persediaan.produk?.id) return null; // Skip if no linked product

                return {
                    produkId: stock.persediaan.produk.id,
                    kuantitas: diff, // + or -
                };
            }).filter(Boolean);

            if (itemsToAdjust.length === 0) {
                toast.info('Tidak ada selisih stok yang ditemukan');
                setSubmitting(false);
                return;
            }

            // Send to Backend
            await api.post('/inventory/movement', {
                items: itemsToAdjust,
                gudangId: selectedWarehouse,
                akunId: selectedAccount,
                tipe: 'ADJUSTMENT',
                tanggal: new Date().toISOString(),
                keterangan: 'Stock Opname Adjustment',
                referensi: `SO-${new Date().toISOString().slice(0, 10)}`
            });

            toast.success('Stok dan jurnal berhasil disesuaikan');
            fetchStock(selectedWarehouse); // Refresh

        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || 'Gagal menyimpan penyesuaian');
            } else {
                toast.error('Terjadi kesalahan yang tidak diketahui');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">Stock Opname</h1>

            <Card className="p-4">
                <div className="flex gap-4 items-end flex-wrap">
                    <div className="space-y-2 w-[300px]">
                        <label className="text-sm font-medium">Pilih Gudang</label>
                        <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Gudang..." />
                            </SelectTrigger>
                            <SelectContent>
                                {warehouses.map(w => (
                                    <SelectItem key={w.id} value={w.id}>{w.nama} ({w.kode})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2 w-[300px]">
                        <label className="text-sm font-medium">Akun Penyesuaian</label>
                        <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Akun Penyesuaian..." />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts.map(acc => (
                                    <SelectItem key={acc.id} value={acc.id}>{acc.kodeAkun} - {acc.namaAkun}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => selectedWarehouse && fetchStock(selectedWarehouse)}
                        disabled={loading || !selectedWarehouse}
                    >
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                </div>
            </Card>

            {selectedWarehouse && (
                <Card className="p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-slate-500">Kode</th>
                                    <th className="px-4 py-3 text-left font-medium text-slate-500">Produk</th>
                                    <th className="px-4 py-3 text-right font-medium text-slate-500">Stok Sistem</th>
                                    <th className="px-4 py-3 text-right font-medium text-slate-500 w-[150px]">Stok Fisik</th>
                                    <th className="px-4 py-3 text-right font-medium text-slate-500">Selisih</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {stocks.map((stock) => {
                                    const actual = opnameItems[stock.id] ?? Number(stock.kuantitas);
                                    const diff = actual - Number(stock.kuantitas);
                                    const hasDiff = diff !== 0;

                                    return (
                                        <tr key={stock.id} className={hasDiff ? 'bg-yellow-50/50' : ''}>
                                            <td className="px-4 py-3">{stock.persediaan.kodePersediaan}</td>
                                            <td className="px-4 py-3">{stock.persediaan.namaPersediaan}</td>
                                            <td className="px-4 py-3 text-right">{Number(stock.kuantitas)} {stock.persediaan.satuan}</td>
                                            <td className="px-4 py-3 text-right">
                                                <Input
                                                    type="number"
                                                    className="text-right h-8"
                                                    value={opnameItems[stock.id] ?? ''}
                                                    onChange={(e) => handleQtyChange(stock.id, e.target.value)}
                                                />
                                            </td>
                                            <td className={`px-4 py-3 text-right font-medium ${diff < 0 ? 'text-red-500' : diff > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                                                {diff > 0 ? '+' : ''}{diff}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {stocks.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                                            Tidak ada data stok di gudang ini
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 border-t bg-slate-50 flex justify-end gap-2">
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={submitting || stocks.length === 0}
                            className="w-[200px]"
                        >
                            {submitting ? 'Menyimpan...' : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Simpan Opname & Jurnal
                                </>
                            )}
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
}
