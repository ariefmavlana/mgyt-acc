'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Menu, X, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Fitur', href: '#features' },
        { name: 'Harga', href: '#pricing' },
        { name: 'Tentang', href: '#about' },
        { name: 'Bantuan', href: '/dashboard/help' },
    ];

    return (
        <nav
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
                isScrolled
                    ? 'bg-white/80 backdrop-blur-md border-slate-200 py-3 shadow-sm'
                    : 'bg-transparent border-transparent py-5'
            )}
        >
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="bg-primary p-1.5 rounded-lg group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/20">
                            <Rocket className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900">
                            MAVLANA <span className="text-primary font-black">GOLD</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-sm font-medium text-slate-600 hover:text-primary transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Auth Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link href="/login">
                            <Button variant="ghost" className="text-slate-600 font-semibold hover:text-primary">
                                Masuk
                            </Button>
                        </Link>
                        <Link href="/register">
                            <Button className="font-bold shadow-lg shadow-primary/25 hover:scale-105 transition-all">
                                Mulai Sekarang
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 text-slate-600"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <div
                className={cn(
                    'fixed inset-0 bg-white z-40 p-6 md:hidden transition-all duration-500 ease-in-out transform',
                    isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                )}
            >
                <div className="flex justify-between items-center mb-10">
                    <span className="text-xl font-bold text-slate-900">Mavlana Menu</span>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 border rounded-full">
                        <X className="w-6 h-6 text-slate-600" />
                    </button>
                </div>
                <div className="flex flex-col gap-6">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-4"
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="flex flex-col gap-4 mt-6">
                        <Link href="/login" className="w-full">
                            <Button variant="outline" className="w-full text-lg h-14">Masuk</Button>
                        </Link>
                        <Link href="/register" className="w-full">
                            <Button className="w-full text-lg h-14 font-bold shadow-xl shadow-primary/20">Daftar Akun Gratis</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};
