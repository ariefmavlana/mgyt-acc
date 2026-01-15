# 🦅 Indonesian Accounting System (Enterprise Edition)

> **Sistem Akuntansi Terintegrasi Berbasis Standar Akuntansi Keuangan (PSAK) Indonesia.**  
> Dibangun dengan performa tinggi menggunakan Next.js 16, Express v5, dan Prisma ORM.

![Status](https://img.shields.io/badge/Status-Production%20Ready-green)
![Tech](https://img.shields.io/badge/Stack-Next.js%20Running%20on%20Bun-black)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🌟 Tentang Proyek

**Mgyt Accounting** adalah solusi ERP (Enterprise Resource Planning) modern yang dirancang khusus untuk kebutuhan bisnis di Indonesia. Sistem ini menggabungkan fleksibilitas arsitektur frontend modern dengan kekokohan backend enterprise dalam satu *Unified Server architecture*.

### Keunggulan Utama
- **Unified Architecture**: Frontend (Next.js) dan Backend (Express) berjalan pada satu port (3000), menyederhanakan deployment.
- **PSAK Compliant**: Struktur Chart of Accounts (COA), Laporan Keuangan, dan Perpajakan sesuai regulasi Indonesia.
- **Multi-Tenant & Multi-Branch**: Mendukung pengelolaan banyak perusahaan dan cabang dalam satu instalasi.
- **Real-time Engine**: Saldo buku besar dan inventory terupdate seketika saat transaksi terjadi (Event-driven).
- **Mavlana Gold UI**: Desain premium dengan aesthetics tingkat tinggi (Shadcn/UI, Tailwind).

---

## 🚀 Modul & Fitur

Sistem ini mencakup modul-modul terintegrasi untuk operasional bisnis menyeluruh:

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
- **Invoicing**: Pembuatan Faktur Penjualan otomatis dengan kalkulasi pajak.
- **Payment Matching**: Pencatatan pembayaran parsial dan pelunasan piutang (Aging AR).
- **Customer Portal**: Database pelanggan dan riwayat piutang.

### 4. 🚚 Purchasing & Payables (AP)
- **Purchase Orders**: Manajemen pesanan pembelian ke supplier.
- **Bill Payment**: Penjadwalan dan pelunasan hutang usaha (Aging AP).
- **Supplier Mgmt**: Database pemasok dan riwayat transaksi.

### 5. 📦 Inventory Management
- **Multi-Warehouse**: Stok opname per gudang dan pelacakan antar gudang.
- **Stock Movement**: In/Out/Transfer dan penyesuaian stok.
- **Valuation**: Mendukung metode FIFO/Average (Default: Average).

### 6. 🧾 Tax Compliance
- **e-Faktur Ready**: Perhitungan PPN Keluaran/Masukan (11%).
- **PPh 21/23/4(2)**: Pemotongan pajak penghasilan otomatis pada payroll dan jasa.
- **Tax Reporting**: Persiapan data untuk pelaporan SPT Masa.

### 7. 👷 HR & Payroll
- **Employee Management**: Database karyawan lengkap dengan NIK, Jabatan, dan status PTKP.
- **Payroll Processing**: Kalkulasi gaji otomatis dengan BPJS dan PPh 21.
- **Payslip PDF**: Download slip gaji digital premium.

### 8. 🏗️ Project & Costing
- **Project Analytics**: Monitor profitabilitas, budget, dan margin per proyek.
- **Cost Centers**: Alokasi biaya ke pusat biaya tertentu untuk analisis departemen.

### 9. 📈 Budgeting
- **Budget Setup**: Perencanaan anggaran per akun dan per departemen.
- **Variance Analysis**: Visualisasi Budget vs Actual secara real-time.

### 10. 🛡️ Asset & Audit
- **Fixed Assets**: Manajemen aset tetap dengan penyusutan otomatis (Garis Lurus/Saldo Menurun).
- **Audit Trail**: Log aktivitas user mendetail (History Logs).
- **Security**: Proteksi CSRF, Rate Limiting, dan Enkripsi data.

---

## 🛠️ Teknologi Stack

| Layer | Teknologi | Deskripsi |
| :--- | :--- | :--- |
| **Runtime** | **Bun** | Ultra-fast JavaScript runtime & package manager. |
| **Frontend** | **Next.js 16** | App Router, Server Actions, React 19. |
| **Styling** | **Tailwind CSS** | Styling modern dengan Shadcn/UI (Radix). |
| **Backend** | **Express v5** | RESTful API server modern. |
| **Database** | **PostgreSQL** | Relational database (via Prisma ORM 7). |
| **Security** | **Helmet & CSRF** | Proteksi standar industri. |

---

## 📂 Struktur Proyek

```
/
├── app/                  # Next.js App Router (Frontend Pages)
├── components/           # UI Components (Mavlana Gold Aesthetics)
├── server/               # Express Backend Logic
│   ├── controllers/      # Business logic per module
│   ├── routes/           # API endpoints
│   └── middleware/       # Auth, Tenant, Audit guards
├── prisma/               # Schema & Migrations (Modular)
└── lib/                  # Canonical clients (Prisma, Cloudinary, etc.)
```

---

## 📄 Dokumen Tambahan
- 🗺️ [Database Relations Explained](./DATABASE_RELATIONS_EXPLAINED.md)
- ❓ [Frequently Asked Questions](./FAQ.md)
- 📖 [User Manual (Panduan Pengguna)](./USER_MANUAL.md)

---

Hak Cipta © 2026 **Arief Maulana** & **Medina Giacarta**
