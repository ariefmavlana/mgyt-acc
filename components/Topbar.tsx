"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CompanySelector } from "@/components/companies/company-selector";
import { Users, Settings, LogOut, ChevronDown } from "lucide-react";
import { LuAlignLeft, LuAlignRight, LuUserRound } from "react-icons/lu";

interface TopbarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  user: {
    namaLengkap: string;
    email: string;
    role: string;
    foto?: string;
  } | null;
  onLogout: () => void;
}

export function Topbar({
  isSidebarOpen,
  onToggleSidebar,
  user,
  onLogout,
}: TopbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="h-24 bg-white flex items-center justify-between px-8 sticky top-0 z-40 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="text-white hover:text-white bg-orange-500 hover:bg-orange-600"
        >
          {isSidebarOpen ? (
            <LuAlignRight className="h-5 w-5" />
          ) : (
            <LuAlignLeft className="h-5 w-5" />
          )}
        </Button>
        <div className="h-4 w-px bg-slate-200 mx-2" />
        <CompanySelector />
      </div>

      <DropdownMenu onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={`relative h-12 w-auto flex items-center gap-3 bg-white border border-slate-50 rounded-2xl hover:bg-slate-50 transition-all px-2 ${
              isDropdownOpen ? "border-orange-500" : "hover:border-slate-300"
            }`}
          >
            <div className="relative h-9 w-9 rounded-full bg-orange-500 flex items-center justify-center shadow-md overflow-hidden">
              {user?.foto ? (
                <Image
                  src={user.foto}
                  alt={user.namaLengkap || "User"}
                  fill
                  className="object-cover"
                />
              ) : (
                <LuUserRound className="h-5 w-5 text-white" />
              )}
            </div>
            <div className="text-left hidden sm:block pr-2">
              <div className="text-sm font-semibold text-slate-900">
                {user?.namaLengkap}
              </div>
              <div className="text-xs text-slate-500">{user?.role}</div>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-64 bg-white p-2 shadow-lg border border-slate-200"
          align="end"
          sideOffset={8}
        >
          <div className="px-3 py-3 mb-1">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center shadow-md overflow-hidden shrink-0">
                {user?.foto ? (
                  <Image
                    src={user.foto}
                    alt={user.namaLengkap || "User"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <LuUserRound className="h-5 w-5 text-white" />
                )}
              </div>
              <div className="flex flex-col overflow-hidden">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {user?.namaLengkap}
                </p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
          <DropdownMenuSeparator className="my-1" />
          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/profile"
              className="cursor-pointer flex items-center px-3 py-2.5 rounded-md hover:bg-slate-100 transition-colors"
            >
              <Users className="mr-3 h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium">Profil Saya</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/settings"
              className="cursor-pointer flex items-center px-3 py-2.5 rounded-md hover:bg-slate-100 transition-colors"
            >
              <Settings className="mr-3 h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium">Pengaturan</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-1" />
          <DropdownMenuItem
            onClick={onLogout}
            className="cursor-pointer flex items-center px-3 py-2.5 rounded-md hover:bg-red-50 text-red-600 focus:bg-red-50 focus:text-red-600 transition-colors"
          >
            <LogOut className="mr-3 h-4 w-4" />
            <span className="text-sm font-medium">Keluar</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
