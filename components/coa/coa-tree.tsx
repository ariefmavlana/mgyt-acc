'use client';

import React, { useState } from 'react';
import {
    ChevronRight,
    ChevronDown,
    Folder,
    FileText,
    MoreHorizontal,
    Plus,
    Edit2,
    Trash2,
    Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface Account {
    id: string;
    kodeAkun: string;
    namaAkun: string;
    tipe: string;
    isHeader: boolean;
    totalBalance: number;
    children: Account[];
}

interface COATreeProps {
    data: Account[];
    onEdit: (account: Account) => void;
    onDelete: (id: string) => void;
    onCreateSub: (parent: Account) => void;
    isFiltered?: boolean;
}

const AccountRow = ({
    account,
    level,
    onEdit,
    onDelete,
    onCreateSub
}: {
    account: Account;
    level: number;
    onEdit: (account: Account) => void;
    onDelete: (id: string) => void;
    onCreateSub: (parent: Account) => void;
}) => {
    const [isOpen, setIsOpen] = useState(true);
    const router = useRouter();
    const hasChildren = account.children && account.children.length > 0;

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'ASET': return 'text-blue-600 bg-blue-50';
            case 'LIABILITAS': return 'text-red-600 bg-red-50';
            case 'EKUITAS': return 'text-purple-600 bg-purple-50';
            case 'PENDAPATAN': return 'text-emerald-600 bg-emerald-50';
            case 'BEBAN': return 'text-orange-600 bg-orange-50';
            default: return 'text-slate-600 bg-slate-50';
        }
    };

    return (
        <div className="w-full">
            <div
                className={cn(
                    "flex items-center group hover:bg-slate-50 border-b border-slate-100 py-2 px-4 transition-colors",
                    account.isHeader ? "font-semibold bg-slate-50/50" : "font-normal"
                )}
                style={{ paddingLeft: `${(level * 20) + 16}px` }}
            >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {hasChildren ? (
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors"
                        >
                            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                    ) : (
                        <div className="w-6" />
                    )}

                    <div className={cn(
                        "p-1.5 rounded-md",
                        account.isHeader ? "bg-slate-100 text-slate-600" : getTypeColor(account.tipe)
                    )}>
                        {account.isHeader ? <Folder className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
                    </div>

                    <span className="text-sm font-mono text-slate-500 w-20 shrink-0">{account.kodeAkun}</span>
                    <span className="text-sm text-slate-900 truncate">{account.namaAkun}</span>

                    <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-medium ml-2",
                        getTypeColor(account.tipe)
                    )}>
                        {account.tipe}
                    </span>
                </div>

                <div className="text-sm font-medium text-slate-700 w-32 text-right tabular-nums pr-4">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(account.totalBalance)}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-primary hover:bg-primary/10"
                        onClick={() => router.push(`/dashboard/coa/${account.id}`)}
                        title="Lihat Buku Besar"
                    >
                        <Eye className="h-4 w-4" />
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            {account.isHeader && (
                                <DropdownMenuItem onClick={() => onCreateSub(account)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    <span>Tambah Sub-Akun</span>
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => onEdit(account)}>
                                <Edit2 className="mr-2 h-4 w-4" />
                                <span>Ubah Akun</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                onClick={() => onDelete(account.id)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Hapus Akun</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {isOpen && hasChildren && (
                <div className="w-full animate-in fade-in slide-in-from-top-1 duration-200">
                    {account.children.map(child => (
                        <AccountRow
                            key={child.id}
                            account={child}
                            level={level + 1}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onCreateSub={onCreateSub}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export function COATree({ data, onEdit, onDelete, onCreateSub, isFiltered = false }: COATreeProps) {
    if (!data.length) {
        return (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
                <div className="p-4 bg-slate-50 rounded-full mb-4">
                    <Folder className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-slate-900 font-medium">
                    {isFiltered ? 'Tidak ada akun yang sesuai' : 'Belum ada akun'}
                </h3>
                <p className="text-slate-500 text-sm mt-1">
                    {isFiltered
                        ? 'Coba ubah kata kunci pencarian atau filter Anda.'
                        : 'Silakan tambah akun untuk memulai pembukuan.'}
                </p>
                {isFiltered && (
                    <p className="text-xs text-slate-400 mt-2">
                        Atau pastikan akun yang Anda cari sudah terdaftar.
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="flex items-center px-4 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <div className="flex-1 ml-8">Nama Akun & Kode</div>
                <div className="w-32 text-right pr-4">Saldo</div>
                <div className="w-10"></div>
            </div>
            <div className="divide-y divide-slate-100">
                {data.map(account => (
                    <AccountRow
                        key={account.id}
                        account={account}
                        level={0}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onCreateSub={onCreateSub}
                    />
                ))}
            </div>
        </div>
    );
}
