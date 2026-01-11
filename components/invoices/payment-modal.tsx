'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

const paymentSchema = z.object({
    tanggal: z.date(),
    jumlah: z.coerce.number().min(1, 'Jumlah harus > 0'),
    metodePembayaran: z.enum(['TUNAI', 'TRANSFER_BANK', 'CEK', 'GIRO', 'KARTU_KREDIT', 'KARTU_DEBIT', 'E_WALLET', 'VIRTUAL_ACCOUNT']),
    nomorReferensi: z.string().optional(),
    catatan: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface PaymentModalProps {
    invoiceId: string;
    sisaTagihan: number;
    onSuccess: () => void;
    trigger?: React.ReactNode;
}

export function PaymentModal({ invoiceId, sisaTagihan, onSuccess, trigger }: PaymentModalProps) {
    const [open, setOpen] = useState(false);

    const form = useForm<PaymentFormValues>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            tanggal: new Date(),
            jumlah: sisaTagihan,
            metodePembayaran: 'TRANSFER_BANK',
        }
    });

    const onSubmit = async (data: PaymentFormValues) => {
        try {
            await api.post('/payments', {
                invoiceId,
                ...data,
            });
            toast.success('Pembayaran berhasil dicatat');
            setOpen(false);
            onSuccess();
        } catch (error: any) {
            console.error('Payment Error:', error);
            toast.error(error.response?.data?.message || 'Gagal mencatat pembayaran');
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button>Catat Pembayaran</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Catat Pembayaran</DialogTitle>
                    <DialogDescription>
                        Catat penerimaan pembayaran untuk invoice ini.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="tanggal"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Tanggal Pembayaran</FormLabel>
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
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date > new Date() || date < new Date("1900-01-01")
                                                }
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
                            name="jumlah"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Jumlah Bayar (Max: {new Intl.NumberFormat('id-ID').format(sisaTagihan)})</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="metodePembayaran"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Metode Pembayaran</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Metode" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="TUNAI">Tunai</SelectItem>
                                            <SelectItem value="TRANSFER_BANK">Transfer Bank</SelectItem>
                                            <SelectItem value="CEK">Cek</SelectItem>
                                            <SelectItem value="GIRO">Giro</SelectItem>
                                            <SelectItem value="KARTU_KREDIT">Kartu Kredit</SelectItem>
                                            <SelectItem value="E_WALLET">E-Wallet</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="nomorReferensi"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nomor Referensi (Opsional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Contoh: REF123" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="catatan"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Catatan (Opsional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Keterangan tambahan..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Simpan Pembayaran
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
