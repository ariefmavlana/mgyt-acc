'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { usePayroll } from '@/hooks/use-payroll';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Loader2, Plus, RefreshCw, Send, History } from 'lucide-react';

export default function PayrollPage() {
    const [period, setPeriod] = useState(format(new Date(), 'yyyy-MM'));
    const { useHistory, processPayroll, postToJournal } = usePayroll();
    const { data: history, isLoading } = useHistory(period);

    const handleProcess = () => {
        processPayroll.mutate({
            period,
            tanggalBayar: new Date(),
        });
    };

    const handlePost = () => {
        postToJournal.mutate({ period });
    };

    const totalNetto = history?.reduce((sum: number, p: any) => sum + Number(p.netto), 0) || 0;
    const totalPph = history?.reduce((sum: number, p: any) => sum + Number(p.potonganPph21), 0) || 0;

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gold">Penggajian (Payroll)</h1>
                    <p className="text-muted-foreground mt-1">Kelola gaji karyawan, pajak PPh 21, dan laporan penggajian.</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={handleProcess}
                        disabled={processPayroll.isPending}
                        className="border-gold text-gold hover:bg-gold/10"
                    >
                        {processPayroll.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                        Proses Gaji
                    </Button>
                    <Button
                        className="bg-gold text-black hover:bg-gold/90"
                        onClick={handlePost}
                        disabled={postToJournal.isPending || (history?.length === 0)}
                    >
                        {postToJournal.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                        Posting ke Jurnal
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-void border-gold/20 shadow-lg shadow-gold/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Gaji Bersih ({period})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gold">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalNetto)}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-void border-gold/20 shadow-lg shadow-gold/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total PPh 21</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-400">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalPph)}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-void border-gold/20 shadow-lg shadow-gold/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Filter Periode</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Input
                            type="month"
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="bg-black/50 border-gold/20"
                        />
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-void border-gold/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="w-5 h-5 text-gold" />
                        Riwayat Payroll - {period}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="w-8 h-8 animate-spin text-gold" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-gold/20 hover:bg-gold/5">
                                    <TableHead>Karyawan</TableHead>
                                    <TableHead>Jabatan</TableHead>
                                    <TableHead>Total Penghasilan</TableHead>
                                    <TableHead>PPh 21</TableHead>
                                    <TableHead>BPJS</TableHead>
                                    <TableHead>Gaji Bersih</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {history?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            Belum ada data payroll untuk periode ini. Klik "Proses Gaji" untuk memulai.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    history?.map((item: any) => (
                                        <TableRow key={item.id} className="border-gold/10 hover:bg-gold/5">
                                            <TableCell>
                                                <div className="font-medium text-white">{item.karyawan.nama}</div>
                                                <div className="text-xs text-muted-foreground">{item.karyawan.nik}</div>
                                            </TableCell>
                                            <TableCell>{item.karyawan.jabatan}</TableCell>
                                            <TableCell>{new Intl.NumberFormat('id-ID').format(item.totalPenghasilan)}</TableCell>
                                            <TableCell className="text-blue-400">{new Intl.NumberFormat('id-ID').format(item.potonganPph21)}</TableCell>
                                            <TableCell className="text-orange-400">{new Intl.NumberFormat('id-ID').format(item.potonganBpjs)}</TableCell>
                                            <TableCell className="font-bold text-gold">{new Intl.NumberFormat('id-ID').format(item.netto)}</TableCell>
                                            <TableCell>
                                                {item.sudahDijurnal ? (
                                                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">POSTED</Badge>
                                                ) : (
                                                    <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">DRAFT</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 text-xs text-gold border border-gold/20 hover:bg-gold/10"
                                                    onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/payroll/${item.id}/slip`, '_blank')}
                                                >
                                                    Slip PDF
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
