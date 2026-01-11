'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Fixed import path
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MovementHistoryPage() {
    const router = useRouter();
    const [page, setPage] = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: ['movements-history', page],
        queryFn: async () => {
            const res = await api.get(`/inventory/movement?page=${page}&limit=20`);
            return res.data;
        }
    });

    const movements = data?.data || [];
    const pagination = data?.pagination;

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Riwayat Pergerakan Stok</h1>
                    <p className="text-muted-foreground">Audit log lengkap semua transaksi inventaris.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Log Transaksi</CardTitle>
                    <CardDescription>Menampilkan semua mutasi Masuk, Keluar, Transfer, dan Adjustment.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No. Mutasi</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Tipe</TableHead>
                                <TableHead>Item</TableHead>
                                <TableHead className="text-right">Qty</TableHead>
                                <TableHead>Gudang</TableHead>
                                <TableHead>Referensi</TableHead>
                                <TableHead>Keterangan</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-10">
                                        <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                                    </TableCell>
                                </TableRow>
                            ) : movements.length > 0 ? (
                                movements.map((m: any) => (
                                    <TableRow key={m.id}>
                                        <TableCell className="font-medium text-xs font-mono">{m.nomorMutasi}</TableCell>
                                        <TableCell>{new Date(m.tanggal).toLocaleDateString('id-ID')}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className={
                                                m.tipe.includes('IN') || m.tipe === 'MASUK' ? 'bg-green-100 text-green-800' :
                                                    m.tipe.includes('OUT') || m.tipe === 'KELUAR' ? 'bg-red-100 text-red-800' :
                                                        'bg-blue-100 text-blue-800'
                                            }>{m.tipe}</Badge>
                                        </TableCell>
                                        <TableCell>{m.persediaan?.namaPersediaan}</TableCell>
                                        <TableCell className="text-right font-bold">{Number(m.kuantitas)}</TableCell>
                                        <TableCell>{m.gudang?.nama}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm">{m.referensi || '-'}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm max-w-xs truncate">{m.keterangan}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                        Data tidak ditemukan.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
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
