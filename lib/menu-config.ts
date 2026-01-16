import { UserRole } from '@prisma/client';
import {
    LayoutDashboard, FolderTree, FileText, BarChart2, Percent, Box, PieChart,
    TrendingUp, Receipt, Package, Target, Building2, LayoutGrid, Users,
    FileSignature, Banknote, Activity, RefreshCw, Settings, HelpCircle,
    ShieldCheck, Database, CreditCard
} from 'lucide-react';

export const MENU_STRUCTURE = [
    {
        title: '',
        items: [
            { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['*'] },
        ]
    },
    {
        title: 'Akuntansi & Keuangan',
        items: [
            { name: 'Buku Besar', href: '/dashboard/coa', icon: FolderTree, roles: ['ADMIN', 'MANAGER', 'ACCOUNTANT', 'SENIOR_ACCOUNTANT'] },
            { name: 'Voucher / Kas', href: '/dashboard/transactions', icon: FileText, roles: ['ADMIN', 'MANAGER', 'ACCOUNTANT', 'CASHIER'] },
            { name: 'Laporan Keuangan', href: '/dashboard/reports', icon: BarChart2, roles: ['ADMIN', 'MANAGER', 'ACCOUNTANT', 'CEO', 'CFO', 'AUDITOR'] },
            { name: 'Master Pajak', href: '/dashboard/tax', icon: Percent, roles: ['ADMIN', 'TAX_OFFICER', 'ACCOUNTANT'] },
            { name: 'Aset Tetap', href: '/dashboard/assets', icon: Box, roles: ['ADMIN', 'ACCOUNTANT', 'FINANCE_MANAGER'] },
            { name: 'Anggaran', href: '/dashboard/budget', icon: PieChart, roles: ['ADMIN', 'CFO', 'FINANCE_MANAGER'] },
        ]
    },
    {
        title: 'Operasional',
        items: [
            { name: 'Penjualan (AR)', href: '/dashboard/invoices', icon: TrendingUp, roles: ['ADMIN', 'SALES', 'FINANCE_MANAGER'] },
            { name: 'Pembelian (AP)', href: '/dashboard/bills', icon: Receipt, roles: ['ADMIN', 'PURCHASING', 'FINANCE_MANAGER'] },
            { name: 'Persediaan', href: '/dashboard/inventory', icon: Package, roles: ['ADMIN', 'WAREHOUSE_MANAGER', 'PURCHASING'] },
            { name: 'Produk', href: '/dashboard/products', icon: Database, roles: ['ADMIN', 'WAREHOUSE_MANAGER', 'PURCHASING'] },
        ]
    },
    {
        title: 'Organisasi',
        items: [
            { name: 'Cost Center', href: '/dashboard/organization/cost-centers', icon: Target, roles: ['ADMIN', 'CFO', 'FINANCE_MANAGER'], enterprise: true },
            { name: 'Profit Center', href: '/dashboard/organization/profit-centers', icon: TrendingUp, roles: ['ADMIN', 'CFO', 'FINANCE_MANAGER'], enterprise: true },
            { name: 'Cabang', href: '/dashboard/settings?tab=branches', icon: Building2, roles: ['ADMIN', 'CEO'], enterprise: true },
            { name: 'Departemen', href: '/dashboard/hr/departments', icon: Building2, roles: ['ADMIN', 'CEO', 'CFO'], enterprise: true },
            { name: 'Proyek', href: '/dashboard/organization/projects', icon: LayoutGrid, roles: ['ADMIN', 'FINANCE_MANAGER'], enterprise: true },
        ]
    },
    {
        title: 'SDM & Gaji',
        items: [
            { name: 'Karyawan', href: '/dashboard/employees', icon: Users, roles: ['ADMIN', 'MANAGER', 'CEO'] },
            { name: 'Kontrak Kerja', href: '/dashboard/contracts', icon: FileSignature, roles: ['ADMIN', 'MANAGER'] },
            { name: 'Penggajian', href: '/dashboard/hr/payroll', icon: Banknote, roles: ['ADMIN', 'MANAGER', 'CFO'] },
        ]
    },
    {
        title: 'Sistem & Perusahaan',
        items: [
            { name: 'Profil Perusahaan', href: '/dashboard/companies', icon: Building2, roles: ['ADMIN', 'CEO'] },
            { name: 'Audit Trail', href: '/dashboard/audit', icon: Activity, roles: ['ADMIN', 'AUDITOR'], enterprise: true },
            { name: 'Transaksi Berulang', href: '/dashboard/system/recurring', icon: RefreshCw, roles: ['ADMIN', 'ACCOUNTANT'] },
            { name: 'Langganan', href: '/dashboard/settings?tab=subscription', icon: CreditCard, roles: ['ADMIN', 'CEO', 'MANAGER'] },
            { name: 'Pengaturan', href: '/dashboard/settings', icon: Settings, roles: ['ADMIN'] },
        ]
    }
];

export function filterMenuByRoleAndTier(userRole: string, userTier: string) {
    return MENU_STRUCTURE.map(group => ({
        ...group,
        items: group.items.filter(item => {
            // Role matching
            const hasRole = item.roles.includes('*') || item.roles.includes(userRole);
            if (!hasRole) return false;

            // Tier matching (Hide enterprise modules for UMKM)
            if (userTier === 'UMKM' && item.enterprise) return false;

            return true;
        })
    })).filter(group => group.items.length > 0);
}
