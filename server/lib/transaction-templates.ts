export interface TransactionTemplate {
    id: string;
    nama: string;
    tipe: string;
    deskripsiDefault: string;
    items: {
        akunLabel: string; // Logical name to match
        jenis: 'DEBIT' | 'KREDIT';
        persen?: number; // Optional percentage of total
    }[];
}

export const TRANSACTION_TEMPLATES: TransactionTemplate[] = [
    {
        id: 'penjualan-tunai',
        nama: 'Penjualan Tunai',
        tipe: 'PENJUALAN',
        deskripsiDefault: 'Penjualan tunai barang/jasa',
        items: [
            { akunLabel: 'Kas/Bank', jenis: 'DEBIT' },
            { akunLabel: 'Pendapatan Penjualan', jenis: 'KREDIT' }
        ]
    },
    {
        id: 'penjualan-kredit',
        nama: 'Penjualan Kredit',
        tipe: 'PENJUALAN',
        deskripsiDefault: 'Penjualan kredit (Piutang)',
        items: [
            { akunLabel: 'Piutang Usaha', jenis: 'DEBIT' },
            { akunLabel: 'Pendapatan Penjualan', jenis: 'KREDIT' }
        ]
    },
    {
        id: 'pembelian-tunai',
        nama: 'Pembelian Tunai',
        tipe: 'PEMBELIAN',
        deskripsiDefault: 'Pembelian tunai inventaris/aset',
        items: [
            { akunLabel: 'Persediaan/Biaya', jenis: 'DEBIT' },
            { akunLabel: 'Kas/Bank', jenis: 'KREDIT' }
        ]
    },
    {
        id: 'pembelian-kredit',
        nama: 'Pembelian Kredit',
        tipe: 'PEMBELIAN',
        deskripsiDefault: 'Pembelian kredit (Hutang)',
        items: [
            { akunLabel: 'Persediaan/Biaya', jenis: 'DEBIT' },
            { akunLabel: 'Hutang Usaha', jenis: 'KREDIT' }
        ]
    },
    {
        id: 'bayar-gaji',
        nama: 'Bayar Gaji',
        tipe: 'BIAYA',
        deskripsiDefault: 'Pembayaran gaji karyawan',
        items: [
            { akunLabel: 'Beban Gaji', jenis: 'DEBIT' },
            { akunLabel: 'Kas/Bank', jenis: 'KREDIT' }
        ]
    },
    {
        id: 'bayar-sewa',
        nama: 'Bayar Sewa',
        tipe: 'BIAYA',
        deskripsiDefault: 'Pembayaran sewa kantor/lahan',
        items: [
            { akunLabel: 'Beban Sewa', jenis: 'DEBIT' },
            { akunLabel: 'Kas/Bank', jenis: 'KREDIT' }
        ]
    },
    {
        id: 'terima-piutang',
        nama: 'Terima Pembayaran Piutang',
        tipe: 'PENERIMAAN_PIUTANG',
        deskripsiDefault: 'Penerimaan pembayaran dari pelanggan',
        items: [
            { akunLabel: 'Kas/Bank', jenis: 'DEBIT' },
            { akunLabel: 'Piutang Usaha', jenis: 'KREDIT' }
        ]
    },
    {
        id: 'bayar-hutang',
        nama: 'Bayar Hutang',
        tipe: 'PEMBAYARAN_HUTANG',
        deskripsiDefault: 'Pembayaran hutang ke pemasok',
        items: [
            { akunLabel: 'Hutang Usaha', jenis: 'DEBIT' },
            { akunLabel: 'Kas/Bank', jenis: 'KREDIT' }
        ]
    },
    {
        id: 'beban-listrik',
        nama: 'Beban Listrik & Air',
        tipe: 'BIAYA',
        deskripsiDefault: 'Pembayaran tagihan listrik dan air',
        items: [
            { akunLabel: 'Beban Utilitas', jenis: 'DEBIT' },
            { akunLabel: 'Kas/Bank', jenis: 'KREDIT' }
        ]
    },
    {
        id: 'beban-internet',
        nama: 'Beban Internet & Telpon',
        tipe: 'BIAYA',
        deskripsiDefault: 'Pembayaran tagihan internet dan telpon',
        items: [
            { akunLabel: 'Beban Komunikasi', jenis: 'DEBIT' },
            { akunLabel: 'Kas/Bank', jenis: 'KREDIT' }
        ]
    },
    {
        id: 'setoran-modal',
        nama: 'Setoran Modal Pemilik',
        tipe: 'INVESTASI',
        deskripsiDefault: 'Setoran modal dari pemilik/pemegang saham',
        items: [
            { akunLabel: 'Kas/Bank', jenis: 'DEBIT' },
            { akunLabel: 'Modal Saham/Pemilik', jenis: 'KREDIT' }
        ]
    },
    {
        id: 'prive',
        nama: 'Pengambilan Prive',
        tipe: 'INVESTASI',
        deskripsiDefault: 'Pengambilan dana oleh pemilik',
        items: [
            { akunLabel: 'Prive/Dividen', jenis: 'DEBIT' },
            { akunLabel: 'Kas/Bank', jenis: 'KREDIT' }
        ]
    },
    {
        id: 'beban-iklan',
        nama: 'Beban Iklan & Marketing',
        tipe: 'BIAYA',
        deskripsiDefault: 'Biaya promosi dan iklan',
        items: [
            { akunLabel: 'Beban Pemasaran', jenis: 'DEBIT' },
            { akunLabel: 'Kas/Bank', jenis: 'KREDIT' }
        ]
    },
    {
        id: 'stok-opname-hilang',
        nama: 'Stok Opname (Barang Hilang)',
        tipe: 'JURNAL_UMUM',
        deskripsiDefault: 'Penyesuaian stok barang hilang/rusak',
        items: [
            { akunLabel: 'Beban Kerusakan/Kehilangan', jenis: 'DEBIT' },
            { akunLabel: 'Persediaan', jenis: 'KREDIT' }
        ]
    },
    {
        id: 'penyusutan-aset',
        nama: 'Penyusutan Aset Tetap',
        tipe: 'PENYUSUTAN',
        deskripsiDefault: 'Penyusutan bulanan aset tetap',
        items: [
            { akunLabel: 'Beban Penyusutan', jenis: 'DEBIT' },
            { akunLabel: 'Akumulasi Penyusutan', jenis: 'KREDIT' }
        ]
    },
    {
        id: 'beban-bank',
        nama: 'Beban Administrasi Bank',
        tipe: 'BIAYA',
        deskripsiDefault: 'Potongan administrasi bulanan bank',
        items: [
            { akunLabel: 'Beban Administrasi Bank', jenis: 'DEBIT' },
            { akunLabel: 'Kas/Bank', jenis: 'KREDIT' }
        ]
    },
    {
        id: 'pendapatan-bunga',
        nama: 'Pendapatan Bunga Bank',
        tipe: 'LAINNYA',
        deskripsiDefault: 'Penerimaan bunga bank bulanan',
        items: [
            { akunLabel: 'Kas/Bank', jenis: 'DEBIT' },
            { akunLabel: 'Pendapatan Bunga', jenis: 'KREDIT' }
        ]
    },
    {
        id: 'bayar-pajak-ppn',
        nama: 'Bayar Pajak PPN',
        tipe: 'BIAYA',
        deskripsiDefault: 'Setoran PPN ke kas negara',
        items: [
            { akunLabel: 'Hutang PPN', jenis: 'DEBIT' },
            { akunLabel: 'Kas/Bank', jenis: 'KREDIT' }
        ]
    },
    {
        id: 'pinjaman-bank',
        nama: 'Penerimaan Pinjaman Bank',
        tipe: 'LAINNYA',
        deskripsiDefault: 'Penerimaan dana pinjaman dari bank',
        items: [
            { akunLabel: 'Kas/Bank', jenis: 'DEBIT' },
            { akunLabel: 'Hutang Bank', jenis: 'KREDIT' }
        ]
    },
    {
        id: 'bayar-cicilan-bank',
        nama: 'Bayar Cicilan Bank',
        tipe: 'PEMBAYARAN_HUTANG',
        deskripsiDefault: 'Pembayaran cicilan pokok dan bunga bank',
        items: [
            { akunLabel: 'Hutang Bank', jenis: 'DEBIT' },
            { akunLabel: 'Beban Bunga', jenis: 'DEBIT' },
            { akunLabel: 'Kas/Bank', jenis: 'KREDIT' }
        ]
    },
    {
        id: 'beban-perjalanan',
        nama: 'Beban Perjalanan Dinas',
        tipe: 'BIAYA',
        deskripsiDefault: 'Biaya transportasi/hotel dinas',
        items: [
            { akunLabel: 'Beban Perjalanan', jenis: 'DEBIT' },
            { akunLabel: 'Kas/Bank', jenis: 'KREDIT' }
        ]
    },
    {
        id: 'pembelian-aset-tetap',
        nama: 'Pembelian Aset Tetap',
        tipe: 'PEMBELIAN',
        deskripsiDefault: 'Pembelian mesin/peralatan/kendaraan',
        items: [
            { akunLabel: 'Aset Tetap', jenis: 'DEBIT' },
            { akunLabel: 'Kas/Bank', jenis: 'KREDIT' }
        ]
    },
    {
        id: 'retur-penjualan',
        nama: 'Retur Penjualan',
        tipe: 'PENJUALAN',
        deskripsiDefault: 'Penerimaan kembali barang retur dari pelanggan',
        items: [
            { akunLabel: 'Retur Penjualan', jenis: 'DEBIT' },
            { akunLabel: 'Piutang Usaha/Kas', jenis: 'KREDIT' }
        ]
    },
    {
        id: 'retur-pembelian',
        nama: 'Retur Pembelian',
        tipe: 'PEMBELIAN',
        deskripsiDefault: 'Pengembalian barang retur ke pemasok',
        items: [
            { akunLabel: 'Hutang Usaha/Kas', jenis: 'DEBIT' },
            { akunLabel: 'Retur Pembelian/Persediaan', jenis: 'KREDIT' }
        ]
    },
    {
        id: 'beban-perlengkapan',
        nama: 'Beban Perlengkapan Kantor',
        tipe: 'BIAYA',
        deskripsiDefault: 'Pembelian ATK dan perlengkapan kecil',
        items: [
            { akunLabel: 'Beban Perlengkapan', jenis: 'DEBIT' },
            { akunLabel: 'Kas/Bank', jenis: 'KREDIT' }
        ]
    },
    {
        id: 'asuransi-dibayar-dimuka',
        nama: 'Asuransi Dibayar Dimuka',
        tipe: 'JURNAL_UMUM',
        deskripsiDefault: 'Pembayaran premi asuransi tahunan',
        items: [
            { akunLabel: 'Asuransi Dibayar Dimuka', jenis: 'DEBIT' },
            { akunLabel: 'Kas/Bank', jenis: 'KREDIT' }
        ]
    },
    {
        id: 'amortisasi-asuransi',
        nama: 'Amortisasi Asuransi',
        tipe: 'AMORTISASI',
        deskripsiDefault: 'Pembebanan asuransi bulanan',
        items: [
            { akunLabel: 'Beban Asuransi', jenis: 'DEBIT' },
            { akunLabel: 'Asuransi Dibayar Dimuka', jenis: 'KREDIT' }
        ]
    },
    {
        id: 'beban-pemeliharaan',
        nama: 'Beban Pemeliharaan & Perbaikan',
        tipe: 'BIAYA',
        deskripsiDefault: 'Biaya servis rutin aset/kantor',
        items: [
            { akunLabel: 'Beban Pemeliharaan', jenis: 'DEBIT' },
            { akunLabel: 'Kas/Bank', jenis: 'KREDIT' }
        ]
    },
    {
        id: 'pendapatan-diterima-dimuka',
        nama: 'Pendapatan Diterima Dimuka',
        tipe: 'PENJUALAN',
        deskripsiDefault: 'Penerimaan DP/kontrak dimuka',
        items: [
            { akunLabel: 'Kas/Bank', jenis: 'DEBIT' },
            { akunLabel: 'Pendapatan Diterima Dimuka', jenis: 'KREDIT' }
        ]
    },
    {
        id: 'pengakuan-pendapatan',
        nama: 'Pengakuan Pendapatan (dari DP)',
        tipe: 'JURNAL_UMUM',
        deskripsiDefault: 'Pengakuan pendapatan atas jasa yang selesai',
        items: [
            { akunLabel: 'Pendapatan Diterima Dimuka', jenis: 'DEBIT' },
            { akunLabel: 'Pendapatan Penjualan', jenis: 'KREDIT' }
        ]
    }
];
