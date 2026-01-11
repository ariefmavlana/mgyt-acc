# 🗺️ PETA LENGKAP RELASI DATABASE - INDONESIAN ACCOUNTING SYSTEM

## 📚 Panduan Membaca Diagram Ini

**Simbol:**
- `1` = One (satu)
- `*` = Many (banyak)
- `?` = Optional (boleh kosong)
- `!` = Required (wajib diisi)

**Contoh Relasi:**
- `Perusahaan 1 ──── * Cabang` = 1 Perusahaan punya BANYAK Cabang
- `Transaksi * ──── ? Voucher` = Banyak Transaksi bisa punya 1 Voucher (optional)

---

## 🏢 MODUL 1: CORE (Foundation System)

### Diagram Core

```
┌─────────────────┐
│   Perusahaan    │ ◄──── Master company (PT, CV, UD)
│   (Company)     │
└────────┬────────┘
         │
         │ 1 company has
         │ many ↓
         ├──────────────────────────┬──────────────────┬──────────────┬───────────┐
         │                          │                  │              │           │
         ▼                          ▼                  ▼              ▼           ▼
    ┌────────┐              ┌──────────┐        ┌─────────┐    ┌──────────┐  ┌─────────┐
    │ Cabang │              │ Pengguna │        │ Transaksi│   │  Piutang │  │  Produk │
    │(Branch)│              │  (User)  │        │   (Tx)   │   │   (AR)   │  │(Product)│
    └────────┘              └──────────┘        └─────────┘    └──────────┘  └─────────┘
```

**Penjelasan Real:**

1. **PT Maju Jaya** (1 Perusahaan)
   - Punya **3 Cabang**: Jakarta, Bandung, Surabaya
   - Punya **10 Pengguna**: Admin, Accountant, Cashier, dll
   - Punya **1000+ Transaksi** per bulan
   - Punya **50 Piutang** (customer belum bayar)
   - Punya **200 Produk** dijual

**Kode:**
```typescript
// 1 Perusahaan
const perusahaan = await prisma.perusahaan.create({
  data: {
    nama: "PT Maju Jaya",
    // Buat sekaligus dengan cabang-cabangnya
    cabang: {
      create: [
        { nama: "Jakarta", alamat: "..." },
        { nama: "Bandung", alamat: "..." },
        { nama: "Surabaya", alamat: "..." }
      ]
    },
    // Dan user-usernya
    pengguna: {
      create: [
        { nama: "Admin", email: "admin@majujaya.com", role: "ADMIN" },
        { nama: "Accountant", email: "acc@majujaya.com", role: "ACCOUNTANT" }
      ]
    }
  }
});
```

---

## 💰 MODUL 2: ACCOUNTING (Double-Entry Engine)

### Diagram Accounting Flow

```
FLOW TRANSAKSI → VOUCHER → JURNAL → GENERAL LEDGER

┌────────────┐
│ Transaksi  │ ◄──── Penjualan Rp 1 juta
│ (Invoice)  │
└─────┬──────┘
      │
      │ creates automatically
      ▼
┌────────────┐
│  Voucher   │ ◄──── Bukti pembukuan
│ (Journal   │
│  Entry)    │
└─────┬──────┘
      │
      │ posts to
      ▼
┌────────────┐
│ JurnalUmum │ ◄──── General Ledger
│ (GL Entry) │
└─────┬──────┘
      │
      │ updates
      ▼
┌─────────────────┐
│ChartOfAccounts │ ◄──── Saldo akun bertambah/berkurang
│ (COA / Buku    │
│  Besar)        │
└────────────────┘
```

### Detailed Accounting Relations

```
ChartOfAccounts (Buku Besar)
├── ASET (1-xxxx)
│   ├── Kas (1-1000)
│   ├── Bank (1-1100)
│   └── Piutang Usaha (1-2000)
│
├── LIABILITAS (2-xxxx)
│   ├── Hutang Usaha (2-1000)
│   └── Hutang Bank (2-2000)
│
├── EKUITAS (3-xxxx)
│   └── Modal (3-1000)
│
├── PENDAPATAN (4-xxxx)
│   └── Penjualan (4-1000)
│
└── BEBAN (5-xxxx)
    ├── Beban Gaji (5-1000)
    └── Beban Listrik (5-2000)

Setiap akun di atas:
│
├─── bisa punya PARENT (akun induk)
│    Contoh: "Kas BCA" parent-nya "Bank"
│
└─── punya banyak TRANSAKSI
     Contoh: Akun "Penjualan" punya 500 transaksi/bulan
```

**Contoh Real (Penjualan):**

```typescript
// Step 1: Buat transaksi penjualan
const transaksi = await prisma.transaksi.create({
  data: {
    perusahaanId: "perusahaan-123",
    nomorTransaksi: "INV-001",
    tanggal: new Date(),
    tipe: "PENJUALAN",
    total: 1000000,
    
    // Detail transaksi
    detail: {
      create: [
        {
          akunId: "akun-penjualan",  // 4-1000 Penjualan
          deskripsi: "Jual Barang X",
          jumlah: 1000000
        }
      ]
    }
  }
});

// Step 2: System AUTO create voucher
// Voucher = bukti jurnal
const voucher = await prisma.voucher.create({
  data: {
    transaksiId: transaksi.id,
    nomorVoucher: "VCH-001",
    tipe: "KAS_MASUK",
    
    // Double entry (Debit = Kredit)
    detail: {
      create: [
        {
          akunId: "akun-kas",        // 1-1000 Kas
          debit: 1000000,            // Kas bertambah (DEBIT)
          kredit: 0
        },
        {
          akunId: "akun-penjualan",  // 4-1000 Penjualan  
          debit: 0,
          kredit: 1000000            // Penjualan bertambah (KREDIT)
        }
      ]
    }
  }
});

// Step 3: System AUTO post ke jurnal umum
const jurnal = await prisma.jurnalUmum.create({
  data: {
    voucherId: voucher.id,
    nomorJurnal: "JU-001",
    tanggal: new Date(),
    
    detail: {
      create: [
        {
          akunId: "akun-kas",
          debit: 1000000,
          kredit: 0,
          saldoSebelum: 0,
          saldoSesudah: 1000000  // Saldo kas jadi 1 juta
        },
        {
          akunId: "akun-penjualan",
          debit: 0,
          kredit: 1000000,
          saldoSebelum: 0,
          saldoSesudah: 1000000  // Total penjualan jadi 1 juta
        }
      ]
    }
  }
});

// Step 4: Saldo di ChartOfAccounts otomatis terupdate!
```

**Visualisasi:**

```
BEFORE (Saldo Awal):
Kas: Rp 0
Penjualan: Rp 0

TRANSAKSI: Jual barang Rp 1 juta tunai
↓
Debit Kas: Rp 1.000.000
Kredit Penjualan: Rp 1.000.000

AFTER (Saldo Akhir):
Kas: Rp 1.000.000 ✅
Penjualan: Rp 1.000.000 ✅
```

---

## 🛒 MODUL 3: INVENTORY & PRODUCTS

### Diagram Inventory

```
┌──────────┐
│  Produk  │ ◄──── Master produk (Mie Instan, Sabun, dll)
│ (Product)│
└────┬─────┘
     │
     │ has many
     ├──────────────┬────────────────┐
     │              │                │
     ▼              ▼                ▼
┌─────────┐   ┌──────────┐   ┌────────────┐
│Persediaan│   │ Variant  │   │  Transaksi │
│(Inventory│   │(Size,etc)│   │ Persediaan │
│  Item)   │   └──────────┘   │  (Stock    │
└────┬─────┘                  │   Movement)│
     │                        └────────────┘
     │ tracked in
     ▼
┌────────────┐
│StokPersediaan│ ◄──── Stock di gudang
│(Stock Level) │        Qty: 100 pcs
└─────┬────────┘
      │
      │ movements
      ▼
┌──────────────┐
│   Mutasi     │ ◄──── Stock IN/OUT
│ Persediaan   │        +50 pcs (pembelian)
│              │        -20 pcs (penjualan)
└──────────────┘
```

**Contoh Real (Toko Kelontong):**

```typescript
// 1. Buat produk
const mieInstan = await prisma.produk.create({
  data: {
    perusahaanId: "warung-123",
    kodeProduk: "MIE-001",
    namaProduk: "Mie Sedaap Goreng",
    kategori: "Makanan",
    hargaJualEceran: 3500,
    hargaBeli: 2500,
    
    // Link ke inventory
    persediaan: {
      create: {
        kode: "INV-MIE-001",
        nama: "Mie Sedaap Goreng",
        satuan: "PCS",
        metodeNilai: "FIFO",
        
        // Stock awal
        stok: {
          create: {
            gudangId: "gudang-utama",
            kuantitas: 100,  // Stock awal 100 pcs
            nilai: 250000    // 100 x Rp 2,500
          }
        }
      }
    },
    
    // Variant (opsional)
    variant: {
      create: [
        { namaVariant: "Karton (40 pcs)", sku: "MIE-001-CTN", hargaJual: 130000 },
        { namaVariant: "Eceran", sku: "MIE-001-PCS", hargaJual: 3500 }
      ]
    }
  }
});

// 2. Beli stock (stock masuk)
const pembelian = await prisma.transaksiPersediaan.create({
  data: {
    produkId: mieInstan.id,
    tipe: "MASUK",
    tanggal: new Date(),
    kuantitas: 50,      // Beli 50 pcs
    hargaSatuan: 2500,
    total: 125000,      // 50 x 2,500
    keterangan: "Beli dari supplier"
  }
});
// Stock sekarang: 100 + 50 = 150 pcs

// 3. Jual (stock keluar)
const penjualan = await prisma.transaksiPersediaan.create({
  data: {
    produkId: mieInstan.id,
    tipe: "KELUAR",
    tanggal: new Date(),
    kuantitas: 20,      // Jual 20 pcs
    hargaSatuan: 3500,
    total: 70000,       // 20 x 3,500
    keterangan: "Jual ke customer"
  }
});
// Stock sekarang: 150 - 20 = 130 pcs
```

**Visualisasi Stock Movement:**

```
TIMELINE STOCK:

Day 1: Stock Awal
├─ Mie Instan: 100 pcs @ Rp 2,500 = Rp 250,000

Day 2: Pembelian (+50 pcs)
├─ Stock: 100 + 50 = 150 pcs
└─ Nilai: Rp 250,000 + Rp 125,000 = Rp 375,000

Day 3: Penjualan (-20 pcs)
├─ Stock: 150 - 20 = 130 pcs
└─ HPP (FIFO): 20 x Rp 2,500 = Rp 50,000
    Nilai: Rp 375,000 - Rp 50,000 = Rp 325,000

CURRENT:
Stock: 130 pcs
Nilai: Rp 325,000
Harga Rata-rata: Rp 2,500/pcs
```

---

## 👥 MODUL 4: PARTNERS (AR/AP Management)

### Diagram Piutang (Account Receivable)

```
CUSTOMER OWES MONEY

┌──────────┐
│ Pelanggan│ ◄──── Toko A, Toko B, dll
│(Customer)│
└────┬─────┘
     │
     │ has many
     ▼
┌──────────┐
│  Piutang │ ◄──── Invoice belum dibayar
│   (AR)   │        INV-001: Rp 5 juta (due 30 hari)
└────┬─────┘        INV-002: Rp 3 juta (due 15 hari)
     │
     │ receives
     ▼
┌─────────────────┐
│ PembayaranPiutang│ ◄──── Customer bayar
│   (AR Payment)   │        Payment 1: Rp 2 juta
└──────────────────┘        Payment 2: Rp 3 juta
                            Total: Rp 5 juta ✅ LUNAS
```

**Contoh Real (Toko Grosir):**

```typescript
// Scenario: Jual ke Toko X Rp 5 juta, termin 30 hari

// Step 1: Buat invoice & piutang
const invoice = await prisma.transaksi.create({
  data: {
    nomorTransaksi: "INV-001",
    pelangganId: "toko-x",
    tanggal: new Date(),
    total: 5000000,
    statusPembayaran: "BELUM_DIBAYAR",
    
    // AUTO create piutang
    piutang: {
      create: {
        nomorPiutang: "AR-001",
        pelangganId: "toko-x",
        tanggalPiutang: new Date(),
        tanggalJatuhTempo: new Date(Date.now() + 30*24*60*60*1000), // +30 hari
        jumlahPiutang: 5000000,
        sisaPiutang: 5000000,
        statusPembayaran: "BELUM_DIBAYAR"
      }
    }
  }
});

// Status: Toko X hutang Rp 5 juta, due dalam 30 hari

// Step 2: Toko X bayar DP Rp 2 juta (hari ke-10)
const payment1 = await prisma.pembayaranPiutang.create({
  data: {
    piutangId: "ar-001",
    tanggalBayar: new Date(),
    jumlahBayar: 2000000,
    tipePembayaran: "TRANSFER",
    nomorReferensi: "TF-12345"
  }
});

// System AUTO update piutang:
// - jumlahDibayar: 0 → 2,000,000
// - sisaPiutang: 5,000,000 → 3,000,000
// - statusPembayaran: BELUM_DIBAYAR → DIBAYAR_SEBAGIAN

// Step 3: Toko X bayar sisa Rp 3 juta (hari ke-25)
const payment2 = await prisma.pembayaranPiutang.create({
  data: {
    piutangId: "ar-001",
    tanggalBayar: new Date(),
    jumlahBayar: 3000000,
    tipePembayaran: "TRANSFER",
    nomorReferensi: "TF-67890"
  }
});

// System AUTO update piutang:
// - jumlahDibayar: 2,000,000 → 5,000,000
// - sisaPiutang: 3,000,000 → 0
// - statusPembayaran: DIBAYAR_SEBAGIAN → LUNAS ✅
```

**Visualisasi Timeline:**

```
DAY 1: Invoice Created
├─ Invoice: INV-001 = Rp 5,000,000
├─ Piutang: AR-001 = Rp 5,000,000
├─ Status: BELUM_DIBAYAR
└─ Due Date: 30 hari lagi

DAY 10: Terima DP
├─ Payment 1: Rp 2,000,000
├─ Sisa Piutang: Rp 3,000,000
└─ Status: DIBAYAR_SEBAGIAN 🟡

DAY 25: Terima Pelunasan
├─ Payment 2: Rp 3,000,000
├─ Sisa Piutang: Rp 0
└─ Status: LUNAS ✅ 🟢
```

### Diagram Hutang (Account Payable)

```
WE OWE SUPPLIER MONEY

┌──────────┐
│ Pemasok  │ ◄──── Supplier A, Supplier B
│(Supplier)│
└────┬─────┘
     │
     │ has many
     ▼
┌──────────┐
│  Hutang  │ ◄──── Purchase belum dibayar
│   (AP)   │        PO-001: Rp 10 juta (due 30 hari)
└────┬─────┘
     │
     │ we pay
     ▼
┌─────────────────┐
│ PembayaranHutang │ ◄──── Kita bayar supplier
│   (AP Payment)   │        Payment: Rp 10 juta ✅
└──────────────────┘
```

**Sama seperti Piutang, tapi sebaliknya!**

---

## 💼 MODUL 5: TAX (Indonesian Tax Compliance)

### Diagram Tax Flow

```
TRANSAKSI → TAX CALC → E-FAKTUR → LAPOR SPT

┌────────────┐
│ Transaksi  │ ◄──── Jual Rp 10 juta
└─────┬──────┘
      │
      │ auto calculate
      ▼
┌──────────────┐
│TransaksiPajak│ ◄──── PPN 11% = Rp 1.1 juta
│              │        DPP = Rp 10 juta
└─────┬────────┘
      │
      │ generate
      ▼
┌─────────────┐
│ FakturPajak │ ◄──── e-Faktur
│  (e-Faktur) │        Nomor Seri: 010.000-21.12345678
└─────┬───────┘        Upload ke DJP ✅
      │
      │ monthly report
      ▼
┌─────────────┐
│LaporanPajak │ ◄──── SPT Masa PPN
│  (SPT Masa) │        Masa: Desember 2024
└─────────────┘        Total PPN: Rp 50 juta
```

**Contoh Real (e-Faktur PPN):**

```typescript
// Scenario: Jual ke customer PKP Rp 10 juta + PPN 11%

const penjualan = await prisma.transaksi.create({
  data: {
    nomorTransaksi: "INV-001",
    total: 11100000,  // 10 juta + PPN 1.1 juta
    
    // AUTO create tax transaction
    pajak: {
      create: {
        jenisPajak: "PPN_KELUARAN",
        dpp: 10000000,           // Dasar Pengenaan Pajak
        tarifPajak: 11,          // 11%
        jumlahPajak: 1100000,    // 11% x 10 juta
        masaPajak: 12,           // Desember
        tahunPajak: 2024
      }
    }
  }
});

// System AUTO generate e-Faktur
const eFaktur = await prisma.fakturPajak.create({
  data: {
    transaksiPajakId: "taxpajak-123",
    nomorSeri: "010.000-21.12345678",  // Dari DJP
    tanggalFaktur: new Date(),
    dpp: 10000000,
    ppn: 1100000,
    namaLawanTransaksi: "PT Customer ABC",
    npwpLawanTransaksi: "01.234.567.8-901.000",
    status: "NORMAL"
  }
});

// Upload to DJP
await uploadToDJP(eFaktur);
// eFaktur.isUploaded = true
// eFaktur.nomorApproval = "..."
```

**Tax Types Supported:**

```
PPN (Pajak Pertambahan Nilai):
├── PPN_KELUARAN (kita jual ke customer)
│   └── Rate: 11%
└── PPN_MASUKAN (kita beli dari supplier)
    └── Rate: 11%

PPh (Pajak Penghasilan):
├── PPH_PASAL_21 (gaji karyawan)
│   └── Progressive: 5%, 15%, 25%, 30%
├── PPH_PASAL_23 (jasa)
│   └── Rate: 2% (most services)
└── PPH_PASAL_4_AYAT_2 (sewa, dll)
    └── Rate: 10%
```

---

## 🏗️ MODUL 6: ORGANIZATION (Projects & Departments)

### Diagram Project Costing

```
TRACK COSTS PER PROJECT

┌──────────┐
│  Proyek  │ ◄──── Renovasi Gedung A
│ (Project)│        Budget: Rp 500 juta
└────┬─────┘        Status: ACTIVE
     │
     │ has many
     ▼
┌──────────────┐
│ProyekTransaksi│ ◄──── Track semua cost & income
│              │        - Beli material: -Rp 100 juta
└──────────────┘        - Bayar tukang: -Rp 50 juta
                        - Terima progress payment: +Rp 80 juta
                        
                        Current Status:
                        Total Cost: Rp 150 juta
                        Total Income: Rp 80 juta
                        Profit/Loss: -Rp 70 juta (masih rugi, belum selesai)
```

**Contoh Real (Kontraktor):**

```typescript
// 1. Create project
const project = await prisma.proyek.create({
  data: {
    kodeProyek: "PROJ-001",
    namaProyek: "Renovasi Gedung A",
    pelangganId: "client-abc",
    nilaiKontrak: 500000000,  // Rp 500 juta
    tanggalMulai: new Date("2024-01-01"),
    targetSelesai: new Date("2024-06-30"),
    status: "ACTIVE"
  }
});

// 2. Beli material (cost)
const materialCost = await prisma.transaksi.create({
  data: {
    nomorTransaksi: "PO-001",
    tipe: "PEMBELIAN",
    total: 100000000,  // Rp 100 juta
    
    // Link to project
    proyekTransaksi: {
      create: {
        proyekId: project.id,
        jumlah: 100000000,
        tipeTransaksi: "EXPENSE",
        keterangan: "Beli material bangunan"
      }
    }
  }
});

// 3. Bayar tukang (cost)
const laborCost = await prisma.transaksi.create({
  data: {
    nomorTransaksi: "PAY-001",
    tipe: "BEBAN",
    total: 50000000,  // Rp 50 juta
    
    proyekTransaksi: {
      create: {
        proyekId: project.id,
        jumlah: 50000000,
        tipeTransaksi: "EXPENSE",
        keterangan: "Upah tukang"
      }
    }
  }
});

// 4. Terima progress payment (income)
const progressPayment = await prisma.transaksi.create({
  data: {
    nomorTransaksi: "INV-001",
    tipe: "PENJUALAN",
    total: 80000000,  // Rp 80 juta (termin 1)
    
    proyekTransaksi: {
      create: {
        proyekId: project.id,
        jumlah: 80000000,
        tipeTransaksi: "INCOME",
        keterangan: "Progress payment 1 (20%)"
      }
    }
  }
});

// Query: Hitung profit/loss per project
const projectSummary = await prisma.proyekTransaksi.aggregate({
  where: { proyekId: project.id },
  _sum: {
    jumlah: true  // Auto calculate total
  }
});

// Result:
// Total Expense: Rp 150 juta (100 + 50)
// Total Income: Rp 80 juta
// Net: -Rp 70 juta (masih rugi, normal karena belum selesai)
```

**Visualisasi Project Dashboard:**

```
PROJECT: Renovasi Gedung A
Contract Value: Rp 500,000,000
Progress: 30% complete

COSTS TO DATE:
├─ Materials:  Rp 100,000,000
├─ Labor:      Rp  50,000,000
└─ Total Cost: Rp 150,000,000

INCOME TO DATE:
└─ Progress Payments: Rp 80,000,000

PROFIT/LOSS:
└─ Current: -Rp 70,000,000 (masih ongoing)

REMAINING:
├─ Contract Balance: Rp 420,000,000
└─ Expected Final Profit: Rp 350,000,000
    (jika selesai sesuai budget)
```

---

## 💵 MODUL 7: BUDGET (Budget vs Actual)

### Diagram Budget Tracking

```
PLAN → ACTUAL → VARIANCE

┌────────────┐
│   Budget   │ ◄──── Budget Operasional 2024
│            │        Total: Rp 100 juta/bulan
└─────┬──────┘
      │
      │ breakdown to
      ▼
┌──────────────┐
│ BudgetDetail │ ◄──── Per akun per bulan
│              │        - Gaji: Rp 50 juta
└──────┬───────┘        - Listrik: Rp 10 juta
       │                - Telepon: Rp 5 juta
       │
       │ compare with
       ▼
┌─────────────────┐
│ BudgetRealisasi │ ◄──── Actual spending
│                 │        - Gaji: Rp 48 juta ✅ Under budget!
└─────────────────┘        - Listrik: Rp 12 juta ⚠️ Over budget!
                           - Telepon: Rp 5 juta ✅ On budget
```

**Contoh Real (Budget Departemen):**

```typescript
// 1. Buat budget tahunan
const budget = await prisma.budget.create({
  data: {
    kode: "BDG-2024-OPS",
    nama: "Budget Operasional 2024",
    tahun: 2024,
    tipe: "OPERASIONAL",
    totalBudget: 1200000000,  // Rp 1.2 milyar per tahun
    
    // Budget per akun per bulan
    detail: {
      create: [
        {
          akunId: "akun-gaji",
          bulan: 1,  // Januari
          jumlahBudget: 50000000  // Rp 50 juta
        },
        {
          akunId: "akun-listrik",
          bulan: 1,
          jumlahBudget: 10000000  // Rp 10 juta
        },
        // ... repeat for all months
      ]
    }
  }
});

// 2. Track actual spending (auto dari transaksi)
const gajiJanuari = await prisma.transaksi.create({
  data: {
    tipe: "BEBAN",
    akunId: "akun-gaji",
    total: 48000000,  // Actual: Rp 48 juta
    
    // AUTO create budget realization
    budgetRealisasi: {
      create: {
        budgetId: budget.id,
        bulan: 1,
        jumlah: 48000000,
        persentase: 96  // 48/50 * 100 = 96%
      }
    }
  }
});

// 3. System AUTO calculate variance
const variance = await prisma.budgetDetail.findFirst({
  where: {
    budgetId: budget.id,
    akunId: "akun-gaji",
    bulan: 1
  }
});

// Result:
// Budget: Rp 50,000,000
// Actual: Rp 48,000,000
// Variance: -Rp 2,000,000 (UNDER budget, GOOD! ✅)
// Variance %: -4% (96% utilization)
```

**Visualisasi Variance Report:**

```
BUDGET VS ACTUAL - JANUARI 2024

BEBAN GAJI:
Budget:  Rp 50,000,000
Actual:  Rp 48,000,000
Variance: -Rp 2,000,000 (UNDER) ✅ GOOD
Utilization: 96%

BEBAN LISTRIK:
Budget:  Rp 10,000,000
Actual:  Rp 12,000,000
Variance: +Rp 2,000,000 (OVER) ⚠️ ALERT!
Utilization: 120%

BEBAN TELEPON:
Budget:  Rp 5,000,000
Actual:  Rp 5,000,000
Variance: Rp 0 (ON TARGET) ✅
Utilization: 100%

TOTAL JANUARI:
Budget:  Rp 100,000,000
Actual:  Rp 98,000,000
Variance: -Rp 2,000,000 ✅
Overall: 98% utilization (GOOD!)
```

---

## 🎯 RINGKASAN RELASI PENTING

### 1. **One-to-Many (Paling Umum)**

```
Perusahaan 1 ──── * Cabang
"1 company has many branches"

Perusahaan 1 ──── * Transaksi  
"1 company has many transactions"

Pelanggan 1 ──── * Piutang
"1 customer has many invoices"

Produk 1 ──── * ProdukVariant
"1 product has many variants"
```

### 2. **Optional Relations (?)**

```
Transaksi * ──── ? Voucher
"Many transactions MAY have 1 voucher"
(Bisa ada transaksi belum divoucher)

Budget * ──── ? Departemen
"Many budgets MAY belong to 1 department"
(Bisa ada budget company-wide tanpa dept)
```

### 3. **Many-to-Many (Via Junction Table)**

```
Produk * ──── * Gudang
Via: StokPersediaan
"Many products in many warehouses"

Budget * ──── * ChartOfAccounts
Via: BudgetDetail
"Many budgets for many accounts"
```

### 4. **Self Relations (Hierarchy)**

```
ChartOfAccounts ──── ChartOfAccounts
         ↑                ↓
       parent          children

Contoh:
"Bank" (parent)
  ├── "Bank BCA" (child)
  ├── "Bank Mandiri" (child)
  └── "Bank BRI" (child)

Departemen ──── Departemen
       ↑            ↓
    parent      children

Contoh:
"Finance" (parent)
  ├── "Accounting" (child)
  ├── "Tax" (child)
  └── "Cashier" (child)
```

---

## 📖 CHEAT SHEET: Kapan Pakai Relasi Apa?

| Scenario | Relasi Type | Contoh |
|----------|-------------|--------|
| **Satu punya banyak** | One-to-Many | 1 Perusahaan → banyak Cabang |
| **Banyak punya banyak** | Many-to-Many | Banyak Produk ↔ Banyak Gudang |
| **Boleh kosong** | Optional (?) | Transaksi bisa tanpa Voucher |
| **Wajib ada** | Required (!) | Transaksi HARUS punya Perusahaan |
| **Hierarchy/Tree** | Self-Relation | COA parent-child |

---

## 💬 Penjelasan Dalam Bahasa Sehari-hari

**Q: Kenapa Transaksi punya Voucher, Voucher punya Jurnal?**

A: **Analogi Rumah Sakit:**
- **Transaksi** = Pasien datang ke rumah sakit
- **Voucher** = Dokter periksa, buat resep
- **Jurnal** = Apoteker baca resep, kasih obat
- **ChartOfAccounts** = Stok obat di apotek bertambah/berkurang

Semuanya **otomatis berhubungan**. Pas pasien datang, otomatis ada pemeriksaan, otomatis ada resep, otomatis stok obat berubah.

**Q: Kenapa ada Piutang DAN PembayaranPiutang?**

A: **Analogi Hutang Teman:**
- **Piutang** = Teman hutang Rp 1 juta ke Anda
- **PembayaranPiutang** = Teman bayar cicilan Rp 300rb, Rp 300rb, Rp 400rb

Satu "hutang" bisa punya banyak "cicilan pembayaran". Makanya pisah jadi 2 table.

**Q: Kenapa Project punya ProyekTransaksi?**

A: **Analogi Proyek Renovasi Rumah:**
- **Proyek** = Renovasi rumah total
- **ProyekTransaksi** = Setiap pengeluaran/pemasukan:
  - Beli cat: -Rp 5 juta
  - Beli genteng: -Rp 10 juta
  - Bayar tukang: -Rp 20 juta
  - Total: -Rp 35 juta

Kita track SETIAP transaksi, baru tau total project cost-nya berapa.

---

## 🎓 Tips Memahami Relasi Database

### 1. **Baca dari Parent ke Child**

```
Perusahaan (PARENT)
    ↓ has many
Cabang (CHILD)
```

"1 Perusahaan PUNYA BANYAK Cabang"

### 2. **Foreign Key = Penunjuk**

```
Cabang {
  perusahaanId  ← ini foreign key, nunjuk ke parent
}
```

`perusahaanId` di Cabang = "cabang ini milik perusahaan yang mana?"

### 3. **Reverse Relation = Array**

```
Perusahaan {
  cabang  Cabang[]  ← array, karena banyak
}
```

Dari parent, bisa ambil semua children-nya sekaligus.

### 4. **Optional (?) vs Required (!)**

```
? = Boleh kosong
! = Wajib ada

Transaksi {
  voucherId  String?  ← boleh NULL (optional)
  perusahaanId  String  ← WAJIB ada (required)
}
```

---

Apakah penjelasan ini cukup jelas? Ada bagian mana yang masih membingungkan?

