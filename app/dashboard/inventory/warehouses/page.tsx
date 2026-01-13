'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Box, ArrowRight, ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';

interface Warehouse {
    id: string;
    kode: string;
    nama: string;
    alamat: string;
    isUtama: boolean;
    cabang: {
        nama: string;
    };
    _count?: {
        stokPersediaan: number;
    }
}

export default function WarehousesPage() {
    const { data: warehouses, isLoading } = useQuery({
        queryKey: ['warehouses'],
        queryFn: async () => {
            const res = await api.get('/inventory/warehouses');
            return res.data;
        }
    });

    if (isLoading) {
        return <div className="p-6">Memuat data gudang...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Daftar Gudang</h1>
                    <p className="text-muted-foreground">Kelola lokasi penyimpanan dan stok per gudang.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/inventory/transfer">
                            <ArrowRightLeft className="mr-2 h-4 w-4" /> Transfer Stok
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/dashboard/inventory/warehouses/new">Tambah Gudang</Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {warehouses?.map((w: Warehouse) => (
                    <Card key={w.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg">{w.nama}</CardTitle>
                                    <CardDescription>{w.kode}</CardDescription>
                                </div>
                                {w.isUtama && <Badge variant="default">Utama</Badge>}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start text-sm text-muted-foreground">
                                <MapPin className="mr-2 h-4 w-4 mt-0.5 shrink-0" />
                                <span>{w.alamat || 'Tidak ada alamat'}</span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Box className="mr-2 h-4 w-4" />
                                <span>{w.cabang?.nama}</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full" asChild>
                                <Link href={`/dashboard/inventory/warehouses/${w.id}`}>
                                    Lihat Stok <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
