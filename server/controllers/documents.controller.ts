
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../../lib/prisma';
import { FileService } from '../services/file.service';
import { KategoriDokumen } from '@prisma/client';

/**
 * Upload a document and link it to a transaction or user
 */
export const uploadDocument = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
        const userId = authReq.user.id;

        // Multer handles the upload, file is in req.file
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'Tidak ada file yang diunggah' });
        }

        const {
            entityId,        // e.g. Transaction ID
            entityType,      // e.g. TRANSACTION, USER
            kategori,        // e.g. INVOICE, CONTRACT
            keterangan
        } = req.body;

        // Determine category enum
        const kategoriDokumen: KategoriDokumen = kategori || 'LAINNYA';

        // Save metadata to database
        const document = await prisma.dokumenTransaksi.create({
            data: {
                perusahaanId,
                jenisFile: file.mimetype,
                nama: file.originalname,
                urlFile: file.filename,
                ukuranFile: file.size,
                kategori: kategoriDokumen,
                deskripsi: keterangan,

                // Linkage
                transaksiId: entityType === 'TRANSACTION' ? entityId : undefined,
                uploadedById: userId
            }
        });

        res.status(201).json(document);

    } catch (error) {
        console.error('Upload Error:', error);
        // Clean up file if DB save fails
        if (req.file) {
            FileService.deleteFile(req.file.filename);
        }
        res.status(500).json({ message: 'Gagal mengunggah dokumen' });
    }
};

/**
 * Get Documents for a specific entity (Transaction)
 */
export const getDocuments = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
        const { entityId, entityType } = req.query;

        if (!entityId) {
            return res.status(400).json({ message: 'Entity ID diperlukan' });
        }

        const where: any = { perusahaanId };

        if (entityType === 'TRANSACTION' || !entityType) {
            where.transaksiId = String(entityId);
        }
        // Add more entity types if needed (e.g. Employee Contracts)

        const documents = await prisma.dokumenTransaksi.findMany({
            where,
            include: {
                uploadedBy: { select: { namaLengkap: true } }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Map URL to serveable path if needed, but for now we serve via static or stream
        // For security, strict stream endpoint is better.

        res.json(documents);

    } catch (error) {
        res.status(500).json({ message: 'Gagal memuat dokumen' });
    }
};

/**
 * Serve file content securely
 */
export const serveDocument = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;

        const doc = await prisma.dokumenTransaksi.findFirst({
            where: { id: String(id), perusahaanId }
        });

        if (!doc) {
            return res.status(404).json({ message: 'Dokumen tidak ditemukan' });
        }

        const filepath = FileService.getFilePath(doc.urlFile);
        res.download(filepath, doc.nama); // This sets Content-Disposition to attachment

    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil file' });
    }
};

/**
 * Delete Document
 */
export const deleteDocument = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;

        const doc = await prisma.dokumenTransaksi.findFirst({
            where: { id: String(id), perusahaanId }
        });

        if (!doc) {
            return res.status(404).json({ message: 'Dokumen tidak ditemukan' });
        }

        // Delete from Disk
        await FileService.deleteFile(doc.urlFile);

        // Delete from DB
        await prisma.dokumenTransaksi.delete({
            where: { id: String(id) }
        });

        res.json({ message: 'Dokumen berhasil dihapus' });

    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus dokumen' });
    }
};
