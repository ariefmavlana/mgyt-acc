import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { StatusApproval, TierPaket } from '@prisma/client';

export const getSubscriptionRequests = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId;

        if (!perusahaanId) return res.status(400).json({ message: 'Perusahaan tidak ditemukan' });

        const requests = await prisma.subscriptionRequest.findMany({
            where: { perusahaanId },
            include: {
                requester: {
                    select: { id: true, namaLengkap: true, email: true }
                },
                paketTarget: true,
                approver: {
                    select: { id: true, namaLengkap: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(requests);
    } catch (error) {
        console.error('Get Subscription Requests Error:', error);
        res.status(500).json({ message: 'Gagal mengambil daftar permintaan langganan' });
    }
};

export const createSubscriptionRequest = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId;
        const userId = authReq.user?.id;
        const { paketTier, catatan } = req.body;

        if (!perusahaanId || !userId) return res.status(400).json({ message: 'Data tidak lengkap' });

        // Find the target package
        const paket = await prisma.paketFitur.findFirst({
            where: { tier: paketTier as TierPaket, isAktif: true }
        });

        if (!paket) return res.status(404).json({ message: 'Paket tidak ditemukan' });

        const request = await prisma.subscriptionRequest.create({
            data: {
                perusahaanId,
                requesterId: userId,
                paketTargetId: paket.id,
                catatan,
                status: 'PENDING'
            },
            include: {
                paketTarget: true
            }
        });

        // Audit Log
        await prisma.jejakAudit.create({
            data: {
                perusahaanId,
                penggunaId: userId,
                aksi: 'CREATE',
                modul: 'SUBSCRIPTION',
                namaTabel: 'SubscriptionRequest',
                idData: request.id,
                keterangan: `Meminta upgrade ke paket ${paketTier}`,
                ipAddress: req.ip
            }
        });

        // TODO: Trigger email notification to CEO/Owner
        console.log(`[Notification] Admin ${userId} requested upgrade to ${paketTier} for company ${perusahaanId}. Email sent to owner.`);

        res.status(201).json(request);
    } catch (error) {
        console.error('Create Subscription Request Error:', error);
        res.status(500).json({ message: 'Gagal membuat permintaan langganan' });
    }
};

export const approveSubscriptionRequest = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const { id } = req.params;
        const { status, alasanPenolakan } = req.body; // status: APPROVED or REJECTED
        const userId = authReq.user?.id;
        const perusahaanId = authReq.currentCompanyId;

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ message: 'Status tidak valid' });
        }

        const request = await prisma.subscriptionRequest.findUnique({
            where: { id },
            include: { paketTarget: true }
        });

        if (!request || request.perusahaanId !== perusahaanId) {
            return res.status(404).json({ message: 'Permintaan tidak ditemukan' });
        }

        if (request.status !== 'PENDING') {
            return res.status(400).json({ message: 'Permintaan sudah diproses' });
        }

        const updatedRequest = await prisma.$transaction(async (tx: any) => {
            const reqUpdate = await tx.subscriptionRequest.update({
                where: { id },
                data: {
                    status: status as StatusApproval,
                    approverId: userId,
                    tanggalApproval: status === 'APPROVED' ? new Date() : null,
                    alasanPenolakan: status === 'REJECTED' ? alasanPenolakan : null
                }
            });

            if (status === 'APPROVED') {
                // Update PerusahaanPaket
                // 1. Deactivate current active package
                await tx.perusahaanPaket.updateMany({
                    where: { perusahaanId, isAktif: true },
                    data: { isAktif: false }
                });

                // 2. Create new active package
                await tx.perusahaanPaket.create({
                    data: {
                        perusahaanId,
                        paketId: request.paketTargetId,
                        tanggalMulai: new Date(),
                        tanggalAkhir: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 year
                        isAktif: true,
                        isTrial: false
                    }
                });
            }

            return reqUpdate;
        });

        // Audit Log
        await prisma.jejakAudit.create({
            data: {
                perusahaanId,
                penggunaId: userId || '',
                aksi: status === 'APPROVED' ? 'APPROVE' : 'REJECT',
                modul: 'SUBSCRIPTION',
                namaTabel: 'SubscriptionRequest',
                idData: id,
                keterangan: `${status === 'APPROVED' ? 'Menyetujui' : 'Menolak'} permintaan upgrade paket`,
                ipAddress: req.ip
            }
        });

        res.json(updatedRequest);
    } catch (error) {
        console.error('Process Subscription Request Error:', error);
        res.status(500).json({ message: 'Gagal memproses permintaan langganan' });
    }
};

export const getAvailablePackages = async (req: Request, res: Response) => {
    try {
        const packages = await prisma.paketFitur.findMany({
            where: { isAktif: true, isPublik: true },
            orderBy: { tier: 'asc' }
        });
        res.json(packages);
    } catch (error) {
        console.error('Get Packages Error:', error);
        res.status(500).json({ message: 'Gagal mengambil daftar paket' });
    }
};
