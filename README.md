# Mgyt Akuntansi - Sistem Akuntansi Terintegrasi

Mgyt Akuntansi adalah sistem akuntansi modern yang dibangun dengan Next.js dan Express, dirancang untuk memberikan kemudahan dalam pengelolaan keuangan, transaksi, dan data perusahaan secara real-time.

## Fitur Utama

- **Unified Architecture**: Frontend (Next.js) dan Backend (Express) berjalan serentak pada port yang sama (3000).
- **Multi-Company Support**: Kelola banyak perusahaan dalam satu platform.
- **Transaction Entry System**: Sistem entri transaksi yang valid dan otomatis menghasilkan Jurnal serta Voucher.
- **Real-time Balance**: Update saldo Chart of Accounts (COA) secara instan setelah transaksi.
- **Type Safety**: Dibangun dengan TypeScript untuk keamanan kode maksimal.
- **Modern UI**: Antarmuka responsif menggunakan Tailwind CSS dan komponen Radix UI.

## Teknologi Stack

- **Frontend**: Next.js 16 (App Router), Tailwind CSS, TanStack Query/Table.
- **Backend**: Express v5, Prisma ORM.
- **Database**: PostgreSQL.
- **Validation**: Zod (Schema sharing antara frontend & backend).

## Pengaturan Lokal

1. **Clone repositori**
2. **Instal dependensi**:
   ```bash
   bun install
   ```
3. **Konfigurasi Environment**:
   Salin `.env.example` menjadi `.env` dan sesuaikan `DATABASE_URL`.
4. **Sinkronisasi Database**:
   ```bash
   bun x prisma db push
   ```
5. **Jalankan Server Pengembangan**:
   ```bash
   bun dev
   ```

Aplikasi dapat diakses di [http://localhost:3000](http://localhost:3000). API tersedia di `/api`.

## Struktur Proyek

- `/app`: Root aplikasi Next.js (Pages & Layouts).
- `/server`: Logika backend Express (Routes, Controllers, Middleware).
- `/components`: Komponen UI reusable.
- `/lib`: Utilitas bersama dan instansi API.
- `/prisma`: Skema database dan migrasi.

---
FATH
