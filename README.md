# 🦅 Indonesian Accounting System (Enterprise Edition)

> **Sistem Akuntansi Terintegrasi Berbasis Standar Akuntansi Keuangan (PSAK) Indonesia.**  
> Dibangun dengan performa tinggi menggunakan Next.js 16, Express v5, dan Prisma ORM.

![Status](https://img.shields.io/badge/Status-Production%20Ready-green)
![Tech](https://img.shields.io/badge/Stack-Next.js%20Running%20on%20Bun-black)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🌟 Tentang Proyek

**Mgyt Accounting** adalah solusi ERP (Enterprise Resource Planning) modern yang dirancang khusus untuk kebutuhan bisnis di Indonesia. Sistem ini menggabungkan fleksibilitas arsitektur frontend modern dengan kekokohan backend enterprise dalam satu _Unified Server architecture_.

### Keunggulan Utama

- **Unified Architecture**: Frontend (Next.js) dan Backend (Express) berjalan pada satu port (3000), menyederhanakan deployment.
- **PSAK Compliant**: Struktur Chart of Accounts (COA), Laporan Keuangan, dan Perpajakan sesuai regulasi Indonesia.
- **Multi-Tenant & Multi-Branch**: Mendukung pengelolaan banyak perusahaan dan cabang dalam satu instalasi.
- **Real-time Engine**: Saldo buku besar dan inventory terupdate seketika saat transaksi terjadi (Event-driven).

---

## 🚀 Modul & Fitur

Sistem ini mencakup 10 modul terintegrasi untuk operasional bisnis menyeluruh:

### 1. 🏢 Core & Organization

- **Multi-Company Dashboard**: Kelola profil perusahaan, cabang, departemen, dan pengguna.
- **Role-Based Access Control (RBAC)**: Manajemen hak akses granular untuk Admin, Manajer, Akuntan, dan Staff.
- **Subscription Management**: Dukungan multi-tier paket bisnis (UMKM, Starter, Growth, Enterprise).

### 2. 💰 Financial Accounting (GL)

- **Interactive Dashboard**: Visualisasi data real-time dengan grafik kinerja keuangan dan distribusi operasional.
- **Chart of Accounts (COA)**: Standar akun Indonesia (Aset, Liabilitas, Ekuitas, Pendapatan, Beban).
- **Double-Entry Bookkeeping**: Otomatisasi Jurnal Umum dan Voucher dari setiap transaksi.
- **Financial Reports**: Neraca, Laba Rugi, Arus Kas, dan Neraca Saldo (Real-time).

### 3. 🛍️ Sales & Receivables (AR)

- **Invoicing**: Pembuatan Faktur Penjualan otomatis.
- **Payment Matching**: Pencatatan pembayaran parsial dan pelunasan piutang.
- **Aging Analysis**: Analisis umur piutang pelanggan.

### 4. 🚚 Purchasing & Payables (AP)

- **Purchase Orders**: Manajemen pesanan pembelian ke supplier.
- **Bill Payment**: Penjadwalan dan pelunasan hutang usaha.
- **Supplier Mgmt**: Database pemasok dan riwayat transaksi.

### 5. 📦 Inventory Management

- **Multi-Warehouse**: Stok opname per gudang.
- **Stock Movement**: In/Out/Transfer dan penyesuaian stok.
- **Valuation**: Mendukung metode FIFO/Average (Default: Average).

### 6. 🧾 Tax Compliance

- **e-Faktur Ready**: Perhitungan PPN Keluaran/Masukan (11%).
- **PPh 21/23**: Pemotongan pajak penghasilan otomatis pada transaksi terkait.
- **Tax Reporting**: Persiapan data untuk pelaporan SPT Masa.

### 7. 👷 HR & Payroll

- **Employee Database**: Data karyawan, jabatan, dan status pernikahan (PTKP).
- **Payroll Process**: Perhitungan gaji, lembur, bonus, dan potongan (BPJS/Pajak).
- **Payslip Generation**: Slip gaji otomatis.

### 8. 🏗️ Project & Costing

- **Project Tracking**: Monitor profitabilitas per proyek.
- **Budgeting**: Budget vs Actual tracking untuk kontrol biaya operasional.

### 9. 📄 Document Management

- **Digital Archive**: Upload dan lampirkan bukti transaksi (PDF/Image).
- **Association**: Link dokumen ke Transaksi, Aset, atau Voucher.

### 10. 🛡️ System & Audit

- **Audit Trail**: Log aktivitas user mendetail (Who, When, What Changed).
- **Security**: Proteksi CSRF, Rate Limiting, dan Enkripsi data sensitif.

---

## 🛠️ Teknologi Stack

Didesain untuk performa, keamanan, dan skalabilitas.

| Layer        | Teknologi         | Deskripsi                                        |
| :----------- | :---------------- | :----------------------------------------------- |
| **Runtime**  | **Bun**           | Ultra-fast JavaScript runtime & package manager. |
| **Frontend** | **Next.js 16**    | App Router, Server Actions, React 19.            |
| **Styling**  | **Tailwind CSS**  | Styling modern dengan Shadcn/UI (Radix).         |
| **Backend**  | **Express v5**    | RESTful API server yang powerful.                |
| **Database** | **PostgreSQL**    | Relational database (via Prisma ORM 7).          |
| **Security** | **Helmet & CSRF** | Proteksi standar industri.                       |

---

## 💻 Panduan Instalasi (Lokal)

### Prasyarat

- [Bun](https://bun.sh) (v1.1+)
- PostgreSQL Database

### Langkah-langkah

1. **Clone Repositori**

   ```bash
   git clone https://github.com/mavlana/accounting-system.git
   cd accounting-system
   ```

2. **Instal Dependensi**

   ```bash
   bun install
   ```

3. **Konfigurasi Environment**
   Salin `.env.example` ke `.env` dan sesuaikan koneksi database Anda:

   ```bash
   cp .env.example .env
   ```

   _Edit `.env` isi `DATABASE_URL` dengan koneksi PostgreSQL Anda._

4. **Siapkan Database**

   ```bash
   bun x prisma db push
   # Opsional: Seed data awal (Roles, COA standard)
   bun x prisma db seed
   ```

5. **Jalankan Aplikasi**
   ```bash
   bun dev
   ```
   Akses aplikasi di [http://localhost:3000](http://localhost:3000).

---

## 📂 Struktur Proyek

```
/
├── app/                  # Next.js App Router (Frontend Pages)
│   ├── dashboard/        # Halaman utama aplikasi (Protected)
│   └── (auth)/           # Halaman Login/Register
├── server/               # Express Backend Logic
│   ├── controllers/      # Logika bisnis
│   ├── routes/           # Definisi endpoint API
│   ├── middleware/       # Auth, Tenant, Audit middleware
│   └── index.ts          # Entry point server
├── prisma/               # Database Schema & Migrations
│   └── schemas/          # Modular schema definitions
├── components/           # Reusable UI Components
└── lib/                  # Shared Utilities (API client, helpers)
```

---

## 📄 Lisensi

Hak Cipta © 2026 **Arief Maulana** & **Medina Giacarta**
Dikembangkan untuk penggunaan internal dan komersial terbatas.

---

> **Catatan Pengembang**: Dokumentasi relasi database detail tersedia di file [`DATABASE_RELATIONS_EXPLAINED.md`](./DATABASE_RELATIONS_EXPLAINED.md).
