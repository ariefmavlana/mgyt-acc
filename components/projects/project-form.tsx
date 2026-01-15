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
import { Loader2, CalendarIcon } from 'lucide-react';
import { useContacts } from '@/hooks/use-contacts';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Project } from '@/hooks/use-project';

const formSchema = z.object({
    kodeProyek: z.string().min(1, 'Kode proyek wajib diisi'),
    namaProyek: z.string().min(1, 'Nama proyek wajib diisi'),
    pelangganId: z.string().nullable().optional(),
    tanggalMulai: z.date({
        required_error: "Tanggal mulai wajib diisi",
    }),
    tanggalSelesai: z.date().nullable().optional(),
    targetSelesai: z.date().nullable().optional(),
    nilaiKontrak: z.number().nullable().optional(),
    manajerProyek: z.string().nullable().optional(),
    lokasi: z.string().nullable().optional(),
    deskripsi: z.string().nullable().optional(),
    status: z.string().default('ACTIVE'),
});

type FormValues = z.infer<typeof formSchema>;

interface ProjectFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: Project | null;
    onSubmit: (data: FormValues) => Promise<void>;
    isLoading?: boolean;
}

export function ProjectForm({
    open,
    onOpenChange,
    initialData,
    onSubmit,
    isLoading,
}: ProjectFormProps) {
    const { useCustomers } = useContacts();
    const { data: customers } = useCustomers();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            kodeProyek: initialData?.kodeProyek || '',
            namaProyek: initialData?.namaProyek || '',
            pelangganId: initialData?.pelangganId || null,
            tanggalMulai: initialData?.tanggalMulai ? new Date(initialData.tanggalMulai) : new Date(),
            tanggalSelesai: initialData?.tanggalSelesai ? new Date(initialData.tanggalSelesai) : null,
            targetSelesai: initialData?.targetSelesai ? new Date(initialData.targetSelesai) : null,
            nilaiKontrak: initialData?.nilaiKontrak || 0,
            manajerProyek: initialData?.manajerProyek || '',
            lokasi: initialData?.lokasi || '',
            deskripsi: initialData?.deskripsi || '',
            status: initialData?.status || 'ACTIVE',
        },
    });

    // Reset values when initialData changes
    React.useEffect(() => {
        if (open) {
            form.reset({
                kodeProyek: initialData?.kodeProyek || '',
                namaProyek: initialData?.namaProyek || '',
                pelangganId: initialData?.pelangganId || null,
                tanggalMulai: initialData?.tanggalMulai ? new Date(initialData.tanggalMulai) : new Date(),
                tanggalSelesai: initialData?.tanggalSelesai ? new Date(initialData.tanggalSelesai) : null,
                targetSelesai: initialData?.targetSelesai ? new Date(initialData.targetSelesai) : null,
                nilaiKontrak: initialData?.nilaiKontrak || 0,
                manajerProyek: initialData?.manajerProyek || '',
                lokasi: initialData?.lokasi || '',
                deskripsi: initialData?.deskripsi || '',
                status: initialData?.status || 'ACTIVE',
            });
        }
    }, [initialData, open, form]);

    const handleFormSubmit = async (values: FormValues) => {
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
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        {initialData ? 'Edit Proyek' : 'Tambah Proyek Baru'}
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="kodeProyek"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Kode Proyek</FormLabel>
                                        <FormControl>
                                            <Input placeholder="PRJ-2024-001" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih Status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="PLANNING">Planning</SelectItem>
                                                <SelectItem value="ACTIVE">Active</SelectItem>
                                                <SelectItem value="ON_HOLD">On Hold</SelectItem>
                                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="namaProyek"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama Proyek</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Contoh: Pembangunan Jembatan Layang" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="pelangganId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Pelanggan (Client)</FormLabel>
                                    <Select
                                        onValueChange={(val) => field.onChange(val === 'none' ? null : val)}
                                        value={field.value || 'none'}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Pelanggan" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">Internal / Tanpa Pelanggan</SelectItem>
                                            {customers?.map((c) => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.nama}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="tanggalMulai"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Tanggal Mulai</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value instanceof Date ? (
                                                            format(field.value, "PP")
                                                        ) : (
                                                            <span>Pilih tanggal</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value instanceof Date ? field.value : undefined}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="targetSelesai"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Target Selesai</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value instanceof Date ? (
                                                            format(field.value, "PP")
                                                        ) : (
                                                            <span>Pilih tanggal</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value instanceof Date ? field.value : undefined}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="nilaiKontrak"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nilai Kontrak (IDR)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                {...field}
                                                value={field.value || 0}
                                                onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="manajerProyek"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Manajer Proyek</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nama Manajer" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="lokasi"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Lokasi</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Lokasi Proyek" {...field} value={field.value || ''} />
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
                                            placeholder="Detil proyek..."
                                            className="resize-none"
                                            {...field}
                                            value={field.value || ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-4 pb-2">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Simpan Proyek
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
