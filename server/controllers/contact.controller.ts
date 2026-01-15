import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';

export const getCustomers = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const { search } = req.query;

        const where: Prisma.PelangganWhereInput = {
            perusahaanId: authReq.currentCompanyId!,
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
    } catch (error: unknown) {
        console.error('Fetch Customers Error:', error);
        res.status(500).json({ message: 'Gagal mengambil data pelanggan' });
    }
};

export const createCustomer = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
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
    } catch (error: unknown) {
        console.error('Create Customer Error:', error);
        res.status(500).json({ message: 'Gagal membuat pelanggan' });
    }
};

export const getVendors = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const { search } = req.query;

        const where: Prisma.PemasokWhereInput = {
            perusahaanId: authReq.currentCompanyId!,
        };

        if (search) {
            where.nama = { contains: String(search), mode: 'insensitive' };
        }

        const vendors = await prisma.pemasok.findMany({
            where,
            orderBy: { nama: 'asc' },
            take: 50
        });

        res.json(vendors);
    } catch (error: unknown) {
        console.error('Fetch Vendors Error:', error);
        res.status(500).json({ message: 'Gagal mengambil data pemasok' });
    }
};

export const createVendor = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const { nama, email, telepon, alamat } = req.body;

        const vendor = await prisma.pemasok.create({
            data: {
                perusahaanId: authReq.currentCompanyId!,
                kodePemasok: `VEND-${Date.now()}`,
                nama,
                email,
                telepon,
                alamat
            }
        });

        res.status(201).json(vendor);
    } catch (error: unknown) {
        console.error('Create Vendor Error:', error);
        res.status(500).json({ message: 'Gagal membuat pemasok' });
    }
};
