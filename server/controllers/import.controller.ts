import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../../lib/prisma';
import ExcelJS from 'exceljs';
import { AccountingEngine } from '../lib/accounting-engine';
import { TipeTransaksi } from '@prisma/client';

export const importCSV = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
        const { data } = req.body; // Expecting raw CSV string or processed array

        if (!data) return res.status(400).json({ message: 'Data tidak ditemukan' });

        const result = await prisma.$transaction(async (tx) => {
            const engine = new AccountingEngine(tx);
            const imports = [];

            // Simulating CSV parsing if it's a string
            let rows = Array.isArray(data) ? data : [];

            for (const row of rows) {
                // row: { tanggal, tipe, deskripsi, items: [{ kodeAkun, debit, kredit }] }
                const tanggal = new Date(row.tanggal);
                await engine.validatePeriod(perusahaanId, tanggal);

                const nomorTransaksi = await engine.generateNumber(perusahaanId, 'TX', 'transaksi');
                const nomorVoucher = await engine.generateNumber(perusahaanId, 'VC', 'voucher');
                const nomorJurnal = await engine.generateNumber(perusahaanId, 'JU', 'jurnalUmum');

                // Find period ID
                const period = await tx.periodeAkuntansi.findFirst({
                    where: {
                        perusahaanId,
                        bulan: tanggal.getMonth() + 1,
                        tahun: tanggal.getFullYear()
                    }
                });

                if (!period) throw new Error(`Periode untuk ${row.tanggal} tidak ditemukan`);

                // Create Transaksi
                const transaksi = await tx.transaksi.create({
                    data: {
                        perusahaanId,
                        nomorTransaksi,
                        tanggal,
                        tipe: row.tipe as TipeTransaksi,
                        deskripsi: row.deskripsi,
                        totalAmount: row.totalAmount,
                        createdById: authReq.user.id
                    }
                });

                // Create Voucher
                const voucher = await tx.voucher.create({
                    data: {
                        perusahaanId,
                        transaksiId: transaksi.id,
                        nomorVoucher,
                        tanggal,
                        tipe: 'JURNAL_UMUM',
                        totalAmount: row.totalAmount,
                        keterangan: row.deskripsi,
                        status: 'DIPOSTING'
                    }
                });

                // Create Jurnal
                const jurnal = await tx.jurnalUmum.create({
                    data: {
                        perusahaanId,
                        voucherId: voucher.id,
                        periodeId: period.id,
                        nomorJurnal,
                        tanggal,
                        deskripsi: row.deskripsi,
                        totalDebit: row.totalAmount,
                        totalKredit: row.totalAmount,
                        isPosted: true,
                        postedAt: new Date()
                    }
                });

                // Process Items
                for (const [index, item] of row.items.entries()) {
                    const account = await tx.chartOfAccounts.findFirst({
                        where: { perusahaanId, kode: item.kodeAkun }
                    });
                    if (!account) throw new Error(`Akun ${item.kodeAkun} tidak ditemukan`);

                    const type = Number(item.debit) > 0 ? 'DEBIT' : 'KREDIT';
                    const amount = Number(item.debit) > 0 ? Number(item.debit) : Number(item.kredit);

                    const { saldoSebelum, saldoSesudah } = await engine.updateBalance(
                        perusahaanId,
                        account.id,
                        amount,
                        type
                    );

                    await tx.jurnalDetail.create({
                        data: {
                            jurnalId: jurnal.id,
                            urutan: index + 1,
                            akunId: account.id,
                            deskripsi: item.deskripsi || row.deskripsi,
                            debit: item.debit,
                            kredit: item.kredit,
                            saldoSebelum,
                            saldoSesudah
                        }
                    });
                }
                imports.push(transaksi.id);
            }
            return imports;
        });

        res.json({
            message: `Berhasil mengimport ${result.length} transaksi`,
            ids: result
        });
    } catch (error: any) {
        console.error(error);
        res.status(400).json({ message: error.message || 'Gagal mengimport data' });
    }
};
