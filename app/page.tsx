'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Navbar } from './components/landing/Navbar';
import { Footer } from './components/landing/Footer';
import { FeatureGrid } from './components/landing/FeatureGrid';
import { PricingTable } from './components/landing/PricingTable';
import {
  ArrowRight, Star, ShieldCheck,
  Zap, Award, Users, ChevronRight, BarChart2
} from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-white">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10 opacity-50" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-full mb-8 shadow-xl hover:scale-105 transition-transform cursor-pointer">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-black uppercase tracking-[0.2em] italic">Visi Masa Depan Akuntansi</span>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-8xl font-black text-slate-900 mb-8 leading-[0.9] tracking-tighter uppercase whitespace-pre-line">
              Kelola Finansial <br />
              <span className="text-primary italic underline decoration-primary/20">Tanpa Batas</span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-slate-600 font-medium max-w-3xl mb-12 leading-relaxed">
              MAVLANA <span className="text-primary font-bold">GOLD</span> adalah ekosistem ERP Akuntansi tercanggih
              yang dirancang untuk mematuhi standar PSAK Indonesia. Tuntaskan pembukuan, stok, hingga payroll
              dalam satu dashboard yang cantik dan intuitif.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-20 w-full sm:w-auto">
              <Link href="/register" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto px-10 h-16 text-lg font-black uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 transition-all">
                  Mulai Sekarang <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="#features" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto px-10 h-16 text-lg font-bold border-2 border-slate-200 hover:border-primary/50 transition-all uppercase tracking-wider">
                  Pelajari Fitur
                </Button>
              </Link>
            </div>

            {/* Dashboard Mockup Image */}
            <div className="relative w-full max-w-6xl mx-auto group">
              <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-3xl group-hover:bg-primary/20 transition-all -z-10" />
              <div className="bg-slate-900 p-2 md:p-4 rounded-[40px] shadow-2xl shadow-primary/10 border-4 border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-transparent via-primary/50 to-transparent" />
                <Image
                  src="/images/dashboard-mockup.png"
                  alt="Mavlana Gold Dashboard Mockup"
                  width={1200}
                  height={800}
                  className="rounded-[24px] md:rounded-[32px] w-full h-auto object-cover transform transition-all duration-700 group-hover:scale-[1.01]"
                  priority
                />
              </div>

              {/* Floating Stats or Badges (Aesthetic) */}
              <div className="hidden lg:block absolute -right-10 top-1/4 bg-white p-4 rounded-2xl shadow-2xl border border-slate-100 animate-bounce duration-3000">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <ShieldCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Status Pajak</p>
                    <p className="text-sm font-bold text-slate-900 italic">TERVALIDASI PSAK</p>
                  </div>
                </div>
              </div>

              <div className="hidden lg:block absolute -left-10 bottom-1/4 bg-white p-4 rounded-2xl shadow-2xl border border-slate-100 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Award className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Sertifikasi</p>
                    <p className="text-sm font-bold text-slate-900 italic">KEAMANAN GRADE A</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-12 border-y border-slate-100 bg-slate-50/50">
        <div className="container mx-auto px-6">
          <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8 italic">Dipercaya oleh Bisnis Terkemuka</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-40 grayscale group hover:grayscale-0 transition-all duration-700">
            {['PT. MAJU JAYA', 'SOLUSI TEKNOLOGI', 'GARMEN SEJAHTERA', 'MODERN RETAIL', 'LOGISTIK TRANS'].map((name) => (
              <span key={name} className="text-xl md:text-2xl font-black text-slate-800 tracking-tighter hover:text-primary transition-colors cursor-default select-none">{name}</span>
            ))}
          </div>
        </div>
      </section>

      <FeatureGrid />

      {/* "Why Mavlana" Section */}
      <section id="about" className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.1),transparent)]" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-6xl font-black leading-[0.9] uppercase italic tracking-tighter">
                Mengapa Harus <br />
                <span className="text-primary italic">Mavlana Gold?</span>
              </h2>
              <p className="text-lg text-slate-400 font-medium leading-relaxed">
                Kami bukan sekadar software akuntansi. Kami adalah partner strategis dalam akselerasi bisnis Anda melalui data yang akurat dan sistem yang transparan.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6">
                {[
                  { icon: Zap, title: 'Super Cepat', desc: 'Arsitektur modern untuk load data kilat.' },
                  { icon: ShieldCheck, title: 'Data Aman', desc: 'Enkripsi SSL 256-bit kelas perbankan.' },
                  { icon: Users, title: 'Kolaborasi', desc: 'Multi-user dengan akses yang tertata.' },
                  { icon: BarChart2, title: 'Analisa Real-time', desc: 'Laporan instan kapan saja diperlukan.' },
                ].map((item) => (
                  <div key={item.title} className="space-y-3">
                    <div className="bg-white/10 w-12 h-12 rounded-xl flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="text-xl font-bold uppercase tracking-tight italic">{item.title}</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-linear-to-br from-primary/30 to-transparent p-px rounded-[40px]">
                <div className="bg-slate-800 rounded-[40px] p-8 md:p-12 relative overflow-hidden shadow-2xl">
                  <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
                  <blockquote className="relative z-10">
                    <Star className="w-12 h-12 text-primary mb-8 fill-primary" />
                    <p className="text-2xl md:text-3xl font-bold leading-snug mb-8 tracking-tight italic">
                      &quot;Mavlana Gold berhasil memangkas waktu tutup buku kami dari 7 hari menjadi hanya 1 hari. Visibilitas stok antar cabang sekarang sangat transparan.&quot;
                    </p>
                    <footer className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-700 rounded-full" />
                      <div>
                        <cite className="not-italic font-black text-white uppercase tracking-widest text-sm">Arief Maviana</cite>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">CEO PT. Garmen Maju Sejahtera</p>
                      </div>
                    </footer>
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PricingTable />

      {/* Final CTA */}
      <section className="py-24 bg-primary relative overflow-hidden group">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2),transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-7xl font-black text-white mb-10 leading-[0.9] uppercase italic tracking-widest">
            Siap Bertransformasi <br className="hidden md:block" /> Menjadi <span className="text-slate-900 underline decoration-white/30">Miliarder</span> Baru?
          </h2>
          <Link href="/register">
            <Button className="bg-white text-primary hover:bg-slate-900 hover:text-white px-12 h-20 text-xl font-black uppercase tracking-[0.3em] shadow-3xl hover:scale-110 transition-all rounded-full border-0">
              Gabung Sekarang Gratis <ChevronRight className="ml-2 w-6 h-6" />
            </Button>
          </Link>
          <p className="mt-10 text-white/70 font-black uppercase tracking-[0.2em] text-xs underline decoration-white/20 cursor-default">
            Tidak perlu kartu kredit untuk mulai mencoba gratis
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
