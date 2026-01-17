"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  RefreshCcw,
  Download,
  Upload,
  Filter,
} from "lucide-react";
import { COATree } from "@/components/coa/coa-tree";
import { AccountForm } from "@/components/coa/account-form";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import api from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRequireAuth } from "@/hooks/use-require-auth";

interface COANode {
  id: string;
  kodeAkun: string;
  namaAkun: string;
  tipe: string;
  isHeader: boolean;
  totalBalance: number;
  children: COANode[];
  [key: string]: any;
}

export default function COAPage() {
  useRequireAuth("/login", ["SUPERADMIN", "ADMIN", "MANAGER"]);
  const [data, setData] = useState<COANode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [subParent, setSubParent] = useState<any>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const fetchCOA = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/coa");
      setData(res.data);
    } catch (err) {
      toast.error("Gagal memuat data akun");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCOA();
  }, [fetchCOA]);

  const handleCreate = () => {
    setSelectedAccount(null);
    setSubParent(null);
    setIsFormOpen(true);
  };

  const handleCreateSub = (parent: any) => {
    setSelectedAccount(null);
    setSubParent(parent);
    setIsFormOpen(true);
  };

  const handleEdit = (account: any) => {
    setSelectedAccount(account);
    setSubParent(null);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus akun ini?")) return;

    try {
      await api.delete(`/coa/${id}`);
      toast.success("Akun berhasil dihapus");
      fetchCOA();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal menghapus akun";
      toast.error(msg);
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (selectedAccount) {
        await api.put(`/coa/${selectedAccount.id}`, formData);
        toast.success("Akun berhasil diperbarui");
      } else {
        await api.post("/coa", formData);
        toast.success("Akun berhasil dibuat");
      }
      setIsFormOpen(false);
      fetchCOA();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal menyimpan akun";
      toast.error(msg);
    }
  };

  // Filter tree logic
  const handleExport = async () => {
    try {
      const toastId = toast.loading("Mengekspor data akun...");
      const response = await api.get("/coa/export", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `COA-${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.dismiss(toastId);
      toast.success("Export berhasil");
    } catch (error) {
      toast.dismiss();
      toast.error("Gagal mengexport data");
    }
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const toastId = toast.loading("Mengimport data akun...");
      const res = await api.post("/coa/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.dismiss(toastId);
      toast.success(res.data.message || "Import berhasil");
      // Refresh logic - better to reload full query
      window.location.reload();
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Gagal mengimport data");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const filteredData = useMemo(() => {
    if (!search) return data;

    const filterNodes = (nodes: COANode[]): COANode[] => {
      return nodes
        .map((node) => ({ ...node }))
        .filter((node) => {
          const matches =
            node.namaAkun.toLowerCase().includes(search.toLowerCase()) ||
            node.kodeAkun.toLowerCase().includes(search.toLowerCase());

          if (node.children && node.children.length > 0) {
            node.children = filterNodes(node.children);
          }

          return matches || (node.children && node.children.length > 0);
        });
    };

    return filterNodes(data);
  }, [data, search]);

  // Flatten for parent selection
  const flattenNodes = (nodes: any[]): any[] => {
    return nodes.reduce((acc, node) => {
      acc.push(node);
      if (node.children && node.children.length > 0) {
        acc.push(...flattenNodes(node.children));
      }
      return acc;
    }, []);
  };
  const flatAccounts = flattenNodes(data);

  return (
    <div className="p-6 max-w-full mx-auto space-y-8">
      <div className="bg-white flex flex-col gap-6 p-6 rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Daftar Akun (COA)
            </h1>
            <p className="text-slate-500">
              Kelola hierarki akun dan saldo buku besar Anda.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-orange-500 hover:bg-orange-600 border-none text-white cursor-pointer"
              onClick={handleImportClick}
            >
              <Upload className="h-4 w-4" /> Import
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
            />
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-emerald-500 hover:bg-emerald-600 border-none text-white cursor-pointer"
              onClick={handleExport}
            >
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button
              onClick={handleCreate}
              className="btn-primary gap-2 border border-neutral-400 hover:border-orange-400 hover:bg-orange-50 cursor-pointer"
            >
              <Plus className="h-4 w-4 text-orange-500" /> Akun Baru
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Cari kode atau nama akun..."
              className="pl-10 border border-slate-200 focus-visible:border-orange-500 focus-visible:ring-1 focus-visible:ring-orange-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="icon"
              onClick={fetchCOA}
              disabled={loading}
              className="bg-emerald-50 text-emerald-600 cursor-pointer"
            >
              <RefreshCcw
                className={cn("h-4 w-4", loading && "animate-spin")}
              />
            </Button>
            <Button
              variant="outline"
              className="gap-2 border-none bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-emerald-50 cursor-pointer"
            >
              <Filter className="h-4 w-4" /> Filter
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200">
            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-500">Memuat hierarki akun...</p>
          </div>
        ) : (
          <COATree
            data={filteredData}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCreateSub={handleCreateSub}
          />
        )}

        <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
          <SheetContent className="sm:max-w-xl overflow-y-auto">
            <SheetHeader className="mb-6">
              <SheetTitle>
                {selectedAccount ? "Ubah Akun" : "Tambah Akun Baru"}
              </SheetTitle>
              <SheetDescription>
                Isi detail akun di bawah ini. Akun yang memiliki induk akan
                menjadi sub-akun.
              </SheetDescription>
            </SheetHeader>

            <AccountForm
              initialData={
                selectedAccount ||
                (subParent
                  ? { parentId: subParent.id, tipe: subParent.tipe }
                  : {})
              }
              parents={flatAccounts.filter(
                (a: any) => a.isHeader && a.id !== selectedAccount?.id,
              )}
              onSubmit={handleFormSubmit}
              isLoading={loading}
            />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
