import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HelpIndicator } from "@/components/ui/help-indicator"

export default function HelpPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Pusat Bantuan</h1>
                <p className="text-muted-foreground">
                    Jawaban untuk pertanyaan umum dan panduan penggunaan sistem.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Pertanyaan Umum (FAQ)
                        <HelpIndicator content="Klik pada pertanyaan untuk melihat jawaban detail" />
                    </CardTitle>
                    <CardDescription>
                        Informasi dasar mengenai terminologi dan fitur sistem akuntansi.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>Apa itu Chart of Accounts (COA)?</AccordionTrigger>
                            <AccordionContent>
                                Chart of Accounts (COA) atau Kode Akun Perkiraan adalah daftar terstruktur dari semua akun yang digunakan untuk mencatat transaksi keuangan perusahaan.
                                Sistem ini menggunakan standar PSAK dengan struktur: Aset, Liabilitas, Ekuitas, Pendapatan, dan Beban.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>Bagaimana cara mencatat transaksi harian?</AccordionTrigger>
                            <AccordionContent>
                                Anda dapat mencatat transaksi melalui menu <strong>Jurnal Umum</strong> untuk entri manual, atau menggunakan menu <strong>Faktur Penjualan</strong> dan <strong>Faktur Pembelian</strong> untuk transaksi dagang otomatis. Sistem akan otomatis membuat voucher dan jurnal yang sesuai.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>Apakah laporan keuangan terupdate secara otomatis?</AccordionTrigger>
                            <AccordionContent>
                                Ya, Mgyt Accounting menggunakan <em>Real-time Engine</em>. Setiap kali Anda menyimpan transaksi, saldo akun dan laporan keuangan (Neraca, Laba Rugi) akan terupdate seketika tanpa perlu proses &quot;tutup buku&quot; manual untuk melihat saldo harian.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>Apa bedanya Role MANAGER dan STAFF?</AccordionTrigger>
                            <AccordionContent>
                                <strong>MANAGER</strong> memiliki akses penuh untuk menyetujui (approve) transaksi, melihat laporan sensitif, dan mengubah pengaturan divisi.
                                <br />
                                <strong>STAFF</strong> fokus pada input data harian (membuat faktur, mencatat pengeluaran) tetapi tidak dapat menghapus data penting atau mengakses konfigurasi sistem.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-5">
                            <AccordionTrigger>Bagaimana cara melakukan Stock Opname?</AccordionTrigger>
                            <AccordionContent>
                                Masuk ke menu <strong>Persediaan (Inventory)</strong>, pilih gudang yang dituju, dan gunakan fitur &quot;Stock Opname&quot;. Anda bisa mencatat selisih stok fisik dan sistem, yang kemudian akan otomatis dibuatkan jurnal penyesuaian persediaan.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Butuh Bantuan Lebih Lanjut?</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Jika Anda mengalami kendala teknis atau membutuhkan pelatihan khusus.
                        </p>
                        <div className="text-sm font-medium">
                            Email: support@mavlana.com<br />
                            Wa: +62 812-3456-7890
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
