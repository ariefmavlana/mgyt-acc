'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Loader2, ArrowLeft, Edit, Package, Archive, RefreshCw } from 'lucide-react';

export default function ProductDetailPage() {
    const { id } = useParams();
    const router = useRouter();

    const { data: product, isLoading } = useQuery({
        queryKey: ['product', id],
        queryFn: async () => {
            const res = await api.get(`/products/${id}`);
            return res.data;
        }
    });

    const { data: stocks, isLoading: isLoadingStock } = useQuery({
        queryKey: ['product-stock', id],
        queryFn: async () => {
            const res = await api.get(`/inventory/stock?productId=${id}`);
            return res.data;
        },
        enabled: !!product
    });

    if (isLoading) {
        return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
    }

    if (!product) {
        return <div className="p-8 text-center bg-red-50 text-red-600 rounded-md">Produk tidak ditemukan</div>;
    }

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight">{product.namaProduk}</h1>
                            <Badge variant="outline">{product.kodeProduk}</Badge>
                            <Badge variant={product.isAktif ? 'default' : 'secondary'}>
                                {product.isAktif ? 'Aktif' : 'Arsip'}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">{product.kategori} &bull; {product.subKategori || '-'}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Harga Jual</CardTitle>
                        <span className="font-bold text-muted-foreground">IDR</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(Number(product.hargaJualEceran))}</div>
                        <p className="text-xs text-muted-foreground">/{product.satuan}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Harga Modal</CardTitle>
                        <span className="font-bold text-muted-foreground">IDR</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(Number(product.hargaBeli || 0))}</div>
                        <p className="text-xs text-muted-foreground">Estimasi COGS</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Stok</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {/* Calculate total from loaded stocks or display loading */}
                        <div className="text-2xl font-bold">
                            {isLoadingStock ? '...' : stocks?.reduce((acc: any, curr: any) => acc + Number(curr.kuantitas), 0) || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Unit di semua gudang</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Status Inventaris</CardTitle>
                        <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-medium pt-1">
                            {product.persediaan?.stokMinimum > 0 ? (
                                <span className="text-yellow-600">Min: {product.persediaan.stokMinimum}</span>
                            ) : <span>Standar</span>}
                        </div>
                        <p className="text-xs text-muted-foreground">Kebijakan stok</p>
                    </CardContent>
                </Card>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="inventory" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="inventory">Inventaris & Stok</TabsTrigger>
                    <TabsTrigger value="variants">Varian Produk</TabsTrigger>
                    <TabsTrigger value="info">Informasi Detail</TabsTrigger>
                </TabsList>

                <TabsContent value="inventory" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Stok per Gudang</CardTitle>
                            <CardDescription>Posisi stok saat ini di setiap lokasi gudang.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama Gudang</TableHead>
                                        <TableHead>Kode</TableHead>
                                        <TableHead className="text-center">Kuantitas</TableHead>
                                        <TableHead className="text-right">Nilai Estimasi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoadingStock ? (
                                        <TableRow><TableCell colSpan={4} className="text-center">Memuat data stok...</TableCell></TableRow>
                                    ) : stocks && stocks.length > 0 ? (
                                        stocks.map((stock: any) => (
                                            <TableRow key={stock.id}>
                                                <TableCell className="font-medium">{stock.gudang.nama}</TableCell>
                                                <TableCell className="text-muted-foreground">{stock.gudang.kode}</TableCell>
                                                <TableCell className="text-center font-bold text-lg">
                                                    {Number(stock.kuantitas)} <span className="text-xs font-normal text-muted-foreground">{product.satuan}</span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatCurrency(Number(stock.nilaiStok))}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground p-8">Belum ada data stok tercatat.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="variants">
                    <Card>
                        <CardHeader>
                            <CardTitle>Daftar Varian</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama Varian</TableHead>
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Harga Spesifik</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {product.variant && product.variant.length > 0 ? (
                                        product.variant.map((v: any) => (
                                            <TableRow key={v.id}>
                                                <TableCell>{v.namaVariant}</TableCell>
                                                <TableCell>{v.sku}</TableCell>
                                                <TableCell>
                                                    {v.hargaJual ? formatCurrency(Number(v.hargaJual)) : <span className="text-muted-foreground italic">Mengikuti Induk</span>}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={v.isAktif ? 'outline' : 'secondary'}>{v.isAktif ? 'Aktif' : 'Non-Aktif'}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow><TableCell colSpan={4} className="text-center p-8 text-muted-foreground">Produk ini tidak memiliki varian.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="info">
                    <Card>
                        <CardHeader>
                            <CardTitle>Deskripsi & Spesifikasi</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-1">Deskripsi</h4>
                                <p className="text-sm text-muted-foreground whitespace-pre-line">{product.deskripsiSingkat || 'Tidak ada deskripsi.'}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                <div>
                                    <span className="text-sm font-medium text-muted-foreground">Kena PPN?</span>
                                    <p>{product.isPPN ? 'Ya (Taxable)' : 'Tidak (Non-Taxable)'}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-muted-foreground">Dibuat Pada</span>
                                    <p>{new Date(product.createdAt).toLocaleDateString('id-ID')}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
