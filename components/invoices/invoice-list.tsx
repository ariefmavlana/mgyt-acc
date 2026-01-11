'use client';

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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Printer, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface Invoice {
    id: string;
    nomorTransaksi: string;
    tanggal: string;
    tanggalJatuhTempo: string;
    pelanggan: { nama: string };
    total: number;
    sisaPembayaran: number;
    statusPembayaran: 'BELUM_DIBAYAR' | 'DIBAYAR_SEBAGIAN' | 'LUNAS' | 'OVERDUE';
}

export function InvoiceList() {
    const router = useRouter();
    const { data: invoices, isLoading } = useQuery({
        queryKey: ['invoices'],
        queryFn: async () => {
            const res = await api.get('/invoices');
            return res.data.data as Invoice[];
        }
    });

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'LUNAS': return 'bg-green-100 text-green-700';
            case 'DIBAYAR_SEBAGIAN': return 'bg-yellow-100 text-yellow-700';
            case 'OVERDUE': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    if (isLoading) return <div className="p-4 text-center">Memuat daftar invoice...</div>;

    return (
        <div className="rounded-md border bg-white">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nomor Invoice</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Pelanggan</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Sisa Tagihan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices?.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                Belum ada invoice.
                            </TableCell>
                        </TableRow>
                    ) : (
                        invoices?.map((inv) => (
                            <TableRow key={inv.id} className="hover:bg-slate-50/50">
                                <TableCell className="font-mono text-sm">{inv.nomorTransaksi}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span>{format(new Date(inv.tanggal), 'dd MMM yyyy', { locale: idLocale })}</span>
                                        <span className="text-xs text-muted-foreground">
                                            Jatuh tempo: {format(new Date(inv.tanggalJatuhTempo), 'dd MMM', { locale: idLocale })}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">{inv.pelanggan?.nama || '-'}</TableCell>
                                <TableCell className="text-right font-medium">{formatCurrency(inv.total)}</TableCell>
                                <TableCell className="text-right text-muted-foreground">{formatCurrency(inv.sisaPembayaran)}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={getStatusColor(inv.statusPembayaran)}>
                                        {inv.statusPembayaran.replace('_', ' ')}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => router.push(`/dashboard/invoices/${inv.id}`)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                Detail
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/invoices/${inv.id}/print`, '_blank')}>
                                                <Printer className="mr-2 h-4 w-4" />
                                                Cetak PDF
                                            </DropdownMenuItem>
                                            {/* Implement Record Payment Dialog Here later */}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
