'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CreditCard, Check, ShieldCheck, AlertCircle, Clock, History, ArrowUpCircle, Loader2 } from 'lucide-react';
import { useSubscription, Paket, SubscriptionRequest } from '@/hooks/use-subscription';
import { useCompany } from '@/hooks/use-company';
import { Tier, TIER_LIMITS } from '@/lib/tier-config';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const TIER_DESCRIPTIONS = {
    UMKM: 'Cocok untuk usaha mikro yang baru memulai digitalisasi akuntansi.',
    SMALL: 'Ideal untuk bisnis berkembang dengan beberapa cabang.',
    MEDIUM: 'Solusi lengkap untuk perusahaan menengah dengan departemen SDM.',
    ENTERPRISE: 'Skalabilitas tanpa batas untuk korporasi besar dan grup perusahaan.'
};

export function SubscriptionSettings() {
    const { currentCompany } = useCompany();
    const { useAvailablePackages, useSubscriptionRequests, createRequest } = useSubscription();
    const { data: packages, isLoading: pkgLoading } = useAvailablePackages();
    const { data: requests, isLoading: reqLoading } = useSubscriptionRequests();

    const [requestModal, setRequestModal] = useState<{ open: boolean; targetTier: Tier | null }>({
        open: false,
        targetTier: null
    });
    const [note, setNote] = useState('');

    const currentTier = (currentCompany?.tier || 'UMKM') as Tier;

    const handleRequestUpgrade = async () => {
        if (!requestModal.targetTier) return;
        await createRequest.mutateAsync({
            paketTier: requestModal.targetTier,
            catatan: note
        });
        setRequestModal({ open: false, targetTier: null });
        setNote('');
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING': return <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200">Menunggu</Badge>;
            case 'APPROVED': return <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">Disertujui</Badge>;
            case 'REJECTED': return <Badge variant="outline" className="text-red-600 bg-red-50 border-red-200">Ditolak</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Current Plan Header */}
            <Card className="border-primary/20 bg-primary/5 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4">
                    <ShieldCheck className="h-16 w-16 text-primary/10 -rotate-12" />
                </div>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="bg-primary p-2 rounded-lg text-white shadow-md">
                            <CreditCard className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-bold font-outfit text-slate-900">
                                Paket Saat Ini: <span className="text-primary">{currentTier}</span>
                            </CardTitle>
                            <CardDescription className="text-slate-600">
                                {TIER_DESCRIPTIONS[currentTier]}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                    <div className="space-y-1">
                        <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">Limit Perusahaan</span>
                        <p className="text-lg font-semibold text-slate-800">{TIER_LIMITS[currentTier].maxCompanies} Perusahaan</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">Limit Cabang</span>
                        <p className="text-lg font-semibold text-slate-800">{TIER_LIMITS[currentTier].maxBranches} Cabang</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">Limit Karyawan</span>
                        <p className="text-lg font-semibold text-slate-800">{TIER_LIMITS[currentTier].maxEmployees} Karyawan</p>
                    </div>
                </CardContent>
            </Card>

            {/* Tier Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(['UMKM', 'SMALL', 'MEDIUM', 'ENTERPRISE'] as Tier[]).map((tier) => {
                    const isCurrent = currentTier === tier;
                    const isUpgrade = !isCurrent && TIER_LIMITS[tier].maxCompanies > TIER_LIMITS[currentTier].maxCompanies;

                    return (
                        <Card key={tier} className={`flex flex-col border-slate-200 shadow-sm hover:shadow-md transition-all ${isCurrent ? 'ring-2 ring-primary' : ''}`}>
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold font-outfit">{tier}</h3>
                                    {isCurrent && <Badge className="bg-primary text-white">Aktif</Badge>}
                                </div>
                                <CardDescription className="text-xs min-h-[40px]">
                                    {TIER_DESCRIPTIONS[tier]}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Check className="h-4 w-4 text-green-500" />
                                        <span>Max {TIER_LIMITS[tier].maxCompanies} Perusahaan</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Check className="h-4 w-4 text-green-500" />
                                        <span>Max {TIER_LIMITS[tier].maxBranches} Cabang</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Check className="h-4 w-4 text-green-500" />
                                        <span>Max {TIER_LIMITS[tier].maxEmployees} Anggota</span>
                                    </div>
                                </div>
                                <hr className="border-slate-100" />
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fitur Utama:</p>
                                    {tier === 'UMKM' && <p className="text-xs text-slate-600">• Akuntansi Dasar & Inventaris</p>}
                                    {tier === 'SMALL' && <p className="text-xs text-slate-600">• Perpajakan & Multi Cabang</p>}
                                    {tier === 'MEDIUM' && <p className="text-xs text-slate-600">• Budgeting & HR Payroll</p>}
                                    {tier === 'ENTERPRISE' && <p className="text-xs text-slate-600">• Audit Trail & Cost Center</p>}
                                </div>
                            </CardContent>
                            <CardFooter>
                                {isUpgrade ? (
                                    <Button
                                        className="w-full bg-slate-900 hover:bg-slate-800"
                                        onClick={() => setRequestModal({ open: true, targetTier: tier })}
                                    >
                                        <ArrowUpCircle className="mr-2 h-4 w-4" /> Minta Upgrade
                                    </Button>
                                ) : (
                                    <Button variant="outline" className="w-full" disabled>
                                        {isCurrent ? 'Paket Anda' : 'Tier Dasar'}
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>

            {/* Request History */}
            {requests && requests.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <History className="h-5 w-5 text-slate-400" />
                        <h3 className="text-lg font-bold font-outfit">Riwayat Permintaan</h3>
                    </div>
                    <Card className="border-slate-200 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Tujuan Paket</TableHead>
                                    <TableHead>Catatan</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Diproses Oleh</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.map((req) => (
                                    <TableRow key={req.id}>
                                        <TableCell className="text-xs font-mono">
                                            {format(new Date(req.createdAt), 'dd MMM yyyy HH:mm', { locale: idLocale })}
                                        </TableCell>
                                        <TableCell className="font-bold text-primary">{req.paketTarget.tier}</TableCell>
                                        <TableCell className="text-xs text-slate-500 max-w-[200px] truncate">{req.catatan || '-'}</TableCell>
                                        <TableCell>{getStatusBadge(req.status)}</TableCell>
                                        <TableCell className="text-xs">
                                            {req.status !== 'PENDING' ? (
                                                <div className="flex flex-col">
                                                    <span>CEO / Finance Admin</span>
                                                    {req.tanggalApproval && <span className="text-slate-400">{format(new Date(req.tanggalApproval), 'dd/MM/yy')}</span>}
                                                </div>
                                            ) : '-'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </div>
            )}

            {/* Upgrade Modal */}
            <Dialog open={requestModal.open} onOpenChange={(open) => setRequestModal({ ...requestModal, open })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Minta Upgrade Paket</DialogTitle>
                        <DialogDescription>
                            Anda akan mengajukan permintaan upgrade ke paket <strong>{requestModal.targetTier}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Alasan atau Catatan Tambahan (Opsional)</Label>
                            <Textarea
                                placeholder="Jelaskan mengapa Anda membutuhkan upgrade ini..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                            <AlertCircle className="h-5 w-5 text-blue-600 shrink-0" />
                            <p className="text-xs text-blue-700 leading-relaxed">
                                Permintaan Anda akan dikirim ke **Pemilik Akun** atau **Administrator Utama** untuk disetujui. Setelah disetujui, fitur tambahan akan langsung aktif.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRequestModal({ open: false, targetTier: null })}>Batal</Button>
                        <Button
                            onClick={handleRequestUpgrade}
                            disabled={createRequest.isPending}
                        >
                            {createRequest.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Kirim Permintaan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
