# 📊 Catatan Hasil Test Manual & Feedback Akuntan

Dokumen ini berisi kumpulan catatan dan umpan balik (feedback) dari akuntan berpengalaman setelah melakukan pengujian manual pada sistem. Catatan ini berfungsi sebagai **patron (panduan)** untuk pengembangan dan perbaikan sistem ke depannya.

---

## 📝 Ringkasan Feedback Utama

### 1. 🧭 Navigasi & Sidebar (User Experience)
*   **Prioritas Menu:** Penempatan halaman di Sidebar harus menonjolkan bagian **Core Penting** dari Akuntansi (seperti Jurnal, Buku Besar, Neraca) di bagian atas. Hindari menempatkan fitur inti di posisi bawah yang sulit dijangkau.
*   **Grouping:** Pastikan pengelompokan menu logis sesuai dengan alur kerja akuntan di Indonesia.

### 2. 🗂️ Bagan Akun (Chart of Accounts - COA)
*   **Otomatisasi Nomor Akun:** Tambahkan fitur pengisian nomor akun secara otomatis berdasarkan kategori atau parent account.
*   **Fleksibilitas Penulisan:** Sistem harus mampu menyesuaikan dengan cara penulisan user (misal: penggunaan separator, format angka, atau penulisan nama akun).

### 3. 🎫 Voucher & Role Security
*   **Bug "Batalkan":** Terdapat error pada fitur pembatalan voucher. Tombol/fitur "Batalkan" saat ini tidak berfungsi meskipun role pengguna memiliki izin yang sesuai. Ini merupakan prioritas tinggi untuk diperbaiki.

### 4. ⚡ Real-Time Balance (COA Updates)
*   **Sinkronisasi Saldo:** Saldo pada Chart of Accounts (COA) harus terupdate secara **real-time** saat terjadi input atau perubahan data transaksi. Tidak boleh ada delay yang menyebabkan ketidaksesuaian data sementara.

### 5. 📅 Manajemen Periode Akuntansi
*   **Penyesuaian Tahun:** Saat memilih "Tahun Periode", sistem harus otomatis menyesuaikan seluruh tampilan dan validasi logis ke periode tersebut (terutama untuk pengerjaan periode lampau atau *back-date*).
*   **Registrasi Awal:** Disarankan agar pengaturan Periode disimpan langsung saat tahap **Registrasi Perusahaan** sebagai data awal (initial setup), sehingga user tidak perlu melakukan setting berulang kali.

### 6. 🔐 Manajemen Akun & Otoritas
*   **Penghapusan Akun:** Fitur untuk menghapus akun (COA) harus tersedia namun wajib dibatasi dengan **Role-Based Access Control (RBAC)** yang ketat. Akun yang sudah memiliki saldo atau transaksi tidak boleh dihapus begitu saja (perlu validasi).

### 7. 🧾 Otomatisasi Pajak (PPN & PPh)
*   **Voucher Automation:** Disaat memasukkan baris transaksi di Voucher, perhitungan PPN (Pajak Pertambahan Nilai) dan PPh (Pajak Penghasilan) harus dilakukan secara **otomatis** dan tidak manual lagi.

### 8. 🇮🇩 Lokalisasi Bahasa Akuntansi
*   **Terminologi Lokal:** Gunakan istilah yang familiar bagi akuntan di Indonesia (contoh: *Buku Besar* bukan *General Ledger*, *Neraca Saldo* bukan *Trial Balance*, jika memungkinkan atau gunakan keduanya). Hindari istilah yang terlalu teknis/developer-centric yang bisa membingungkan user akuntan.

---

## 🔍 Detail Teknis & Petunjuk Implementasi

Bagian ini ditujukan bagi Developer untuk membantu mempercepat perbaikan berdasarkan feedback di atas.

### 1. Navigasi Core Accounting
*   **File:** `app/dashboard/layout.tsx` (atau komponen Sidebar terkait).
*   **Aksi:** Geser menu **Accounting (Voucher, Jurnal, COA)** dan **Laporan Keuangan** ke urutan teratas setelah Dashboard. Pindahkan menu *HR*, *Inventory*, atau *Settings* ke bawah.

### 2. COA Auto-Numbering
*   **File:** `server/controllers/coa.controller.ts` dan `components/coa/account-form.tsx`.
*   **Aksi:** Buat logic di backend untuk men-suggest nomor akun berikutnya berdasarkan `parentCode` + `1`. Tambahkan input masking atau validator yang fleksibel terhadap input user.

### 3. Perbaikan Bug Voucher Cancel
*   **Analisis:** Fungsi `voidTransaction` di `server/controllers/transaction.controller.ts` sudah ada, namun perlu dipastikan:
    1. Role user (Accountant/Admin) sudah dilewatkan di middleware.
    2. Endpoint `/api/transactions/:id/void` terdaftar dengan method `DELETE`.
    3. Error handling di frontend `app/dashboard/transactions/[id]/page.tsx` menangkap pesan error spesifik dari backend.

### 4. Real-time COA Balance
*   **Aksi:** Gunakan **Mutation Invalidation** (SWR `mutate` atau React Query `invalidateQueries`) pada komponen COA Tree/Table setiap kali `createTransaction` atau `voidTransaction` sukses dilakukan.

### 5. Periode Akuntansi & Registrasi
*   **Aksi:**
    *   Tambahkan field `tahunBuku` dan `bulanMulai` pada form registrasi perusahaan.
    *   Gunakan `useSession` atau context global untuk menyimpan `activePeriod` sehingga setiap fetch data otomatis mengirimkan filter periode tersebut.

### 6. RBAC untuk Hapus Akun
*   **Aksi:** Tambahkan check `isSystemAccount` atau `hasTransactions` sebelum mengizinkan penghapusan di `coa.controller.ts`. Pastikan hanya role dengan permission `account:delete` yang bisa mengakses tombol tersebut.

### 7. Otomatisasi Pajak di Voucher
*   **File:** `server/lib/accounting-engine.ts` dan `VoucherForm.tsx`.
*   **Aksi:** Saat user memilih akun yang bertipe "Taxable", otomatis tambahkan baris Jurnal baru untuk PPN/PPh dengan nilai yang sudah ter-kalkulasi (11% default).

---

## 🛠️ Analisis Celah Skema (Schema Gaps) - Update

Berdasarkan tinjauan pada `prisma/schemas/`, beberapa tabel sebenarnya **sudah ada** namun perlu dipastikan integrasi fungsinya:

| Komponen | Status Skema | Catatan |
| :--- | :--- | :--- |
| **Cabang** | ✅ Ada (`core.prisma`) | Perlu dipastikan filter tenant per cabang aktif. |
| **Pelanggan** | ✅ Ada (`partners.prisma`) | - |
| **Laporan Pajak** | ✅ Ada (`tax.prisma`) | Perlu implementasi UI Reporting. |
| **Aset Tidak Berwujud**| ✅ Ada (`accounting.prisma`) | Perlu modul Amortisasi. |
| **Role & Permission**| ✅ Ada (`core.prisma`) | Gunakan `Role` model untuk RBAC yang lebih granular. |
| **Refresh Token** | ✅ Ada (`core.prisma`) | Digunakan untuk security persistence. |
| **Budget Revisi** | ✅ Ada (`budget.prisma`) | - |

---
