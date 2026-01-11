import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../../lib/prisma';

export const getCustomers = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const { search } = req.query;

        const where: any = {
            perusahaanId: authReq.currentCompanyId!,
            // You might want a type filter if Pelanggan is just one type of 'Partner'
            // But if 'Pelanggan' is a dedicated model, just query it.
        };

        if (search) {
            where.nama = { contains: String(search), mode: 'insensitive' };
        }

        const customers = await prisma.pelanggan.findMany({
            where,
            orderBy: { nama: 'asc' },
            take: 50
        });

        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data pelanggan' });
    }
};

export const createCustomer = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        // Basic create logic for convenience if needed later
        const { nama, email, telepon, alamat } = req.body;

        const customer = await prisma.pelanggan.create({
            data: {
                perusahaanId: authReq.currentCompanyId!,
                kodePelanggan: `CUST-${Date.now()}`,
                nama,
                email,
                telepon,
                alamat
            }
        });

        res.status(201).json(customer);
    } catch (error) {
        res.status(500).json({ message: 'Gagal membuat pelanggan' });
    }
}
