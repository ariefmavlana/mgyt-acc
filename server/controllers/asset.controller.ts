import { Request, Response } from 'express';
import { Prisma, StatusAsetTetap, MetodePenyusutan } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { createAssetSchema, updateAssetSchema, depreciationSchema } from '../validators/asset.validator';
import { AccountingEngine } from '../lib/accounting-engine';
import { AuditService } from '../services/audit.service';
import prisma from '../../lib/prisma';
import { format, startOfMonth, endOfMonth, addMonths } from 'date-fns';

export const getAssets = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;

        const assets = await prisma.asetTetap.findMany({
            where: { perusahaanId },
            include: {
                akunAset: { select: { kodeAkun: true, namaAkun: true } },
                akunAkumulasi: { select: { kodeAkun: true, namaAkun: true } },
                akunBeban: { select: { kodeAkun: true, namaAkun: true } },
                _count: { select: { penyusutan: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(assets);
    } catch (error) {
        console.error('Get assets error:', error);
        res.status(500).json({ message: 'Gagal mengambil daftar aset tetap' });
    }
};

export const getAssetById = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
        const { id } = req.params;

        const asset = await prisma.asetTetap.findFirst({
            where: { id, perusahaanId },
            include: {
                akunAset: true,
                akunAkumulasi: true,
                akunBeban: true,
                penyusutan: {
                    orderBy: { periode: 'desc' }
                },
                supplier: true
            }
        });

        if (!asset) {
            return res.status(404).json({ message: 'Aset tidak ditemukan' });
        }

        res.json(asset);
    } catch (error) {
        console.error('Get asset error:', error);
        res.status(500).json({ message: 'Gagal mengambil detail aset' });
    }
};

export const createAsset = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
        const validatedData = createAssetSchema.parse(req.body);

        const asset = await prisma.asetTetap.create({
            data: {
                ...validatedData,
                perusahaanId,
                tanggalPerolehan: new Date(validatedData.tanggalPerolehan),
                akumulasiPenyusutan: 0,
                nilaiBuku: validatedData.hargaPerolehan
            }
        });

        await AuditService.log(perusahaanId, authReq.user!.id, 'CREATE', 'ASET_TETAP', asset.id, null, asset);

        res.status(201).json(asset);
    } catch (error: any) {
        console.error('Create asset error:', error);
        res.status(400).json({ message: error.message || 'Gagal mendaftarkan aset baru' });
    }
};

export const calculateDepreciation = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
        const { id } = req.params;
        const { tanggal } = depreciationSchema.parse(req.body);

        const engine = new AccountingEngine(prisma);
        const date = new Date(tanggal);
        const periodeStr = format(date, 'yyyy-MM');

        // Check if period is open
        await engine.validatePeriod(perusahaanId, date);

        const asset = await prisma.asetTetap.findUnique({
            where: { id },
            include: { penyusutan: true }
        });

        if (!asset || asset.perusahaanId !== perusahaanId) {
            return res.status(404).json({ message: 'Aset tidak ditemukan' });
        }

        // Check if already depreciated for this period
        const existing = await prisma.penyusutan.findFirst({
            where: { asetId: id, periode: periodeStr }
        });

        if (existing) {
            return res.status(400).json({ message: `Penyusutan untuk periode ${periodeStr} sudah tercatat.` });
        }

        // Calculation (Garis Lurus)
        const hargaPerolehan = Number(asset.hargaPerolehan);
        const nilaiResidu = Number(asset.nilaiResidu);
        const masaManfaat = asset.masaManfaat; // dalam tahun

        let bebanPenyusutan = 0;
        if (asset.metodePenyusutan === MetodePenyusutan.GARIS_LURUS) {
            bebanPenyusutan = (hargaPerolehan - nilaiResidu) / (masaManfaat * 12);
        }

        const akumulasiLalu = Number(asset.akumulasiPenyusutan);
        const akumulasiBaru = akumulasiLalu + bebanPenyusutan;
        const nilaiBukuBaru = hargaPerolehan - akumulasiBaru;

        // Transactional Update
        const result = await prisma.$transaction(async (tx) => {
            const penyusutan = await tx.penyusutan.create({
                data: {
                    asetId: id,
                    tanggal: date,
                    periode: periodeStr,
                    bulan: date.getMonth() + 1,
                    tahun: date.getFullYear(),
                    nilaiAwal: asset.nilaiBuku,
                    bebanPenyusutan,
                    akumulasi: akumulasiBaru,
                    nilaiBuku: nilaiBukuBaru,
                    keterangan: `Penyusutan otomatis periode ${periodeStr}`
                }
            });

            await tx.asetTetap.update({
                where: { id },
                data: {
                    akumulasiPenyusutan: akumulasiBaru,
                    nilaiBuku: nilaiBukuBaru
                }
            });

            return penyusutan;
        });

        res.json(result);
    } catch (error: any) {
        console.error('Calculate depreciation error:', error);
        res.status(400).json({ message: error.message || 'Gagal menghitung penyusutan' });
    }
};

export const deleteAsset = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
        const { id } = req.params;

        await prisma.asetTetap.delete({
            where: { id, perusahaanId }
        });

        res.json({ message: 'Aset berhasil dihapus' });
    } catch (error) {
        console.error('Delete asset error:', error);
        res.status(500).json({ message: 'Gagal menghapus aset' });
    }
};
