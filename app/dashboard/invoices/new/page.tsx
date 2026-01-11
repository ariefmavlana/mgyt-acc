'use client';

import { InvoiceForm } from '@/components/invoices/invoice-form';
import { Separator } from '@/components/ui/separator';

export default function NewInvoicePage() {
    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Buat Invoice Baru</h1>
                <p className="text-slate-500">Isi form di bawah ini untuk membuat invoice penjualan baru.</p>
            </div>
            <Separator />
            <InvoiceForm />
        </div>
    );
}
