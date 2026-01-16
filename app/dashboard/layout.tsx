'use client';

import React, { useState } from 'react';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useAuth } from '@/hooks/use-auth';
import { CompanySelector } from '@/components/companies/company-selector';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    LayoutDashboard,
    Building2,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NotificationDropdown } from '@/components/notifications/notification-dropdown';
import { filterMenuByRoleAndTier } from '@/lib/menu-config';
import { useCompany } from '@/hooks/use-company';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { loading } = useRequireAuth();
    const { user, logout } = useAuth();
    const { currentCompany } = useCompany();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const pathname = usePathname();

    const currentTier = (currentCompany as any)?.perusahaanPakets?.[0]?.paket?.tier || 'UMKM';
    const filteredMenuGroups = filterMenuByRoleAndTier(user?.role || 'STAFF', currentTier);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <div className="text-slate-500 font-medium">Memuat sistem...</div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className={cn(
                "bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-50 h-screen sticky top-0",
                isSidebarOpen ? "w-64" : "w-20"
            )}>
                <div className="h-16 flex items-center px-6 border-b border-slate-100">
                    <div className="bg-primary h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold shrink-0">
                        M
                    </div>
                    {isSidebarOpen && (
                        <span className="ml-3 font-bold text-slate-800 tracking-tight transition-opacity duration-300">
                            MGYT Accounting
                        </span>
                    )}
                </div>

                <div className="flex-1 py-6 overflow-y-auto overflow-x-hidden">
                    <nav className="px-3 space-y-6">
                        {filteredMenuGroups.map((group, groupIndex) => (
                            <div key={groupIndex}>
                                {isSidebarOpen && group.title && (
                                    <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        {group.title}
                                    </div>
                                )}
                                <div className="space-y-1">
                                    {group.items.map((item) => {
                                        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={cn(
                                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group",
                                                    isActive
                                                        ? "bg-primary text-white shadow-md shadow-primary/20"
                                                        : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                                                )}
                                                title={!isSidebarOpen ? item.name : undefined}
                                            >
                                                <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-white" : "group-hover:text-primary")} />
                                                {isSidebarOpen && <span className="font-medium whitespace-nowrap">{item.name}</span>}
                                                {isActive && isSidebarOpen && <ChevronRight className="ml-auto h-4 w-4 opacity-50" />}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>
                </div>

                <div className="p-4 border-t border-slate-100">
                    <div className={cn("text-xs text-slate-400 text-center transition-opacity", !isSidebarOpen && "opacity-0")}>
                        &copy; 2026 MGYT
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-500">
                            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                        <CompanySelector />
                    </div>

                    <div className="flex items-center gap-2">
                        <NotificationDropdown />
                        <div className="h-4 w-px bg-slate-200 mx-2" />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-14 w-auto px-2 flex items-center gap-4 hover:bg-slate-50 rounded-full">
                                    <div className="text-right hidden sm:block">
                                        <div className="text-sm font-semibold text-slate-800">{user?.namaLengkap}</div>
                                        <div className="text-xs text-slate-500">{user?.role}</div>
                                    </div>
                                    <div className="relative h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                                        {user?.foto ? (
                                            <Image
                                                src={user.foto}
                                                alt={user.namaLengkap}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <Users className="h-5 w-5 text-slate-400" />
                                        )}
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user?.namaLengkap}</p>
                                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard/profile" className="cursor-pointer flex items-center">
                                        <Users className="mr-2 h-4 w-4" />
                                        <span>Profil Saya</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard/settings" className="cursor-pointer flex items-center">
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Pengaturan</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => logout()} className="cursor-pointer text-red-600 focus:text-red-600">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Keluar</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <main className="flex-1 min-w-0">
                    {children}
                </main>
            </div>
        </div>
    );
}
