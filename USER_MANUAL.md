# 📖 Buku Panduan Pengguna & Akuntan
## Indonesian Accounting System - Enterprise Edition

Selamat datang di panduan komprehensif Mgyt Accounting. Dokumen ini dirancang sebagai referensi utama bagi staf administrasi, keuangan, dan akuntan profesional untuk mengelola operasional bisnis secara akurat dan sesuai standar PSAK.

---

## 🏢 1. Organisasi & Keamanan

### 1.1 Multi-Tenant & Multi-Branch
Sistem mendukung pengelolaan banyak perusahaan dalam satu portal. Data antar perusahaan dipisahkan secara absolut.
- **Beralih Perusahaan**: Gunakan pemilih di Sidebar atau menu profil.
- **Cabang**: Transaksi dapat dicatat per cabang untuk keperluan laporan segmentasi.

### 1.2 Jejak Audit (Audit Trail)
Setiap tindakan (Tambah, Edit, Hapus) dicatat secara permanen. Akuntan dapat memantau riwayat perubahan data untuk mendeteksi anomali atau kesalahan input melalui menu **Sistem > Log Aktivitas**.

---

## 💰 2. Akuntansi Dasar (General Ledger)

### 2.1 Chart of Accounts (COA)
Struktur akun mengikuti standar akuntansi Indonesia:
- **1xxx (Aset)**: Kas, Bank, Piutang, Persediaan, Aset Tetap.
- **2xxx (Liabilitas)**: Hutang Usaha, Hutang Pajak, Hutang Gaji.
- **3xxx (Ekuitas)**: Modal Disetor, Saldo Laba.
- **4xxx (Pendapatan)**: Penjualan Barang/Jasa.
- **5xxx (Beban)**: Beban Gaji, Listrik, Sewa, Penyusutan.

*Tips: Gunakan fitur "Parent-Child" untuk mengelompokkan akun (Misal: Bank BCA dan Bank Mandiri di bawah Group Bank).*

### 2.2 Voucher & Jurnal Otomatis
Sistem meminimalisir input journal manual. Jurnal otomatis terbentuk saat:
1. **InvoiceAPPROVED**: Debet Piutang, Kredit Penjualan & Hutang PPN.
2. **Bill Saved**: Debet Biaya/Persediaan, Kredit Hutang Usaha.
3. **Payment Received**: Debet Kas/Bank, Kredit Piutang.

---

## 🛍️ 3. Penjualan & Piutang (Sales & AR)

### 3.1 Pembuatan Invoice
1. Pilih **Pelanggan** (Pastikan data NPWP lengkap jika ingin menerbitkan e-Faktur).
2. Tambahkan **Item** penjualan. Sistem akan mengambil harga jual standar.
3. Tentukan **Pajak** (PPN 11%).
4. **Approve**: Setelah di-approve, transaksi tidak bisa diubah tanpa pembatalan (Void) untuk menjaga urutan voucher.

### 3.2 Monitoring Piutang (AR Aging)
Gunakan modul **Monitor Piutang** untuk melihat umur piutang (0-30, 31-60, 61-90 hari). Ini membantu tim penagihan memprioritaskan pelanggan yang menunggak lama.

---

## 👷 4. Sumber Daya Manusia & Gaji (HR & Payroll)

### 4.1 Data Karyawan & Kontrak
Sistem membutuhkan data valid untuk kalkulasi pajak:
- **Gaji Pokok & Tunjangan**: Dasar penghasilan bruto.
- **Status PTKP**: Sangat krusial (TK/0, K/0, K/1, dst) untuk menentukan batas pajak nihil.
- **Jabatan**: Menentukan departemen biaya gaji tersebut diposting.

### 4.2 Proses Penggajian (Payroll)
Prosedur bulanan:
1. **Generate**: Sistem menarik data kontrak dan kehadiran (jika ada).
2. **Kalkulasi**: PPh 21 dihitung otomatis menggunakan metode TER (Tarif Efektif Rata-rata).
3. **Posting**: Setelah disetujui, sistem akan membuat jurnal beban gaji dan hutang gaji.
4. **Slip Gaji**: Anda dapat mengunduh slip PDF premium untuk dibagikan ke karyawan.

---

## 🏗️ 5. Proyek & Anggaran (Project & Budget)

### 5.1 Profitabilitas Proyek
Setiap transaksi biaya (misal: beli material atau gaji tukang) harus dihubungkan ke **ID Proyek**.
- Dashboard Proyek akan menampilkan: **Revenue - Direct Cost = Gross Margin**.
- Membantu manajemen membuat keputusan proyek mana yang menguntungkan.

### 5.2 Kontrol Anggaran (Budgeting)
Akuntan dapat menetapkan budget per departemen atau per akun.
- **Budget vs Actual**: Memantau realisasi pengeluaran terhadap rencana.
- Sistem memberikan peringatan jika pengeluaran melebihi anggaran yang ditetapkan.

---

## 📦 6. Persediaan & Aset Tetap

### 6.1 Metode Moving Average
Persediaan dinilai berdasarkan rata-rata tertahan. Setiap pembelian baru akan memperbarui nilai per unit barang di gudang.
- **Transfer Stok**: Gunakan modul transfer untuk memindahkan barang antar gudang tanpa mempengaruhi nilai buku.

### 6.2 Penyusutan Otomatis
Daftarkan aset (Laptop, Kendaraan, Mesin) di modul **Aset Tetap**.
- Pilih **Masa Manfaat** (tahun).
- Sistem akan menjurnal beban penyusutan setiap bulan secara otomatis. Anda tidak perlu lagi menghitung manual di Excel di akhir tahun.

---

## 📊 7. Laporan Keuangan

Laporan dapat diakses kapan saja dan dapat diekspor ke **Excel/PDF**:
1. **Neraca**: Posisi Kas, Hutang, dan Modal.
2. **Laba Rugi**: Performa operasional bulan berjalan vs bulan lalu.
3. **Arus Kas**: Pergerakan uang masuk dan keluar.
4. **Buku Besar**: Rincian setiap mutasi pada satu akun COA.

---

> **Bantuan Langsung**: Jika Anda menemukan ketidaksinkronan data, gunakan fitur **Bantuan** di pojok bawah untuk menghubungi tim dukungan akuntansi kami.
