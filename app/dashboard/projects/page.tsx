'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
    Plus,
    Search,
    Loader2,
    Briefcase,
    MoreHorizontal,
    Pencil,
    Trash2,
    X,
    TrendingUp,
    MapPin,
    User,
    Calendar,
    ArrowRight,
    ArrowUpRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useProject, Project } from '@/hooks/use-project';
import { useDebounce } from '@/hooks/use-debounce';
import { ProjectForm } from '@/components/projects/project-form';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn, formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from '@/components/ui/progress';

export default function ProjectsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);

    const {
        useProjects,
        createProject,
        updateProject,
        deleteProject
    } = useProject();

    const { data: projects, isLoading, isError } = useProjects();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [idToDelete, setIdToDelete] = useState<string | null>(null);

    const filteredProjects = projects?.filter(p =>
        p.namaProyek.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        p.kodeProyek.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    const handleCreate = () => {
        setSelectedProject(null);
        setIsFormOpen(true);
    };

    const handleEdit = (p: Project) => {
        setSelectedProject(p);
        setIsFormOpen(true);
    };

    const handleDelete = async () => {
        if (!idToDelete) return;
        try {
            await deleteProject.mutateAsync(idToDelete);
        } catch (error) {
            console.error(error);
        } finally {
            setIdToDelete(null);
        }
    };

    const handleFormSubmit = async (data: any) => {
        if (selectedProject) {
            await updateProject.mutateAsync({ id: selectedProject.id, data });
        } else {
            await createProject.mutateAsync(data);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'PLANNING': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'ON_HOLD': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'COMPLETED': return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'CANCELLED': return 'bg-rose-50 text-rose-700 border-rose-200';
            default: return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Manajemen Proyek</h1>
                    <p className="text-slate-500 mt-1">Lacak kemajuan, biaya, dan profitabilitas proyek Anda secara real-time.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" /> Proyek Baru
                    </Button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Cari nama, kode, atau manajer proyek..."
                        className="pl-10 h-11 bg-white border-slate-200 focus:border-primary focus:ring-primary/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Project Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="h-[300px] animate-pulse bg-slate-50/50" />
                    ))}
                </div>
            ) : isError ? (
                <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed border-slate-200">
                    <X className="h-10 w-10 text-rose-500 mb-4" />
                    <p className="text-slate-600 font-medium">Gagal memuat data proyek.</p>
                </div>
            ) : filteredProjects && filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((p) => (
                        <Card key={p.id} className="group hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/5 overflow-hidden">
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant="outline" className={cn("text-[10px] font-bold tracking-wider", getStatusColor(p.status))}>
                                        {p.status}
                                    </Badge>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                                                <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEdit(p)}>
                                                <Pencil className="mr-2 h-4 w-4" /> Edit Detil
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-rose-600 focus:text-rose-600" onClick={() => setIdToDelete(p.id)}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Hapus Proyek
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{p.namaProyek}</h3>
                                    <p className="text-xs font-mono text-primary flex items-center gap-1">
                                        <Briefcase className="w-3 h-3" /> {p.kodeProyek}
                                    </p>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4 pb-4">
                                <div className="space-y-3">
                                    <div className="flex items-center text-sm text-slate-600 gap-2">
                                        <MapPin className="w-4 h-4 text-slate-400" />
                                        <span className="truncate">{p.lokasi || 'Lokasi tidak diatur'}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-slate-600 gap-2">
                                        <User className="w-4 h-4 text-slate-400" />
                                        <span>PM: {p.manajerProyek || '-'}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-slate-600 gap-2">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        <span>Mulai: {format(new Date(p.tanggalMulai), 'dd MMM yyyy')}</span>
                                    </div>
                                </div>

                                <div className="space-y-1.5 pt-2">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-500 font-medium">Progress</span>
                                        <span className="text-primary font-bold">{Number(p.persentaseSelesai)}%</span>
                                    </div>
                                    <Progress value={Number(p.persentaseSelesai)} className="h-2" />
                                </div>

                                <div className="pt-2 border-t border-slate-50 flex justify-between items-end">
                                    <div className="space-y-0.5">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Nilai Kontrak</span>
                                        <p className="text-sm font-bold text-slate-700">{formatCurrency(p.nilaiKontrak || 0)}</p>
                                    </div>
                                    <div className="bg-emerald-50 p-1.5 rounded-lg border border-emerald-100">
                                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-slate-50/50 p-3 flex justify-center border-t border-slate-100">
                                <Link href={`/dashboard/projects/${p.id}/profitability`} className="w-full">
                                    <Button variant="ghost" size="sm" className="w-full text-xs font-bold text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                        LIHAT ANALISIS PROFIT <ArrowRight className="ml-2 w-3 h-3" />
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-20 bg-white rounded-2xl border-2 border-dashed border-slate-100 text-center">
                    <div className="bg-slate-50 p-6 rounded-full mb-6">
                        <Briefcase className="h-12 w-12 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Belum ada Proyek</h3>
                    <p className="text-slate-500 max-w-sm mb-8">Anda belum membuat proyek apapun. Mulai dengan membuat proyek baru untuk melacak pengeluaran dan keuntungan.</p>
                    <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90 px-8 py-6 rounded-xl font-bold text-lg shadow-xl shadow-primary/20">
                        Buat Proyek Pertama
                    </Button>
                </div>
            )}

            <ProjectForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                initialData={selectedProject}
                onSubmit={handleFormSubmit}
                isLoading={createProject.isPending || updateProject.isPending}
            />

            <AlertDialog open={!!idToDelete} onOpenChange={(open) => !open && setIdToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Proyek?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Seluruh data transaksi yang terhubung dengan proyek ini akan tetap ada di General Ledger namun tidak lagi terasosiasi dengan proyek ini.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700">
                            {deleteProject.isPending ? 'Menghapus...' : 'Hapus'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
