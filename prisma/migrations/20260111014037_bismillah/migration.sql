-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPERADMIN', 'ADMIN', 'MANAGER', 'STAFF', 'AUDITOR', 'CEO', 'CFO', 'ACCOUNTANT', 'SENIOR_ACCOUNTANT', 'FINANCE_MANAGER', 'CASHIER', 'TAX_OFFICER', 'WAREHOUSE_MANAGER', 'PURCHASING', 'SALES');

-- CreateEnum
CREATE TYPE "TipeAkun" AS ENUM ('ASET', 'LIABILITAS', 'EKUITAS', 'PENDAPATAN', 'BEBAN', 'PENDAPATAN_KOMPREHENSIF_LAIN');

-- CreateEnum
CREATE TYPE "KategoriAset" AS ENUM ('ASET_LANCAR', 'KAS_DAN_SETARA_KAS', 'PIUTANG_USAHA', 'PERSEDIAAN', 'ASET_TIDAK_LANCAR', 'ASET_TETAP', 'PROPERTI_INVESTASI', 'ASET_TIDAK_BERWUJUD', 'INVESTASI_JANGKA_PANJANG', 'ASET_PAJAK_TANGGUHAN');

-- CreateEnum
CREATE TYPE "KategoriLiabilitas" AS ENUM ('LIABILITAS_JANGKA_PENDEK', 'HUTANG_USAHA', 'HUTANG_PAJAK', 'LIABILITAS_JANGKA_PANJANG', 'HUTANG_BANK', 'LIABILITAS_PAJAK_TANGGUHAN', 'LIABILITAS_IMBALAN_KERJA');

-- CreateEnum
CREATE TYPE "KategoriEkuitas" AS ENUM ('MODAL_SAHAM', 'TAMBAHAN_MODAL_DISETOR', 'SAHAM_TREASURI', 'SALDO_LABA', 'SALDO_LABA_DITENTUKAN_PENGGUNAANNYA', 'PENDAPATAN_KOMPREHENSIF_LAIN', 'KEPENTINGAN_NON_PENGENDALI');

-- CreateEnum
CREATE TYPE "TipeTransaksi" AS ENUM ('PENJUALAN', 'PEMBELIAN', 'BIAYA', 'GAJI', 'PEMBAYARAN_HUTANG', 'PENERIMAAN_PIUTANG', 'INVESTASI', 'PENYUSUTAN', 'AMORTISASI', 'REVALUASI', 'PENYISIHAN', 'JURNAL_PENYESUAIAN', 'JURNAL_PENUTUP', 'JURNAL_PEMBALIK', 'JURNAL_KOREKSI', 'LAINNYA');

-- CreateEnum
CREATE TYPE "TipeVoucher" AS ENUM ('KAS_MASUK', 'KAS_KELUAR', 'BANK_MASUK', 'BANK_KELUAR', 'JURNAL_UMUM', 'JURNAL_MEMORIAL', 'JURNAL_PENYESUAIAN', 'JURNAL_PENUTUP', 'JURNAL_PEMBALIK');

-- CreateEnum
CREATE TYPE "StatusVoucher" AS ENUM ('DRAFT', 'MENUNGGU_PERSETUJUAN', 'DISETUJUI', 'DIPOSTING', 'DITOLAK', 'DIBATALKAN', 'REVERSED');

-- CreateEnum
CREATE TYPE "StatusPembayaran" AS ENUM ('BELUM_DIBAYAR', 'DIBAYAR_SEBAGIAN', 'LUNAS', 'OVERDUE', 'DIHAPUSBUKUKAN');

-- CreateEnum
CREATE TYPE "TipePembayaran" AS ENUM ('TUNAI', 'TRANSFER_BANK', 'CEK', 'GIRO', 'KARTU_KREDIT', 'KARTU_DEBIT', 'VIRTUAL_ACCOUNT', 'E_WALLET');

-- CreateEnum
CREATE TYPE "StatusAsetTetap" AS ENUM ('AKTIF', 'DALAM_KONSTRUKSI', 'DALAM_PERBAIKAN', 'IDLE', 'UNTUK_DIJUAL', 'DIJUAL', 'DIHAPUSKAN', 'RUSAK');

-- CreateEnum
CREATE TYPE "MetodePenyusutan" AS ENUM ('GARIS_LURUS', 'SALDO_MENURUN', 'SALDO_MENURUN_GANDA', 'JUMLAH_ANGKA_TAHUN', 'UNIT_PRODUKSI');

-- CreateEnum
CREATE TYPE "MetodePenilaianPersediaan" AS ENUM ('FIFO', 'RATA_RATA_BERGERAK', 'RATA_RATA_TERTIMBANG', 'IDENTIFIKASI_KHUSUS');

-- CreateEnum
CREATE TYPE "StatusPersediaan" AS ENUM ('TERSEDIA', 'DIPESAN', 'DIPINJAM', 'RUSAK', 'KADALUARSA', 'DALAM_TRANSIT', 'DIKEMBALIKAN');

-- CreateEnum
CREATE TYPE "JenisPajak" AS ENUM ('PPH_PASAL_21', 'PPH_PASAL_22', 'PPH_PASAL_23', 'PPH_PASAL_25', 'PPH_PASAL_26', 'PPH_PASAL_29', 'PPH_PASAL_4_AYAT_2', 'PPH_PASAL_15', 'PPN_KELUARAN', 'PPN_MASUKAN', 'PBB', 'BPHTB', 'BEA_MATERAI', 'PAJAK_DAERAH');

-- CreateEnum
CREATE TYPE "StatusFakturPajak" AS ENUM ('NORMAL', 'PENGGANTI', 'DIBATALKAN', 'GAGAL_UPLOAD', 'APPROVAL_PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TipeLaporan" AS ENUM ('LAPORAN_POSISI_KEUANGAN', 'LAPORAN_LABA_RUGI', 'LAPORAN_LABA_RUGI_KOMPREHENSIF', 'LAPORAN_PERUBAHAN_EKUITAS', 'LAPORAN_ARUS_KAS', 'CATATAN_ATAS_LAPORAN_KEUANGAN', 'BUKU_BESAR', 'BUKU_PEMBANTU', 'NERACA_SALDO', 'NERACA_LAJUR', 'JURNAL_UMUM', 'KARTU_PIUTANG', 'KARTU_HUTANG', 'KARTU_PERSEDIAAN', 'AGING_SCHEDULE_PIUTANG', 'AGING_SCHEDULE_HUTANG', 'SPT_MASA_PPN', 'SPT_MASA_PPH', 'SPT_TAHUNAN', 'DAFTAR_FAKTUR_PAJAK', 'ANALISIS_RASIO', 'BUDGET_REALIZATION', 'BREAK_EVEN_ANALYSIS', 'CASH_FLOW_PROJECTION');

-- CreateEnum
CREATE TYPE "PeriodeLaporan" AS ENUM ('HARIAN', 'MINGGUAN', 'BULANAN', 'KUARTALAN', 'SEMESTERAN', 'TAHUNAN', 'CUSTOM');

-- CreateEnum
CREATE TYPE "StatusLaporan" AS ENUM ('DRAFT', 'REVIEW', 'FINAL', 'PUBLISHED', 'REVISED', 'AUDITED');

-- CreateEnum
CREATE TYPE "TipeBudget" AS ENUM ('OPERASIONAL', 'MODAL', 'KAS', 'PROYEK', 'DEPARTEMEN');

-- CreateEnum
CREATE TYPE "StatusBudget" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'AKTIF', 'CLOSED', 'REVISED');

-- CreateEnum
CREATE TYPE "StatusPeriode" AS ENUM ('TERBUKA', 'DITUTUP_SEMENTARA', 'DITUTUP_PERMANEN');

-- CreateEnum
CREATE TYPE "TierPaket" AS ENUM ('UMKM', 'SMALL', 'MEDIUM', 'ENTERPRISE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "StatusApproval" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "FrekuensiRekuren" AS ENUM ('HARIAN', 'MINGGUAN', 'BULANAN', 'KUARTALAN', 'TAHUNAN', 'CUSTOM');

-- CreateEnum
CREATE TYPE "StatusRekuren" AS ENUM ('SUCCESS', 'FAILED', 'SKIPPED', 'PENDING');

-- CreateEnum
CREATE TYPE "KategoriDokumen" AS ENUM ('INVOICE', 'RECEIPT', 'CONTRACT', 'PURCHASE_ORDER', 'DELIVERY_NOTE', 'TAX_DOCUMENT', 'BANK_STATEMENT', 'SUPPORTING_DOCUMENT', 'LAINNYA');

-- CreateEnum
CREATE TYPE "TipeWidget" AS ENUM ('CHART', 'KPI', 'TABLE', 'GAUGE', 'LIST', 'CALENDAR');

-- CreateTable
CREATE TABLE "ChartOfAccounts" (
    "id" TEXT NOT NULL,
    "perusahaanId" TEXT NOT NULL,
    "kodeAkun" TEXT NOT NULL,
    "namaAkun" TEXT NOT NULL,
    "tipe" "TipeAkun" NOT NULL,
    "kategoriAset" "KategoriAset",
    "kategoriLiabilitas" "KategoriLiabilitas",
    "kategoriEkuitas" "KategoriEkuitas",
    "level" INTEGER NOT NULL DEFAULT 1,
    "parentId" TEXT,
    "normalBalance" TEXT NOT NULL DEFAULT 'DEBIT',
    "isHeader" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isControlAccount" BOOLEAN NOT NULL DEFAULT false,
    "allowManualEntry" BOOLEAN NOT NULL DEFAULT true,
    "requireDepartment" BOOLEAN NOT NULL DEFAULT false,
    "requireProject" BOOLEAN NOT NULL DEFAULT false,
    "requireCostCenter" BOOLEAN NOT NULL DEFAULT false,
    "multiCurrency" BOOLEAN NOT NULL DEFAULT false,
    "mataUangDefault" TEXT,
    "saldoAwal" DECIMAL(25,2) NOT NULL DEFAULT 0,
    "saldoAwalDebit" DECIMAL(25,2) NOT NULL DEFAULT 0,
    "saldoAwalKredit" DECIMAL(25,2) NOT NULL DEFAULT 0,
    "saldoBerjalan" DECIMAL(25,2) NOT NULL DEFAULT 0,
    "pajakId" TEXT,
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChartOfAccounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaksi" (
    "id" TEXT NOT NULL,
    "perusahaanId" TEXT NOT NULL,
    "cabangId" TEXT,
    "penggunaId" TEXT NOT NULL,
    "nomorTransaksi" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "tipe" "TipeTransaksi" NOT NULL,
    "mataUangId" TEXT,
    "kurs" DECIMAL(18,6),
    "pelangganId" TEXT,
    "pemasokId" TEXT,
    "referensi" TEXT,
    "deskripsi" TEXT,
    "subtotal" DECIMAL(25,2) NOT NULL DEFAULT 0,
    "diskon" DECIMAL(25,2) NOT NULL DEFAULT 0,
    "pajakId" TEXT,
    "nilaiPajak" DECIMAL(25,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(25,2) NOT NULL,
    "totalDibayar" DECIMAL(25,2) NOT NULL DEFAULT 0,
    "sisaPembayaran" DECIMAL(25,2) NOT NULL DEFAULT 0,
    "statusPembayaran" "StatusPembayaran" NOT NULL DEFAULT 'BELUM_DIBAYAR',
    "tanggalJatuhTempo" TIMESTAMP(3),
    "termPembayaran" INTEGER,
    "costCenterId" TEXT,
    "profitCenterId" TEXT,
    "kontrakId" TEXT,
    "isPosted" BOOLEAN NOT NULL DEFAULT false,
    "postedAt" TIMESTAMP(3),
    "postedBy" TEXT,
    "isVoid" BOOLEAN NOT NULL DEFAULT false,
    "voidAt" TIMESTAMP(3),
    "voidBy" TEXT,
    "voidReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaksi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransaksiDetail" (
    "id" TEXT NOT NULL,
    "transaksiId" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL,
    "akunId" TEXT NOT NULL,
    "deskripsi" TEXT,
    "kuantitas" DECIMAL(18,4) NOT NULL DEFAULT 1,
    "hargaSatuan" DECIMAL(25,2) NOT NULL,
    "diskon" DECIMAL(25,2) NOT NULL DEFAULT 0,
    "persediaanId" TEXT,
    "asetTetapId" TEXT,
    "subtotal" DECIMAL(25,2) NOT NULL,
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransaksiDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pembayaran" (
    "id" TEXT NOT NULL,
    "transaksiId" TEXT NOT NULL,
    "nomorPembayaran" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "tipePembayaran" "TipePembayaran" NOT NULL,
    "jumlah" DECIMAL(25,2) NOT NULL,
    "bankRekeningId" TEXT,
    "nomorReferensi" TEXT,
    "kurs" DECIMAL(18,6),
    "jumlahAsli" DECIMAL(25,2),
    "biayaAdmin" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "keterangan" TEXT,
    "isPosted" BOOLEAN NOT NULL DEFAULT false,
    "postedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pembayaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Voucher" (
    "id" TEXT NOT NULL,
    "perusahaanId" TEXT NOT NULL,
    "nomorVoucher" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "tipe" "TipeVoucher" NOT NULL,
    "transaksiId" TEXT,
    "deskripsi" TEXT NOT NULL,
    "totalDebit" DECIMAL(25,2) NOT NULL DEFAULT 0,
    "totalKredit" DECIMAL(25,2) NOT NULL DEFAULT 0,
    "status" "StatusVoucher" NOT NULL DEFAULT 'DRAFT',
    "dibuatOlehId" TEXT NOT NULL,
    "disetujuiOleh" TEXT,
    "tanggalDisetujui" TIMESTAMP(3),
    "isPosted" BOOLEAN NOT NULL DEFAULT false,
    "postedAt" TIMESTAMP(3),
    "postedBy" TEXT,
    "isReversed" BOOLEAN NOT NULL DEFAULT false,
    "reversedAt" TIMESTAMP(3),
    "reversedBy" TEXT,
    "reversedVoucherId" TEXT,
    "catatan" TEXT,
    "lampiran" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Voucher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoucherDetail" (
    "id" TEXT NOT NULL,
    "voucherId" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL,
    "akunId" TEXT NOT NULL,
    "deskripsi" TEXT,
    "debit" DECIMAL(25,2) NOT NULL DEFAULT 0,
    "kredit" DECIMAL(25,2) NOT NULL DEFAULT 0,
    "costCenterId" TEXT,
    "profitCenterId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoucherDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JurnalUmum" (
    "id" TEXT NOT NULL,
    "perusahaanId" TEXT NOT NULL,
    "periodeId" TEXT NOT NULL,
    "voucherId" TEXT,
    "nomorJurnal" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "totalDebit" DECIMAL(25,2) NOT NULL DEFAULT 0,
    "totalKredit" DECIMAL(25,2) NOT NULL DEFAULT 0,
    "isPosted" BOOLEAN NOT NULL DEFAULT false,
    "postedAt" TIMESTAMP(3),
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JurnalUmum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JurnalDetail" (
    "id" TEXT NOT NULL,
    "jurnalId" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL,
    "akunId" TEXT NOT NULL,
    "deskripsi" TEXT,
    "debit" DECIMAL(25,2) NOT NULL DEFAULT 0,
    "kredit" DECIMAL(25,2) NOT NULL DEFAULT 0,
    "saldoSebelum" DECIMAL(25,2) NOT NULL DEFAULT 0,
    "saldoSesudah" DECIMAL(25,2) NOT NULL DEFAULT 0,
    "costCenterId" TEXT,
    "profitCenterId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JurnalDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PeriodeAkuntansi" (
    "id" TEXT NOT NULL,
    "perusahaanId" TEXT NOT NULL,
    "tahun" INTEGER NOT NULL,
    "bulan" INTEGER NOT NULL,
    "nama" TEXT NOT NULL,
    "tanggalMulai" TIMESTAMP(3) NOT NULL,
    "tanggalAkhir" TIMESTAMP(3) NOT NULL,
    "status" "StatusPeriode" NOT NULL DEFAULT 'TERBUKA',
    "ditutupOleh" TEXT,
    "tanggalDitutup" TIMESTAMP(3),
    "dibukaPada" TIMESTAMP(3),
    "dibukaOleh" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PeriodeAkuntansi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" TEXT NOT NULL,
    "perusahaanId" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tahun" INTEGER NOT NULL,
    "tipe" "TipeBudget" NOT NULL,
    "tanggalMulai" TIMESTAMP(3) NOT NULL,
    "tanggalAkhir" TIMESTAMP(3) NOT NULL,
    "totalBudget" DECIMAL(25,2) NOT NULL DEFAULT 0,
    "totalRealisasi" DECIMAL(25,2) NOT NULL DEFAULT 0,
    "totalVariance" DECIMAL(25,2) NOT NULL DEFAULT 0,
    "persentaseRealisasi" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "status" "StatusBudget" NOT NULL DEFAULT 'DRAFT',
    "departemenName" TEXT,
    "projectCode" TEXT,
    "deskripsi" TEXT,
    "disetujuiOleh" TEXT,
    "tanggalDisetujui" TIMESTAMP(3),
    "departemenId" TEXT,
    "proyekId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetDetail" (
    "id" TEXT NOT NULL,
    "budgetId" TEXT NOT NULL,
    "akunId" TEXT NOT NULL,
    "periode" TIMESTAMP(3) NOT NULL,
    "bulan" INTEGER NOT NULL,
    "jumlahBudget" DECIMAL(25,2) NOT NULL,
    "jumlahRealisasi" DECIMAL(25,2) NOT NULL DEFAULT 0,
    "variance" DECIMAL(25,2) NOT NULL DEFAULT 0,
    "variancePersentase" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "departemenId" TEXT,

    CONSTRAINT "BudgetDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetRevisi" (
    "id" TEXT NOT NULL,
    "budgetId" TEXT NOT NULL,
    "versi" INTEGER NOT NULL,
    "tanggalRevisi" TIMESTAMP(3) NOT NULL,
    "alasanRevisi" TEXT NOT NULL,
    "jumlahSebelum" DECIMAL(25,2) NOT NULL,
    "jumlahSesudah" DECIMAL(25,2) NOT NULL,
    "direvisiOleh" TEXT NOT NULL,
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BudgetRevisi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetRealisasi" (
    "id" TEXT NOT NULL,
    "budgetId" TEXT NOT NULL,
    "transaksiId" TEXT,
    "bulan" INTEGER NOT NULL,
    "jumlah" DECIMAL(25,2) NOT NULL,
    "persentase" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetRealisasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MataUang" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "simbol" TEXT NOT NULL,
    "desimalDigit" INTEGER NOT NULL DEFAULT 2,
    "negara" TEXT,
    "isAktif" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MataUang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KursHistory" (
    "id" TEXT NOT NULL,
    "mataUangId" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "kurs" DECIMAL(18,6) NOT NULL,
    "kursBeli" DECIMAL(18,6),
    "kursJual" DECIMAL(18,6),
    "sumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KursHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Perusahaan" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "namaLengkap" TEXT,
    "bentukUsaha" TEXT,
    "bidangUsaha" TEXT,
    "alamat" TEXT,
    "kelurahan" TEXT,
    "kecamatan" TEXT,
    "kota" TEXT,
    "provinsi" TEXT,
    "kodePos" TEXT,
    "telepon" TEXT,
    "fax" TEXT,
    "email" TEXT,
    "website" TEXT,
    "npwp" TEXT,
    "nib" TEXT,
    "aktaPendirian" TEXT,
    "skKemenkumham" TEXT,
    "logo" TEXT,
    "mataUangUtama" TEXT NOT NULL DEFAULT 'IDR',
    "tahunBuku" INTEGER NOT NULL DEFAULT 12,
    "satuanUsahaKecil" BOOLEAN NOT NULL DEFAULT false,
    "indukId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Perusahaan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PengaturanPerusahaan" (
    "id" TEXT NOT NULL,
    "perusahaanId" TEXT NOT NULL,
    "metodeAkuntansi" TEXT NOT NULL DEFAULT 'ACCRUAL',
    "metodeInventory" "MetodePenilaianPersediaan" NOT NULL DEFAULT 'RATA_RATA_BERGERAK',
    "metodePenyusutan" "MetodePenyusutan" NOT NULL DEFAULT 'GARIS_LURUS',
    "metodAmortisasi" "MetodePenyusutan" NOT NULL DEFAULT 'GARIS_LURUS',
    "batasKreditDefault" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "termPembayaranDefault" INTEGER NOT NULL DEFAULT 30,
    "permitEditTransaksiPosted" BOOLEAN NOT NULL DEFAULT false,
    "permitDeleteTransaksiPosted" BOOLEAN NOT NULL DEFAULT false,
    "requireApprovalVoucher" BOOLEAN NOT NULL DEFAULT true,
    "requireApprovalPembayaran" BOOLEAN NOT NULL DEFAULT true,
    "autoNumberingVoucher" BOOLEAN NOT NULL DEFAULT true,
    "formatNomorVoucher" TEXT NOT NULL DEFAULT '[PREFIX]-[YEAR][MONTH]-[SEQUENCE]',
    "autoNumberingInvoice" BOOLEAN NOT NULL DEFAULT true,
    "formatNomorInvoice" TEXT NOT NULL DEFAULT 'INV-[YEAR][MONTH]-[SEQUENCE]',
    "useMultiCurrency" BOOLEAN NOT NULL DEFAULT false,
    "useMultiWarehouse" BOOLEAN NOT NULL DEFAULT false,
    "useCostCenter" BOOLEAN NOT NULL DEFAULT false,
    "useProfitCenter" BOOLEAN NOT NULL DEFAULT false,
    "useProjectCosting" BOOLEAN NOT NULL DEFAULT false,
    "useBudgeting" BOOLEAN NOT NULL DEFAULT false,
    "notifikasiEmail" BOOLEAN NOT NULL DEFAULT true,
    "notifikasiWhatsapp" BOOLEAN NOT NULL DEFAULT false,
    "backupOtomatis" BOOLEAN NOT NULL DEFAULT true,
    "frekuensiBackup" TEXT NOT NULL DEFAULT 'HARIAN',
    "retensiBukuBesar" INTEGER NOT NULL DEFAULT 7,
    "integrasiPajak" BOOLEAN NOT NULL DEFAULT false,
    "apiKeyEfaktur" TEXT,
    "apiKeyEbupot" TEXT,
    "logoKopSurat" TEXT,
    "templateKopSurat" JSONB,
    "customSettings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PengaturanPerusahaan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cabang" (
    "id" TEXT NOT NULL,
    "perusahaanId" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "alamat" TEXT,
    "kota" TEXT,
    "telepon" TEXT,
    "email" TEXT,
    "kepala" TEXT,
    "isAktif" BOOLEAN NOT NULL DEFAULT true,
    "isKantor" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cabang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pengguna" (
    "id" TEXT NOT NULL,
    "perusahaanId" TEXT NOT NULL,
    "cabangId" TEXT,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "namaLengkap" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STAFF',
    "foto" TEXT,
    "telepon" TEXT,
    "isAktif" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastLogin" TIMESTAMP(3),
    "aksesModul" JSONB,
    "permissions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pengguna_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Karyawan" (
    "id" TEXT NOT NULL,
    "perusahaanId" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tempatLahir" TEXT,
    "tanggalLahir" TIMESTAMP(3),
    "jenisKelamin" TEXT,
    "alamat" TEXT,
    "kota" TEXT,
    "telepon" TEXT,
    "email" TEXT,
    "ktp" TEXT,
    "npwp" TEXT,
    "bpjsKesehatan" TEXT,
    "bpjsKetenagakerjaan" TEXT,
    "tanggalMasuk" TIMESTAMP(3) NOT NULL,
    "tanggalKeluar" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'AKTIF',
    "departemen" TEXT,
    "jabatan" TEXT,
    "level" TEXT,
    "gajiPokok" DECIMAL(18,2) NOT NULL,
    "bankNama" TEXT,
    "bankRekening" TEXT,
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Karyawan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Penggajian" (
    "id" TEXT NOT NULL,
    "karyawanId" TEXT NOT NULL,
    "periode" TEXT NOT NULL,
    "tanggalBayar" TIMESTAMP(3) NOT NULL,
    "gajiPokok" DECIMAL(18,2) NOT NULL,
    "tunjangan" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "lembur" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "bonus" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "totalPenghasilan" DECIMAL(18,2) NOT NULL,
    "potonganBpjs" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "potonganPph21" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "potonganLainnya" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "totalPotongan" DECIMAL(18,2) NOT NULL,
    "netto" DECIMAL(18,2) NOT NULL,
    "keterangan" TEXT,
    "sudahDibayar" BOOLEAN NOT NULL DEFAULT false,
    "sudahDijurnal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Penggajian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gudang" (
    "id" TEXT NOT NULL,
    "cabangId" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "alamat" TEXT,
    "penanggungJawab" TEXT,
    "telepon" TEXT,
    "isUtama" BOOLEAN NOT NULL DEFAULT false,
    "isAktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gudang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Persediaan" (
    "id" TEXT NOT NULL,
    "perusahaanId" TEXT NOT NULL,
    "kodePersediaan" TEXT NOT NULL,
    "namaPersediaan" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "satuan" TEXT NOT NULL,
    "barcode" TEXT,
    "sku" TEXT,
    "hargaBeli" DECIMAL(18,2) NOT NULL,
    "hargaJual" DECIMAL(18,2) NOT NULL,
    "hargaGrosir" DECIMAL(18,2),
    "metode" "MetodePenilaianPersediaan" NOT NULL DEFAULT 'RATA_RATA_BERGERAK',
    "stokMinimum" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "stokMaksimum" DECIMAL(18,4),
    "supplierId" TEXT,
    "isPajakPPN" BOOLEAN NOT NULL DEFAULT false,
    "status" "StatusPersediaan" NOT NULL DEFAULT 'TERSEDIA',
    "deskripsi" TEXT,
    "spesifikasi" TEXT,
    "fotoProduk" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Persediaan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StokPersediaan" (
    "id" TEXT NOT NULL,
    "persediaanId" TEXT NOT NULL,
    "gudangId" TEXT NOT NULL,
    "kuantitas" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "kuantitasDipesan" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "kuantitasReserved" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "nilaiStok" DECIMAL(25,2) NOT NULL DEFAULT 0,
    "hargaRataRata" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StokPersediaan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MutasiPersediaan" (
    "id" TEXT NOT NULL,
    "persediaanId" TEXT NOT NULL,
    "gudangId" TEXT NOT NULL,
    "nomorMutasi" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "tipe" TEXT NOT NULL,
    "referensi" TEXT,
    "kuantitas" DECIMAL(18,4) NOT NULL,
    "harga" DECIMAL(18,2) NOT NULL,
    "nilai" DECIMAL(25,2) NOT NULL,
    "saldoSebelum" DECIMAL(18,4) NOT NULL,
    "saldoSesudah" DECIMAL(18,4) NOT NULL,
    "gudangTujuan" TEXT,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MutasiPersediaan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Produk" (
    "id" TEXT NOT NULL,
    "perusahaanId" TEXT NOT NULL,
    "persediaanId" TEXT,
    "kodeProduk" TEXT NOT NULL,
    "namaProduk" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "subKategori" TEXT,
    "hargaJualEceran" DECIMAL(18,2) NOT NULL,
    "hargaJualGrosir" DECIMAL(18,2),
    "hargaBeli" DECIMAL(18,2),
    "isPPN" BOOLEAN NOT NULL DEFAULT false,
    "satuan" TEXT NOT NULL,
    "deskripsiSingkat" TEXT,
    "fotoUtama" TEXT,
    "isAktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Produk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProdukVariant" (
    "id" TEXT NOT NULL,
    "produkId" TEXT NOT NULL,
    "namaVariant" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "hargaJual" DECIMAL(18,2),
    "atribut" JSONB,
    "isAktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProdukVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransaksiPersediaan" (
    "id" TEXT NOT NULL,
    "produkId" TEXT NOT NULL,
    "voucherId" TEXT,
    "tipe" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "kuantitas" DECIMAL(18,4) NOT NULL,
    "hargaSatuan" DECIMAL(18,2) NOT NULL,
    "total" DECIMAL(25,2) NOT NULL,
    "referensi" TEXT,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransaksiPersediaan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostCenter" (
    "id" TEXT NOT NULL,
    "perusahaanId" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "parentId" TEXT,
    "manager" TEXT,
    "isAktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CostCenter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfitCenter" (
    "id" TEXT NOT NULL,
    "perusahaanId" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "parentId" TEXT,
    "manager" TEXT,
    "isAktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfitCenter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kontrak" (
    "id" TEXT NOT NULL,
    "perusahaanId" TEXT NOT NULL,
    "nomorKontrak" TEXT NOT NULL,
    "namaKontrak" TEXT NOT NULL,
    "pihakKedua" TEXT NOT NULL,
    "tanggalMulai" TIMESTAMP(3) NOT NULL,
    "tanggalAkhir" TIMESTAMP(3) NOT NULL,
    "nilaiKontrak" DECIMAL(25,2) NOT NULL,
    "jenis" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AKTIF',
    "deskripsi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kontrak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankRekening" (
    "id" TEXT NOT NULL,
    "perusahaanId" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "namaBank" TEXT NOT NULL,
    "nomorRekening" TEXT NOT NULL,
    "atasNama" TEXT NOT NULL,
    "cabang" TEXT,
    "swift" TEXT,
    "mataUang" TEXT NOT NULL DEFAULT 'IDR',
    "saldoAwal" DECIMAL(25,2) NOT NULL DEFAULT 0,
    "saldoBerjalan" DECIMAL(25,2) NOT NULL DEFAULT 0,
    "isAktif" BOOLEAN NOT NULL DEFAULT true,
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankRekening_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Departemen" (
    "id" TEXT NOT NULL,
    "perusahaanId" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "parentId" TEXT,
    "kepala" TEXT,
    "deskripsi" TEXT,
    "isAktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Departemen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proyek" (
    "id" TEXT NOT NULL,
    "perusahaanId" TEXT NOT NULL,
    "kodeProyek" TEXT NOT NULL,
    "namaProyek" TEXT NOT NULL,
    "pelangganId" TEXT,
    "tanggalMulai" TIMESTAMP(3) NOT NULL,
    "tanggalSelesai" TIMESTAMP(3),
    "targetSelesai" TIMESTAMP(3),
    "nilaiKontrak" DECIMAL(25,2),
    "totalBiaya" DECIMAL(25,2) NOT NULL DEFAULT 0,
    "totalPendapatan" DECIMAL(25,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "persentaseSelesai" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "manajerProyek" TEXT,
    "lokasi" TEXT,
    "deskripsi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proyek_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProyekTransaksi" (
    "id" TEXT NOT NULL,
    "proyekId" TEXT NOT NULL,
    "transaksiId" TEXT NOT NULL,
    "akunId" TEXT,
    "jumlah" DECIMAL(25,2) NOT NULL,
    "tipeTransaksi" TEXT NOT NULL,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProyekTransaksi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pelanggan" (
    "id" TEXT NOT NULL,
    "perusahaanId" TEXT NOT NULL,
    "kodePelanggan" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "namaPerusahaan" TEXT,
    "tipe" TEXT NOT NULL DEFAULT 'INDIVIDUAL',
    "alamat" TEXT,
    "kota" TEXT,
    "provinsi" TEXT,
    "kodePos" TEXT,
    "telepon" TEXT,
    "email" TEXT,
    "website" TEXT,
    "npwp" TEXT,
    "nik" TEXT,
    "kontakPerson" TEXT,
    "teleponKontak" TEXT,
    "batasKredit" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "termPembayaran" INTEGER NOT NULL DEFAULT 30,
    "kategori" TEXT,
    "grup" TEXT,
    "salesPerson" TEXT,
    "isAktif" BOOLEAN NOT NULL DEFAULT true,
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pelanggan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pemasok" (
    "id" TEXT NOT NULL,
    "perusahaanId" TEXT NOT NULL,
    "kodePemasok" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "namaPerusahaan" TEXT,
    "alamat" TEXT,
    "kota" TEXT,
    "provinsi" TEXT,
    "kodePos" TEXT,
    "telepon" TEXT,
    "email" TEXT,
    "website" TEXT,
    "npwp" TEXT,
    "kontakPerson" TEXT,
    "teleponKontak" TEXT,
    "batasKredit" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "termPembayaran" INTEGER NOT NULL DEFAULT 30,
    "kategori" TEXT,
    "nomorRekening" TEXT,
    "namaBank" TEXT,
    "atasNama" TEXT,
    "isAktif" BOOLEAN NOT NULL DEFAULT true,
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pemasok_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Piutang" (
    "id" TEXT NOT NULL,
    "perusahaanId" TEXT NOT NULL,
    "pelangganId" TEXT NOT NULL,
    "transaksiId" TEXT,
    "nomorPiutang" TEXT NOT NULL,
    "tanggalPiutang" TIMESTAMP(3) NOT NULL,
    "tanggalJatuhTempo" TIMESTAMP(3) NOT NULL,
    "jumlahPiutang" DECIMAL(18,2) NOT NULL,
    "jumlahDibayar" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "sisaPiutang" DECIMAL(18,2) NOT NULL,
    "statusPembayaran" "StatusPembayaran" NOT NULL DEFAULT 'BELUM_DIBAYAR',
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Piutang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PembayaranPiutang" (
    "id" TEXT NOT NULL,
    "piutangId" TEXT NOT NULL,
    "voucherId" TEXT,
    "tanggalBayar" TIMESTAMP(3) NOT NULL,
    "jumlahBayar" DECIMAL(18,2) NOT NULL,
    "mataUangId" TEXT NOT NULL,
    "kurs" DECIMAL(18,6),
    "jumlahAsli" DECIMAL(18,2),
    "tipePembayaran" "TipePembayaran" NOT NULL,
    "nomorReferensi" TEXT,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PembayaranPiutang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hutang" (
    "id" TEXT NOT NULL,
    "perusahaanId" TEXT NOT NULL,
    "pemasokId" TEXT NOT NULL,
    "transaksiId" TEXT,
    "nomorHutang" TEXT NOT NULL,
    "tanggalHutang" TIMESTAMP(3) NOT NULL,
    "tanggalJatuhTempo" TIMESTAMP(3) NOT NULL,
    "jumlahHutang" DECIMAL(18,2) NOT NULL,
    "jumlahDibayar" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "sisaHutang" DECIMAL(18,2) NOT NULL,
    "statusPembayaran" "StatusPembayaran" NOT NULL DEFAULT 'BELUM_DIBAYAR',
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hutang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PembayaranHutang" (
    "id" TEXT NOT NULL,
    "hutangId" TEXT NOT NULL,
    "voucherId" TEXT,
    "tanggalBayar" TIMESTAMP(3) NOT NULL,
    "jumlahBayar" DECIMAL(18,2) NOT NULL,
    "mataUangId" TEXT NOT NULL,
    "kurs" DECIMAL(18,6),
    "jumlahAsli" DECIMAL(18,2),
    "tipePembayaran" "TipePembayaran" NOT NULL,
    "nomorReferensi" TEXT,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PembayaranHutang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Laporan" (
    "id" TEXT NOT NULL,
    "perusahaanId" TEXT NOT NULL,
    "dibuatOlehId" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tipe" "TipeLaporan" NOT NULL,
    "periode" "PeriodeLaporan" NOT NULL,
    "tanggalMulai" TIMESTAMP(3) NOT NULL,
    "tanggalAkhir" TIMESTAMP(3) NOT NULL,
    "status" "StatusLaporan" NOT NULL DEFAULT 'DRAFT',
    "format" TEXT NOT NULL DEFAULT 'pdf',
    "urlFile" TEXT,
    "ukuranFile" INTEGER,
    "parameter" JSONB,
    "filter" JSONB,
    "useTemplate" BOOLEAN NOT NULL DEFAULT true,
    "templateId" TEXT,
    "customQuery" TEXT,
    "deskripsi" TEXT,
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Laporan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateLaporan" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tipe" "TipeLaporan" NOT NULL,
    "kategori" TEXT,
    "deskripsi" TEXT,
    "query" TEXT,
    "parameter" JSONB,
    "format" JSONB,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TemplateLaporan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardWidget" (
    "id" TEXT NOT NULL,
    "perusahaanId" TEXT NOT NULL,
    "penggunaId" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tipe" "TipeWidget" NOT NULL,
    "kategori" TEXT,
    "query" TEXT,
    "dataSource" JSONB,
    "konfigurasi" JSONB NOT NULL,
    "posisi" INTEGER NOT NULL,
    "lebar" INTEGER NOT NULL DEFAULT 4,
    "tinggi" INTEGER NOT NULL DEFAULT 3,
    "refreshInterval" INTEGER,
    "isAktif" BOOLEAN NOT NULL DEFAULT true,
    "isPublik" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DashboardWidget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaketFitur" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "tier" "TierPaket" NOT NULL,
    "hargaBulanan" DECIMAL(18,2),
    "hargaTahunan" DECIMAL(18,2),
    "maxUser" INTEGER,
    "maxTransaksiPerBulan" INTEGER,
    "maxStorageGB" INTEGER,
    "maxCabang" INTEGER,
    "maxPerusahaan" INTEGER,
    "fiturAktif" JSONB,
    "isPublik" BOOLEAN NOT NULL DEFAULT true,
    "isAktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaketFitur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FiturModul" (
    "id" TEXT NOT NULL,
    "paketId" TEXT,
    "kodeModul" TEXT NOT NULL,
    "namaModul" TEXT NOT NULL,
    "deskripsi" TEXT,
    "isAktif" BOOLEAN NOT NULL DEFAULT true,
    "batasUser" INTEGER,
    "batasTransaksi" INTEGER,
    "batasData" INTEGER,
    "fiturTambahan" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FiturModul_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerusahaanPaket" (
    "id" TEXT NOT NULL,
    "perusahaanId" TEXT NOT NULL,
    "paketId" TEXT NOT NULL,
    "tanggalMulai" TIMESTAMP(3) NOT NULL,
    "tanggalAkhir" TIMESTAMP(3),
    "isAktif" BOOLEAN NOT NULL DEFAULT true,
    "autoRenewal" BOOLEAN NOT NULL DEFAULT false,
    "isTrial" BOOLEAN NOT NULL DEFAULT false,
    "customFitur" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerusahaanPaket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AsetTetap" (
    "id" TEXT NOT NULL,
    "perusahaanId" TEXT NOT NULL,
    "kodeAset" TEXT NOT NULL,
    "namaAset" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "tanggalPerolehan" TIMESTAMP(3) NOT NULL,
    "nilaiPerolehan" DECIMAL(25,2) NOT NULL,
    "supplierId" TEXT,
    "metodePenyusutan" "MetodePenyusutan" NOT NULL,
    "umurEkonomis" INTEGER NOT NULL,
    "nilaiResidu" DECIMAL(25,2) NOT NULL DEFAULT 0,
    "akumulasiPenyusutan" DECIMAL(25,2) NOT NULL DEFAULT 0,
    "nilaiBuku" DECIMAL(25,2) NOT NULL,
    "lokasi" TEXT,
    "departemen" TEXT,
    "penanggungJawab" TEXT,
    "nomorSeri" TEXT,
    "merk" TEXT,
    "model" TEXT,
    "spesifikasi" TEXT,
    "status" "StatusAsetTetap" NOT NULL DEFAULT 'AKTIF',
    "tanggalPenjualan" TIMESTAMP(3),
    "nilaiPenjualan" DECIMAL(25,2),
    "catatan" TEXT,
    "fotoAset" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AsetTetap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PenyusutanAset" (
    "id" TEXT NOT NULL,
    "asetTetapId" TEXT NOT NULL,
    "periode" TIMESTAMP(3) NOT NULL,
    "bulan" INTEGER NOT NULL,
    "tahun" INTEGER NOT NULL,
    "nilaiAwal" DECIMAL(25,2) NOT NULL,
    "bebanPenyusutan" DECIMAL(25,2) NOT NULL,
    "akumulasi" DECIMAL(25,2) NOT NULL,
    "nilaiBuku" DECIMAL(25,2) NOT NULL,
    "isPosted" BOOLEAN NOT NULL DEFAULT false,
    "postedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PenyusutanAset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AsetTidakBerwujud" (
    "id" TEXT NOT NULL,
    "perusahaanId" TEXT NOT NULL,
    "kodeAset" TEXT NOT NULL,
    "namaAset" TEXT NOT NULL,
    "jenis" TEXT NOT NULL,
    "tanggalPerolehan" TIMESTAMP(3) NOT NULL,
    "nilaiPerolehan" DECIMAL(25,2) NOT NULL,
    "umurManfaat" INTEGER NOT NULL,
    "nilaiResidu" DECIMAL(25,2) NOT NULL DEFAULT 0,
    "akumulasiAmortisasi" DECIMAL(25,2) NOT NULL DEFAULT 0,
    "nilaiBuku" DECIMAL(25,2) NOT NULL,
    "nomorHakPaten" TEXT,
    "masaBerlaku" TIMESTAMP(3),
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AsetTidakBerwujud_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AmortisasiAset" (
    "id" TEXT NOT NULL,
    "asetTidakBerwujudId" TEXT NOT NULL,
    "periode" TIMESTAMP(3) NOT NULL,
    "bulan" INTEGER NOT NULL,
    "tahun" INTEGER NOT NULL,
    "nilaiAwal" DECIMAL(25,2) NOT NULL,
    "bebanAmortisasi" DECIMAL(25,2) NOT NULL,
    "akumulasi" DECIMAL(25,2) NOT NULL,
    "nilaiBuku" DECIMAL(25,2) NOT NULL,
    "isPosted" BOOLEAN NOT NULL DEFAULT false,
    "postedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AmortisasiAset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransaksiRekuren" (
    "id" TEXT NOT NULL,
    "perusahaanId" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tipe" "TipeTransaksi" NOT NULL,
    "templateTransaksi" JSONB NOT NULL,
    "frekuensi" "FrekuensiRekuren" NOT NULL,
    "intervalHari" INTEGER,
    "hariDalamBulan" INTEGER,
    "tanggalMulai" TIMESTAMP(3) NOT NULL,
    "tanggalAkhir" TIMESTAMP(3),
    "tanggalExekusiBerikutnya" TIMESTAMP(3) NOT NULL,
    "isAktif" BOOLEAN NOT NULL DEFAULT true,
    "autoPosting" BOOLEAN NOT NULL DEFAULT false,
    "jumlahEksekusi" INTEGER NOT NULL DEFAULT 0,
    "jumlahBerhasil" INTEGER NOT NULL DEFAULT 0,
    "jumlahGagal" INTEGER NOT NULL DEFAULT 0,
    "notifikasiEmail" BOOLEAN NOT NULL DEFAULT true,
    "emailTujuan" TEXT,
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransaksiRekuren_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiwayatTransaksiRekuren" (
    "id" TEXT NOT NULL,
    "rekurenId" TEXT NOT NULL,
    "transaksiId" TEXT,
    "tanggalDijadwalkan" TIMESTAMP(3) NOT NULL,
    "tanggalDiproses" TIMESTAMP(3),
    "status" "StatusRekuren" NOT NULL,
    "errorMessage" TEXT,
    "dataTransaksi" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiwayatTransaksiRekuren_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalTemplate" (
    "id" TEXT NOT NULL,
    "perusahaanId" TEXT NOT NULL,
    "modul" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "rules" JSONB NOT NULL,
    "isAktif" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApprovalTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalLevel" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "nama" TEXT NOT NULL,
    "approverRoles" JSONB NOT NULL,
    "minApprover" INTEGER NOT NULL DEFAULT 1,
    "kondisi" JSONB,
    "isParalel" BOOLEAN NOT NULL DEFAULT false,
    "timeoutHari" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApprovalLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalFlow" (
    "id" TEXT NOT NULL,
    "modul" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "approverId" TEXT NOT NULL,
    "status" "StatusApproval" NOT NULL DEFAULT 'PENDING',
    "tanggal" TIMESTAMP(3),
    "catatan" TEXT,
    "voucherId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApprovalFlow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DokumenTransaksi" (
    "id" TEXT NOT NULL,
    "transaksiId" TEXT,
    "voucherId" TEXT,
    "asetTetapId" TEXT,
    "nama" TEXT NOT NULL,
    "jenisFile" TEXT NOT NULL,
    "ukuranFile" INTEGER NOT NULL,
    "urlFile" TEXT NOT NULL,
    "kategori" "KategoriDokumen" NOT NULL DEFAULT 'LAINNYA',
    "deskripsi" TEXT,
    "uploadedById" TEXT NOT NULL,
    "isPublik" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DokumenTransaksi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notifikasi" (
    "id" TEXT NOT NULL,
    "penggunaId" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "pesan" TEXT NOT NULL,
    "tipe" TEXT NOT NULL,
    "kategori" TEXT,
    "referensiId" TEXT,
    "urlAction" TEXT,
    "dibaca" BOOLEAN NOT NULL DEFAULT false,
    "tanggalDibaca" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notifikasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JejakAudit" (
    "id" TEXT NOT NULL,
    "perusahaanId" TEXT NOT NULL,
    "penggunaId" TEXT,
    "aksi" TEXT NOT NULL,
    "modul" TEXT NOT NULL,
    "subModul" TEXT,
    "namaTabel" TEXT NOT NULL,
    "idData" TEXT NOT NULL,
    "dataSebelum" JSONB,
    "dataSesudah" JSONB,
    "perubahan" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "lokasi" TEXT,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JejakAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SistemSetting" (
    "id" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "kunci" TEXT NOT NULL,
    "nilai" TEXT NOT NULL,
    "tipeData" TEXT NOT NULL DEFAULT 'string',
    "deskripsi" TEXT,
    "defaultValue" TEXT,
    "validasiRule" TEXT,
    "isPublik" BOOLEAN NOT NULL DEFAULT false,
    "isSensitive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SistemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BackupLog" (
    "id" TEXT NOT NULL,
    "namaFile" TEXT NOT NULL,
    "ukuran" BIGINT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "tipe" TEXT NOT NULL DEFAULT 'FULL',
    "status" TEXT NOT NULL,
    "pesanError" TEXT,
    "waktuMulai" TIMESTAMP(3) NOT NULL,
    "waktuSelesai" TIMESTAMP(3),
    "durasi" INTEGER,
    "dibuatOleh" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BackupLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterPajak" (
    "id" TEXT NOT NULL,
    "perusahaanId" TEXT NOT NULL,
    "kodePajak" TEXT NOT NULL,
    "namaPajak" TEXT NOT NULL,
    "jenis" "JenisPajak" NOT NULL,
    "tarif" DECIMAL(5,2) NOT NULL,
    "akunPajak" TEXT,
    "isAktif" BOOLEAN NOT NULL DEFAULT true,
    "isPemungut" BOOLEAN NOT NULL DEFAULT false,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterPajak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransaksiPajak" (
    "id" TEXT NOT NULL,
    "transaksiId" TEXT NOT NULL,
    "pajakId" TEXT NOT NULL,
    "dasar" DECIMAL(25,2) NOT NULL,
    "tarif" DECIMAL(5,2) NOT NULL,
    "jumlah" DECIMAL(25,2) NOT NULL,
    "nomorFaktur" TEXT,
    "tanggalFaktur" TIMESTAMP(3),
    "statusFaktur" "StatusFakturPajak",
    "isCreditable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransaksiPajak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FakturPajak" (
    "id" TEXT NOT NULL,
    "perusahaanId" TEXT NOT NULL,
    "transaksiPajakId" TEXT NOT NULL,
    "nomorSeri" TEXT NOT NULL,
    "tanggalFaktur" TIMESTAMP(3) NOT NULL,
    "dpp" DECIMAL(18,2) NOT NULL,
    "ppn" DECIMAL(18,2) NOT NULL,
    "ppnBm" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "namaLawanTransaksi" TEXT NOT NULL,
    "npwpLawanTransaksi" TEXT,
    "alamatLawanTransaksi" TEXT,
    "status" "StatusFakturPajak" NOT NULL DEFAULT 'NORMAL',
    "isUploaded" BOOLEAN NOT NULL DEFAULT false,
    "uploadedAt" TIMESTAMP(3),
    "nomorApproval" TEXT,
    "fakturPengganti" TEXT,
    "alasanPengganti" TEXT,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FakturPajak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaporanPajak" (
    "id" TEXT NOT NULL,
    "perusahaanId" TEXT NOT NULL,
    "jenisPajak" TEXT NOT NULL,
    "masaPajak" INTEGER NOT NULL,
    "tahunPajak" INTEGER NOT NULL,
    "statusLaporan" TEXT NOT NULL DEFAULT 'DRAFT',
    "tanggalLapor" TIMESTAMP(3),
    "nomorBuktiPenerimaan" TEXT,
    "dpp" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "pajak" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "dokumen" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LaporanPajak_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChartOfAccounts_perusahaanId_tipe_idx" ON "ChartOfAccounts"("perusahaanId", "tipe");

-- CreateIndex
CREATE INDEX "ChartOfAccounts_kodeAkun_idx" ON "ChartOfAccounts"("kodeAkun");

-- CreateIndex
CREATE INDEX "ChartOfAccounts_parentId_idx" ON "ChartOfAccounts"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "ChartOfAccounts_perusahaanId_kodeAkun_key" ON "ChartOfAccounts"("perusahaanId", "kodeAkun");

-- CreateIndex
CREATE INDEX "Transaksi_perusahaanId_tanggal_idx" ON "Transaksi"("perusahaanId", "tanggal");

-- CreateIndex
CREATE INDEX "Transaksi_perusahaanId_tanggal_tipe_idx" ON "Transaksi"("perusahaanId", "tanggal", "tipe");

-- CreateIndex
CREATE INDEX "Transaksi_pelangganId_idx" ON "Transaksi"("pelangganId");

-- CreateIndex
CREATE INDEX "Transaksi_pemasokId_idx" ON "Transaksi"("pemasokId");

-- CreateIndex
CREATE INDEX "Transaksi_statusPembayaran_idx" ON "Transaksi"("statusPembayaran");

-- CreateIndex
CREATE INDEX "Transaksi_referensi_idx" ON "Transaksi"("referensi");

-- CreateIndex
CREATE INDEX "Transaksi_tanggalJatuhTempo_idx" ON "Transaksi"("tanggalJatuhTempo");

-- CreateIndex
CREATE UNIQUE INDEX "Transaksi_perusahaanId_nomorTransaksi_key" ON "Transaksi"("perusahaanId", "nomorTransaksi");

-- CreateIndex
CREATE INDEX "TransaksiDetail_transaksiId_idx" ON "TransaksiDetail"("transaksiId");

-- CreateIndex
CREATE INDEX "TransaksiDetail_akunId_idx" ON "TransaksiDetail"("akunId");

-- CreateIndex
CREATE INDEX "TransaksiDetail_persediaanId_idx" ON "TransaksiDetail"("persediaanId");

-- CreateIndex
CREATE INDEX "Pembayaran_transaksiId_idx" ON "Pembayaran"("transaksiId");

-- CreateIndex
CREATE INDEX "Pembayaran_tanggal_idx" ON "Pembayaran"("tanggal");

-- CreateIndex
CREATE INDEX "Pembayaran_nomorPembayaran_idx" ON "Pembayaran"("nomorPembayaran");

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_transaksiId_key" ON "Voucher"("transaksiId");

-- CreateIndex
CREATE INDEX "Voucher_perusahaanId_tanggal_idx" ON "Voucher"("perusahaanId", "tanggal");

-- CreateIndex
CREATE INDEX "Voucher_status_idx" ON "Voucher"("status");

-- CreateIndex
CREATE INDEX "Voucher_tipe_idx" ON "Voucher"("tipe");

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_perusahaanId_nomorVoucher_key" ON "Voucher"("perusahaanId", "nomorVoucher");

-- CreateIndex
CREATE INDEX "VoucherDetail_voucherId_idx" ON "VoucherDetail"("voucherId");

-- CreateIndex
CREATE INDEX "VoucherDetail_akunId_idx" ON "VoucherDetail"("akunId");

-- CreateIndex
CREATE INDEX "JurnalUmum_perusahaanId_tanggal_idx" ON "JurnalUmum"("perusahaanId", "tanggal");

-- CreateIndex
CREATE INDEX "JurnalUmum_periodeId_idx" ON "JurnalUmum"("periodeId");

-- CreateIndex
CREATE UNIQUE INDEX "JurnalUmum_perusahaanId_nomorJurnal_key" ON "JurnalUmum"("perusahaanId", "nomorJurnal");

-- CreateIndex
CREATE INDEX "JurnalDetail_akunId_createdAt_idx" ON "JurnalDetail"("akunId", "createdAt");

-- CreateIndex
CREATE INDEX "JurnalDetail_jurnalId_idx" ON "JurnalDetail"("jurnalId");

-- CreateIndex
CREATE INDEX "JurnalDetail_akunId_idx" ON "JurnalDetail"("akunId");

-- CreateIndex
CREATE INDEX "JurnalDetail_debit_kredit_idx" ON "JurnalDetail"("debit", "kredit");

-- CreateIndex
CREATE INDEX "PeriodeAkuntansi_perusahaanId_status_idx" ON "PeriodeAkuntansi"("perusahaanId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PeriodeAkuntansi_perusahaanId_tahun_bulan_key" ON "PeriodeAkuntansi"("perusahaanId", "tahun", "bulan");

-- CreateIndex
CREATE INDEX "Budget_perusahaanId_tahun_idx" ON "Budget"("perusahaanId", "tahun");

-- CreateIndex
CREATE INDEX "Budget_status_idx" ON "Budget"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Budget_perusahaanId_kode_key" ON "Budget"("perusahaanId", "kode");

-- CreateIndex
CREATE INDEX "BudgetDetail_budgetId_idx" ON "BudgetDetail"("budgetId");

-- CreateIndex
CREATE INDEX "BudgetDetail_akunId_idx" ON "BudgetDetail"("akunId");

-- CreateIndex
CREATE UNIQUE INDEX "BudgetDetail_budgetId_akunId_periode_key" ON "BudgetDetail"("budgetId", "akunId", "periode");

-- CreateIndex
CREATE INDEX "BudgetRevisi_budgetId_idx" ON "BudgetRevisi"("budgetId");

-- CreateIndex
CREATE INDEX "BudgetRealisasi_budgetId_bulan_idx" ON "BudgetRealisasi"("budgetId", "bulan");

-- CreateIndex
CREATE INDEX "BudgetRealisasi_transaksiId_idx" ON "BudgetRealisasi"("transaksiId");

-- CreateIndex
CREATE UNIQUE INDEX "MataUang_kode_key" ON "MataUang"("kode");

-- CreateIndex
CREATE INDEX "MataUang_kode_isAktif_idx" ON "MataUang"("kode", "isAktif");

-- CreateIndex
CREATE INDEX "KursHistory_mataUangId_idx" ON "KursHistory"("mataUangId");

-- CreateIndex
CREATE INDEX "KursHistory_tanggal_idx" ON "KursHistory"("tanggal");

-- CreateIndex
CREATE UNIQUE INDEX "KursHistory_mataUangId_tanggal_key" ON "KursHistory"("mataUangId", "tanggal");

-- CreateIndex
CREATE UNIQUE INDEX "Perusahaan_kode_key" ON "Perusahaan"("kode");

-- CreateIndex
CREATE INDEX "Perusahaan_kode_idx" ON "Perusahaan"("kode");

-- CreateIndex
CREATE INDEX "Perusahaan_npwp_idx" ON "Perusahaan"("npwp");

-- CreateIndex
CREATE UNIQUE INDEX "PengaturanPerusahaan_perusahaanId_key" ON "PengaturanPerusahaan"("perusahaanId");

-- CreateIndex
CREATE INDEX "Cabang_perusahaanId_idx" ON "Cabang"("perusahaanId");

-- CreateIndex
CREATE UNIQUE INDEX "Cabang_perusahaanId_kode_key" ON "Cabang"("perusahaanId", "kode");

-- CreateIndex
CREATE UNIQUE INDEX "Pengguna_username_key" ON "Pengguna"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Pengguna_email_key" ON "Pengguna"("email");

-- CreateIndex
CREATE INDEX "Pengguna_perusahaanId_idx" ON "Pengguna"("perusahaanId");

-- CreateIndex
CREATE INDEX "Pengguna_email_idx" ON "Pengguna"("email");

-- CreateIndex
CREATE INDEX "Karyawan_perusahaanId_idx" ON "Karyawan"("perusahaanId");

-- CreateIndex
CREATE INDEX "Karyawan_nama_idx" ON "Karyawan"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "Karyawan_perusahaanId_nik_key" ON "Karyawan"("perusahaanId", "nik");

-- CreateIndex
CREATE INDEX "Penggajian_periode_idx" ON "Penggajian"("periode");

-- CreateIndex
CREATE UNIQUE INDEX "Penggajian_karyawanId_periode_key" ON "Penggajian"("karyawanId", "periode");

-- CreateIndex
CREATE INDEX "Gudang_cabangId_idx" ON "Gudang"("cabangId");

-- CreateIndex
CREATE UNIQUE INDEX "Gudang_cabangId_kode_key" ON "Gudang"("cabangId", "kode");

-- CreateIndex
CREATE INDEX "Persediaan_perusahaanId_kategori_idx" ON "Persediaan"("perusahaanId", "kategori");

-- CreateIndex
CREATE INDEX "Persediaan_barcode_idx" ON "Persediaan"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "Persediaan_perusahaanId_kodePersediaan_key" ON "Persediaan"("perusahaanId", "kodePersediaan");

-- CreateIndex
CREATE INDEX "StokPersediaan_gudangId_idx" ON "StokPersediaan"("gudangId");

-- CreateIndex
CREATE UNIQUE INDEX "StokPersediaan_persediaanId_gudangId_key" ON "StokPersediaan"("persediaanId", "gudangId");

-- CreateIndex
CREATE INDEX "MutasiPersediaan_persediaanId_tanggal_idx" ON "MutasiPersediaan"("persediaanId", "tanggal");

-- CreateIndex
CREATE INDEX "MutasiPersediaan_gudangId_idx" ON "MutasiPersediaan"("gudangId");

-- CreateIndex
CREATE INDEX "MutasiPersediaan_nomorMutasi_idx" ON "MutasiPersediaan"("nomorMutasi");

-- CreateIndex
CREATE UNIQUE INDEX "Produk_persediaanId_key" ON "Produk"("persediaanId");

-- CreateIndex
CREATE INDEX "Produk_perusahaanId_kategori_idx" ON "Produk"("perusahaanId", "kategori");

-- CreateIndex
CREATE INDEX "Produk_isAktif_idx" ON "Produk"("isAktif");

-- CreateIndex
CREATE UNIQUE INDEX "Produk_perusahaanId_kodeProduk_key" ON "Produk"("perusahaanId", "kodeProduk");

-- CreateIndex
CREATE UNIQUE INDEX "ProdukVariant_sku_key" ON "ProdukVariant"("sku");

-- CreateIndex
CREATE INDEX "ProdukVariant_produkId_idx" ON "ProdukVariant"("produkId");

-- CreateIndex
CREATE INDEX "TransaksiPersediaan_produkId_idx" ON "TransaksiPersediaan"("produkId");

-- CreateIndex
CREATE INDEX "TransaksiPersediaan_voucherId_idx" ON "TransaksiPersediaan"("voucherId");

-- CreateIndex
CREATE INDEX "TransaksiPersediaan_tanggal_idx" ON "TransaksiPersediaan"("tanggal");

-- CreateIndex
CREATE INDEX "TransaksiPersediaan_tipe_idx" ON "TransaksiPersediaan"("tipe");

-- CreateIndex
CREATE INDEX "CostCenter_perusahaanId_idx" ON "CostCenter"("perusahaanId");

-- CreateIndex
CREATE UNIQUE INDEX "CostCenter_perusahaanId_kode_key" ON "CostCenter"("perusahaanId", "kode");

-- CreateIndex
CREATE INDEX "ProfitCenter_perusahaanId_idx" ON "ProfitCenter"("perusahaanId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfitCenter_perusahaanId_kode_key" ON "ProfitCenter"("perusahaanId", "kode");

-- CreateIndex
CREATE INDEX "Kontrak_perusahaanId_status_idx" ON "Kontrak"("perusahaanId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Kontrak_perusahaanId_nomorKontrak_key" ON "Kontrak"("perusahaanId", "nomorKontrak");

-- CreateIndex
CREATE INDEX "BankRekening_perusahaanId_idx" ON "BankRekening"("perusahaanId");

-- CreateIndex
CREATE INDEX "BankRekening_nomorRekening_idx" ON "BankRekening"("nomorRekening");

-- CreateIndex
CREATE UNIQUE INDEX "BankRekening_perusahaanId_kode_key" ON "BankRekening"("perusahaanId", "kode");

-- CreateIndex
CREATE INDEX "Departemen_perusahaanId_idx" ON "Departemen"("perusahaanId");

-- CreateIndex
CREATE INDEX "Departemen_parentId_idx" ON "Departemen"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "Departemen_perusahaanId_kode_key" ON "Departemen"("perusahaanId", "kode");

-- CreateIndex
CREATE INDEX "Proyek_perusahaanId_status_idx" ON "Proyek"("perusahaanId", "status");

-- CreateIndex
CREATE INDEX "Proyek_pelangganId_idx" ON "Proyek"("pelangganId");

-- CreateIndex
CREATE UNIQUE INDEX "Proyek_perusahaanId_kodeProyek_key" ON "Proyek"("perusahaanId", "kodeProyek");

-- CreateIndex
CREATE INDEX "ProyekTransaksi_proyekId_idx" ON "ProyekTransaksi"("proyekId");

-- CreateIndex
CREATE INDEX "ProyekTransaksi_transaksiId_idx" ON "ProyekTransaksi"("transaksiId");

-- CreateIndex
CREATE INDEX "ProyekTransaksi_akunId_idx" ON "ProyekTransaksi"("akunId");

-- CreateIndex
CREATE INDEX "Pelanggan_perusahaanId_nama_idx" ON "Pelanggan"("perusahaanId", "nama");

-- CreateIndex
CREATE INDEX "Pelanggan_email_idx" ON "Pelanggan"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Pelanggan_perusahaanId_kodePelanggan_key" ON "Pelanggan"("perusahaanId", "kodePelanggan");

-- CreateIndex
CREATE INDEX "Pemasok_perusahaanId_nama_idx" ON "Pemasok"("perusahaanId", "nama");

-- CreateIndex
CREATE INDEX "Pemasok_email_idx" ON "Pemasok"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Pemasok_perusahaanId_kodePemasok_key" ON "Pemasok"("perusahaanId", "kodePemasok");

-- CreateIndex
CREATE INDEX "Piutang_perusahaanId_statusPembayaran_idx" ON "Piutang"("perusahaanId", "statusPembayaran");

-- CreateIndex
CREATE INDEX "Piutang_pelangganId_idx" ON "Piutang"("pelangganId");

-- CreateIndex
CREATE INDEX "Piutang_transaksiId_idx" ON "Piutang"("transaksiId");

-- CreateIndex
CREATE INDEX "Piutang_tanggalJatuhTempo_idx" ON "Piutang"("tanggalJatuhTempo");

-- CreateIndex
CREATE UNIQUE INDEX "Piutang_perusahaanId_nomorPiutang_key" ON "Piutang"("perusahaanId", "nomorPiutang");

-- CreateIndex
CREATE INDEX "PembayaranPiutang_piutangId_idx" ON "PembayaranPiutang"("piutangId");

-- CreateIndex
CREATE INDEX "PembayaranPiutang_voucherId_idx" ON "PembayaranPiutang"("voucherId");

-- CreateIndex
CREATE INDEX "PembayaranPiutang_tanggalBayar_idx" ON "PembayaranPiutang"("tanggalBayar");

-- CreateIndex
CREATE INDEX "Hutang_perusahaanId_statusPembayaran_idx" ON "Hutang"("perusahaanId", "statusPembayaran");

-- CreateIndex
CREATE INDEX "Hutang_pemasokId_idx" ON "Hutang"("pemasokId");

-- CreateIndex
CREATE INDEX "Hutang_transaksiId_idx" ON "Hutang"("transaksiId");

-- CreateIndex
CREATE INDEX "Hutang_tanggalJatuhTempo_idx" ON "Hutang"("tanggalJatuhTempo");

-- CreateIndex
CREATE UNIQUE INDEX "Hutang_perusahaanId_nomorHutang_key" ON "Hutang"("perusahaanId", "nomorHutang");

-- CreateIndex
CREATE INDEX "PembayaranHutang_hutangId_idx" ON "PembayaranHutang"("hutangId");

-- CreateIndex
CREATE INDEX "PembayaranHutang_voucherId_idx" ON "PembayaranHutang"("voucherId");

-- CreateIndex
CREATE INDEX "PembayaranHutang_tanggalBayar_idx" ON "PembayaranHutang"("tanggalBayar");

-- CreateIndex
CREATE INDEX "Laporan_perusahaanId_tipe_idx" ON "Laporan"("perusahaanId", "tipe");

-- CreateIndex
CREATE INDEX "Laporan_tanggalMulai_tanggalAkhir_idx" ON "Laporan"("tanggalMulai", "tanggalAkhir");

-- CreateIndex
CREATE UNIQUE INDEX "Laporan_perusahaanId_kode_key" ON "Laporan"("perusahaanId", "kode");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateLaporan_kode_key" ON "TemplateLaporan"("kode");

-- CreateIndex
CREATE INDEX "TemplateLaporan_tipe_idx" ON "TemplateLaporan"("tipe");

-- CreateIndex
CREATE INDEX "DashboardWidget_perusahaanId_penggunaId_idx" ON "DashboardWidget"("perusahaanId", "penggunaId");

-- CreateIndex
CREATE INDEX "DashboardWidget_kategori_idx" ON "DashboardWidget"("kategori");

-- CreateIndex
CREATE UNIQUE INDEX "DashboardWidget_perusahaanId_penggunaId_nama_key" ON "DashboardWidget"("perusahaanId", "penggunaId", "nama");

-- CreateIndex
CREATE UNIQUE INDEX "PaketFitur_kode_key" ON "PaketFitur"("kode");

-- CreateIndex
CREATE INDEX "PaketFitur_tier_isAktif_idx" ON "PaketFitur"("tier", "isAktif");

-- CreateIndex
CREATE INDEX "FiturModul_kodeModul_idx" ON "FiturModul"("kodeModul");

-- CreateIndex
CREATE UNIQUE INDEX "FiturModul_paketId_kodeModul_key" ON "FiturModul"("paketId", "kodeModul");

-- CreateIndex
CREATE INDEX "PerusahaanPaket_perusahaanId_isAktif_idx" ON "PerusahaanPaket"("perusahaanId", "isAktif");

-- CreateIndex
CREATE INDEX "PerusahaanPaket_tanggalAkhir_idx" ON "PerusahaanPaket"("tanggalAkhir");

-- CreateIndex
CREATE UNIQUE INDEX "PerusahaanPaket_perusahaanId_paketId_tanggalMulai_key" ON "PerusahaanPaket"("perusahaanId", "paketId", "tanggalMulai");

-- CreateIndex
CREATE INDEX "AsetTetap_perusahaanId_kategori_idx" ON "AsetTetap"("perusahaanId", "kategori");

-- CreateIndex
CREATE INDEX "AsetTetap_status_idx" ON "AsetTetap"("status");

-- CreateIndex
CREATE UNIQUE INDEX "AsetTetap_perusahaanId_kodeAset_key" ON "AsetTetap"("perusahaanId", "kodeAset");

-- CreateIndex
CREATE INDEX "PenyusutanAset_asetTetapId_tahun_bulan_idx" ON "PenyusutanAset"("asetTetapId", "tahun", "bulan");

-- CreateIndex
CREATE UNIQUE INDEX "PenyusutanAset_asetTetapId_periode_key" ON "PenyusutanAset"("asetTetapId", "periode");

-- CreateIndex
CREATE INDEX "AsetTidakBerwujud_perusahaanId_jenis_idx" ON "AsetTidakBerwujud"("perusahaanId", "jenis");

-- CreateIndex
CREATE UNIQUE INDEX "AsetTidakBerwujud_perusahaanId_kodeAset_key" ON "AsetTidakBerwujud"("perusahaanId", "kodeAset");

-- CreateIndex
CREATE INDEX "AmortisasiAset_asetTidakBerwujudId_tahun_bulan_idx" ON "AmortisasiAset"("asetTidakBerwujudId", "tahun", "bulan");

-- CreateIndex
CREATE UNIQUE INDEX "AmortisasiAset_asetTidakBerwujudId_periode_key" ON "AmortisasiAset"("asetTidakBerwujudId", "periode");

-- CreateIndex
CREATE INDEX "TransaksiRekuren_perusahaanId_isAktif_idx" ON "TransaksiRekuren"("perusahaanId", "isAktif");

-- CreateIndex
CREATE INDEX "TransaksiRekuren_tanggalExekusiBerikutnya_idx" ON "TransaksiRekuren"("tanggalExekusiBerikutnya");

-- CreateIndex
CREATE UNIQUE INDEX "TransaksiRekuren_perusahaanId_kode_key" ON "TransaksiRekuren"("perusahaanId", "kode");

-- CreateIndex
CREATE INDEX "RiwayatTransaksiRekuren_rekurenId_idx" ON "RiwayatTransaksiRekuren"("rekurenId");

-- CreateIndex
CREATE INDEX "RiwayatTransaksiRekuren_tanggalDijadwalkan_idx" ON "RiwayatTransaksiRekuren"("tanggalDijadwalkan");

-- CreateIndex
CREATE INDEX "RiwayatTransaksiRekuren_status_idx" ON "RiwayatTransaksiRekuren"("status");

-- CreateIndex
CREATE INDEX "ApprovalTemplate_perusahaanId_modul_idx" ON "ApprovalTemplate"("perusahaanId", "modul");

-- CreateIndex
CREATE UNIQUE INDEX "ApprovalTemplate_perusahaanId_modul_nama_key" ON "ApprovalTemplate"("perusahaanId", "modul", "nama");

-- CreateIndex
CREATE INDEX "ApprovalLevel_templateId_idx" ON "ApprovalLevel"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "ApprovalLevel_templateId_level_key" ON "ApprovalLevel"("templateId", "level");

-- CreateIndex
CREATE INDEX "ApprovalFlow_modul_recordId_idx" ON "ApprovalFlow"("modul", "recordId");

-- CreateIndex
CREATE INDEX "ApprovalFlow_approverId_status_idx" ON "ApprovalFlow"("approverId", "status");

-- CreateIndex
CREATE INDEX "ApprovalFlow_voucherId_idx" ON "ApprovalFlow"("voucherId");

-- CreateIndex
CREATE INDEX "DokumenTransaksi_transaksiId_idx" ON "DokumenTransaksi"("transaksiId");

-- CreateIndex
CREATE INDEX "DokumenTransaksi_voucherId_idx" ON "DokumenTransaksi"("voucherId");

-- CreateIndex
CREATE INDEX "DokumenTransaksi_asetTetapId_idx" ON "DokumenTransaksi"("asetTetapId");

-- CreateIndex
CREATE INDEX "DokumenTransaksi_kategori_idx" ON "DokumenTransaksi"("kategori");

-- CreateIndex
CREATE INDEX "DokumenTransaksi_uploadedById_idx" ON "DokumenTransaksi"("uploadedById");

-- CreateIndex
CREATE INDEX "Notifikasi_penggunaId_dibaca_idx" ON "Notifikasi"("penggunaId", "dibaca");

-- CreateIndex
CREATE INDEX "Notifikasi_kategori_idx" ON "Notifikasi"("kategori");

-- CreateIndex
CREATE INDEX "Notifikasi_createdAt_idx" ON "Notifikasi"("createdAt");

-- CreateIndex
CREATE INDEX "JejakAudit_perusahaanId_namaTabel_idData_idx" ON "JejakAudit"("perusahaanId", "namaTabel", "idData");

-- CreateIndex
CREATE INDEX "JejakAudit_penggunaId_idx" ON "JejakAudit"("penggunaId");

-- CreateIndex
CREATE INDEX "JejakAudit_createdAt_idx" ON "JejakAudit"("createdAt");

-- CreateIndex
CREATE INDEX "JejakAudit_modul_subModul_idx" ON "JejakAudit"("modul", "subModul");

-- CreateIndex
CREATE INDEX "JejakAudit_aksi_idx" ON "JejakAudit"("aksi");

-- CreateIndex
CREATE INDEX "SistemSetting_kategori_idx" ON "SistemSetting"("kategori");

-- CreateIndex
CREATE UNIQUE INDEX "SistemSetting_kategori_kunci_key" ON "SistemSetting"("kategori", "kunci");

-- CreateIndex
CREATE INDEX "BackupLog_status_idx" ON "BackupLog"("status");

-- CreateIndex
CREATE INDEX "BackupLog_waktuMulai_idx" ON "BackupLog"("waktuMulai");

-- CreateIndex
CREATE INDEX "MasterPajak_perusahaanId_jenis_idx" ON "MasterPajak"("perusahaanId", "jenis");

-- CreateIndex
CREATE UNIQUE INDEX "MasterPajak_perusahaanId_kodePajak_key" ON "MasterPajak"("perusahaanId", "kodePajak");

-- CreateIndex
CREATE INDEX "TransaksiPajak_transaksiId_idx" ON "TransaksiPajak"("transaksiId");

-- CreateIndex
CREATE INDEX "TransaksiPajak_pajakId_idx" ON "TransaksiPajak"("pajakId");

-- CreateIndex
CREATE INDEX "TransaksiPajak_nomorFaktur_idx" ON "TransaksiPajak"("nomorFaktur");

-- CreateIndex
CREATE UNIQUE INDEX "FakturPajak_nomorSeri_key" ON "FakturPajak"("nomorSeri");

-- CreateIndex
CREATE INDEX "FakturPajak_perusahaanId_tanggalFaktur_idx" ON "FakturPajak"("perusahaanId", "tanggalFaktur");

-- CreateIndex
CREATE INDEX "FakturPajak_transaksiPajakId_idx" ON "FakturPajak"("transaksiPajakId");

-- CreateIndex
CREATE INDEX "FakturPajak_status_idx" ON "FakturPajak"("status");

-- CreateIndex
CREATE INDEX "FakturPajak_isUploaded_idx" ON "FakturPajak"("isUploaded");

-- CreateIndex
CREATE INDEX "LaporanPajak_perusahaanId_statusLaporan_idx" ON "LaporanPajak"("perusahaanId", "statusLaporan");

-- CreateIndex
CREATE UNIQUE INDEX "LaporanPajak_perusahaanId_jenisPajak_masaPajak_tahunPajak_key" ON "LaporanPajak"("perusahaanId", "jenisPajak", "masaPajak", "tahunPajak");

-- AddForeignKey
ALTER TABLE "ChartOfAccounts" ADD CONSTRAINT "ChartOfAccounts_perusahaanId_fkey" FOREIGN KEY ("perusahaanId") REFERENCES "Perusahaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChartOfAccounts" ADD CONSTRAINT "ChartOfAccounts_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ChartOfAccounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_perusahaanId_fkey" FOREIGN KEY ("perusahaanId") REFERENCES "Perusahaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_cabangId_fkey" FOREIGN KEY ("cabangId") REFERENCES "Cabang"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_penggunaId_fkey" FOREIGN KEY ("penggunaId") REFERENCES "Pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_mataUangId_fkey" FOREIGN KEY ("mataUangId") REFERENCES "MataUang"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_pelangganId_fkey" FOREIGN KEY ("pelangganId") REFERENCES "Pelanggan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_pemasokId_fkey" FOREIGN KEY ("pemasokId") REFERENCES "Pemasok"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES "CostCenter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_profitCenterId_fkey" FOREIGN KEY ("profitCenterId") REFERENCES "ProfitCenter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_kontrakId_fkey" FOREIGN KEY ("kontrakId") REFERENCES "Kontrak"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiDetail" ADD CONSTRAINT "TransaksiDetail_transaksiId_fkey" FOREIGN KEY ("transaksiId") REFERENCES "Transaksi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiDetail" ADD CONSTRAINT "TransaksiDetail_akunId_fkey" FOREIGN KEY ("akunId") REFERENCES "ChartOfAccounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiDetail" ADD CONSTRAINT "TransaksiDetail_persediaanId_fkey" FOREIGN KEY ("persediaanId") REFERENCES "Persediaan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiDetail" ADD CONSTRAINT "TransaksiDetail_asetTetapId_fkey" FOREIGN KEY ("asetTetapId") REFERENCES "AsetTetap"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pembayaran" ADD CONSTRAINT "Pembayaran_transaksiId_fkey" FOREIGN KEY ("transaksiId") REFERENCES "Transaksi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pembayaran" ADD CONSTRAINT "Pembayaran_bankRekeningId_fkey" FOREIGN KEY ("bankRekeningId") REFERENCES "BankRekening"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_perusahaanId_fkey" FOREIGN KEY ("perusahaanId") REFERENCES "Perusahaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_transaksiId_fkey" FOREIGN KEY ("transaksiId") REFERENCES "Transaksi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_dibuatOlehId_fkey" FOREIGN KEY ("dibuatOlehId") REFERENCES "Pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_reversedVoucherId_fkey" FOREIGN KEY ("reversedVoucherId") REFERENCES "Voucher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherDetail" ADD CONSTRAINT "VoucherDetail_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherDetail" ADD CONSTRAINT "VoucherDetail_akunId_fkey" FOREIGN KEY ("akunId") REFERENCES "ChartOfAccounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherDetail" ADD CONSTRAINT "VoucherDetail_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES "CostCenter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherDetail" ADD CONSTRAINT "VoucherDetail_profitCenterId_fkey" FOREIGN KEY ("profitCenterId") REFERENCES "ProfitCenter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JurnalUmum" ADD CONSTRAINT "JurnalUmum_perusahaanId_fkey" FOREIGN KEY ("perusahaanId") REFERENCES "Perusahaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JurnalUmum" ADD CONSTRAINT "JurnalUmum_periodeId_fkey" FOREIGN KEY ("periodeId") REFERENCES "PeriodeAkuntansi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JurnalUmum" ADD CONSTRAINT "JurnalUmum_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JurnalDetail" ADD CONSTRAINT "JurnalDetail_jurnalId_fkey" FOREIGN KEY ("jurnalId") REFERENCES "JurnalUmum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JurnalDetail" ADD CONSTRAINT "JurnalDetail_akunId_fkey" FOREIGN KEY ("akunId") REFERENCES "ChartOfAccounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JurnalDetail" ADD CONSTRAINT "JurnalDetail_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES "CostCenter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JurnalDetail" ADD CONSTRAINT "JurnalDetail_profitCenterId_fkey" FOREIGN KEY ("profitCenterId") REFERENCES "ProfitCenter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeriodeAkuntansi" ADD CONSTRAINT "PeriodeAkuntansi_perusahaanId_fkey" FOREIGN KEY ("perusahaanId") REFERENCES "Perusahaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_perusahaanId_fkey" FOREIGN KEY ("perusahaanId") REFERENCES "Perusahaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_departemenId_fkey" FOREIGN KEY ("departemenId") REFERENCES "Departemen"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_proyekId_fkey" FOREIGN KEY ("proyekId") REFERENCES "Proyek"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetDetail" ADD CONSTRAINT "BudgetDetail_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetDetail" ADD CONSTRAINT "BudgetDetail_akunId_fkey" FOREIGN KEY ("akunId") REFERENCES "ChartOfAccounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetDetail" ADD CONSTRAINT "BudgetDetail_departemenId_fkey" FOREIGN KEY ("departemenId") REFERENCES "Departemen"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetRevisi" ADD CONSTRAINT "BudgetRevisi_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetRealisasi" ADD CONSTRAINT "BudgetRealisasi_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetRealisasi" ADD CONSTRAINT "BudgetRealisasi_transaksiId_fkey" FOREIGN KEY ("transaksiId") REFERENCES "Transaksi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KursHistory" ADD CONSTRAINT "KursHistory_mataUangId_fkey" FOREIGN KEY ("mataUangId") REFERENCES "MataUang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Perusahaan" ADD CONSTRAINT "Perusahaan_indukId_fkey" FOREIGN KEY ("indukId") REFERENCES "Perusahaan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengaturanPerusahaan" ADD CONSTRAINT "PengaturanPerusahaan_perusahaanId_fkey" FOREIGN KEY ("perusahaanId") REFERENCES "Perusahaan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cabang" ADD CONSTRAINT "Cabang_perusahaanId_fkey" FOREIGN KEY ("perusahaanId") REFERENCES "Perusahaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pengguna" ADD CONSTRAINT "Pengguna_perusahaanId_fkey" FOREIGN KEY ("perusahaanId") REFERENCES "Perusahaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pengguna" ADD CONSTRAINT "Pengguna_cabangId_fkey" FOREIGN KEY ("cabangId") REFERENCES "Cabang"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Karyawan" ADD CONSTRAINT "Karyawan_perusahaanId_fkey" FOREIGN KEY ("perusahaanId") REFERENCES "Perusahaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Penggajian" ADD CONSTRAINT "Penggajian_karyawanId_fkey" FOREIGN KEY ("karyawanId") REFERENCES "Karyawan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gudang" ADD CONSTRAINT "Gudang_cabangId_fkey" FOREIGN KEY ("cabangId") REFERENCES "Cabang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Persediaan" ADD CONSTRAINT "Persediaan_perusahaanId_fkey" FOREIGN KEY ("perusahaanId") REFERENCES "Perusahaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Persediaan" ADD CONSTRAINT "Persediaan_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Pemasok"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StokPersediaan" ADD CONSTRAINT "StokPersediaan_persediaanId_fkey" FOREIGN KEY ("persediaanId") REFERENCES "Persediaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StokPersediaan" ADD CONSTRAINT "StokPersediaan_gudangId_fkey" FOREIGN KEY ("gudangId") REFERENCES "Gudang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MutasiPersediaan" ADD CONSTRAINT "MutasiPersediaan_persediaanId_fkey" FOREIGN KEY ("persediaanId") REFERENCES "Persediaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MutasiPersediaan" ADD CONSTRAINT "MutasiPersediaan_gudangId_fkey" FOREIGN KEY ("gudangId") REFERENCES "Gudang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Produk" ADD CONSTRAINT "Produk_perusahaanId_fkey" FOREIGN KEY ("perusahaanId") REFERENCES "Perusahaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Produk" ADD CONSTRAINT "Produk_persediaanId_fkey" FOREIGN KEY ("persediaanId") REFERENCES "Persediaan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdukVariant" ADD CONSTRAINT "ProdukVariant_produkId_fkey" FOREIGN KEY ("produkId") REFERENCES "Produk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiPersediaan" ADD CONSTRAINT "TransaksiPersediaan_produkId_fkey" FOREIGN KEY ("produkId") REFERENCES "Produk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiPersediaan" ADD CONSTRAINT "TransaksiPersediaan_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostCenter" ADD CONSTRAINT "CostCenter_perusahaanId_fkey" FOREIGN KEY ("perusahaanId") REFERENCES "Perusahaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostCenter" ADD CONSTRAINT "CostCenter_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "CostCenter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfitCenter" ADD CONSTRAINT "ProfitCenter_perusahaanId_fkey" FOREIGN KEY ("perusahaanId") REFERENCES "Perusahaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfitCenter" ADD CONSTRAINT "ProfitCenter_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ProfitCenter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kontrak" ADD CONSTRAINT "Kontrak_perusahaanId_fkey" FOREIGN KEY ("perusahaanId") REFERENCES "Perusahaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankRekening" ADD CONSTRAINT "BankRekening_perusahaanId_fkey" FOREIGN KEY ("perusahaanId") REFERENCES "Perusahaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Departemen" ADD CONSTRAINT "Departemen_perusahaanId_fkey" FOREIGN KEY ("perusahaanId") REFERENCES "Perusahaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Departemen" ADD CONSTRAINT "Departemen_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Departemen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proyek" ADD CONSTRAINT "Proyek_perusahaanId_fkey" FOREIGN KEY ("perusahaanId") REFERENCES "Perusahaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proyek" ADD CONSTRAINT "Proyek_pelangganId_fkey" FOREIGN KEY ("pelangganId") REFERENCES "Pelanggan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProyekTransaksi" ADD CONSTRAINT "ProyekTransaksi_proyekId_fkey" FOREIGN KEY ("proyekId") REFERENCES "Proyek"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProyekTransaksi" ADD CONSTRAINT "ProyekTransaksi_transaksiId_fkey" FOREIGN KEY ("transaksiId") REFERENCES "Transaksi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProyekTransaksi" ADD CONSTRAINT "ProyekTransaksi_akunId_fkey" FOREIGN KEY ("akunId") REFERENCES "ChartOfAccounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pelanggan" ADD CONSTRAINT "Pelanggan_perusahaanId_fkey" FOREIGN KEY ("perusahaanId") REFERENCES "Perusahaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pemasok" ADD CONSTRAINT "Pemasok_perusahaanId_fkey" FOREIGN KEY ("perusahaanId") REFERENCES "Perusahaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Piutang" ADD CONSTRAINT "Piutang_perusahaanId_fkey" FOREIGN KEY ("perusahaanId") REFERENCES "Perusahaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Piutang" ADD CONSTRAINT "Piutang_pelangganId_fkey" FOREIGN KEY ("pelangganId") REFERENCES "Pelanggan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Piutang" ADD CONSTRAINT "Piutang_transaksiId_fkey" FOREIGN KEY ("transaksiId") REFERENCES "Transaksi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PembayaranPiutang" ADD CONSTRAINT "PembayaranPiutang_piutangId_fkey" FOREIGN KEY ("piutangId") REFERENCES "Piutang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PembayaranPiutang" ADD CONSTRAINT "PembayaranPiutang_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PembayaranPiutang" ADD CONSTRAINT "PembayaranPiutang_mataUangId_fkey" FOREIGN KEY ("mataUangId") REFERENCES "MataUang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hutang" ADD CONSTRAINT "Hutang_perusahaanId_fkey" FOREIGN KEY ("perusahaanId") REFERENCES "Perusahaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hutang" ADD CONSTRAINT "Hutang_pemasokId_fkey" FOREIGN KEY ("pemasokId") REFERENCES "Pemasok"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hutang" ADD CONSTRAINT "Hutang_transaksiId_fkey" FOREIGN KEY ("transaksiId") REFERENCES "Transaksi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PembayaranHutang" ADD CONSTRAINT "PembayaranHutang_hutangId_fkey" FOREIGN KEY ("hutangId") REFERENCES "Hutang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PembayaranHutang" ADD CONSTRAINT "PembayaranHutang_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PembayaranHutang" ADD CONSTRAINT "PembayaranHutang_mataUangId_fkey" FOREIGN KEY ("mataUangId") REFERENCES "MataUang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Laporan" ADD CONSTRAINT "Laporan_perusahaanId_fkey" FOREIGN KEY ("perusahaanId") REFERENCES "Perusahaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Laporan" ADD CONSTRAINT "Laporan_dibuatOlehId_fkey" FOREIGN KEY ("dibuatOlehId") REFERENCES "Pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardWidget" ADD CONSTRAINT "DashboardWidget_perusahaanId_fkey" FOREIGN KEY ("perusahaanId") REFERENCES "Perusahaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardWidget" ADD CONSTRAINT "DashboardWidget_penggunaId_fkey" FOREIGN KEY ("penggunaId") REFERENCES "Pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FiturModul" ADD CONSTRAINT "FiturModul_paketId_fkey" FOREIGN KEY ("paketId") REFERENCES "PaketFitur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerusahaanPaket" ADD CONSTRAINT "PerusahaanPaket_perusahaanId_fkey" FOREIGN KEY ("perusahaanId") REFERENCES "Perusahaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerusahaanPaket" ADD CONSTRAINT "PerusahaanPaket_paketId_fkey" FOREIGN KEY ("paketId") REFERENCES "PaketFitur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsetTetap" ADD CONSTRAINT "AsetTetap_perusahaanId_fkey" FOREIGN KEY ("perusahaanId") REFERENCES "Perusahaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsetTetap" ADD CONSTRAINT "AsetTetap_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Pemasok"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PenyusutanAset" ADD CONSTRAINT "PenyusutanAset_asetTetapId_fkey" FOREIGN KEY ("asetTetapId") REFERENCES "AsetTetap"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsetTidakBerwujud" ADD CONSTRAINT "AsetTidakBerwujud_perusahaanId_fkey" FOREIGN KEY ("perusahaanId") REFERENCES "Perusahaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmortisasiAset" ADD CONSTRAINT "AmortisasiAset_asetTidakBerwujudId_fkey" FOREIGN KEY ("asetTidakBerwujudId") REFERENCES "AsetTidakBerwujud"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiRekuren" ADD CONSTRAINT "TransaksiRekuren_perusahaanId_fkey" FOREIGN KEY ("perusahaanId") REFERENCES "Perusahaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiwayatTransaksiRekuren" ADD CONSTRAINT "RiwayatTransaksiRekuren_rekurenId_fkey" FOREIGN KEY ("rekurenId") REFERENCES "TransaksiRekuren"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiwayatTransaksiRekuren" ADD CONSTRAINT "RiwayatTransaksiRekuren_transaksiId_fkey" FOREIGN KEY ("transaksiId") REFERENCES "Transaksi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalTemplate" ADD CONSTRAINT "ApprovalTemplate_perusahaanId_fkey" FOREIGN KEY ("perusahaanId") REFERENCES "Perusahaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalLevel" ADD CONSTRAINT "ApprovalLevel_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ApprovalTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalFlow" ADD CONSTRAINT "ApprovalFlow_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "Pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalFlow" ADD CONSTRAINT "ApprovalFlow_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DokumenTransaksi" ADD CONSTRAINT "DokumenTransaksi_transaksiId_fkey" FOREIGN KEY ("transaksiId") REFERENCES "Transaksi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DokumenTransaksi" ADD CONSTRAINT "DokumenTransaksi_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DokumenTransaksi" ADD CONSTRAINT "DokumenTransaksi_asetTetapId_fkey" FOREIGN KEY ("asetTetapId") REFERENCES "AsetTetap"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DokumenTransaksi" ADD CONSTRAINT "DokumenTransaksi_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "Pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifikasi" ADD CONSTRAINT "Notifikasi_penggunaId_fkey" FOREIGN KEY ("penggunaId") REFERENCES "Pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JejakAudit" ADD CONSTRAINT "JejakAudit_perusahaanId_fkey" FOREIGN KEY ("perusahaanId") REFERENCES "Perusahaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JejakAudit" ADD CONSTRAINT "JejakAudit_penggunaId_fkey" FOREIGN KEY ("penggunaId") REFERENCES "Pengguna"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterPajak" ADD CONSTRAINT "MasterPajak_perusahaanId_fkey" FOREIGN KEY ("perusahaanId") REFERENCES "Perusahaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiPajak" ADD CONSTRAINT "TransaksiPajak_transaksiId_fkey" FOREIGN KEY ("transaksiId") REFERENCES "Transaksi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiPajak" ADD CONSTRAINT "TransaksiPajak_pajakId_fkey" FOREIGN KEY ("pajakId") REFERENCES "MasterPajak"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FakturPajak" ADD CONSTRAINT "FakturPajak_perusahaanId_fkey" FOREIGN KEY ("perusahaanId") REFERENCES "Perusahaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FakturPajak" ADD CONSTRAINT "FakturPajak_transaksiPajakId_fkey" FOREIGN KEY ("transaksiPajakId") REFERENCES "TransaksiPajak"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaporanPajak" ADD CONSTRAINT "LaporanPajak_perusahaanId_fkey" FOREIGN KEY ("perusahaanId") REFERENCES "Perusahaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
