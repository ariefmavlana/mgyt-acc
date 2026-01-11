'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Printer, CreditCard } from 'lucide-react';
import { PaymentModal } from '@/components/invoices/payment-modal';

export default function InvoiceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { data: invoice, isLoading, refetch } = useQuery({
        queryKey: ['invoice', id],
        queryFn: async () => {
            const res = await api.get(`/invoices/${id}`);
            return res.data;
        }
    });

    if (isLoading) return <div className="p-8 text-center">Memuat detail invoice...</div>;
    if (!invoice) return <div className="p-8 text-center text-red-500">Invoice tidak ditemukan</div>;

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'LUNAS': return 'bg-green-100 text-green-700';
            case 'DIBAYAR_SEBAGIAN': return 'bg-yellow-100 text-yellow-700';
            case 'OVERDUE': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Invoice {invoice.nomorTransaksi}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={getStatusColor(invoice.statusPembayaran)}>
                                {invoice.statusPembayaran.replace('_', ' ')}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                                {format(new Date(invoice.tanggal), 'dd MMMM yyyy', { locale: idLocale })}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/invoices/${id}/print`, '_blank')}>
                        <Printer className="mr-2 h-4 w-4" />
                        Cetak PDF
                    </Button>
                    {invoice.statusPembayaran !== 'LUNAS' && (
                        <PaymentModal
                            invoiceId={invoice.id}
                            sisaTagihan={Number(invoice.sisaPembayaran)}
                            onSuccess={() => refetch()}
                            trigger={
                                <Button>
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Catat Pembayaran
                                </Button>
                            }
                        />
                    )}
                </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Content (Items) */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Rincian Item</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Deskripsi</TableHead>
                                        <TableHead className="text-center w-[80px]">Qty</TableHead>
                                        <TableHead className="text-right">Harga</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoice.detail.map((item: any) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.deskripsi}</TableCell>
                                            <TableCell className="text-center">{item.kuantitas}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(Number(item.hargaSatuan))}</TableCell>
                                            <TableCell className="text-right font-medium">{formatCurrency(Number(item.subtotal))}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Payment History */}
                    {invoice.piutangs?.[0]?.pembayaran?.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Riwayat Pembayaran</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tanggal</TableHead>
                                            <TableHead>Metode</TableHead>
                                            <TableHead>Refferensi</TableHead>
                                            <TableHead className="text-right">Jumlah</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {invoice.piutangs[0].pembayaran.map((pay: any) => (
                                            <TableRow key={pay.id}>
                                                <TableCell>{format(new Date(pay.tanggalBayar), 'dd/MM/yy')}</TableCell>
                                                <TableCell>{pay.tipePembayaran}</TableCell>
                                                <TableCell>{pay.nomorReferensi || '-'}</TableCell>
                                                <TableCell className="text-right font-medium text-green-600">
                                                    {formatCurrency(Number(pay.jumlahBayar))}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Pelanggan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                <p className="font-medium text-lg">{invoice.pelanggan?.nama}</p>
                                <p className="text-sm text-muted-foreground">{invoice.pelanggan?.alamat || 'Alamat tidak tersedia'}</p>
                                <p className="text-sm text-muted-foreground">{invoice.pelanggan?.email}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Ringkasan Tagihan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>{formatCurrency(Number(invoice.subtotal))}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Pajak</span>
                                <span>{formatCurrency(Number(invoice.pajak || 0))}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>{formatCurrency(Number(invoice.total))}</span>
                            </div>
                            <div className="flex justify-between text-sm text-muted-foreground pt-2">
                                <span>Sudah Dibayar</span>
                                <span>{formatCurrency(Number(invoice.total) - Number(invoice.sisaPembayaran))}</span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-md flex justify-between font-medium text-red-600 border border-slate-200">
                                <span>Sisa Tagihan</span>
                                <span>{formatCurrency(Number(invoice.sisaPembayaran))}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
