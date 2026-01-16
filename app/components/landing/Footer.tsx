'use client';

import React from 'react';
import Link from 'next/link';
import { Rocket, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="bg-slate-900 text-slate-300 pt-20 pb-10 border-t border-white/10 overflow-hidden relative">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none" />

            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 relative z-10">
                    {/* Brand Info */}
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="bg-primary p-1.5 rounded-lg">
                                <Rocket className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white uppercase">
                                MAVLANA <span className="text-primary font-black">GOLD</span>
                            </span>
                        </Link>
                        <p className="text-sm leading-relaxed max-w-xs">
                            Sistem Akuntansi Terpadu yang dirancang khusus untuk mematuhi standar PSAK Indonesia,
                            memudahkan pengelolaan keuangan bisnis dari UMKM hingga Enterprise.
                        </p>
                        <div className="flex items-center gap-4">
                            <Link href="#" className="hover:text-primary transition-colors p-2 bg-white/5 rounded-full"><Facebook className="w-4 h-4" /></Link>
                            <Link href="#" className="hover:text-primary transition-colors p-2 bg-white/5 rounded-full"><Twitter className="w-4 h-4" /></Link>
                            <Link href="#" className="hover:text-primary transition-colors p-2 bg-white/5 rounded-full"><Instagram className="w-4 h-4" /></Link>
                            <Link href="#" className="hover:text-primary transition-colors p-2 bg-white/5 rounded-full"><Linkedin className="w-4 h-4" /></Link>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 className="text-white font-bold mb-6 text-lg uppercase tracking-wider">Navigasi</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><Link href="#features" className="hover:text-white hover:translate-x-1 inline-block transition-all">Fitur Utama</Link></li>
                            <li><Link href="#pricing" className="hover:text-white hover:translate-x-1 inline-block transition-all">Pilihan Paket</Link></li>
                            <li><Link href="#about" className="hover:text-white hover:translate-x-1 inline-block transition-all">Tentang Kami</Link></li>
                            <li><Link href="/register" className="hover:text-white hover:translate-x-1 inline-block transition-all text-primary font-bold">Mulai Sekarang</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-white font-bold mb-6 text-lg uppercase tracking-wider">Layanan</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><Link href="/dashboard/coa" className="hover:text-white hover:translate-x-1 inline-block transition-all">Buku Besar</Link></li>
                            <li><Link href="/dashboard/reports" className="hover:text-white hover:translate-x-1 inline-block transition-all">Laporan Keuangan</Link></li>
                            <li><Link href="/dashboard/tax" className="hover:text-white hover:translate-x-1 inline-block transition-all">Master Pajak</Link></li>
                            <li><Link href="/dashboard/help" className="hover:text-white hover:translate-x-1 inline-block transition-all">Pusat Bantuan</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-bold mb-6 text-lg uppercase tracking-wider">Kontak Kami</h4>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-primary mt-0.5" />
                                <span>hello@mavlana.co.id</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-primary mt-0.5" />
                                <span>+62 (21) 1234 5678</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                                <span>Sudirman Central Business District, Jakarta Pusat</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[12px] font-semibold uppercase tracking-widest text-slate-500">
                    <p>© {new Date().getFullYear()} MAVLANA ACC. SELURUH HAK CIPTA DILINDUNGI.</p>
                    <div className="flex gap-8">
                        <Link href="#" className="hover:text-white transition-colors">Kebijakan Privasi</Link>
                        <Link href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
