'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, History, Eye, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { TierGuard } from '@/components/auth/tier-guard';

// Helper to format JSON diff
const JSONViewer = ({ data }: { data: any }) => {
    if (!data) return <span className="text-slate-400 italic">Tidak ada data</span>;
    return (
        <pre className="bg-slate-50 p-3 rounded text-xs font-mono overflow-auto max-h-[200px] border border-slate-200">
            {JSON.stringify(data, null, 2)}
        </pre>
    );
};

export default function AuditPage() {
    const [search, setSearch] = useState('');
    const [selectedLog, setSelectedLog] = useState<any>(null);

    const { data: logs, isLoading } = useQuery({
        queryKey: ['audit-logs', search],
        queryFn: async () => {
            const { data } = await api.get('/system/audit', { params: { search } });
            return data.data;
        }
    });

    const getActionColor = (action: string) => {
        switch (action) {
            case 'CREATE': return 'bg-green-100 text-green-700 hover:bg-green-100';
            case 'UPDATE': return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
            case 'DELETE': return 'bg-red-100 text-red-700 hover:bg-red-100';
            case 'LOGIN': return 'bg-purple-100 text-purple-700 hover:bg-purple-100';
            default: return 'bg-slate-100 text-slate-700 hover:bg-slate-100';
        }
    };

    return (
        <TierGuard feature="audit" allowedRoles={['ADMIN', 'SUPERADMIN']}>
            <div className="p-8 space-y-8 animate-in fade-in duration-500">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                            <History className="h-8 w-8 text-slate-700" />
                            Jejak Audit
                        </h1>
                        <p className="text-slate-500 mt-1">
                            Rekam jejak aktivitas pengguna untuk keamanan dan kepatuhan.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Filter className="mr-2 h-4 w-4" /> Filter Lanjutan
                        </Button>
                        <Button variant="outline">Ekspor Log</Button>
                    </div>
                </div>

                {/* Content */}
                <Card>
                    <CardHeader className="pb-3 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                            <CardTitle>Aktivitas Terbaru</CardTitle>
                            <div className="relative w-full max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Cari user, modul, atau aksi..."
                                    className="pl-10 bg-slate-50"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[180px]">Waktu</TableHead>
                                    <TableHead>Pengguna</TableHead>
                                    <TableHead>Aksi</TableHead>
                                    <TableHead>Modul / Entitas</TableHead>
                                    <TableHead>Keterangan</TableHead>
                                    <TableHead className="text-right">Detail</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            <div className="flex items-center justify-center gap-2 text-slate-500">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>Memuat log...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : logs?.length > 0 ? (
                                    logs.map((log: any) => (
                                        <TableRow key={log.id} className="hover:bg-slate-50/50">
                                            <TableCell className="font-medium text-slate-600">
                                                {format(new Date(log.createdAt), 'dd MMM HH:mm', { locale: idLocale })}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                                        {log.pengguna?.namaLengkap?.[0] || '?'}
                                                    </div>
                                                    <span className="text-sm font-medium">{log.pengguna?.namaLengkap || 'System'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className={getActionColor(log.aksi)}>
                                                    {log.aksi}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                                    {log.modul}
                                                </span>
                                            </TableCell>
                                            <TableCell className="max-w-[300px] truncate text-slate-500">
                                                {log.keterangan || '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)}>
                                                            <Eye className="h-4 w-4 text-slate-400 hover:text-primary" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-2xl">
                                                        <DialogHeader>
                                                            <DialogTitle>Detail Log Aktivitas</DialogTitle>
                                                            <DialogDescription>
                                                                ID: <span className="font-mono">{log.id}</span>
                                                            </DialogDescription>
                                                        </DialogHeader>

                                                        <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <h4 className="font-semibold text-slate-900 mb-2">Informasi Dasar</h4>
                                                                    <div className="grid grid-cols-2 gap-2 text-slate-500">
                                                                        <span>Waktu:</span>
                                                                        <span className="text-slate-900">{format(new Date(log.createdAt), 'dd MMM yyyy HH:mm:ss')}</span>
                                                                        <span>Pengguna:</span>
                                                                        <span className="text-slate-900">{log.pengguna?.namaLengkap || 'System'}</span>
                                                                        <span>IP Address:</span>
                                                                        <span className="text-slate-900 font-mono">{log.ipAddress || '-'}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <h4 className="font-semibold text-slate-900 mb-2">Target Data</h4>
                                                                    <div className="grid grid-cols-2 gap-2 text-slate-500">
                                                                        <span>Modul:</span>
                                                                        <span className="text-slate-900">{log.modul}</span>
                                                                        <span>ID Data:</span>
                                                                        <span className="text-slate-900 font-mono text-xs">{log.idData}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="mt-6 space-y-4">
                                                            {log.dataSebelum && (
                                                                <div>
                                                                    <h4 className="font-semibold text-slate-900 mb-2 text-xs uppercase tracking-wider">Data Sebelum (Before)</h4>
                                                                    <JSONViewer data={log.dataSebelum} />
                                                                </div>
                                                            )}
                                                            {log.dataSesudah && (
                                                                <div>
                                                                    <h4 className="font-semibold text-slate-900 mb-2 text-xs uppercase tracking-wider">Data Sesudah (After)</h4>
                                                                    <JSONViewer data={log.dataSesudah} />
                                                                </div>
                                                            )}
                                                            {!log.dataSebelum && !log.dataSesudah && (
                                                                <div className="text-center py-8 text-slate-400 bg-slate-50 rounded border border-dashed border-slate-200">
                                                                    Tidak ada detail perubahan data
                                                                </div>
                                                            )}
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                                            Belum ada aktivitas yang terekam.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </TierGuard>
    );
}
