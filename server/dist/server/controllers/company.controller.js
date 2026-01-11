"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSettings = exports.deleteCompany = exports.updateCompany = exports.createCompany = exports.getCompany = exports.getCompanies = void 0;
const company_validator_1 = require("../validators/company.validator");
const prisma_1 = __importDefault(require("../../lib/prisma"));
const getCompanies = async (req, res) => {
    try {
        const authReq = req;
        const userId = authReq.user.id;
        const page = parseInt(req.query.page || '1');
        const limit = parseInt(req.query.limit || '10');
        const skip = (page - 1) * limit;
        const [companies, total] = await Promise.all([
            prisma_1.default.perusahaan.findMany({
                where: {
                    pengguna: {
                        some: { id: userId }
                    }
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma_1.default.perusahaan.count({
                where: {
                    pengguna: {
                        some: { id: userId }
                    }
                }
            })
        ]);
        res.json({
            companies,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengambil daftar perusahaan' });
    }
};
exports.getCompanies = getCompanies;
const getCompany = async (req, res) => {
    try {
        const authReq = req;
        const { id } = req.params;
        const userId = authReq.user.id;
        const company = await prisma_1.default.perusahaan.findFirst({
            where: {
                id: id,
                pengguna: {
                    some: { id: userId }
                }
            }
        });
        if (!company) {
            return res.status(404).json({ message: 'Perusahaan tidak ditemukan' });
        }
        res.json(company);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengambil detail perusahaan' });
    }
};
exports.getCompany = getCompany;
const createCompany = async (req, res) => {
    try {
        const authReq = req;
        const _a = company_validator_1.createCompanySchema.parse(req.body), { tier } = _a, rest = __rest(_a, ["tier"]);
        const userId = authReq.user.id;
        const company = await prisma_1.default.perusahaan.create({
            data: Object.assign(Object.assign({}, rest), { kode: rest.nama.substring(0, 3).toUpperCase() + Math.floor(Math.random() * 1000), pengguna: {
                    connect: { id: userId }
                } })
        });
        // Assign initial package
        try {
            const paket = await prisma_1.default.paketFitur.findFirst({ where: { tier: tier } });
            if (paket) {
                await prisma_1.default.perusahaanPaket.create({
                    data: {
                        perusahaanId: company.id,
                        paketId: paket.id,
                        tanggalMulai: new Date(),
                        isAktif: true
                    }
                });
            }
        }
        catch (e) {
            console.warn('Failed to assign initial package:', e);
        }
        res.status(201).json(company);
    }
    catch (error) {
        if (typeof error === 'object' && error !== null && 'name' in error && error.name === 'ZodError') {
            const zodError = error;
            return res.status(400).json({ message: zodError.errors[0].message });
        }
        console.error(error);
        res.status(500).json({ message: 'Gagal membuat perusahaan' });
    }
};
exports.createCompany = createCompany;
const updateCompany = async (req, res) => {
    try {
        const authReq = req;
        const { id } = req.params;
        const validatedData = company_validator_1.updateCompanySchema.parse(req.body);
        const userId = authReq.user.id;
        // Verify ownership
        const companyExists = await prisma_1.default.perusahaan.findFirst({
            where: { id: String(id), pengguna: { some: { id: userId } } }
        });
        if (!companyExists) {
            return res.status(404).json({ message: 'Perusahaan tidak ditemukan' });
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { tier: _ } = validatedData, updateData = __rest(validatedData, ["tier"]);
        const updatedCompany = await prisma_1.default.perusahaan.update({
            where: { id: String(id) },
            data: updateData
        });
        res.json(updatedCompany);
    }
    catch (error) {
        if (typeof error === 'object' && error !== null && 'name' in error && error.name === 'ZodError') {
            const zodError = error;
            return res.status(400).json({ message: zodError.errors[0].message });
        }
        res.status(500).json({ message: 'Gagal memperbarui perusahaan' });
    }
};
exports.updateCompany = updateCompany;
const deleteCompany = async (req, res) => {
    try {
        const authReq = req;
        const { id } = req.params;
        const userId = authReq.user.id;
        const count = await prisma_1.default.perusahaan.count({
            where: { pengguna: { some: { id: userId } } }
        });
        if (count <= 1) {
            return res.status(400).json({ message: 'Tidak dapat menghapus satu-satunya perusahaan Anda' });
        }
        const company = await prisma_1.default.perusahaan.findFirst({
            where: { id: String(id), pengguna: { some: { id: userId } } }
        });
        if (!company) {
            return res.status(404).json({ message: 'Perusahaan tidak ditemukan' });
        }
        await prisma_1.default.perusahaan.delete({ where: { id: String(id) } });
        res.json({ message: 'Perusahaan berhasil dihapus' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal menghapus perusahaan' });
    }
};
exports.deleteCompany = deleteCompany;
const updateSettings = async (req, res) => {
    try {
        const authReq = req;
        const { id } = req.params;
        const validatedData = company_validator_1.settingsSchema.parse(req.body);
        const userId = authReq.user.id;
        const company = await prisma_1.default.perusahaan.findFirst({
            where: { id: String(id), pengguna: { some: { id: userId } } }
        });
        if (!company) {
            return res.status(404).json({ message: 'Perusahaan tidak ditemukan' });
        }
        const updatedCompany = await prisma_1.default.perusahaan.update({
            where: { id: String(id) },
            data: validatedData
        });
        res.json(updatedCompany);
    }
    catch (error) {
        if (typeof error === 'object' && error !== null && 'name' in error && error.name === 'ZodError') {
            const zodError = error;
            return res.status(400).json({ message: zodError.errors[0].message });
        }
        res.status(500).json({ message: 'Gagal memperbarui pengaturan' });
    }
};
exports.updateSettings = updateSettings;
