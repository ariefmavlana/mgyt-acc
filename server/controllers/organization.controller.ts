import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../../lib/prisma';
import { organizationSchema } from '../validators/organization.validator';

// --- COST CENTERS ---

export const getCostCenters = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;

        const costCenters = await prisma.costCenter.findMany({
            where: { perusahaanId },
            include: { parent: { select: { nama: true } } },
            orderBy: { kode: 'asc' }
        });

        res.json({ success: true, data: costCenters });
    } catch (error) {
        console.error('Get Cost Centers Error:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data Cost Center' });
    }
};

export const createCostCenter = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
        const validated = organizationSchema.parse(req.body);

        const costCenter = await prisma.costCenter.create({
            data: {
                ...validated,
                perusahaanId
            }
        });

        res.status(201).json({ success: true, data: costCenter, message: 'Cost Center berhasil dibuat' });
    } catch (error: any) {
        console.error('Create Cost Center Error:', error);
        res.status(400).json({ success: false, message: error.message || 'Gagal membuat Cost Center' });
    }
};

export const updateCostCenter = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
        const { id } = req.params;
        const validated = organizationSchema.parse(req.body);

        const updated = await prisma.costCenter.update({
            where: { id, perusahaanId },
            data: validated
        });

        res.json({ success: true, data: updated, message: 'Cost Center berhasil diperbarui' });
    } catch (error: any) {
        console.error('Update Cost Center Error:', error);
        res.status(400).json({ success: false, message: error.message || 'Gagal memperbarui Cost Center' });
    }
};

export const deleteCostCenter = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
        const { id } = req.params;

        await prisma.costCenter.delete({
            where: { id, perusahaanId }
        });

        res.json({ success: true, message: 'Cost Center berhasil dihapus' });
    } catch (error) {
        console.error('Delete Cost Center Error:', error);
        res.status(500).json({ success: false, message: 'Gagal menghapus Cost Center. Pastikan tidak ada data yang bergantung pada ini.' });
    }
};

// --- PROFIT CENTERS ---

export const getProfitCenters = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;

        const profitCenters = await prisma.profitCenter.findMany({
            where: { perusahaanId },
            include: { parent: { select: { nama: true } } },
            orderBy: { kode: 'asc' }
        });

        res.json({ success: true, data: profitCenters });
    } catch (error) {
        console.error('Get Profit Centers Error:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data Profit Center' });
    }
};

export const createProfitCenter = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
        const validated = organizationSchema.parse(req.body);

        const profitCenter = await prisma.profitCenter.create({
            data: {
                ...validated,
                perusahaanId
            }
        });

        res.status(201).json({ success: true, data: profitCenter, message: 'Profit Center berhasil dibuat' });
    } catch (error: any) {
        console.error('Create Profit Center Error:', error);
        res.status(400).json({ success: false, message: error.message || 'Gagal membuat Profit Center' });
    }
};

export const updateProfitCenter = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
        const { id } = req.params;
        const validated = organizationSchema.parse(req.body);

        const updated = await prisma.profitCenter.update({
            where: { id, perusahaanId },
            data: validated
        });

        res.json({ success: true, data: updated, message: 'Profit Center berhasil diperbarui' });
    } catch (error: any) {
        console.error('Update Profit Center Error:', error);
        res.status(400).json({ success: false, message: error.message || 'Gagal memperbarui Profit Center' });
    }
};

export const deleteProfitCenter = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
        const { id } = req.params;

        await prisma.profitCenter.delete({
            where: { id, perusahaanId }
        });

        res.json({ success: true, message: 'Profit Center berhasil dihapus' });
    } catch (error) {
        console.error('Delete Profit Center Error:', error);
        res.status(500).json({ success: false, message: 'Gagal menghapus Profit Center. Pastikan tidak ada data yang bergantung pada ini.' });
    }
};
