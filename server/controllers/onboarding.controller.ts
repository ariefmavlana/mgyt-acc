import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const getOnboardingStatus = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const companyId = authReq.currentCompanyId!;

        if (!companyId) return res.status(400).json({ message: 'No company context' });

        const company = await prisma.perusahaan.findUnique({
            where: { id: companyId },
            select: { onboardingStatus: true, nama: true }
        });

        res.json(company);
    } catch {
        res.status(500).json({ message: 'Error fetching onboarding status' });
    }
};

export const setupCompany = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const companyId = authReq.currentCompanyId!;
        const data = req.body;

        await prisma.perusahaan.update({
            where: { id: companyId },
            data: {
                ...data,
                onboardingStatus: 'STEP1_COMPLETED'
            }
        });

        res.json({ message: 'Company information updated' });
    } catch {
        res.status(500).json({ message: 'Error updating company info' });
    }
};

export const setupBranches = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const companyId = authReq.currentCompanyId!;
        const { branches } = req.body; // Array of branch objects

        await prisma.$transaction(async (tx) => {
            for (const b of branches) {
                await tx.cabang.create({
                    data: {
                        ...b,
                        perusahaanId: companyId
                    }
                });
            }

            await tx.perusahaan.update({
                where: { id: companyId },
                data: { onboardingStatus: 'STEP2_COMPLETED' }
            });
        });

        res.json({ message: 'Branches created' });
    } catch {
        res.status(500).json({ message: 'Error creating branches' });
    }
};

export const setupCOA = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const companyId = authReq.currentCompanyId!;
        const { template } = req.body; // 'STANDARD', 'TRADING', 'SERVICE', NULL

        if (template) {
            // Logic to seed COA from template
            // For now, let's assume we have a basic template seeder
            await seedCOATemplate(companyId!);
        }

        await prisma.perusahaan.update({
            where: { id: companyId },
            data: { onboardingStatus: 'STEP3_COMPLETED' }
        });

        res.json({ message: 'COA initialized' });
    } catch (error: unknown) {
        console.error(error);
        res.status(500).json({ message: 'Error initializing COA' });
    }
};

export const finalizeOnboarding = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const companyId = authReq.currentCompanyId!;

        await prisma.perusahaan.update({
            where: { id: companyId },
            data: { onboardingStatus: 'COMPLETED' }
        });

        res.json({ message: 'Onboarding completed! Welcome aboard.' });
    } catch {
        res.status(500).json({ message: 'Error finalizing onboarding' });
    }
};

async function seedCOATemplate(perusahaanId: string) {
    // Simple template seeder
    const accounts = await prisma.chartOfAccounts.findMany({
        where: {
            perusahaanId
        }
    });

    await prisma.chartOfAccounts.createMany({
        data: accounts.map(acc => ({
            ...acc,
            perusahaanId
        }))
    });
}
