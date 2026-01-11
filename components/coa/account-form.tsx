'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { createCOASchema } from '@/server/validators/coa.validator';
import { TipeAkun } from '@prisma/client';

type AccountFormData = z.infer<typeof createCOASchema>;

interface AccountFormProps {
    initialData?: Partial<AccountFormData>;
    parents: { id: string, namaAkun: string, kodeAkun: string }[];
    onSubmit: (data: AccountFormData) => void;
    isLoading?: boolean;
}

export function AccountForm({ initialData, parents, onSubmit, isLoading }: AccountFormProps) {
    const form = useForm<AccountFormData>({
        resolver: zodResolver(createCOASchema) as any,
        defaultValues: {
            kodeAkun: initialData?.kodeAkun || '',
            namaAkun: initialData?.namaAkun || '',
            tipe: (initialData?.tipe as TipeAkun) || TipeAkun.ASET,
            parentId: initialData?.parentId || null,
            normalBalance: initialData?.normalBalance || 'DEBIT',
            isHeader: initialData?.isHeader || false,
            isActive: initialData?.isActive ?? true,
            allowManualEntry: initialData?.allowManualEntry ?? true,
            saldoAwal: initialData?.saldoAwal || 0,
            catatan: initialData?.catatan || '',
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="kodeAkun"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Kode Akun</FormLabel>
                                <FormControl>
                                    <Input placeholder="1-1001" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="tipe"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipe Akun</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Tipe" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.values(TipeAkun).map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type.replace(/_/g, ' ')}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="namaAkun"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nama Akun</FormLabel>
                            <FormControl>
                                <Input placeholder="Kas Utama / Piutang Usaha" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="parentId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Induk Akun</FormLabel>
                            <Select
                                onValueChange={(val) => field.onChange(val === "root" ? null : val)}
                                value={field.value || "root"}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Tanpa Induk (Root)" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="root">Tanpa Induk (Root)</SelectItem>
                                    {parents.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.kodeAkun} - {p.namaAkun}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormDescription>Pilih jika akun ini adalah sub-akun.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="normalBalance"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Saldo Normal</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Saldo Normal" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="DEBIT">DEBIT</SelectItem>
                                        <SelectItem value="KREDIT">KREDIT</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="saldoAwal"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Saldo Awal</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        onChange={e => field.onChange(parseFloat(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex flex-col gap-3 pt-2">
                    <FormField
                        control={form.control}
                        name="isHeader"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>Akun Header</FormLabel>
                                    <FormDescription>
                                        Akun header digunakan untuk pengelompokan dan tidak dapat menerima transaksi langsung.
                                    </FormDescription>
                                </div>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="allowManualEntry"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-1">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>Izinkan Input Manual</FormLabel>
                                </div>
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="catatan"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Catatan</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Keterangan tambahan..."
                                    className="resize-none"
                                    {...field}
                                    value={field.value || ''}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="submit" disabled={isLoading} className="btn-primary">
                        {isLoading ? 'Menyimpan...' : 'Simpan Akun'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
