import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function QuickActions() {
  const router = useRouter();

  const actions = [
    {
      label: "+ Transaksi Baru",
      href: "/dashboard/transactions/new",
    },
    {
      label: "+ Transfer Stok",
      href: "/dashboard/inventory/transfer",
    },
    {
      label: "+ Stock Opname",
      href: "/dashboard/inventory/opname",
    },
    {
      label: "+ Karyawan",
      href: "/dashboard/employees",
    },
  ];

  return (
    <Card className="col-span-1 bg-slate-900 text-slate-50">
      <CardHeader>
        <CardTitle className="text-slate-50">Aksi Cepat</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        {actions.map((action) => (
          <Button
            key={action.href}
            variant="secondary"
            className="w-full justify-start"
            onClick={() => router.push(action.href)}
          >
            {action.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
