import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HelpIndicator } from "@/components/ui/help-indicator"
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
    Building
} from "lucide-react"

export default function HelpPage() {
    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
                        Pusat Bantuan & Panduan Akuntansi
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Panduan komprehensif operasional sistem untuk Pengguna dan Akuntan Profesional.
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-full border border-amber-500/20">
                    <span className="text-xs font-semibold text-amber-500">SIGN '?' AKTIF</span>
                    <HelpIndicator content="Setiap simbol ini memberikan informasi tambahan instan saat kursor diarahkan." />
                </div>
            </div>

            {/* Quick Access - Accountant Needs */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-amber-500/20 bg-background/40 hover:bg-background/60 transition-colors">
                    <CardHeader className="pb-3 text-center">
                        <Calculator className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                        <CardTitle className="text-md">Kalkulasi Pajak</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center text-xs text-muted-foreground">
                        Penjelasan tarif PPh 21, PPN 11%, dan PPh 23.
                    </CardContent>
                </Card>
                <Card className="border-amber-500/20 bg-background/40 hover:bg-background/60 transition-colors">
                    <CardHeader className="pb-3 text-center">
                        <BookOpen className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                        <CardTitle className="text-md">Buku Besar</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center text-xs text-muted-foreground">
                        Struktur COA dan Mapping Jurnal Otomatis.
                    </CardContent>
                </Card>
                <Card className="border-amber-500/20 bg-background/40 hover:bg-background/60 transition-colors">
                    <CardHeader className="pb-3 text-center">
                        <Package className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                        <CardTitle className="text-md">Penilaian Stok</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center text-xs text-muted-foreground">
                        Metode Inventory Moving Average.
                    </CardContent>
                </Card>
                <Card className="border-amber-500/20 bg-background/40 hover:bg-background/60 transition-colors">
                    <CardHeader className="pb-3 text-center">
                        <FileText className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                        <CardTitle className="text-md">Laporan Keuangan</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center text-xs text-muted-foreground">
                        Cara membaca Neraca dan Laba Rugi.
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Column 1: Accounting Core */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-amber-500" />
                                Penjelasan Modul Keuangan (GL)
                                <HelpIndicator content="Modul pusat yang merangkum semua transaksi dari modul lain." />
                            </CardTitle>
                            <CardDescription>Bagaimana transaksi berubah menjadi jurnal akuntansi.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="gl-1">
                                    <AccordionTrigger>
                                        <div className="flex items-center gap-2">
                                            Alur Otomatisasi Jurnal
                                            <HelpIndicator content="Sistem menggunakan Double-Entry Bookkeeping." />
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-3">
                                        <p>Setiap Invoice Penjualan atau Tagihan Pembelian yang di-approve akan:</p>
                                        <ol className="list-decimal pl-5 space-y-1 text-sm">
                                            <li>Memasukkan data ke modul <strong>Piutang/Hutang</strong>.</li>
                                            <li>Membuat <strong>Voucher</strong> (Nomor Urut Unik).</li>
                                            <li>Membuat entri <strong>Jurnal Umum</strong> (Debit vs Kredit).</li>
                                            <li>Mengupdate saldo <strong>Buku Besar (COA)</strong> secara real-time.</li>
                                        </ol>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="gl-2">
                                    <AccordionTrigger>
                                        <div className="flex items-center gap-2">
                                            Metode Penilaian Persediaan (Average)
                                            <HelpIndicator content="Moving Average Method adalah standar default sistem." />
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-2">
                                        <p>Sistem menghitung nilai stok berdasarkan total biaya dibagi jumlah unit yang tersedia setiap kali ada barang masuk (Purchase).</p>
                                        <div className="p-3 bg-slate-50 rounded border text-xs leading-relaxed">
                                            <strong>Formula:</strong> (Nilai Stok Lama + Nilai Barang Masuk) / (Jumlah Stok Lama + Jumlah Barang Masuk)
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calculator className="h-5 w-5 text-amber-500" />
                                Perpajakan & Payroll (HR)
                                <HelpIndicator content="Kalkulator PPh 21 dan PPN terintegrasi." />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="tax-1">
                                    <AccordionTrigger>
                                        Perhitungan PPh 21 Karyawan (PTKP)
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-2">
                                        <p>Payroll dihitung berdasarkan status <strong>Penghasilan Tidak Kena Pajak (PTKP)</strong> terbaru:</p>
                                        <ul className="list-disc pl-5 text-sm space-y-1">
                                            <li><strong>TK/0</strong> (Tidak Kawin): 54.000.000/tahun.</li>
                                            <li><strong>K/0</strong> (Kawin tanpa anak): Tambahan 4.500.000.</li>
                                            <li><strong>K/1-3</strong>: Tambahan per anak (max 3).</li>
                                        </ul>
                                        <p className="text-xs italic text-amber-600">Sistem otomatis menerapkan Tarif Terintegrasi (TER) berdasarkan regulasi pemerintah terbaru.</p>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="tax-2">
                                    <AccordionTrigger>PPN (Pajak Pertambahan Nilai)</AccordionTrigger>
                                    <AccordionContent>
                                        Tarif PPN dikunci pada <strong>11%</strong>. Pada Invoice Penjualan, Anda dapat memilih apakah harga sudah termasuk pajak (Inc) atau belum (Exc). Sistem akan memisahkan nominal PPN ke akun <em>Hutang PPN Keluaran</em> secara otomatis.
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building className="h-5 w-5 text-amber-500" />
                                Laporan Keuangan Profesional
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="rep-1">
                                    <AccordionTrigger>Neraca (Balance Sheet)</AccordionTrigger>
                                    <AccordionContent>
                                        Menampilkan posisi keuangan pada tanggal tertentu. Mengikuti prinsip: <strong>Aset = Liabilitas + Ekuitas</strong>. Laporan ini memberikan gambaran kekayaan bersih perusahaan.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="rep-2">
                                    <AccordionTrigger>Laba Rugi (Income Statement)</AccordionTrigger>
                                    <AccordionContent>
                                        Menyajikan performa perusahaan selama satu periode. Pendapatan dikurangi Beban Operasional untuk mendapatkan <em>Laba Bersih</em>.
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>
                </div>

                {/* Column 2: Sidebars / FAQ */}
                <div className="space-y-6">
                    <Card className="border-amber-500/10">
                        <CardHeader className="bg-amber-500/5">
                            <CardTitle className="text-lg">Kamus Istilah (Glossary)</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <dl className="space-y-4">
                                <div>
                                    <dt className="text-sm font-bold flex items-center gap-2">
                                        COA
                                        <HelpIndicator content="Chart of Accounts" />
                                    </dt>
                                    <dd className="text-xs text-muted-foreground">Daftar semua akun akuntansi yang digunakan perusahaan.</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-bold flex items-center gap-2">
                                        Voucher
                                        <HelpIndicator content="Bukti Transaksi" />
                                    </dt>
                                    <dd className="text-xs text-muted-foreground">Dokumen internal sebagai bukti dasar pencatatan jurnal.</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-bold flex items-center gap-2">
                                        Audit Trail
                                        <HelpIndicator content="Jejak Audit" />
                                    </dt>
                                    <dd className="text-xs text-muted-foreground">Catatan kronologis siapa yang mengubah data dalam sistem.</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-bold">Depresiasi</dt>
                                    <dd className="text-xs text-muted-foreground">Alokasi biaya aset tetap sepanjang masa manfaatnya.</dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 text-slate-100 border-none shadow-xl">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <LifeBuoy className="h-6 w-6 text-amber-500" />
                                <CardTitle>Hubungi Akuntan Kami</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-slate-400">Punya kendala dengan pencatatan pembukuan Anda?</p>
                            <div className="space-y-3">
                                <a href="mailto:support@mavlana.com" className="flex items-center gap-3 p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700">
                                    <Mail className="h-4 w-4 text-amber-500" />
                                    <span className="text-xs font-medium">support@mavlana.com</span>
                                </a>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800 border border-slate-700">
                                    <Phone className="h-4 w-4 text-amber-500" />
                                    <span className="text-xs font-medium">+62 812-3456-7890 (WA)</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
