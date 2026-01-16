'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Building2, Plus, Pencil, Trash2, MapPin, Phone, Mail, User, Loader2 } from 'lucide-react';
import { useCompany, Branch } from '@/hooks/use-company';
import { toast } from 'sonner';
import { Tier, TIER_LIMITS } from '@/lib/tier-config';
import { AlertCircle } from 'lucide-react';

export function BranchSettings() {
    const { currentCompany, useBranches, createBranch, updateBranch, deleteBranch } = useCompany();
    const { data: branches, isLoading } = useBranches();
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

    const currentTier = (currentCompany?.tier || 'UMKM') as Tier;
    const maxBranches = TIER_LIMITS[currentTier]?.maxBranches || 0;
    const isLimitReached = (branches?.length || 0) >= maxBranches;

    const [form, setForm] = useState<Partial<Branch>>({
        kode: '',
        nama: '',
        alamat: '',
        kota: '',
        telepon: '',
        email: '',
        kepala: '',
        isKantor: false
    });

    const resetForm = () => {
        setForm({
            kode: '',
            nama: '',
            alamat: '',
            kota: '',
            telepon: '',
            email: '',
            kepala: '',
            isKantor: false
        });
        setEditingBranch(null);
    };

    const handleEdit = (branch: Branch) => {
        setEditingBranch(branch);
        setForm({
            kode: branch.kode,
            nama: branch.nama,
            alamat: branch.alamat || '',
            kota: branch.kota || '',
            telepon: branch.telepon || '',
            email: branch.email || '',
            kepala: branch.kepala || '',
            isKantor: branch.isKantor
        });
        setOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            if (editingBranch) {
                await updateBranch(editingBranch.id, form);
                toast.success('Cabang berhasil diperbarui');
            } else {
                await createBranch(form);
                toast.success('Cabang baru berhasil ditambahkan');
            }
            setOpen(false);
            resetForm();
        } catch (error) {
            toast.error('Gagal menyimpan data cabang');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus cabang ini?')) return;
        try {
            await deleteBranch(id);
            toast.success('Cabang berhasil dihapus');
        } catch (error) {
            toast.error('Gagal menghapus cabang');
            console.error(error);
        }
    };

    return (
        <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/30 border-b border-slate-100/50 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <Building2 className="h-5 w-5 text-primary" />
                        Daftar Cabang
                    </CardTitle>
                    <CardDescription>
                        Kelola unit bisnis atau kantor cabang perusahaan Anda.
                    </CardDescription>
                </div>
                <Dialog open={open} onOpenChange={(val) => { if (isLimitReached && !editingBranch && val) return; setOpen(val); if (!val) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button
                            className={cn(
                                "transition-all duration-200",
                                isLimitReached && !editingBranch ? "bg-slate-100 text-slate-400 cursor-not-allowed hover:bg-slate-100" : "bg-primary hover:bg-primary/90 shadow-sm"
                            )}
                            disabled={isLimitReached && !editingBranch}
                        >
                            {isLimitReached && !editingBranch ? (
                                <><AlertCircle className="mr-2 h-4 w-4" /> Limit Cabang Tercapai</>
                            ) : (
                                <><Plus className="mr-2 h-4 w-4" /> Tambah Cabang</>
                            )}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>{editingBranch ? 'Edit Cabang' : 'Tambah Cabang Baru'}</DialogTitle>
                                <DialogDescription>
                                    Lengkapi informasi detail mengenai cabang perusahaan Anda.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-6 py-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="kode">Kode Cabang</Label>
                                        <Input id="kode" value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value })} placeholder="HO, CBR, etc." required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="nama">Nama Cabang</Label>
                                        <Input id="nama" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="Kantor Pusat" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="alamat">Alamat Lengkap</Label>
                                    <Input id="alamat" value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} placeholder="Jl. Sudirman No. 1" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="kota">Kota</Label>
                                        <Input id="kota" value={form.kota} onChange={(e) => setForm({ ...form, kota: e.target.value })} placeholder="Jakarta" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="kepala">Kepala Cabang</Label>
                                        <Input id="kepala" value={form.kepala} onChange={(e) => setForm({ ...form, kepala: e.target.value })} placeholder="Nama Pimpinan" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="telepon">No. Telepon</Label>
                                        <Input id="telepon" value={form.telepon} onChange={(e) => setForm({ ...form, telepon: e.target.value })} placeholder="021-..." />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="branch@mavlana.com" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isKantor"
                                        checked={form.isKantor}
                                        onChange={(e) => setForm({ ...form, isKantor: e.target.checked })}
                                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                                    />
                                    <Label htmlFor="isKantor" className="text-sm cursor-pointer">Jadikan sebagai Kantor Pusat Utama</Label>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {editingBranch ? 'Simpan Perubahan' : 'Tambah Cabang'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent className="p-0">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20 text-slate-400">
                        <Loader2 className="h-8 w-8 animate-spin mr-3" />
                        <span>Memuat data cabang...</span>
                    </div>
                ) : branches && branches.length > 0 ? (
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead className="w-[100px] font-semibold text-slate-700">Kode</TableHead>
                                <TableHead className="font-semibold text-slate-700">Nama Cabang</TableHead>
                                <TableHead className="font-semibold text-slate-700">Kepala Cabang</TableHead>
                                <TableHead className="font-semibold text-slate-700">Kontak</TableHead>
                                <TableHead className="text-right font-semibold text-slate-700">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {branches.map((branch) => (
                                <TableRow key={branch.id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell className="font-medium font-mono text-xs">{branch.kode}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-900">{branch.nama}</span>
                                            {branch.isKantor && (
                                                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full w-fit mt-1 font-bold">KANTOR PUSAT</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <User className="h-3.5 w-3.5 text-slate-400" />
                                            {branch.kepala || '-'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1 text-xs">
                                            {branch.telepon && (
                                                <div className="flex items-center gap-1.5 text-slate-600">
                                                    <Phone className="h-3 w-3 text-slate-400" />
                                                    {branch.telepon}
                                                </div>
                                            )}
                                            {branch.email && (
                                                <div className="flex items-center gap-1.5 text-slate-600">
                                                    <Mail className="h-3 w-3 text-slate-400" />
                                                    {branch.email}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1.5 text-slate-500 italic">
                                                <MapPin className="h-3 w-3 text-slate-400" />
                                                {branch.kota || 'N/A'}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/5 transition-all" onClick={() => handleEdit(branch)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all" onClick={() => handleDelete(branch.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                        <div className="bg-slate-50 p-6 rounded-full mb-6">
                            <Building2 className="h-12 w-12 text-slate-200" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Belum ada cabang</h3>
                        <p className="text-slate-500 max-w-xs mx-auto mb-8">
                            Mulai dengan menambahkan cabang atau kantor unit bisnis baru.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
