'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Percent } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { useTax, MasterPajak } from '@/hooks/use-tax';

interface TaxSelectorProps {
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export function TaxSelector({ value, onChange, placeholder = "Pilih pajak...", disabled }: TaxSelectorProps) {
    const [open, setOpen] = React.useState(false);
    const { useTaxes } = useTax();
    const { data: taxes, isLoading } = useTaxes();

    const selectedTax = taxes?.find((tax) => tax.id === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal bg-white"
                    disabled={disabled}
                >
                    <div className="flex items-center gap-2 truncate">
                        {selectedTax ? (
                            <>
                                <span className="font-medium text-slate-900">{selectedTax.kodePajak}</span>
                                <span className="text-slate-500 text-xs">({selectedTax.tarif}%)</span>
                            </>
                        ) : (
                            <span className="text-slate-400">{isLoading ? "Memuat..." : placeholder}</span>
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Cari kode atau nama pajak..." />
                    <CommandList>
                        <CommandEmpty>Pajak tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                            <CommandItem
                                value="None"
                                onSelect={() => {
                                    onChange('');
                                    setOpen(false);
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        !value ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                <span className="text-slate-500 italic">Tanpa Pajak</span>
                            </CommandItem>
                            {taxes?.map((tax) => (
                                <CommandItem
                                    key={tax.id}
                                    value={`${tax.kodePajak} ${tax.namaPajak}`}
                                    onSelect={() => {
                                        onChange(tax.id);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === tax.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">{tax.kodePajak}</span>
                                            <span className="text-primary text-xs font-bold">{tax.tarif}%</span>
                                        </div>
                                        <span className="text-xs text-slate-500 truncate">{tax.namaPajak}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
