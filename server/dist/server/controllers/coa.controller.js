"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccountBalance = exports.getAccountLedger = exports.deleteCOA = exports.updateCOA = exports.createCOA = exports.getCOADetail = exports.getCOATree = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const coa_validator_1 = require("../validators/coa.validator");
const getCOATree = async (req, res) => {
    try {
        const authReq = req;
        const perusahaanId = authReq.user.perusahaanId;
        const { type, flatten } = req.query; // Add support for filtering and flattening
        const where = { perusahaanId };
        if (type) {
            where.tipe = String(type);
        }
        const allAccounts = await prisma_1.default.chartOfAccounts.findMany({
            where,
            orderBy: { kodeAkun: 'asc' }
        });
        // If filtering by type or explicitly requesting flat list, return as is
        if (type || flatten === 'true') {
            return res.json(allAccounts);
        }
        // Map to hold accounts for easy children lookup
        const accountMap = new Map();
        allAccounts.forEach(acc => accountMap.set(acc.id, Object.assign(Object.assign({}, acc), { children: [], totalBalance: Number(acc.saldoBerjalan) })));
        const tree = [];
        // Build hierarchy and calculate consolidated balances for headers
        // Sort by level descending to propagate balances upwards
        const sortedAccounts = [...allAccounts].sort((a, b) => b.level - a.level);
        sortedAccounts.forEach(acc => {
            const current = accountMap.get(acc.id);
            if (!current)
                return;
            if (acc.parentId) {
                const parent = accountMap.get(acc.parentId);
                if (parent) {
                    parent.children.push(current);
                    parent.totalBalance += current.totalBalance;
                }
            }
            else {
                tree.push(current);
            }
        });
        // Re-sort tree by kodeAkun since propagation might have messed up order
        const sortTree = (nodes) => {
            nodes.sort((a, b) => a.kodeAkun.localeCompare(b.kodeAkun));
            nodes.forEach(node => {
                if (node.children.length > 0)
                    sortTree(node.children);
            });
        };
        sortTree(tree);
        res.json(tree);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengambil daftar akun' });
    }
};
exports.getCOATree = getCOATree;
const getCOADetail = async (req, res) => {
    try {
        const authReq = req;
        const id = req.params.id;
        const perusahaanId = authReq.user.perusahaanId;
        const account = await prisma_1.default.chartOfAccounts.findFirst({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengambil detail akun' });
    }
};
exports.getCOADetail = getCOADetail;
const createCOA = async (req, res) => {
    try {
        const authReq = req;
        const validatedData = coa_validator_1.createCOASchema.parse(req.body);
        const perusahaanId = authReq.user.perusahaanId;
        let level = 1;
        if (validatedData.parentId) {
            const parent = await prisma_1.default.chartOfAccounts.findUnique({
                where: { id: validatedData.parentId }
            });
            if (parent) {
                level = parent.level + 1;
            }
        }
        const account = await prisma_1.default.chartOfAccounts.create({
            data: Object.assign(Object.assign({}, validatedData), { perusahaanId,
                level, saldoAwal: Number(validatedData.saldoAwal || 0), saldoBerjalan: Number(validatedData.saldoAwal || 0), kategoriAset: validatedData.kategoriAset, kategoriLiabilitas: validatedData.kategoriLiabilitas, kategoriEkuitas: validatedData.kategoriEkuitas })
        });
        res.status(201).json(account);
    }
    catch (error) {
        if (typeof error === 'object' && error !== null && 'name' in error && error.name === 'ZodError') {
            const zodError = error;
            return res.status(400).json({ message: zodError.errors[0].message });
        }
        console.error(error);
        res.status(500).json({ message: 'Gagal membuat akun' });
    }
};
exports.createCOA = createCOA;
const updateCOA = async (req, res) => {
    try {
        const authReq = req;
        const id = req.params.id;
        const validatedData = coa_validator_1.updateCOASchema.parse(req.body);
        const perusahaanId = authReq.user.perusahaanId;
        const existing = await prisma_1.default.chartOfAccounts.findFirst({
            where: { id, perusahaanId }
        });
        if (!existing) {
            return res.status(404).json({ message: 'Akun tidak ditemukan' });
        }
        const updated = await prisma_1.default.chartOfAccounts.update({
            where: { id },
            data: Object.assign(Object.assign({}, validatedData), { kategoriAset: validatedData.kategoriAset, kategoriLiabilitas: validatedData.kategoriLiabilitas, kategoriEkuitas: validatedData.kategoriEkuitas })
        });
        res.json(updated);
    }
    catch (error) {
        if (typeof error === 'object' && error !== null && 'name' in error && error.name === 'ZodError') {
            const zodError = error;
            return res.status(400).json({ message: zodError.errors[0].message });
        }
        res.status(500).json({ message: 'Gagal memperbarui akun' });
    }
};
exports.updateCOA = updateCOA;
const deleteCOA = async (req, res) => {
    try {
        const authReq = req;
        const id = req.params.id;
        const perusahaanId = authReq.user.perusahaanId;
        // Check if has transactions
        const transactionCount = await prisma_1.default.jurnalDetail.count({
            where: { akunId: id }
        });
        if (transactionCount > 0) {
            return res.status(400).json({ message: 'Akun tidak dapat dihapus karena sudah memiliki transaksi' });
        }
        // Check if has children
        const childrenCount = await prisma_1.default.chartOfAccounts.count({
            where: { parentId: id }
        });
        if (childrenCount > 0) {
            return res.status(400).json({ message: 'Akun tidak dapat dihapus karena memiliki sub-akun' });
        }
        await prisma_1.default.chartOfAccounts.delete({
            where: { id, perusahaanId }
        });
        res.json({ message: 'Akun berhasil dihapus' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal menghapus akun' });
    }
};
exports.deleteCOA = deleteCOA;
const getAccountLedger = async (req, res) => {
    try {
        const authReq = req;
        const id = req.params.id;
        const perusahaanId = authReq.user.perusahaanId;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const account = await prisma_1.default.chartOfAccounts.findFirst({
            where: { id, perusahaanId }
        });
        if (!account) {
            return res.status(404).json({ message: 'Akun tidak ditemukan' });
        }
        const where = {
            akunId: id,
            jurnal: {
                perusahaanId,
            }
        };
        if (startDate || endDate) {
            const jurnalWhere = where.jurnal;
            jurnalWhere.tanggal = {};
            if (startDate)
                jurnalWhere.tanggal.gte = new Date(startDate);
            if (endDate)
                jurnalWhere.tanggal.lte = new Date(endDate);
        }
        const transactions = await prisma_1.default.jurnalDetail.findMany({
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
            return Object.assign(Object.assign({}, t), { runningBalance: currentBalance });
        });
        res.json({
            account,
            ledger
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengambil buku besar' });
    }
};
exports.getAccountLedger = getAccountLedger;
const getAccountBalance = async (req, res) => {
    try {
        const authReq = req;
        const id = req.params.id;
        const perusahaanId = authReq.user.perusahaanId;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const account = await prisma_1.default.chartOfAccounts.findFirst({
            where: { id, perusahaanId }
        });
        if (!account) {
            return res.status(404).json({ message: 'Akun tidak ditemukan' });
        }
        const where = {
            akunId: id,
            jurnal: {
                perusahaanId,
            }
        };
        if (startDate || endDate) {
            const jurnalWhere = where.jurnal;
            jurnalWhere.tanggal = {};
            if (startDate)
                jurnalWhere.tanggal.gte = new Date(startDate);
            if (endDate)
                jurnalWhere.tanggal.lte = new Date(endDate);
        }
        const sum = await prisma_1.default.jurnalDetail.aggregate({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengambil saldo akun' });
    }
};
exports.getAccountBalance = getAccountBalance;
