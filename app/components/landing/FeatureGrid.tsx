'use client';

import React from 'react';
import {
    LayoutDashboard, FileText, BarChart2, Briefcase, Box,
    ShieldCheck, Activity, Users, Globe, Smartphone,
    CheckCircle2, Scale, Wallet, Repeat
} from 'lucide-react';

const coreFeatures = [
    {
        title: 'Akuntansi & Buku Besar',
        description: 'Pencatatan transaksi terstandar PSAK dengan jurnal otomatis dan buku besar yang rapi.',
        icon: FileText,
        color: 'blue'
    },
    {
        title: 'Inventory & Gudang',
        description: 'Kontrol stok real-time antar cabang dengan dukungan metode FIFO atau Average.',
        icon: Box,
        color: 'amber'
    },
    {
        title: 'Payroll & SDM',
        description: 'Kelola data karyawan, kontrak, dan slip gaji dalam satu dashboard terintegrasi.',
        icon: Users,
        color: 'emerald'
    },
    {
        title: 'Master Pajak',
        description: 'Mendukung perhitungan PPN, PPh 21, dan integrasi pelaporan pajak yang akurat.',
        icon: Scale,
        color: 'rose'
    },
    {
        title: 'Laporan Finansial',
        description: 'Neraca, Laba Rugi, dan Arus Kas siap saji kapan saja untuk membantu keputusan bisnis.',
        icon: BarChart2,
        color: 'purple'
    },
    {
        title: 'Keamanan Grade-A',
        description: 'Enkripsi data berlapis, Audit Trail, dan sistem izin per role yang sangat ketat (RBAC).',
        icon: ShieldCheck,
        color: 'slate'
    }
];

export const FeatureGrid = () => {
    return (
        <section id="features" className="py-24 bg-white">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col lg:flex-row gap-16 items-center">
                    {/* Left: Headline & Description */}
                    <div className="lg:w-1/3 text-left">
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-widest italic">Fitur Unggulan</span>
                        </div>
                        <h2 className="text-4xl font-extrabold text-slate-900 mb-6 leading-[1.1]">
                            Solusi <span className="text-primary italic underline decoration-primary/20">End-to-End</span> Untuk Segala Jenis Usaha
                        </h2>
                        <p className="text-slate-600 font-medium text-lg leading-relaxed mb-8">
                            Kami menggabungkan kompleksitas akuntansi korporat dengan kemudahan penggunaan aplikasi modern.
                            Dirancang oleh akuntan profesional untuk kebutuhan pemilik bisnis.
                        </p>
                        <div className="space-y-4">
                            {['Berbasis Cloud', 'Compliant PSAK', 'Mobile Friendly', 'Multi-Company'].map((item) => (
                                <div key={item} className="flex items-center gap-3">
                                    <div className="bg-primary/5 p-1 rounded-full">
                                        <CheckCircle2 className="w-4 h-4 text-primary" />
                                    </div>
                                    <span className="text-slate-800 font-bold uppercase tracking-tight text-sm italic">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Feature Cards */}
                    <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {coreFeatures.map((f, idx) => (
                            <div
                                key={f.title}
                                className="group p-8 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-500"
                            >
                                <div className={`inline-flex p-4 rounded-2xl mb-6 bg-white shadow-sm group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500`}>
                                    <f.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors uppercase tracking-tight">{f.title}</h3>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed">{f.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
