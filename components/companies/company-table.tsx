"use client";
"use no memo";
import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TierBadge } from "./tier-badge";
import { Building2, MoreHorizontal, Settings, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { LuArrowLeft, LuArrowRight } from "react-icons/lu";

interface CompanyData {
  id: string;
  nama: string;
  kode: string;
  tier: string;
  email: string | null;
  telepon: string | null;
  mataUangUtama: string;
}

interface CompanyTableProps {
  data: CompanyData[];
  onDelete?: (id: string) => void;
}

export function CompanyTable({ data, onDelete }: CompanyTableProps) {
  const router = useRouter();

  const columns = React.useMemo<ColumnDef<CompanyData>[]>(
    () => [
      {
        accessorKey: "nama",
        header: () => (
          <span className="font-semibold text-slate-700">Nama Perusahaan</span>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Building2 className="h-4 w-4 text-slate-500" />
            </div>
            <div>
              <div className="font-medium text-slate-900">
                {row.getValue("nama")}
              </div>
              <div className="text-xs text-slate-500">{row.original.kode}</div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "tier",
        header: () => (
          <span className="font-semibold text-slate-700">Paket</span>
        ),
        cell: ({ row }) => (
          <TierBadge tier={(row.getValue("tier") as string) || "UMKM"} />
        ),
      },
      {
        accessorKey: "email",
        header: () => (
          <span className="font-semibold text-slate-700">Kontak</span>
        ),
        cell: ({ row }) => (
          <div className="text-sm">
            <div className="text-slate-700">{row.getValue("email") || "-"}</div>
            <div className="text-xs text-slate-500">
              {row.original.telepon || "-"}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "mataUangUtama",
        header: () => (
          <span className="font-semibold text-slate-700">Mata Uang</span>
        ),
        cell: ({ row }) => (
          <span className="text-sm font-mono text-slate-700">
            {row.getValue("mataUangUtama")}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => (
          <span className="font-semibold text-slate-700 text-center block">
            Aksi
          </span>
        ),
        cell: ({ row }) => {
          const company = row.original;
          return (
            <div className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0 hover:bg-slate-100"
                  >
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4 text-slate-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="text-slate-700">
                    Aksi
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(`/dashboard/companies/${company.id}`)
                    }
                    className="cursor-pointer"
                  >
                    <Settings className="mr-2 h-4 w-4 text-slate-500" />
                    <span>Pengaturan</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
                    onClick={() => onDelete?.(company.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Hapus</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [router, onDelete]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-slate-50 hover:bg-slate-50 border-b border-slate-200"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="py-4">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-slate-500"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Building2 className="h-8 w-8 text-slate-300" />
                    <p>Tidak ada data perusahaan.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-slate-600">
          Menampilkan {table.getRowModel().rows.length} dari {data.length}{" "}
          perusahaan
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="border-orange-500 hover:bg-orange-600"
          >
            <LuArrowLeft />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="border-orange-500 hover:bg-orange-600"
          >
            <LuArrowRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
