"use client";

import { useCompany } from "@/hooks/use-company";
import { CompanyTable } from "@/components/companies/company-table";
import { Button } from "@/components/ui/button";
import { Building2, Search, Filter, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function CompaniesPage() {
  const { companies, loading } = useCompany();
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredCompanies = companies.filter(
    (c) =>
      c.nama.toLowerCase().includes(search.toLowerCase()) ||
      c.kode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-full mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white flex flex-col gap-6 p-6 rounded-2xl">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Daftar Perusahaan
            </h1>
            <p className="text-slate-500 mt-1">
              Kelola perusahaan yang terdaftar di akun Anda.
            </p>
          </div>
          <Button
            onClick={() => router.push("/dashboard/companies/new")}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Perusahaan
          </Button>
        </div>

        {/* Search & Filter Section */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Cari nama atau kode perusahaan..."
              className="pl-9 border-slate-200 focus-visible:ring-slate-200"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" className="border-slate-200">
            <Filter className="mr-2 h-4 w-4 text-slate-500" />
            Filter
          </Button>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-20 w-full animate-pulse bg-slate-100 rounded-xl"
              />
            ))}
          </div>
        ) : filteredCompanies.length > 0 ? (
          <CompanyTable data={filteredCompanies} />
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-xl border-2 border-dashed border-slate-200">
            <div className="bg-slate-50 p-6 rounded-full mb-6">
              <Building2 className="h-12 w-12 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {search ? "Tidak ada hasil pencarian" : "Belum ada perusahaan"}
            </h3>
            <p className="text-slate-500 max-w-md mx-auto mb-6">
              {search
                ? `Tidak ditemukan perusahaan dengan kata kunci "${search}". Coba kata kunci lain.`
                : "Anda belum memiliki perusahaan. Mulai dengan membuat perusahaan baru."}
            </p>
            {!search && (
              <Button
                onClick={() => router.push("/dashboard/companies/new")}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Buat Perusahaan Pertama
              </Button>
            )}
            {search && (
              <Button
                variant="outline"
                onClick={() => setSearch("")}
                className="border-slate-200"
              >
                Reset Pencarian
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
