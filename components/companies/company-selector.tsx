'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Building2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { useCompany } from '@/hooks/use-company';
import { useRouter } from 'next/navigation';
import { Tier, TIER_LIMITS } from '@/lib/tier-config';
import { AlertCircle } from 'lucide-react';

export function CompanySelector() {
    const [open, setOpen] = React.useState(false);
    const { companies, currentCompany, switchCompany, loading } = useCompany();
    const router = useRouter();

    if (loading) return <div className="h-9 w-[200px] animate-pulse bg-muted rounded-md" />;

    const currentTier = (currentCompany?.tier || 'UMKM') as Tier;
    const maxCompanies = TIER_LIMITS[currentTier]?.maxCompanies || 1;
    const isLimitReached = companies.length >= maxCompanies;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between h-9 px-3 font-medium border-slate-200 bg-white/50 backdrop-blur-sm hover:bg-white transition-all shadow-sm"
                >
                    <div className="flex items-center gap-2 overflow-hidden">
                        <Building2 className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <span className="truncate">
                            {currentCompany ? currentCompany.nama : 'Pilih Perusahaan'}
                        </span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0 shadow-xl border-slate-200 overflow-hidden" align="start">
                <Command className="bg-white">
                    <CommandInput placeholder="Cari perusahaan..." className="h-9" />
                    <CommandList>
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
                                    className="flex items-center justify-between cursor-pointer py-2 px-3 hover:bg-slate-50 aria-selected:bg-slate-100"
                                >
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <Building2 className="h-3.5 w-3.5 opacity-50" />
                                        <span className="truncate">{company.nama}</span>
                                    </div>
                                    {currentCompany?.id === company.id && (
                                        <Check className="h-4 w-4 text-primary" />
                                    )}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                    <CommandSeparator />
                    <CommandList>
                        <CommandGroup>
                            <CommandItem
                                onSelect={() => {
                                    if (isLimitReached) return;
                                    setOpen(false);
                                    router.push('/dashboard/companies/new');
                                }}
                                disabled={isLimitReached}
                                className={cn(
                                    "flex items-center gap-2 cursor-pointer py-2 px-3 font-medium transition-colors italic",
                                    isLimitReached
                                        ? "text-slate-400 bg-slate-50 cursor-not-allowed opacity-70"
                                        : "text-primary hover:bg-primary/5"
                                )}
                            >
                                {isLimitReached ? (
                                    <>
                                        <AlertCircle className="h-4 w-4" />
                                        <span>Limit Perusahaan Tercapai</span>
                                    </>
                                ) : (
                                    <>
                                        <PlusCircle className="h-4 w-4" />
                                        <span>Tambah Perusahaan</span>
                                    </>
                                )}
                            </CommandItem>
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

// Helper to use cn in this component if not already available
function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
