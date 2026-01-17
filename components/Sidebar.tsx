"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  FileText,
  Users,
  Settings,
  Box,
  Package,
  ArrowRightLeft,
  Receipt,
  TrendingUp,
  FileSignature,
  Banknote,
  Activity,
  HelpCircle,
  FolderTree,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const menuGroups = [
  {
    title: "",
    items: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        exact: true,
      },
      { name: "Perusahaan", href: "/dashboard/companies", icon: Building2 },
    ],
  },
  {
    title: "Penjualan",
    items: [
      { name: "Faktur Penjualan", href: "/dashboard/invoices", icon: FileText },
      {
        name: "Monitor Piutang",
        href: "/dashboard/ar-dashboard",
        icon: TrendingUp,
      },
    ],
  },
  {
    title: "Pembelian",
    items: [
      { name: "Tagihan Pembelian", href: "/dashboard/bills", icon: Receipt },
    ],
  },
  {
    title: "Persediaan",
    items: [
      { name: "Produk", href: "/dashboard/products", icon: Box, exact: true },
      {
        name: "Stok Gudang",
        href: "/dashboard/inventory",
        icon: Package,
        exact: true,
      },
      {
        name: "Transfer Stok",
        href: "/dashboard/inventory/transfer",
        icon: ArrowRightLeft,
      },
    ],
  },
  {
    title: "Keuangan",
    items: [
      { name: "Buku Besar", href: "/dashboard/coa", icon: FolderTree },
      {
        name: "Voucher / Kas",
        href: "/dashboard/transactions",
        icon: FileText,
      },
    ],
  },
  {
    title: "SDM & Gaji",
    items: [
      { name: "Karyawan", href: "/dashboard/employees", icon: Users },
      {
        name: "Kontrak Kerja",
        href: "/dashboard/contracts",
        icon: FileSignature,
      },
      { name: "Penggajian", href: "/dashboard/payrolls", icon: Banknote },
    ],
  },
  {
    title: "Sistem",
    items: [
      { name: "Laporan", href: "/dashboard/reports", icon: FileText },
      { name: "Audit Trail", href: "/dashboard/audit", icon: Activity },
      { name: "Pengaturan", href: "/dashboard/settings", icon: Settings },
      { name: "Bantuan", href: "/dashboard/help", icon: HelpCircle },
    ],
  },
];

export function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const state: Record<string, boolean> = {};
    menuGroups.forEach((g) => {
      if (g.title) state[g.title] = true;
    });
    return state;
  });

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const isItemActive = (item: any) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  const isGroupActive = (items: any[]) => {
    return items.some((item) => isItemActive(item));
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-50 h-screen border-r border-neutral-200 bg-white transition-all duration-300 flex flex-col",
        isOpen ? "w-64" : "w-20"
      )}
    >
      <div className="h-24 flex items-center px-6 border-b border-neutral-200 shrink-0">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center font-bold">
          M
        </div>
        {isOpen && (
          <span className="ml-3 font-bold uppercase tracking-tight">
            MGYT Accounting
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-6 scrollbar-hide">
        <nav className="px-3 space-y-2">
          {menuGroups.map((group) => {
            const activeGroup = isGroupActive(group.items);
            const open = openGroups[group.title] ?? true;

            return (
              <div key={group.title}>
                {isOpen && group.title && (
                  <button
                    onClick={() => toggleGroup(group.title)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold uppercase",
                      activeGroup
                        ? "bg-orange-50 text-orange-600"
                        : "text-neutral-500 hover:bg-neutral-100"
                    )}
                  >
                    <span>{group.title}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        open ? "rotate-180" : ""
                      )}
                    />
                  </button>
                )}

                <div
                  className={cn(
                    "space-y-1 overflow-hidden transition-all",
                    isOpen && group.title && !open
                      ? "max-h-0 opacity-0"
                      : "max-h-125 opacity-100",
                    isOpen && group.title && "mt-1"
                  )}
                >
                  {group.items.map((item) => {
                    const active = isItemActive(item);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs",
                          active
                            ? "bg-orange-500"
                            : "text-neutral-700 hover:bg-neutral-100",
                          isOpen && group.title && "ml-2"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-5 w-5",
                            active ? "text-white" : "text-neutral-500"
                          )}
                        />
                        {isOpen && (
                          <span
                            className={cn(
                              "font-medium",
                              active ? "text-white" : "text-neutral-700"
                            )}
                          >
                            {item.name}
                          </span>
                        )}
                        {active && isOpen && (
                          <ChevronRight className="ml-auto h-4 w-4 text-white" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
