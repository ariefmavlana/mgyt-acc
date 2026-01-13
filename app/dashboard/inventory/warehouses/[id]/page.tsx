'use client';

import { use, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search, ArrowLeft, ArrowUpRight, ArrowDownLeft, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { id as dateLocale } from 'date-fns/locale';

export default function WarehouseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: warehouseId } = use(params);
    const [search, setSearch] = useState('');

    // Fetch Warehouse Info (using existing list endpoint pending specific detail endpoint, or just filter client side if needed, 
    // but better to have efficient fetch. For now, we assume we might need a specific endpoint or just rely on the Stock fetch returning warehouse info if we are lucky, 
    // BUT checking inventory.controller.ts, getStock returns product stocks. getWarehouses returns list. 
    // Let's assume we can fetch list and find, or we should add a detail endpoint. 
    // For speed, let's use the list and find.)
    const { data: warehouses } = useQuery({
        queryKey: ['warehouses'],
        queryFn: async () => {
            const res = await api.get('/inventory/warehouses');
            return res.data;
        }
    });

    const warehouse = warehouses?.find((w: any) => w.id === warehouseId);

    // Fetch Stock
    const { data: stocks, isLoading: loadingStock } = useQuery({
        queryKey: ['warehouse-stock', warehouseId],
        queryFn: async () => {
            const res = await api.get(`/inventory/stock?warehouseId=${warehouseId}`);
            return res.data;
        }
    });

    // Fetch Movements
    const { data: movements, isLoading: loadingMovements } = useQuery({
        queryKey: ['warehouse-movements', warehouseId],
        queryFn: async () => {
            const res = await api.get(`/inventory/movement?warehouseId=${warehouseId}&limit=50`);
            return res.data; // { data: [], pagination: {} }
        }
    });

    const filteredStocks = stocks?.filter((s: any) =>
        s.persediaan.namaPersediaan.toLowerCase().includes(search.toLowerCase()) ||
        s.persediaan.kodePersediaan.toLowerCase().includes(search.toLowerCase())
    );

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

    if (!warehouse && !warehouses) return <div className="p-6">Memuat...</div>;

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/inventory/warehouses">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{warehouse?.nama || 'Detail Gudang'}</h1>
                    <p className="text-muted-foreground">{warehouse?.kode} - {warehouse?.alamat}</p>
                </div>
            </div>

            <Tabs defaultValue="stock">
                <TabsList>
                    <TabsTrigger value="stock">Stok Saat Ini</TabsTrigger>
                    <TabsTrigger value="history">Riwayat Mutasi</TabsTrigger>
                </TabsList>

                {/* STOCK TAB */}
                <TabsContent value="stock" className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari produk..."
                                className="pl-8"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Kode</TableHead>
                                    <TableHead>Produk</TableHead>
                                    <TableHead className="text-right">Kuantitas</TableHead>
                                    <TableHead className="text-right">Satuan</TableHead>
                                    <TableHead className="text-right hidden md:table-cell">Nilai Estimasi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loadingStock ? (
                                    <TableRow><TableCell colSpan={5} className="text-center">Memuat stok...</TableCell></TableRow>
                                ) : filteredStocks?.length > 0 ? (
                                    filteredStocks.map((item: any) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-mono text-xs">{item.persediaan.kodePersediaan}</TableCell>
                                            <TableCell className="font-medium">{item.persediaan.namaPersediaan}</TableCell>
                                            <TableCell className="text-right font-bold">{Number(item.kuantitas)}</TableCell>
                                            <TableCell className="text-right text-muted-foreground">{item.persediaan.satuan}</TableCell>
                                            <TableCell className="text-right hidden md:table-cell">
                                                {formatCurrency(Number(item.kuantitas) * Number(item.persediaan.hargaBeli || 0))}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Tidak ada stok produk.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                {/* HISTORY TAB */}
                <TabsContent value="history">
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Waktu</TableHead>
                                    <TableHead>Tipe</TableHead>
                                    <TableHead>Referensi</TableHead>
                                    <TableHead>Produk</TableHead>
                                    <TableHead className="text-right">Jumlah</TableHead>
                                    <TableHead className="text-right hidden md:table-cell">Saldo Akhir</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loadingMovements ? (
                                    <TableRow><TableCell colSpan={6} className="text-center">Memuat riwayat...</TableCell></TableRow>
                                ) : movements?.data?.length > 0 ? (
                                    movements.data.map((m: any) => (
                                        <TableRow key={m.id}>
                                            <TableCell className="whitespace-nowrap">
                                                {format(new Date(m.tanggal), 'dd MMM yyyy HH:mm', { locale: dateLocale })}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        m.tipe === 'MASUK' || m.tipe.includes('IN') ? 'border-green-500 text-green-600 bg-green-50' :
                                                            m.tipe === 'KELUAR' || m.tipe.includes('OUT') ? 'border-red-500 text-red-600 bg-red-50' :
                                                                'border-blue-500 text-blue-600 bg-blue-50'
                                                    }
                                                >
                                                    {m.tipe}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">{m.nomorMutasi}</TableCell>
                                            <TableCell>{m.persediaan.namaPersediaan}</TableCell>
                                            <TableCell className="text-right font-medium">
                                                {m.tipe === 'KELUAR' || m.tipe.includes('OUT') ? '-' : '+'}{Number(m.kuantitas)}
                                            </TableCell>
                                            <TableCell className="text-right hidden md:table-cell text-muted-foreground">
                                                {Number(m.saldoSesudah)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Belum ada riwayat mutasi.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
