'use client';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpIndicator } from "@/components/ui/help-indicator";
import {
    BookOpen,
    Calculator,
    ShieldCheck,
    CreditCard,
    Package,
    Settings,
    LifeBuoy,
    Mail,
    Phone,
    FileText,
    TrendingUp,
    Truck,
    Building,
    Scale,
    History,
    Key,
    Files
} from "lucide-react";

export default function HelpPage() {
    return (
        <div className="space-y-8 pb-24 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 via-amber-600 to-amber-900 bg-clip-text text-transparent font-outfit">
                        Panduan Akuntan Profesional
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg max-w-2xl">
                        Dokumentasi komprehensif mengenai logika akuntansi, alur perpajakan Indonesia, dan integritas data sistem Mgyt Accounting.
                    </p>
                </div>
                <div className="flex items-center gap-3 px-5 py-2.5 bg-amber-50 rounded-2xl border border-amber-200 shadow-sm">
                    <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Contextual Help: ON</span>
                    <HelpIndicator content="Simbol '?' ini tersedia di seluruh sistem untuk memberikan penjelasan terminologi akuntansi secara instan." />
                </div>
            </div>

            {/* Accounting Core Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-all group">
                    <CardHeader className="pb-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <Scale className="h-6 w-6 text-blue-600" />
                        </div>
                        <CardTitle className="text-lg">Prinsip Double-Entry</CardTitle>
                        <CardDescription>Bagaimana sistem menjaga keseimbangan Neraca.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-slate-600 leading-relaxed">
                        Setiap transaksi otomatis mendebit dan mengkredit akun terkait. Sistem memvalidasi parity (kesamaan nilai) sebelum transaksi diposting ke Buku Besar.
                    </CardContent>
                </Card>

                <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-all group">
                    <CardHeader className="pb-4">
                        <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <TrendingUp className="h-6 w-6 text-green-600" />
                        </div>
                        <CardTitle className="text-lg">Moving Average Inventory</CardTitle>
                        <CardDescription>Metode penilaian stok real-time.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-slate-600 leading-relaxed">
                        Nilai persediaan dihitung ulang setiap kali barang masuk. Formula: (Total Biaya Stok / Total Unit) untuk menentukan Harga Pokok Penjualan (HPP).
                    </CardContent>
                </Card>

                <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-all group">
                    <CardHeader className="pb-4">
                        <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <Calculator className="h-6 w-6 text-amber-600" />
                        </div>
                        <CardTitle className="text-lg">Automated Tax Engine</CardTitle>
                        <CardDescription>Integrasi PPN 11% dan PPh 21 TER.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-slate-600 leading-relaxed">
                        Pajak dihitung secara otomatis saat pembuatan Invoice atau Payroll, meminimalisir kesalahan input manual akuntan.
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-4">
                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-8">
                    {/* Deep Logic Section */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold flex items-center gap-2 border-b pb-2 text-slate-800">
                            <BookOpen className="h-5 w-5 text-amber-600" />
                            Logika Siklus Akuntansi
                        </h2>
                        <Accordion type="single" collapsible className="w-full space-y-3">
                            <AccordionItem value="logic-1" className="border rounded-xl px-4 bg-white shadow-sm">
                                <AccordionTrigger className="hover:no-underline py-4">
                                    <div className="flex items-center gap-3 text-left">
                                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold font-mono">01</div>
                                        <div>
                                            <p className="font-semibold text-slate-900">Konsolidasi Multi-Cabang</p>
                                            <p className="text-xs text-slate-500 font-normal">Cara kerja eliminasi saldo antar entitas internal.</p>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pb-6 text-sm text-slate-600 space-y-4">
                                    <p>Sistem mendukung pencatatan transaksi spesifik cabang menggunakan `cabangId`. Laporan dapat dikonsolidasi dengan cara:</p>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li><strong>Laporan Gabungan</strong>: Akumulasi saldo dari seluruh cabang ke dalam satu Neraca/Laba Rugi induk.</li>
                                        <li><strong>Eliminasi</strong>: Pastikan akun 'Hutang/Piutang Antar Cabang' memiliki nilai bersih nol saat konsolidasi dilakukan.</li>
                                    </ul>
                                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 italic text-xs">
                                        Note: Gunakan fitur filter 'Pusat + Seluruh Cabang' di dashboard laporan untuk melihat performa grup.
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="logic-2" className="border rounded-xl px-4 bg-white shadow-sm">
                                <AccordionTrigger className="hover:no-underline py-4">
                                    <div className="flex items-center gap-3 text-left">
                                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold font-mono">02</div>
                                        <div>
                                            <p className="font-semibold text-slate-900">Rekonsiliasi Bank & Voucher</p>
                                            <p className="text-xs text-slate-500 font-normal">Sinkronisasi saldo buku dengan rekening koran.</p>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pb-6 text-sm text-slate-600 space-y-3">
                                    <p>Gunakan modul <strong>Kas & Bank</strong> untuk mencatat mutasi. Setiap baris mutasi bank harus dipasangkan dengan 1 atau lebih Voucher.</p>
                                    <p>Jika terdapat selisih (biaya admin/bunga), buat jurnal penyesuaian melalui <strong>Voucher Manual</strong> untuk mendebit Beban Admin dan mengkredit akun Kas terkait.</p>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="logic-3" className="border rounded-xl px-4 bg-white shadow-sm">
                                <AccordionTrigger className="hover:no-underline py-4">
                                    <div className="flex items-center gap-3 text-left">
                                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold font-mono">03</div>
                                        <div>
                                            <p className="font-semibold text-slate-900">Penutupan Tahun Buku</p>
                                            <p className="text-xs text-slate-500 font-normal">Prosedur memindahkan laba berjalan ke laba ditahan.</p>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pb-6 text-sm text-slate-600 space-y-3">
                                    <p>Sistem akan menutup saldo akun nominal (Laba Rugi) secara otomatis pada akhir tahun fiskal yang dikonfigurasi di Settings.</p>
                                    <p>Selisih antara total pendapatan dan beban akan dipindahkan ke akun <strong>Laba Ditahan (Retained Earnings)</strong> pada awal periode tahun berikutnya.</p>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>

                    {/* Tax Logic Section */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold flex items-center gap-2 border-b pb-2 text-slate-800">
                            <ShieldCheck className="h-5 w-5 text-green-600" />
                            Regulasi Perpajakan (Indonesia)
                        </h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="p-5 border rounded-2xl bg-slate-50 border-slate-200">
                                <h4 className="font-bold text-slate-900 mb-2">PPh 21 (TER)</h4>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Sistem menerapkan <strong>Tarif Efektif Rata-rata</strong> untuk pemotongan pajak gaji bulanan. PTKP (TK/0, K/0, dst) divalidasi saat pendaftaran karyawan. Hasil perhitungan tersedia dalam laporan e-Bupot.
                                </p>
                            </div>
                            <div className="p-5 border rounded-2xl bg-slate-50 border-slate-200">
                                <h4 className="font-bold text-slate-900 mb-2">PPN 11%</h4>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Otomatisasi pemisahan DPP (Dasar Pengenaan Pajak) dan PPN Keluaran pada setiap Invoice. Akun penampung `Hutang PPN` akan selalu balance dengan nilai yang tertulis di faktur pajak keluaran.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar / Glossary Area */}
                <div className="space-y-6">
                    <Card className="border-amber-500/20 bg-amber-50/30 overflow-hidden">
                        <CardHeader className="bg-amber-500/10 border-b border-amber-200/50">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <History className="h-4 w-4 text-amber-700" />
                                Integritas Data
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div>
                                <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest mb-1">Audit Trail</p>
                                <p className="text-xs text-slate-600">Setiap perubahan angka pada entitas tertutup akan mencatat User ID, IP, dan nominal sebelum/sesudah perubahan.</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest mb-1">Hard Lock Period</p>
                                <p className="text-xs text-slate-600">Periode yang sudah diaudit dapat dikunci secara permanen untuk mencegah manipulasi data historis.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 text-slate-100 border-none shadow-xl">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <LifeBuoy className="h-5 w-5 text-amber-500" />
                                <CardTitle className="text-lg">Support Akuntansi</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-slate-400">Hubungi tim ahli kami untuk bantuan implementasi PSAK.</p>
                            <div className="space-y-3">
                                <a href="mailto:expert@mavlana.com" className="flex items-center gap-3 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 group">
                                    <Mail className="h-4 w-4 text-amber-500 group-hover:scale-110 transition-transform" />
                                    <span className="text-xs font-medium">expert@mavlana.com</span>
                                </a>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800 border border-slate-700">
                                    <Phone className="h-4 w-4 text-amber-500" />
                                    <span className="text-xs font-medium">+62 812-3456-7890</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
