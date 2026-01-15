# ❓ Tanya Jawab Akuntansi & Sistem (FAQ)

Selamat datang di pusat informasi Mgyt Accounting. Dokumen ini dirancang sebagai panduan mandiri untuk Akuntan dan Pengguna sistem.

---

## 🏢 Perusahaan & Organisasi

### 1. Bagaimana sistem menangani banyak perusahaan (Multi-Tenant)?
Sistem menggunakan isolasi data total. Setiap perusahaan memiliki Chart of Accounts (COA), daftar karyawan, dan laporan keuangan yang sepenuhnya terpisah. Data tidak akan pernah tercampur antar entitas.

### 2. Apakah saya bisa mengkonsolidasikan laporan antar cabang?
Ya. Setiap transaksi mencatat `cabangId`. Anda dapat memfilter laporan (Neraca/Laba Rugi) untuk satu cabang tertentu atau melihat akumulasi seluruh cabang dalam satu perusahaan untuk tujuan konsolidasi internal.

---

## 💰 Siklus Akuntansi & Jurnal

### 1. Kapan Jurnal Umum dibuat oleh sistem?
Sistem menganut prinsip **Real-time Journaling**. Jurnal otomatis dibuat saat:
- **Invoice Penjualan**: Saat status berubah menjadi "APPROVED".
- **Tagihan Pembelian**: Saat invoice supplier disimpan.
- **Payroll**: Saat periode gaji di-approve untuk posting.
- **Penyusutan Aset**: Setiap akhir bulan melalui engine otomatis.

### 2. Bagaimana cara melakukan rekonsiliasi bank?
Gunakan modul **Voucher / Kas**. Anda dapat mencocokkan setiap baris transaksi bank dengan voucher yang ada. Untuk selisih biaya administrasi atau bunga bank, Anda bisa membuat voucher manual agar saldo di sistem sama dengan rekening koran.

### 3. Apakah ada proses "Tutup Buku" bulanan?
Secara teknis tidak wajib karena saldo bersifat real-time. Namun, untuk disiplin akuntansi, kami menyarankan Anda menggunakan fitur **Lock Period** (jika diaktifkan oleh Admin) untuk mencegah perubahan data pada bulan yang sudah dilaporkan.

---

## 🧾 Perpajakan Indonesia

### 1. Bagaimana perhitungan PPh 21 Karyawan?
Sistem menggunakan metode **Tarif Efektif Rata-rata (TER)** sesuai regulasi terbaru. Komponen yang dihitung meliputi Gaji Pokok, Tunjangan, dikurangi Biaya Jabatan (5%, max 500rb/bln) dan Iuran BPJS Ketenagakerjaan (JKK, JKM, JHT).

### 2. Bagaimana cara menangani PPh 23 (Pajak Jasa)?
Saat mencatat tagihan jasa di modul **Purchase**, Anda dapat memilih kode pajak PPh 23 (2% untuk ber-NPWP). Sistem akan otomatis memotong nilai pembayaran ke supplier dan mencatatnya sebagai *Hutang PPh 23*.

### 3. Apakah sistem mendukung PPN 11%?
Ya. PPN Keluaran dihitung dari nilai dasar pengenaan pajak (DPP) pada invoice. Laporan PPN setiap masa dapat ditarik untuk membantu pelaporan SPT Masa PPN di aplikasi e-Faktur.

---

## 📦 Inventori & Aset

### 1. Mengapa nilai stok saya berbeda dengan perkiraan?
Mgyt Accounting menggunakan metode **Moving Average**. Nilai persediaan dihitung ulang setiap kali ada pembelian baru masuk. Jika ada retur atau penyesuaian stok, pastikan menggunakan modul **Stock Opname** agar nilai buku dan fisik sinkron.

### 2. Bagaimana perhitungan penyusutan aset tetap?
Sistem mendukung metode **Garis Lurus**.
- **Formula**: (Harga Perolehan - Nilai Residu) / Masa Manfaat.
- Hasil pembagian tahunan dibagi 12 untuk menjadi beban penyusutan bulanan yang dijurnal otomatis ke akun *Beban Penyusutan* (Debit) dan *Akumulasi Penyusutan* (Kredit).

---

## 🛡️ Keamanan & Integritas

### 1. Bagaimana jika terjadi kesalahan input yang sudah diposting?
Data yang sudah diposting ke Buku Besar sebaiknya tidak dihapus. Gunakan fitur **Voucher Pembalik (Reversal)** atau Jurnal Koreksi untuk memperbaiki nilai tersebut. Ini penting untuk menjaga integritas **Audit Trail**.

### 2. Siapa yang bisa menghapus data?
Hak hapus data sangat dibatasi. Hanya role **SUPERADMIN** atau user dengan izin khusus yang bisa melakukan penghapusan (Soft Delete). Setiap aksi penghapusan akan tercatat di log Jejak Audit.

---

> Anda memiliki pertanyaan spesifik seputar PSAK? Tim akutan kami siap membantu melalui saluran dukungan resmi.
