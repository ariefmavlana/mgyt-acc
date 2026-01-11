import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { createCOASchema, updateCOASchema } from '../validators/coa.validator';
import { KategoriAset, KategoriLiabilitas, KategoriEkuitas, ChartOfAccounts, Prisma } from '@prisma/client';

interface COANode extends ChartOfAccounts {
    children: COANode[];
    totalBalance: number;
}

export const getCOATree = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.user.perusahaanId;
        const { type, flatten } = req.query; // Add support for filtering and flattening

        const where: any = { perusahaanId };
        if (type) {
            where.tipe = String(type);
        }

        const allAccounts = await prisma.chartOfAccounts.findMany({
            where,
            orderBy: { kodeAkun: 'asc' }
        });

        // If filtering by type or explicitly requesting flat list, return as is
        if (type || flatten === 'true') {
            return res.json(allAccounts);
        }

        // Map to hold accounts for easy children lookup
        const accountMap = new Map<string, COANode>();
        allAccounts.forEach(acc => accountMap.set(acc.id, { ...acc, children: [], totalBalance: Number(acc.saldoBerjalan) }));

        const tree: COANode[] = [];

        // Build hierarchy and calculate consolidated balances for headers
        // Sort by level descending to propagate balances upwards
        const sortedAccounts = [...allAccounts].sort((a, b) => b.level - a.level);

        sortedAccounts.forEach(acc => {
            const current = accountMap.get(acc.id);
            if (!current) return;

            if (acc.parentId) {
                const parent = accountMap.get(acc.parentId);
                if (parent) {
                    parent.children.push(current);
                    parent.totalBalance += current.totalBalance;
                }
            } else {
                tree.push(current);
            }
        });

        // Re-sort tree by kodeAkun since propagation might have messed up order
        const sortTree = (nodes: COANode[]) => {
            nodes.sort((a, b) => a.kodeAkun.localeCompare(b.kodeAkun));
            nodes.forEach(node => {
                if (node.children.length > 0) sortTree(node.children);
            });
        };
        sortTree(tree);

        res.json(tree);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengambil daftar akun' });
    }
};

export const getCOADetail = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const id = req.params.id as string;
        const perusahaanId = authReq.user.perusahaanId;

        const account = await prisma.chartOfAccounts.findFirst({
            where: { id, perusahaanId },
            include: {
                parent: true,
                children: true
            }
        });

        if (!account) {
            return res.status(404).json({ message: 'Akun tidak ditemukan' });
        }

        res.json(account);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengambil detail akun' });
    }
};

export const createCOA = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const validatedData = createCOASchema.parse(req.body);
        const perusahaanId = authReq.user.perusahaanId;

        let level = 1;
        if (validatedData.parentId) {
            const parent = await prisma.chartOfAccounts.findUnique({
                where: { id: validatedData.parentId }
            });
            if (parent) {
                level = parent.level + 1;
            }
        }

        const account = await prisma.chartOfAccounts.create({
            data: {
                ...validatedData,
                perusahaanId,
                level,
                saldoAwal: Number(validatedData.saldoAwal || 0),
                saldoBerjalan: Number(validatedData.saldoAwal || 0),
                kategoriAset: validatedData.kategoriAset as KategoriAset,
                kategoriLiabilitas: validatedData.kategoriLiabilitas as KategoriLiabilitas,
                kategoriEkuitas: validatedData.kategoriEkuitas as KategoriEkuitas,
            }
        });

        res.status(201).json(account);
    } catch (error: unknown) {
        if (typeof error === 'object' && error !== null && 'name' in error && error.name === 'ZodError') {
            const zodError = error as unknown as { errors: Array<{ message: string }> };
            return res.status(400).json({ message: zodError.errors[0].message });
        }
        console.error(error);
        res.status(500).json({ message: 'Gagal membuat akun' });
    }
};

export const updateCOA = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const id = req.params.id as string;
        const validatedData = updateCOASchema.parse(req.body);
        const perusahaanId = authReq.user.perusahaanId;

        const existing = await prisma.chartOfAccounts.findFirst({
            where: { id, perusahaanId }
        });

        if (!existing) {
            return res.status(404).json({ message: 'Akun tidak ditemukan' });
        }

        const updated = await prisma.chartOfAccounts.update({
            where: { id },
            data: {
                ...validatedData,
                kategoriAset: validatedData.kategoriAset as KategoriAset,
                kategoriLiabilitas: validatedData.kategoriLiabilitas as KategoriLiabilitas,
                kategoriEkuitas: validatedData.kategoriEkuitas as KategoriEkuitas,
            }
        });

        res.json(updated);
    } catch (error: unknown) {
        if (typeof error === 'object' && error !== null && 'name' in error && error.name === 'ZodError') {
            const zodError = error as unknown as { errors: Array<{ message: string }> };
            return res.status(400).json({ message: zodError.errors[0].message });
        }
        res.status(500).json({ message: 'Gagal memperbarui akun' });
    }
};

export const deleteCOA = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const id = req.params.id as string;
        const perusahaanId = authReq.user.perusahaanId;

        // Check if has transactions
        const transactionCount = await prisma.jurnalDetail.count({
            where: { akunId: id }
        });

        if (transactionCount > 0) {
            return res.status(400).json({ message: 'Akun tidak dapat dihapus karena sudah memiliki transaksi' });
        }

        // Check if has children
        const childrenCount = await prisma.chartOfAccounts.count({
            where: { parentId: id }
        });

        if (childrenCount > 0) {
            return res.status(400).json({ message: 'Akun tidak dapat dihapus karena memiliki sub-akun' });
        }

        await prisma.chartOfAccounts.delete({
            where: { id, perusahaanId }
        });

        res.json({ message: 'Akun berhasil dihapus' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal menghapus akun' });
    }
};

export const getAccountLedger = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const id = req.params.id as string;
        const perusahaanId = authReq.user.perusahaanId;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;

        const account = await prisma.chartOfAccounts.findFirst({
            where: { id, perusahaanId }
        });

        if (!account) {
            return res.status(404).json({ message: 'Akun tidak ditemukan' });
        }

        const where: Prisma.JurnalDetailWhereInput = {
            akunId: id,
            jurnal: {
                perusahaanId,
            }
        };

        if (startDate || endDate) {
            const jurnalWhere = where.jurnal as Prisma.JurnalUmumWhereInput;
            jurnalWhere.tanggal = {};
            if (startDate) (jurnalWhere.tanggal as Prisma.DateTimeFilter).gte = new Date(startDate as string);
            if (endDate) (jurnalWhere.tanggal as Prisma.DateTimeFilter).lte = new Date(endDate as string);
        }

        const transactions = await prisma.jurnalDetail.findMany({
            where,
            include: {
                jurnal: true
            },
            orderBy: {
                jurnal: {
                    tanggal: 'asc'
                }
            }
        });

        // Calculate running balance
        let currentBalance = Number(account.saldoAwal);
        const ledger = transactions.map(t => {
            const adjustment = account.normalBalance === 'DEBIT'
                ? Number(t.debit) - Number(t.kredit)
                : Number(t.kredit) - Number(t.debit);
            currentBalance += adjustment;
            return {
                ...t,
                runningBalance: currentBalance
            };
        });

        res.json({
            account,
            ledger
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengambil buku besar' });
    }
};

export const getAccountBalance = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const id = req.params.id as string;
        const perusahaanId = authReq.user.perusahaanId;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;

        const account = await prisma.chartOfAccounts.findFirst({
            where: { id, perusahaanId }
        });

        if (!account) {
            return res.status(404).json({ message: 'Akun tidak ditemukan' });
        }

        const where: Prisma.JurnalDetailWhereInput = {
            akunId: id,
            jurnal: {
                perusahaanId,
            }
        };

        if (startDate || endDate) {
            const jurnalWhere = where.jurnal as Prisma.JurnalUmumWhereInput;
            jurnalWhere.tanggal = {};
            if (startDate) (jurnalWhere.tanggal as Prisma.DateTimeFilter).gte = new Date(startDate as string);
            if (endDate) (jurnalWhere.tanggal as Prisma.DateTimeFilter).lte = new Date(endDate as string);
        }

        const sum = await prisma.jurnalDetail.aggregate({
            where,
            _sum: {
                debit: true,
                kredit: true
            }
        });

        const totalDebit = Number(sum._sum.debit || 0);
        const totalKredit = Number(sum._sum.kredit || 0);

        const balanceValue = account.normalBalance === 'DEBIT'
            ? totalDebit - totalKredit
            : totalKredit - totalDebit;

        res.json({
            accountId: id,
            totalDebit,
            totalKredit,
            balance: balanceValue + Number(account.saldoAwal)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengambil saldo akun' });
    }
};
