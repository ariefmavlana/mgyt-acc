import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import { JenisPajak, Prisma } from '@prisma/client';

export const getTaxes = async (req: Request, res: Response) => {
    try {
        const { perusahaanId } = req.query;

        if (!perusahaanId) {
            return res.status(400).json({ message: 'Perusahaan ID diperlukan' });
        }

        const taxes = await prisma.masterPajak.findMany({
            where: {
                perusahaanId: perusahaanId as string,
                isAktif: true,
            },
            orderBy: {
                kodePajak: 'asc',
            },
        });

        res.json(taxes);
    } catch (error) {
        console.error('Error fetching taxes:', error);
        res.status(500).json({ message: 'Gagal mengambil data pajak' });
    }
};

export const createTax = async (req: Request, res: Response) => {
    try {
        const { perusahaanId, kodePajak, namaPajak, jenis, tarif, akunPajak, isPemungut, keterangan } = req.body;

        if (!perusahaanId || !kodePajak || !namaPajak || !jenis || tarif === undefined) {
            return res.status(400).json({ message: 'Data pajak tidak lengkap' });
        }

        const tax = await prisma.masterPajak.create({
            data: {
                perusahaanId,
                kodePajak,
                namaPajak,
                jenis: jenis as JenisPajak,
                tarif,
                akunPajak,
                isPemungut: !!isPemungut,
                keterangan,
            },
        });

        res.status(201).json(tax);
    } catch (error: unknown) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
            return res.status(400).json({ message: 'Kode pajak sudah digunakan' });
        }
        console.error('Error creating tax:', error);
        res.status(500).json({ message: 'Gagal membuat data pajak' });
    }
};

export const updateTax = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const tax = await prisma.masterPajak.update({
            where: { id: id as string },
            data,
        });

        res.json(tax);
    } catch (error) {
        console.error('Error updating tax:', error);
        res.status(500).json({ message: 'Gagal mengupdate data pajak' });
    }
};

export const deleteTax = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Soft delete
        const tax = await prisma.masterPajak.update({
            where: { id: id as string },
            data: { isAktif: false },
        });

        res.json({ message: 'Pajak berhasil dinonaktifkan', tax });
    } catch (error) {
        console.error('Error deleting tax:', error);
        res.status(500).json({ message: 'Gagal menonaktifkan data pajak' });
    }
};

export const getTaxReport = async (req: Request, res: Response) => {
    try {
        const { perusahaanId, startDate, endDate } = req.query;

        if (!perusahaanId) {
            return res.status(400).json({ message: 'Perusahaan ID diperlukan' });
        }

        const where: Prisma.TransaksiPajakWhereInput = {
            transaksi: {
                perusahaanId: perusahaanId as string,
            }
        };

        if (startDate && endDate) {
            where.transaksi = {
                is: {
                    tanggal: {
                        gte: new Date(startDate as string),
                        lte: new Date(endDate as string),
                    }
                }
            };
        }

        const taxTransactions = await prisma.transaksiPajak.findMany({
            where,
            include: {
                pajak: true,
                transaksi: {
                    select: {
                        nomorTransaksi: true,
                        tanggal: true,
                        deskripsi: true,
                        referensi: true,
                    }
                }
            },
            orderBy: {
                transaksi: {
                    tanggal: 'desc',
                }
            }
        });

        // Summary by type
        const summary = taxTransactions.reduce((acc: Record<string, { totalDasar: number, totalPajak: number, count: number }>, curr: Prisma.TransaksiPajakGetPayload<{ include: { pajak: true } }>) => {
            const jenis = curr.pajak.jenis as string;
            if (!acc[jenis]) {
                acc[jenis] = {
                    totalDasar: 0,
                    totalPajak: 0,
                    count: 0
                };
            }
            acc[jenis].totalDasar += Number(curr.dasar);
            acc[jenis].totalPajak += Number(curr.jumlah);
            acc[jenis].count += 1;
            return acc;
        }, {});

        res.json({
            summary,
            details: taxTransactions
        });
    } catch (error) {
        console.error('Error generating tax report:', error);
        res.status(500).json({ message: 'Gagal membuat laporan pajak' });
    }
};

export const fileTaxReport = async (req: Request, res: Response) => {
    try {
        const { perusahaanId, jenisPajak, masaPajak, tahunPajak, dpp, pajak, nomorBuktiPenerimaan, dokumen } = req.body;

        if (!perusahaanId || !jenisPajak || !masaPajak || !tahunPajak) {
            return res.status(400).json({ message: 'Data laporan pajak tidak lengkap' });
        }

        const report = await prisma.laporanPajak.upsert({
            where: {
                perusahaanId_jenisPajak_masaPajak_tahunPajak: {
                    perusahaanId,
                    jenisPajak,
                    masaPajak,
                    tahunPajak
                }
            },
            create: {
                perusahaanId,
                jenisPajak,
                masaPajak,
                tahunPajak,
                dpp: dpp || 0,
                pajak: pajak || 0,
                nomorBuktiPenerimaan,
                dokumen,
                statusLaporan: 'FILED',
                tanggalLapor: new Date()
            },
            update: {
                dpp: dpp || 0,
                pajak: pajak || 0,
                nomorBuktiPenerimaan,
                dokumen,
                statusLaporan: 'FILED',
                tanggalLapor: new Date()
            }
        });

        res.status(201).json(report);
    } catch (error) {
        console.error('Error filing tax report:', error);
        res.status(500).json({ message: 'Gagal melakukan pelaporan pajak' });
    }
};

export const getFiledTaxReports = async (req: Request, res: Response) => {
    try {
        const { perusahaanId, tahun } = req.query;

        if (!perusahaanId) {
            return res.status(400).json({ message: 'Perusahaan ID diperlukan' });
        }

        const reports = await prisma.laporanPajak.findMany({
            where: {
                perusahaanId: perusahaanId as string,
                tahunPajak: tahun ? parseInt(tahun as string) : undefined
            },
            orderBy: [
                { tahunPajak: 'desc' },
                { masaPajak: 'desc' }
            ]
        });

        res.json(reports);
    } catch (error) {
        console.error('Error fetching filed tax reports:', error);
        res.status(500).json({ message: 'Gagal mengambil history laporan pajak' });
    }
};
