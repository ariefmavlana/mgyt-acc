import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { calculatePayrollSchema } from '../validators/payroll.validator';
import { AuditService } from '../services/audit.service';
import { Prisma } from '@prisma/client';
import PDFDocument from 'pdfkit';

/**
 * PPh 21 Calculation Engine (Simplified Progressive)
 */
const calculatePPh21 = (grossSalary: number, ptkpStatus: string): number => {
    const ptkpMap: Record<string, number> = {
        'TK/0': 54000000,
        'K/0': 58500000,
        'K/1': 63000000,
        'K/2': 67500000,
        'K/3': 72000000,
    };

    const annualGross = grossSalary * 12;
    const ptkp = ptkpMap[ptkpStatus] || 54000000;
    const pkp = Math.max(0, annualGross - ptkp);

    let annualTax = 0;
    let remainingPkp = pkp;

    const brackets = [
        { limit: 60000000, rate: 0.05 },
        { limit: 190000000, rate: 0.15 },
        { limit: 250000000, rate: 0.25 },
        { limit: 4500000000, rate: 0.30 },
        { limit: Infinity, rate: 0.35 },
    ];

    for (const bracket of brackets) {
        if (remainingPkp <= 0) break;
        const taxable = Math.min(remainingPkp, bracket.limit);
        annualTax += taxable * bracket.rate;
        remainingPkp -= taxable;
    }

    return annualTax / 12;
};

export const processPayroll = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
        const { period, employeeId, tanggalBayar } = calculatePayrollSchema.parse(req.body);

        const where: Prisma.KaryawanWhereInput = { status: 'AKTIF' };
        if (employeeId) where.id = employeeId;

        const employees = await prisma.karyawan.findMany({ where });

        if (employees.length === 0) {
            return res.status(404).json({ message: 'Tidak ada karyawan aktif untuk diproses' });
        }

        const payrolls = [];

        for (const emp of employees) {
            const gajiPokok = Number(emp.gajiPokok);
            const tunjangan = 0;
            const lembur = 0;
            const bonus = 0;
            const totalPenghasilan = gajiPokok + tunjangan + lembur + bonus;

            const potonganBpjs = totalPenghasilan * 0.01;
            const pph21 = calculatePPh21(totalPenghasilan, emp.statusPernikahan || 'TK/0');
            const totalPotongan = potonganBpjs + pph21;
            const netto = totalPenghasilan - totalPotongan;

            const payroll = await prisma.penggajian.upsert({
                where: {
                    perusahaanId_karyawanId_periode: {
                        perusahaanId,
                        karyawanId: emp.id,
                        periode: period
                    }
                },
                update: {
                    tanggalBayar: new Date(tanggalBayar),
                    gajiPokok,
                    tunjangan,
                    lembur,
                    bonus,
                    totalPenghasilan,
                    potonganBpjs,
                    potonganPph21: pph21,
                    totalPotongan,
                    netto,
                    sudahDibayar: false
                },
                create: {
                    perusahaanId,
                    karyawanId: emp.id,
                    periode: period,
                    tanggalBayar: new Date(tanggalBayar),
                    gajiPokok,
                    tunjangan,
                    lembur,
                    bonus,
                    totalPenghasilan,
                    potonganBpjs,
                    potonganPph21: pph21,
                    totalPotongan,
                    netto,
                    sudahDibayar: false
                }
            });

            payrolls.push(payroll);
        }

        await AuditService.log({
            perusahaanId,
            userId: authReq.user!.id,
            action: 'PROCESS',
            entity: 'PAYROLL',
            entityId: period,
            details: `Processed payroll for ${payrolls.length} employees`,
            metadata: { count: payrolls.length }
        });

        res.json({ message: `Berhasil memproses payroll untuk ${payrolls.length} karyawan`, data: payrolls });
    } catch (error: unknown) {
        console.error('Process Payroll Error:', error);
        const message = error instanceof Error ? error.message : 'Gagal memproses payroll';
        res.status(400).json({ message });
    }
};

export const getPayrollHistory = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
        const { period } = req.query;

        const where: Prisma.PenggajianWhereInput = {};
        if (period) where.periode = period as string;

        const history = await prisma.penggajian.findMany({
            where,
            include: {
                karyawan: {
                    select: { nama: true, nik: true, jabatan: true, departemen: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(history);
    } catch (error) {
        console.error('Get Payroll History Error:', error);
        res.status(500).json({ message: 'Gagal mengambil riwayat payroll' });
    }
};

export const postPayrollToJournal = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
        const { period } = req.body;

        const payrolls = await prisma.penggajian.findMany({
            where: {
                periode: period,
                sudahDijurnal: false
            }
        });

        if (payrolls.length === 0) {
            return res.status(400).json({ message: 'Tidak ada payroll yang perlu diposting untuk periode ini' });
        }

        const totals = payrolls.reduce((acc, curr) => ({
            gaji: acc.gaji + Number(curr.totalPenghasilan),
            pph: acc.pph + Number(curr.potonganPph21),
            bpjs: acc.bpjs + Number(curr.potonganBpjs),
            netto: acc.netto + Number(curr.netto)
        }), { gaji: 0, pph: 0, bpjs: 0, netto: 0 });

        const result = await prisma.$transaction(async (tx) => {
            const expenseAccount = await tx.chartOfAccounts.findFirst({
                where: { perusahaanId, kategoriBeban: 'BEBAN_GAJI_DAN_TUNJANGAN' }
            }) || await tx.chartOfAccounts.findFirst({ where: { perusahaanId, tipe: 'BEBAN', namaAkun: { contains: 'Gaji' } } });

            const taxPayable = await tx.chartOfAccounts.findFirst({
                where: { perusahaanId, kategoriLiabilitas: 'HUTANG_PAJAK' }
            }) || await tx.chartOfAccounts.findFirst({ where: { perusahaanId, tipe: 'LIABILITAS', namaAkun: { contains: 'PPh' } } });

            const bpjsPayable = await tx.chartOfAccounts.findFirst({
                where: { perusahaanId, kategoriLiabilitas: 'HUTANG_JANGKA_PENDEK_LAINNYA' }
            }) || await tx.chartOfAccounts.findFirst({ where: { perusahaanId, tipe: 'LIABILITAS', namaAkun: { contains: 'BPJS' } } });

            const cashAccount = await tx.chartOfAccounts.findFirst({
                where: { perusahaanId, kategoriAset: 'KAS_DAN_SETARA_KAS' }
            });

            if (!expenseAccount || !cashAccount) throw new Error('Akun Beban Gaji atau Kas tidak ditemukan. Harap atur COA Anda.');

            const voucher = await tx.voucher.create({
                data: {
                    perusahaanId,
                    nomorVoucher: `PYR-${period}-${Date.now().toString().slice(-4)}`,
                    tanggal: new Date(),
                    tipe: 'KAS_KELUAR',
                    deskripsi: `Posting Payroll Periode ${period}`,
                    totalDebit: totals.gaji,
                    totalKredit: totals.gaji,
                    status: 'DIPOSTING',
                    dibuatOlehId: authReq.user.id,
                    isPosted: true,
                    postedAt: new Date(),
                    postedBy: authReq.user.username,
                    detail: {
                        create: [
                            { urutan: 1, akunId: expenseAccount.id, debit: totals.gaji, kredit: 0, deskripsi: 'Beban Gaji Karyawan' },
                            { urutan: 2, akunId: cashAccount.id, debit: 0, kredit: totals.netto, deskripsi: 'Pembayaran Gaji Netto' },
                            { urutan: 3, akunId: taxPayable?.id || cashAccount.id, debit: 0, kredit: totals.pph, deskripsi: 'Hutang PPh 21' },
                            { urutan: 4, akunId: bpjsPayable?.id || cashAccount.id, debit: 0, kredit: totals.bpjs, deskripsi: 'Hutang BPJS' }
                        ].filter(d => d.kredit > 0 || d.debit > 0)
                    }
                }
            });

            await tx.penggajian.updateMany({
                where: { id: { in: payrolls.map(p => p.id) } },
                data: { sudahDijurnal: true, sudahDibayar: true }
            });

            return voucher;
        });

        await AuditService.log({
            perusahaanId,
            userId: authReq.user!.id,
            action: 'POST',
            entity: 'PAYROLL',
            entityId: period,
            details: `Posted payroll for period ${period} to journal`,
            metadata: totals as any
        });

        res.json({ message: `Payroll periode ${period} berhasil diposting ke jurnal`, data: result });
    } catch (error: unknown) {
        console.error('Post Payroll Error:', error);
        const message = error instanceof Error ? error.message : 'Gagal melakukan posting payroll';
        res.status(400).json({ message });
    }
};

export const downloadSlipGaji = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
        const { id } = req.params;

        const payroll = await prisma.penggajian.findUnique({
            where: { id },
            include: {
                karyawan: {
                    include: { perusahaan: true }
                }
            }
        });

        if (!payroll) return res.status(404).json({ message: 'Slip gaji tidak ditemukan' });

        const doc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=SlipGaji-${payroll.karyawan.nama}-${payroll.periode}.pdf`);
        doc.pipe(res);

        doc.fontSize(20).text(payroll.karyawan.perusahaan.nama, { align: 'center' });
        doc.fontSize(10).text(payroll.karyawan.perusahaan.alamat || '', { align: 'center' });
        doc.moveDown();
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();

        doc.fontSize(16).text('SLIP GAJI', { align: 'center', underline: true });
        doc.fontSize(12).text(`Periode: ${payroll.periode}`, { align: 'center' });
        doc.moveDown();

        doc.fontSize(10).text(`NIK: ${payroll.karyawan.nik}`);
        doc.text(`Nama: ${payroll.karyawan.nama}`);
        doc.text(`Jabatan: ${payroll.karyawan.jabatan}`);
        doc.text(`Departemen: ${payroll.karyawan.departemen}`);
        doc.moveDown();

        const startY = doc.y;
        doc.fontSize(12).text('PENGHASILAN', 50, startY, { underline: true });
        doc.fontSize(10);
        doc.text('Gaji Pokok', 60, startY + 20).text(new Intl.NumberFormat('id-ID').format(Number(payroll.gajiPokok)), 200, startY + 20, { align: 'right', width: 100 });
        doc.text('Tunjangan', 60, startY + 35).text(new Intl.NumberFormat('id-ID').format(Number(payroll.tunjangan)), 200, startY + 35, { align: 'right', width: 100 });
        doc.text('Lembur/Bonus', 60, startY + 50).text(new Intl.NumberFormat('id-ID').format(Number(payroll.lembur) + Number(payroll.bonus)), 200, startY + 50, { align: 'right', width: 100 });
        doc.font('Helvetica-Bold').text('Total Penghasilan', 60, startY + 70).text(new Intl.NumberFormat('id-ID').format(Number(payroll.totalPenghasilan)), 200, startY + 70, { align: 'right', width: 100 });

        doc.font('Helvetica').fontSize(12).text('POTONGAN', 350, startY, { underline: true });
        doc.fontSize(10);
        doc.text('PPh 21', 360, startY + 20).text(new Intl.NumberFormat('id-ID').format(Number(payroll.potonganPph21)), 450, startY + 20, { align: 'right', width: 100 });
        doc.text('BPJS', 360, startY + 35).text(new Intl.NumberFormat('id-ID').format(Number(payroll.potonganBpjs)), 450, startY + 35, { align: 'right', width: 100 });
        doc.font('Helvetica-Bold').text('Total Potongan', 360, startY + 50).text(new Intl.NumberFormat('id-ID').format(Number(payroll.totalPotongan)), 450, startY + 50, { align: 'right', width: 100 });

        doc.moveDown(5);
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();

        doc.fontSize(14).text('TAKE HOME PAY', 50, doc.y, { continued: true });
        doc.text(`: Rp ${new Intl.NumberFormat('id-ID').format(Number(payroll.netto))}`, { align: 'right' });

        doc.moveDown(4);
        doc.fontSize(10).text('Dibuat Oleh,', 400, doc.y, { align: 'center' });
        doc.moveDown(3);
        doc.text('____________________', 400, doc.y, { align: 'center' });
        doc.text('Finance Department', 400, doc.y + 15, { align: 'center' });

        doc.end();
    } catch (error) {
        console.error('Download Slip Gaji Error:', error);
        res.status(500).json({ message: 'Gagal generate PDF slip gaji' });
    }
};
