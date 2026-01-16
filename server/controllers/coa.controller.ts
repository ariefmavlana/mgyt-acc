import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { createCOASchema, updateCOASchema } from '../validators/coa.validator';
import { KategoriAset, KategoriLiabilitas, KategoriEkuitas, ChartOfAccounts, Prisma } from '@prisma/client';
import ExcelJS from 'exceljs';
import { Readable } from 'stream';

interface COANode extends ChartOfAccounts {
    children: COANode[];
    totalBalance: number;
}

export const getCOATree = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
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
        const perusahaanId = authReq.currentCompanyId!;

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

export const getNextAccountCode = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
        const { parentId } = req.query;

        if (!parentId) {
            return res.status(400).json({ message: 'Parent ID is required' });
        }

        const parent = await prisma.chartOfAccounts.findUnique({
            where: { id: parentId as string }
        });

        if (!parent) {
            return res.status(404).json({ message: 'Parent account not found' });
        }

        // Find sibling with highest code
        const lastSibling = await prisma.chartOfAccounts.findFirst({
            where: { perusahaanId, parentId: parentId as string },
            orderBy: { kodeAkun: 'desc' }
        });

        let nextCode = "";
        if (lastSibling) {
            // Increment last digit or part of the code
            const parts = lastSibling.kodeAkun.split(/[-.]/);
            const lastPart = parts[parts.length - 1];
            if (!isNaN(Number(lastPart))) {
                const newLastPart = String(Number(lastPart) + 1).padStart(lastPart.length, '0');
                parts[parts.length - 1] = newLastPart;
                nextCode = parts.join(lastSibling.kodeAkun.includes('-') ? '-' : '.');
            } else {
                nextCode = `${lastSibling.kodeAkun}-01`;
            }
        } else {
            // First child - start with parent code + suffix
            nextCode = `${parent.kodeAkun}-01`;
        }

        res.json({ nextCode });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mendapatkan saran nomor akun' });
    }
};

export const createCOA = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const validatedData = createCOASchema.parse(req.body);
        const perusahaanId = authReq.currentCompanyId!;

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
        const perusahaanId = authReq.currentCompanyId!;

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
        const perusahaanId = authReq.currentCompanyId!;

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
        const perusahaanId = authReq.currentCompanyId!;
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
        const perusahaanId = authReq.currentCompanyId!;
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

export const exportCOA = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;

        const accounts = await prisma.chartOfAccounts.findMany({
            where: { perusahaanId },
            include: { parent: true },
            orderBy: { kodeAkun: 'asc' }
        });

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Chart of Accounts');

        sheet.columns = [
            { header: 'Kode Akun', key: 'kodeAkun', width: 15 },
            { header: 'Nama Akun', key: 'namaAkun', width: 30 },
            { header: 'Tipe', key: 'tipe', width: 20 },
            { header: 'Kategori', key: 'kategori', width: 20 },
            { header: 'Sub Kategori', key: 'subKategori', width: 20 },
            { header: 'Header?', key: 'isHeader', width: 10 },
            { header: 'Kode Induk', key: 'parentCode', width: 15 },
            { header: 'Saldo Awal', key: 'saldoAwal', width: 15 },
            { header: 'Saldo Normal', key: 'normalBalance', width: 15 },
            { header: 'Catatan', key: 'catatan', width: 30 },
        ];

        accounts.forEach(acc => {
            let kategori = '';
            if (acc.kategoriAset) kategori = acc.kategoriAset;
            else if (acc.kategoriLiabilitas) kategori = acc.kategoriLiabilitas;
            else if (acc.kategoriEkuitas) kategori = acc.kategoriEkuitas;

            sheet.addRow({
                kodeAkun: acc.kodeAkun,
                namaAkun: acc.namaAkun,
                tipe: acc.tipe,
                kategori: kategori,
                subKategori: acc.subKategori || '',
                isHeader: acc.isHeader ? 'Yes' : 'No',
                parentCode: acc.parent?.kodeAkun || '',
                saldoAwal: acc.saldoAwal,
                normalBalance: acc.normalBalance,
                catatan: acc.catatan || ''
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=COA-${new Date().toISOString().slice(0, 10)}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Export COA Error:', error);
        res.status(500).json({ message: 'Gagal mengexport data akun' });
    }
};

export const importCOA = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'File wajib diunggah' });
        }

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(file.buffer);
        const sheet = workbook.getWorksheet(1);

        if (!sheet) {
            return res.status(400).json({ message: 'Format Excel tidak valid' });
        }

        const accountsToProcess: any[] = [];

        sheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header

            const kodeAkun = row.getCell(1).text?.toString();
            // Basic validation
            if (kodeAkun) {
                accountsToProcess.push({
                    kodeAkun: kodeAkun,
                    namaAkun: row.getCell(2).text?.toString() || 'Unnamed Account',
                    tipe: row.getCell(3).text?.toString() || 'ASET',
                    kategori: row.getCell(4).text?.toString(),
                    subKategori: row.getCell(5).text?.toString(),
                    isHeader: row.getCell(6).text?.toString().toLowerCase() === 'yes',
                    parentCode: row.getCell(7).text?.toString(),
                    saldoAwal: Number(row.getCell(8).value || 0),
                    normalBalance: row.getCell(9).text?.toString() || 'DEBIT',
                    catatan: row.getCell(10).text?.toString()
                });
            }
        });

        let successCount = 0;
        let failCount = 0;

        // Process sequentially to handle parent dependencies roughly
        // Better strategy: Create all without parents first, then link parents
        // Or simply strict order (parent must exist). 
        // We'll try: Upsert all, then link parents.

        // 1. Upsert Accounts (Ignore parent first)
        for (const data of accountsToProcess) {
            try {
                // Determine Category Enum
                let katAset = null;
                let katLiab = null;
                let katEkuitas = null;

                // Simple heuristic for mapping back (can be improved)
                if (data.tipe === 'ASET') katAset = data.kategori;
                if (data.tipe === 'LIABILITAS') katLiab = data.kategori;
                if (data.tipe === 'EKUITAS') katEkuitas = data.kategori;

                await prisma.chartOfAccounts.upsert({
                    where: {
                        perusahaanId_kodeAkun: {
                            perusahaanId,
                            kodeAkun: data.kodeAkun
                        }
                    },
                    update: {
                        namaAkun: data.namaAkun,
                        tipe: data.tipe as any,
                        isHeader: data.isHeader,
                        normalBalance: data.normalBalance as any,
                        // Don't overwrite balance/catatan if existing? Maybe yes if importing.
                        // For safety, let's update basic info.
                    },
                    create: {
                        perusahaanId,
                        kodeAkun: data.kodeAkun,
                        namaAkun: data.namaAkun,
                        tipe: data.tipe as any,
                        level: 1, // Default, will fix later
                        isHeader: data.isHeader,
                        normalBalance: data.normalBalance as any,
                        saldoAwal: data.saldoAwal,
                        saldoBerjalan: data.saldoAwal,
                        kategoriAset: katAset as any,
                        kategoriLiabilitas: katLiab as any,
                        kategoriEkuitas: katEkuitas as any
                    }
                });
                successCount++;
            } catch (e) {
                console.error(`Failed to import ${data.kodeAkun}`, e);
                failCount++;
            }
        }

        // 2. Link Parents
        for (const data of accountsToProcess) {
            if (data.parentCode) {
                const parent = await prisma.chartOfAccounts.findFirst({
                    where: { perusahaanId, kodeAkun: data.parentCode }
                });
                if (parent) {
                    await prisma.chartOfAccounts.updateMany({
                        where: { perusahaanId, kodeAkun: data.kodeAkun },
                        data: {
                            parentId: parent.id,
                            level: parent.level + 1
                        }
                    });
                }
            }
        }

        res.json({
            message: `Import selesai. Berhasil: ${successCount}, Gagal: ${failCount}`,
            stats: { successCount, failCount }
        });

    } catch (error) {
        console.error('Import COA Error:', error);
        res.status(500).json({ message: 'Gagal mengimport data akun' });
    }
};

export const updateOpeningBalances = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
        const { balances } = req.body; // Array of { id, saldoAwal }

        if (!Array.isArray(balances)) {
            return res.status(400).json({ message: 'Balances array is required' });
        }

        await prisma.$transaction(async (tx) => {
            for (const item of balances) {
                const account = await tx.chartOfAccounts.findUnique({
                    where: { id: item.id, perusahaanId }
                });

                if (account) {
                    // Calculate adjustment to saldoBerjalan
                    const oldSaldoAwal = Number(account.saldoAwal);
                    const newSaldoAwal = Number(item.saldoAwal);
                    const adjustment = newSaldoAwal - oldSaldoAwal;

                    await tx.chartOfAccounts.update({
                        where: { id: item.id },
                        data: {
                            saldoAwal: newSaldoAwal,
                            saldoBerjalan: {
                                increment: adjustment
                            }
                        }
                    });
                }
            }
        });

        res.json({ message: 'Saldo awal berhasil diperbarui' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal memperbarui saldo awal' });
    }
};
