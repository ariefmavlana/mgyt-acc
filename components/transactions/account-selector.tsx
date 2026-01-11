'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
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
import { useCompany } from '@/hooks/use-company';
import api from '@/lib/api';

interface Account {
    id: string;
    kodeAkun: string;
    namaAkun: string;
    tipe: string;
    isHeader: boolean;
}

interface AccountSelectorProps {
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export function AccountSelector({ value, onChange, placeholder = "Pilih akun...", disabled }: AccountSelectorProps) {
    const [open, setOpen] = React.useState(false);
    const [accounts, setAccounts] = React.useState<Account[]>([]);
    const [loading, setLoading] = React.useState(false);
    const { currentCompany } = useCompany();

    const fetchAccounts = React.useCallback(async () => {
        if (!currentCompany) return;
        try {
            setLoading(true);
            const res = await api.get('/transactions/accounts', {
                params: { perusahaanId: currentCompany.id }
            });
            // Filter only non-header accounts for selection
            setAccounts(res.data.filter((a: Account) => !a.isHeader));
        } catch (error) {
            console.error('Failed to fetch accounts:', error);
        } finally {
            setLoading(false);
        }
    }, [currentCompany]);

    React.useEffect(() => {
        if (open && accounts.length === 0) {
            fetchAccounts();
        }
    }, [open, accounts.length, fetchAccounts]);

    const selectedAccount = accounts.find((account) => account.id === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal"
                    disabled={disabled || !currentCompany}
                >
                    {selectedAccount
                        ? `${selectedAccount.kodeAkun} - ${selectedAccount.namaAkun}`
                        : loading ? "Memuat..." : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Cari kode atau nama akun..." />
                    <CommandList>
                        <CommandEmpty>Akun tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                            {accounts.map((account) => (
                                <CommandItem
                                    key={account.id}
                                    value={`${account.kodeAkun} ${account.namaAkun}`}
                                    onSelect={() => {
                                        onChange(account.id);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === account.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-medium">{account.kodeAkun} - {account.namaAkun}</span>
                                        <span className="text-xs text-muted-foreground">{account.tipe}</span>
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
