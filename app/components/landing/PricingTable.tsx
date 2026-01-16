'use client';

import React from 'react';
import { Check, X, ShieldCheck, Zap, Building2, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const tiers = [
    {
        name: 'UMKM',
        price: 'Free Trial',
        description: 'Ideal untuk usaha kecil & rintisan yang mulai merapikan pembukuan.',
        icon: Zap,
        features: [
            '1 User Akses',
            'Hingga 50 Transaksi/Bulan',
            'Laporan Keuangan Dasar',
            'Manajemen Produk Dasar',
            'Multi-Currency Dasar',
        ],
        notIncluded: [
            'Manajemen Cabang',
            'Payroll & SDM',
            'Cost/Profit Center',
            'Audit Trail',
        ],
        cta: 'Coba Gratis',
        color: 'slate',
    },
    {
        name: 'Small Business',
        price: 'IDR 299rb',
        period: '/bulan',
        description: 'Untuk bisnis berkembang yang membutuhkan kontrol lebih detail.',
        icon: Building2,
        features: [
            '3 User Akses',
            'Hingga 500 Transaksi/Bulan',
            'Laporan Keuangan Lengkap',
            'Manajemen Inventory Lengkap',
            'Manajemen Piutang & Hutang',
            'Pencatatan Aset Tetap',
        ],
        notIncluded: [
            'Manajemen Cabang',
            'Laporan Pajak Otomatis',
            'Cost/Profit Center',
            'Audit Trail',
        ],
        cta: 'Pilih Small Business',
        color: 'primary',
        popular: true,
    },
    {
        name: 'Medium Corp',
        price: 'IDR 599rb',
        period: '/bulan',
        description: 'Solusi lengkap untuk perusahaan dengan banyak departemen & tim.',
        icon: ShieldCheck,
        features: [
            '10 User Akses',
            'Hingga 2,000 Transaksi/Bulan',
            'Multi-Cabang & Gudang',
            'Modul Payroll & Karyawan',
            'Laporan Pajak Otomatis',
            'Budgeting & Forecast',
        ],
        notIncluded: [
            'Cost center (Enterprise Only)',
            'Unlimited Projects',
        ],
        cta: 'Pilih Medium Corp',
        color: 'slate',
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        period: '',
        description: 'Skalabilitas tanpa batas untuk korporasi besar & grup perusahaan.',
        icon: Crown,
        features: [
            'Unlimited Users',
            'Unlimited Transactions',
            'Cost & Profit Center',
            'Manajemen Proyek Lengkap',
            'Audit Trail & Jejak Audit',
            'Premium Support 24/7',
        ],
        notIncluded: [],
        cta: 'Hubungi Sales',
        color: 'primary',
    },
];

export const PricingTable = () => {
    return (
        <section id="pricing" className="py-24 bg-slate-50 relative overflow-hidden">
            {/* Background decorative circles */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight uppercase">
                        Satu Harga, <span className="text-primary italic">Sejuta</span> Solusi
                    </h2>
                    <p className="text-lg text-slate-600 font-medium leading-relaxed">
                        Pilih paket yang paling sesuai dengan skala pertumbuhan bisnis Anda.
                        Semua paket sudah termasuk update sistem otomatis dan keamanan enkripsi data.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {tiers.map((tier) => (
                        <div
                            key={tier.name}
                            className={`relative flex flex-col p-8 bg-white rounded-3xl border ${tier.popular
                                    ? 'border-primary ring-4 ring-primary/10 shadow-2xl scale-105 z-10'
                                    : 'border-slate-200 shadow-xl hover:border-primary/50 transition-all'
                                }`}
                        >
                            {tier.popular && (
                                <div className="absolute top-0 right-12 transform -translate-y-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                                    Paling Populer
                                </div>
                            )}

                            <div className="mb-8">
                                <div className={`inline-flex p-3 rounded-2xl mb-6 ${tier.color === 'primary' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-600'}`}>
                                    <tier.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2 uppercase tracking-wide">{tier.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-slate-900 tracking-tight">{tier.price}</span>
                                    {tier.period && <span className="text-slate-500 font-semibold text-sm">{tier.period}</span>}
                                </div>
                                <p className="mt-4 text-sm text-slate-500 font-medium leading-relaxed">{tier.description}</p>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1 border-t border-slate-50 pt-8">
                                {tier.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3">
                                        <div className="mt-1 bg-green-500/10 p-0.5 rounded-full">
                                            <Check className="w-4 h-4 text-green-600" />
                                        </div>
                                        <span className="text-sm font-semibold text-slate-700">{feature}</span>
                                    </li>
                                ))}
                                {tier.notIncluded.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 opacity-40 grayscale">
                                        <div className="mt-1 bg-slate-100 p-0.5 rounded-full">
                                            <X className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <span className="text-sm font-semibold text-slate-400">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link href="/register">
                                <Button
                                    className={`w-full h-12 font-bold uppercase tracking-wider ${tier.color === 'primary'
                                            ? 'bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02]'
                                            : 'bg-slate-900 text-white hover:bg-slate-800'
                                        } transition-all`}
                                >
                                    {tier.cta}
                                </Button>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
