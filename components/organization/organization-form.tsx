'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
    kode: z.string().min(1, 'Kode wajib diisi'),
    nama: z.string().min(1, 'Nama wajib diisi'),
    deskripsi: z.string().optional().nullable(),
    parentId: z.string().optional().nullable(),
    manager: z.string().optional().nullable(),
    isAktif: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface OrganizationFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    initialData?: any;
    parents?: any[];
    onSubmit: (data: FormValues) => Promise<void>;
    isLoading?: boolean;
}

export function OrganizationForm({
    open,
    onOpenChange,
    title,
    initialData,
    parents = [],
    onSubmit,
    isLoading,
}: OrganizationFormProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        values: {
            kode: initialData?.kode || '',
            nama: initialData?.nama || '',
            deskripsi: initialData?.deskripsi || '',
            parentId: initialData?.parentId || null,
            manager: initialData?.manager || '',
            isAktif: initialData?.isAktif ?? true,
        },
    });

    const handleSubmit = async (values: FormValues) => {
        try {
            await onSubmit(values);
            onOpenChange(false);
            form.reset();
        } catch (error) {
            console.error('Submit Error:', error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="kode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Kode</FormLabel>
                                        <FormControl>
                                            <Input placeholder="CC-001" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="isAktif"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col justify-end">
                                        <FormLabel className="mb-2">Status Aktif</FormLabel>
                                        <FormControl>
                                            <div className="flex items-center h-10">
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="nama"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nama Unit/Pusat" {...field} />
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
                                    <FormLabel>Induk (Optional)</FormLabel>
                                    <Select
                                        onValueChange={(val) => field.onChange(val === 'none' ? null : val)}
                                        value={field.value || 'none'}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Induk" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">Tanpa Induk</SelectItem>
                                            {parents
                                                .filter((p) => p.id !== initialData?.id)
                                                .map((p) => (
                                                    <SelectItem key={p.id} value={p.id}>
                                                        {p.kode} - {p.nama}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="manager"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Manager</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nama Manager" {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="deskripsi"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Deskripsi</FormLabel>
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

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Simpan
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
