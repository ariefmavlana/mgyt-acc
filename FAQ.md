# ❓ Tanya Jawab Akuntansi & Sistem (FAQ)

Selamat datang di pusat informasi Mgyt Accounting. Dokumen ini dirancang sebagai panduan mandiri untuk Akuntan Profesional dan Pengguna sistem.

---

## 🏢 Konsolidasi & Struktur Organisasi

### 1. Bagaimana sistem menangani entitas Kantor Pusat dan Cabang?
Mgyt Accounting menggunakan basis data tunggal dengan isolasi logis (`cabangId`).
- **Kantor Pusat**: Memiliki hak akses penuh untuk melihat seluruh transaksi cabang.
- **Cabang**: Hanya dapat melihat dan menginput data internal mereka sendiri.
- **Konsolidasi**: Sistem melakukan penggabungan saldo (Aggregation) secara otomatis di laporan Neraca dan Laba Rugi dengan satu klik filter "Seluruh Cabang".

### 2. Apakah sistem mendukung Multi-Currency?
Ya. Anda dapat menentukan **Mata Uang Utama** (biasanya IDR) di Settings. Transaksi dalam mata uang asing akan dikonversi menggunakan kurs transaksi saat posting, dan sistem akan menghitung selisih kurs (Laba/Rugi Kurs) secara otomatis saat pelunasan invoice.

---

## 💰 Jurnal & Siklus Akuntansi

### 1. Bagaimana alur integrasi dari Invoice ke Buku Besar (GL)?
Sistem menggunakan **Real-time Journaling**. Saat Invoice atau Tagihan di-approve:
1. **Pencatatan Sub-Ledger**: Masuk ke buku pembantu Piutang (AR) atau Hutang (AP).
2. **Double-Entry Journal**: Sistem otomatis mendebit Piutang dan mengkredit Pendapatan (serta PPN Keluaran jika ada).
3. **Voucher Tracking**: Setiap jurnal memiliki nomor Voucher unik yang dapat dilacak balik ke dokumen sumber.

### 2. Bagaimana cara melakukan Rekonsiliasi Bank yang efektif?
Gunakan modul **Voucher / Kas**.
- Pastikan saldo Buku Kas di sistem sama dengan saldo fisik/bank.
- Jika ada biaya bank yang terpotong otomatis di rekening koran, buatlah **Voucher Keluar** manual untuk mencatat Beban Administrasi Bank agar saldo buku sinkron.

---

## 🧾 Perpajakan & Compliance

### 1. Bagaimana logika pemotongan PPh 21 TER?
Sistem mengikuti regulasi **Tarif Efektif Rata-rata (TER)** terbaru.
- Pajak dihitung berdasarkan kategori PTKP (TK/0, K/0, dst).
- Sistem otomatis menghitung Biaya Jabatan (5%) dan pengurang iuran BPJS yang menjadi beban karyawan (JHT 2%, JP 1%).

### 2. Bagaimana pemetaan Akun Pajak (Tax Mapping)?
Setiap kode pajak (PPN, PPh 23) dipetakan ke akun spesifik di COA.
- **PPN**: Masuk ke akun *Hutang PPN Keluaran* (Penjualan) atau *PPN Masukan* (Pembelian).
- **PPh 23**: Otomatis dipotong dari nilai pembayaran supplier dan masuk ke akun *Hutang PPh 23*.

---

## 📦 Inventori & Aset Tetap

### 1. Mengapa Nilai Persediaan menggunakan Moving Average?
Metode ini dianggap paling akurat untuk bisnis dengan fluktuasi harga beli yang tinggi. Sistem menghitung ulang rata-rata tertimbang setiap kali ada transaksi **Purchase Order** yang masuk (Received). Ini memastikan HPP (Harga Pokok Penjualan) selalu up-to-date.

### 2. Alur Otomatisasi Penyusutan Aset
Saat aset didaftarkan:
1. Pilih **Masa Manfaat** (misal: 4 tahun/48 bulan).
2. Sistem akan menjadwalkan jurnal penyusutan setiap tanggal akhir bulan.
3. Jurnal: `(D) Beban Penyusutan` vs `(K) Akumulasi Penyusutan`.

---

## 🛡️ Integritas & Keamanan

### 1. Apa itu "Lock Period" dan kapan harus digunakan?
Lock Period mencegah perubahan data pada tanggal tertentu ke belakang. Ini wajib digunakan setelah laporan bulanan dilaporkan ke manajemen/pajak untuk mencegah perubahan angka historis secara tidak sengaja.

### 2. Bagaimana Audit Trail membantu akuntan?
Setiap aksi (Create, Update, Delete) pada transaksi sensitif mencatat:
- Siapa yang melakukan.
- Waktu (Timestamp) yang tepat.
- Perubahan nominal (sebelum vs sesudah).
Ini sangat membantu saat pelacakan selisih saldo atau pemeriksaan internal.

---

> Membutuhkan bantuan lebih lanjut mengenai PSAK? Tim akuntan senior kami siap membantu melalui fitur **Support** di dashboard.
