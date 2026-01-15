'use client';

import React from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import {
    Bell,
    Check,
    CheckCheck,
    Info,
    AlertTriangle,
    AlertCircle,
    CheckCircle2,
    Clock,
    X
} from 'lucide-react';
import { useNotifications, Notification } from '@/hooks/use-notifications';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';

export function NotificationDropdown() {
    const { useLatestNotifications, useUnreadCount, markAsRead, markAllAsRead } = useNotifications();
    const { data: notifications, isLoading } = useLatestNotifications();
    const { data: unreadCount = 0 } = useUnreadCount();

    const getIcon = (tipe: Notification['tipe']) => {
        switch (tipe) {
            case 'SUCCESS': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
            case 'WARNING': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
            case 'ERROR': return <AlertCircle className="h-4 w-4 text-rose-500" />;
            default: return <Info className="h-4 w-4 text-blue-500" />;
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-slate-50 transition-colors">
                    <Bell className="h-5 w-5 text-slate-500" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white animate-in zoom-in">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 p-0 shadow-xl border-slate-200" align="end" forceMount>
                <DropdownMenuLabel className="p-4 flex items-center justify-between bg-slate-50/50">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-bold text-slate-900">Notifikasi</span>
                        <span className="text-[10px] text-slate-500 font-medium">Anda memiliki {unreadCount} pesan belum dibaca</span>
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-[10px] font-bold text-primary hover:bg-primary/5 hover:text-primary transition-all"
                            onClick={() => markAllAsRead.mutate()}
                        >
                            <CheckCheck className="mr-1.5 h-3 w-3" /> Tandai Semua
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="m-0" />

                <ScrollArea className="h-[350px]">
                    {isLoading ? (
                        <div className="p-8 text-center">
                            <Clock className="mx-auto h-8 w-8 text-slate-200 animate-pulse mb-2" />
                            <p className="text-xs text-slate-400 font-medium">Memuat notifikasi...</p>
                        </div>
                    ) : notifications && notifications.length > 0 ? (
                        <div className="flex flex-col">
                            {notifications.map((n) => (
                                <DropdownMenuItem
                                    key={n.id}
                                    className={cn(
                                        "p-4 cursor-pointer flex items-start gap-3 focus:bg-slate-50 transition-colors relative group",
                                        !n.dibaca && "bg-blue-50/30 border-l-2 border-primary"
                                    )}
                                    asChild
                                >
                                    <div>
                                        <div className={cn(
                                            "mt-1 rounded-full p-2 shrink-0",
                                            n.tipe === 'SUCCESS' ? "bg-emerald-50" :
                                                n.tipe === 'WARNING' ? "bg-amber-50" :
                                                    n.tipe === 'ERROR' ? "bg-rose-50" : "bg-blue-50"
                                        )}>
                                            {getIcon(n.tipe)}
                                        </div>
                                        <div className="flex-1 space-y-1 overflow-hidden">
                                            <div className="flex items-center justify-between">
                                                <p className={cn("text-xs font-bold leading-tight truncate pr-4", !n.dibaca ? "text-slate-900" : "text-slate-500")}>
                                                    {n.judul}
                                                </p>
                                                {!n.dibaca && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            markAsRead.mutate(n.id);
                                                        }}
                                                        className="h-4 w-4 text-slate-300 hover:text-primary transition-colors focus:outline-none opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Check className="h-3.5 w-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                                {n.pesan}
                                            </p>
                                            <div className="flex items-center justify-between pt-1">
                                                <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: id })}
                                                </p>
                                                {n.urlAction && (
                                                    <Link
                                                        href={n.urlAction}
                                                        className="text-[10px] font-bold text-primary hover:underline"
                                                        onClick={(e) => {
                                                            if (!n.dibaca) markAsRead.mutate(n.id);
                                                        }}
                                                    >
                                                        Lihat Detail
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <div className="bg-slate-50 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Bell className="h-6 w-6 text-slate-300" />
                            </div>
                            <p className="text-sm font-bold text-slate-400">Belum ada notifikasi</p>
                            <p className="text-[10px] text-slate-300 mt-1">Kami akan memberitahu Anda ketika ada aktivitas penting.</p>
                        </div>
                    )}
                </ScrollArea>

                <DropdownMenuSeparator className="m-0" />
                <div className="p-2">
                    <Button variant="ghost" className="w-full text-[11px] h-8 font-bold text-slate-500 hover:text-primary hover:bg-primary/5 transition-all">
                        LIHAT RIWAYAT NOTIFIKASI
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
