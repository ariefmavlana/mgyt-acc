"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustomer = exports.getCustomers = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const getCustomers = async (req, res) => {
    try {
        const authReq = req;
        const { search } = req.query;
        const where = {
            perusahaanId: authReq.user.perusahaanId,
            // You might want a type filter if Pelanggan is just one type of 'Partner'
            // But if 'Pelanggan' is a dedicated model, just query it.
        };
        if (search) {
            where.nama = { contains: String(search), mode: 'insensitive' };
        }
        const customers = await prisma_1.default.pelanggan.findMany({
            where,
            orderBy: { nama: 'asc' },
            take: 50
        });
        res.json(customers);
    }
    catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data pelanggan' });
    }
};
exports.getCustomers = getCustomers;
const createCustomer = async (req, res) => {
    try {
        const authReq = req;
        // Basic create logic for convenience if needed later
        const { nama, email, telepon, alamat } = req.body;
        const customer = await prisma_1.default.pelanggan.create({
            data: {
                perusahaanId: authReq.user.perusahaanId,
                kodePelanggan: `CUST-${Date.now()}`,
                nama,
                email,
                telepon,
                alamat
            }
        });
        res.status(201).json(customer);
    }
    catch (error) {
        res.status(500).json({ message: 'Gagal membuat pelanggan' });
    }
};
exports.createCustomer = createCustomer;
