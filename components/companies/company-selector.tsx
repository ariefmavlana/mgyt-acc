"use client";
import * as React from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCompany } from "@/hooks/use-company";
import { useRouter } from "next/navigation";
import { LuBuilding, LuCheck, LuChevronDown } from "react-icons/lu";

export function CompanySelector() {
  const [open, setOpen] = React.useState(false);
  const { companies, currentCompany, switchCompany, loading } = useCompany();
  const router = useRouter();

  if (loading)
    return <div className="h-9 w-50 animate-pulse bg-muted rounded-2xl" />;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-md justify-between h-12 px-3 font-medium border-slate-200 bg-white hover:bg-white transition-all rounded-2xl ${
            open ? "border-orange-500" : ""
          }`}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <LuBuilding className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <span className="truncate">
              {currentCompany ? currentCompany.nama : "Pilih Perusahaan"}
            </span>
          </div>
          <LuChevronDown
            className={`ml-2 h-4 w-4 shrink-0 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-md shadow-xl bg-white border-slate-200 overflow-hidden p-0 rounded-lg"
        align="start"
      >
        <Command className="bg-white">
          <CommandInput
            placeholder="Cari perusahaan..."
            className="h-9 px-3 border-0 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <CommandList className="max-h-300px py-2">
            <CommandEmpty>Tidak ada perusahaan.</CommandEmpty>
            <CommandGroup heading="Perusahaan Anda">
              {companies.map((company) => (
                <CommandItem
                  key={company.id}
                  value={company.nama}
                  onSelect={() => {
                    switchCompany(company.id);
                    setOpen(false);
                  }}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden flex-1 pt-2">
                    <LuBuilding className="h-4 w-4 shrink-0 opacity-50" />
                    <span className="truncate text-sm">{company.nama}</span>
                  </div>
                  {currentCompany?.id === company.id && (
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100 shrink-0 ml-2">
                      <LuCheck className="h-4 w-4 text-emerald-600" />
                    </div>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>

        {/* Footer Button */}
        <div className="border-t border-slate-200 bg-slate-50/50">
          <button
            onClick={() => {
              setOpen(false);
              router.push("/dashboard/companies/new");
            }}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 text-sm text-white font-medium bg-orange-500 hover:bg-orange-600 transition-colors cursor-pointer"
          >
            <PlusCircle className="h-4 w-4 shrink-0" />
            <span>Tambah Perusahaan</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
