'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useHR } from '@/hooks/use-hr';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export default function ContractsPage() {
    const { useEmployees } = useHR();
    const { data: employees, isLoading } = useEmployees();

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Kontrak Kerja</h1>
                    <p className="text-slate-500 mt-1">Monitor status kontrak dan detail employment karyawan.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-slate-200">
                        <Download className="mr-2 h-4 w-4" /> Export Report
                    </Button>
                </div>
            </div>

            {/* Contracts Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Daftar Kontrak Aktif
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Karyawan</TableHead>
                                <TableHead>Jabatan</TableHead>
                                <TableHead>Tanggal Mulai</TableHead>
                                <TableHead>Gaji Pokok</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                            <span>Memuat data kontrak...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : employees && employees.length > 0 ? (
                                employees.map((emp) => (
                                    <TableRow key={emp.id}>
                                        <TableCell>
                                            <div className="font-medium">{emp.nama}</div>
                                            <div className="text-xs text-slate-500">{emp.nik}</div>
                                        </TableCell>
                                        <TableCell>{emp.jabatan}</TableCell>
                                        <TableCell>
                                            {emp.tanggalMasuk ?
                                                format(new Date(emp.tanggalMasuk), 'dd MMM yyyy', { locale: idLocale })
                                                : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(emp.gajiPokok)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={emp.status === 'AKTIF' ? 'default' : 'secondary'}>
                                                {emp.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm">Lihat Detail</Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                        Belum ada data kontrak karyawan.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
