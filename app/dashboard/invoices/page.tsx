"use client";

import { Suspense } from "react";
import { InvoiceList } from "@/components/invoices/invoice-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function InvoicesPage() {
  return (
    <div className="p-6 max-w-full mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white flex flex-col gap-6 p-6 rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Invoices
            </h1>
            <p className="text-slate-500">
              Kelola tagihan pelanggan dan pantau pembayaran.
            </p>
          </div>
          <Button
            asChild
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Link href="/dashboard/invoices/new">
              <Plus className="mr-2 h-4 w-4" />
              Buat Invoice
            </Link>
          </Button>
        </div>

        <Separator />

        <Suspense fallback={<div>Loading...</div>}>
          <InvoiceList />
        </Suspense>
      </div>
    </div>
  );
}
