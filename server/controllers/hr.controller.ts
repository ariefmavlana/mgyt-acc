
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import { calculateBPJS, calculatePPh21 } from '../utils/payroll.utils';
import ExcelJS from 'exceljs';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

/**
 * Export employees to Excel
 */
export const exportEmployees = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
        const { search, department, status } = req.query;

        const where: Prisma.KaryawanWhereInput = {
            perusahaanId,
            ...(status && status !== 'ALL' ? { status: String(status) } : {}),
            ...(department && department !== 'ALL' ? { departemen: String(department) } : {}),
            ...(search ? {
                OR: [
                    { nama: { contains: String(search), mode: 'insensitive' } },
                    { nik: { contains: String(search), mode: 'insensitive' } },
                    { jabatan: { contains: String(search), mode: 'insensitive' } }
                ]
            } : {})
        };

        const employees = await prisma.karyawan.findMany({
            where,
            orderBy: { nama: 'asc' }
        });

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Data Karyawan');

        // Columns
        sheet.columns = [
            { header: 'NIK', key: 'nik', width: 15 },
            { header: 'Nama Lengkap', key: 'nama', width: 30 },
            { header: 'Jabatan', key: 'jabatan', width: 20 },
            { header: 'Departemen', key: 'departemen', width: 20 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Tanggal Masuk', key: 'tanggalMasuk', width: 20 },
            { header: 'Gaji Pokok', key: 'gajiPokok', width: 15 },
            { header: 'Status PTKP', key: 'statusPernikahan', width: 15 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'Telepon', key: 'telepon', width: 20 },
        ];

        // Styling
        sheet.getRow(1).font = { bold: true };
        sheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        // Add rows
        employees.forEach(emp => {
            sheet.addRow({
                nik: emp.nik,
                nama: emp.nama,
                jabatan: emp.jabatan,
                departemen: emp.departemen,
                status: emp.status,
                tanggalMasuk: emp.tanggalMasuk ? format(new Date(emp.tanggalMasuk), 'dd/MM/yyyy') : '-',
                gajiPokok: Number(emp.gajiPokok),
                statusPernikahan: emp.statusPernikahan || '-',
                email: emp.email || '-',
                telepon: emp.telepon || '-',
            });
        });

        // Numeric format for salary
        sheet.getColumn('gajiPokok').numFmt = '#,##0';

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Karyawan-${format(new Date(), 'yyyyMMdd')}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error exporting employees:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Get all employees for the current company
 */
export const getEmployees = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
        const { search, department, status } = req.query;

        const where: Prisma.KaryawanWhereInput = {
            perusahaanId,
            ...(status && status !== 'ALL' ? { status: String(status) } : {}),
            ...(department && department !== 'ALL' ? { departemen: String(department) } : {}),
            ...(search ? {
                OR: [
                    { nama: { contains: String(search), mode: 'insensitive' } },
                    { nik: { contains: String(search), mode: 'insensitive' } },
                    { jabatan: { contains: String(search), mode: 'insensitive' } }
                ]
            } : {})
        };

        const employees = await prisma.karyawan.findMany({
            where,
            orderBy: { nama: 'asc' }
        });

        res.json({
            success: true,
            data: employees
        });
    } catch (error: unknown) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Create a new employee
 */
export const createEmployee = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
        const data = req.body;

        const employee = await prisma.karyawan.create({
            data: {
                ...data,
                perusahaanId,
                gajiPokok: new Prisma.Decimal(data.gajiPokok || 0)
            }
        });

        res.status(201).json({
            success: true,
            data: employee,
            message: 'Karyawan berhasil ditambahkan'
        });
    } catch (error) {
        console.error('Error creating employee:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Get details of a specific employee
 */
export const getEmployeeById = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
        const { id } = req.params;

        const employee = await prisma.karyawan.findFirst({
            where: { id: String(id), perusahaanId }
        });

        if (!employee) {
            return res.status(404).json({ success: false, message: 'Karyawan tidak ditemukan' });
        }

        res.json({
            success: true,
            data: employee
        });
    } catch (error) {
        console.error('Error fetching employee:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Update employee details
 */
export const updateEmployee = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
        const { id } = req.params;
        const data = req.body;

        const employee = await prisma.karyawan.findFirst({
            where: { id: String(id), perusahaanId }
        });

        if (!employee) {
            return res.status(404).json({ success: false, message: 'Karyawan tidak ditemukan' });
        }

        const updated = await prisma.karyawan.update({
            where: { id: String(id) },
            data: {
                ...data,
                gajiPokok: data.gajiPokok ? new Prisma.Decimal(data.gajiPokok) : undefined,
                statusPernikahan: data.statusPernikahan // Allow update
            }
        });

        res.json({
            success: true,
            data: updated,
            message: 'Data karyawan berhasil diperbarui'
        });
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Get Payrolls
 */
export const getPayrolls = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!; // Payroll linked to employee which is linked to company
        const { period } = req.query; // Format: YYYY-MM

        const where: Prisma.PenggajianWhereInput = {
            perusahaanId,
            ...(period ? { periode: String(period) } : {})
        };

        const payrolls = await prisma.penggajian.findMany({
            where,
            include: {
                karyawan: {
                    select: { nama: true, nik: true, jabatan: true }
                }
            },
            orderBy: { periode: 'desc' }
        });

        res.json({
            success: true,
            data: payrolls
        });
    } catch (error) {
        console.error('Error fetching payrolls:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Generate Payroll for a Period
 */
export const generatePayroll = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
        const { period, date } = req.body; // period: 2024-01, date: 2024-01-25

        if (!period) return res.status(400).json({ message: 'Periode diperlukan' });

        // Get Active Employees
        const employees = await prisma.karyawan.findMany({
            where: {
                perusahaanId,
                status: 'AKTIF'
            }
        });

        // 1. Pre-fetch existing payrolls for this period to avoid N+1 in lookup
        const existingPayrolls = await prisma.penggajian.findMany({
            where: {
                periode: period,
                perusahaanId
            },
            select: { karyawanId: true }
        });

        const existingSet = new Set(existingPayrolls.map(p => p.karyawanId));
        const payrollsToCreate = [];

        for (const emp of employees) {
            if (existingSet.has(emp.id)) continue;

            const salary = Number(emp.gajiPokok);
            const tunjangan = 0;
            const bonus = 0;
            const grossIncome = salary + tunjangan + bonus;

            const { bpjsKesehatan, bpjsKetenagakerjaan } = calculateBPJS(salary);
            const totalBpjsEmployee = bpjsKesehatan + bpjsKetenagakerjaan;

            const pph21 = calculatePPh21(grossIncome, emp.statusPernikahan || 'TK/0');

            const totalDeduction = totalBpjsEmployee + pph21;
            const net = grossIncome - totalDeduction;

            payrollsToCreate.push({
                perusahaanId,
                karyawanId: emp.id,
                periode: period,
                tanggalBayar: new Date(date || new Date()),
                gajiPokok: new Prisma.Decimal(salary),
                tunjangan: new Prisma.Decimal(tunjangan),
                lembur: new Prisma.Decimal(0),
                bonus: new Prisma.Decimal(bonus),
                totalPenghasilan: new Prisma.Decimal(grossIncome),
                potonganBpjs: new Prisma.Decimal(totalBpjsEmployee),
                potonganPph21: new Prisma.Decimal(pph21),
                potonganLainnya: new Prisma.Decimal(0),
                totalPotongan: new Prisma.Decimal(totalDeduction),
                netto: new Prisma.Decimal(net),
                status: 'DRAFT'
            });
        }

        // 2. Batch create payrolls
        if (payrollsToCreate.length > 0) {
            await prisma.penggajian.createMany({
                data: payrollsToCreate
            });
        }

        res.json({
            success: true,
            count: payrollsToCreate.length,
            message: `Berhasil generate ${payrollsToCreate.length} data penggajian.`
        });

    } catch (error: unknown) {
        console.error('Error generating payroll:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * DEPARTMENTS
 */

/**
 * Get all departments for the current company
 */
export const getDepartments = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;

        const departments = await prisma.departemen.findMany({
            where: { perusahaanId },
            orderBy: { nama: 'asc' }
        });

        res.json({
            success: true,
            data: departments
        });
    } catch (error: unknown) {
        console.error('Error fetching departments:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Create a new department
 */
export const createDepartment = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
        const { kode, nama, kepala, deskripsi } = req.body;

        if (!kode || !nama) {
            return res.status(400).json({ success: false, message: 'Kode dan Nama departemen diperlukan' });
        }

        const department = await prisma.departemen.create({
            data: {
                kode,
                nama,
                kepala,
                deskripsi,
                perusahaanId
            }
        });

        res.status(201).json({
            success: true,
            data: department,
            message: 'Departemen berhasil ditambahkan'
        });
    } catch (error: unknown) {
        console.error('Error creating department:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Update department details
 */
export const updateDepartment = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
        const { id } = req.params;
        const { kode, nama, kepala, deskripsi, isAktif } = req.body;

        const department = await prisma.departemen.findFirst({
            where: { id: String(id), perusahaanId }
        });

        if (!department) {
            return res.status(404).json({ success: false, message: 'Departemen tidak ditemukan' });
        }

        const updated = await prisma.departemen.update({
            where: { id: String(id) },
            data: {
                kode,
                nama,
                kepala,
                deskripsi,
                isAktif
            }
        });

        res.json({
            success: true,
            data: updated,
            message: 'Data departemen berhasil diperbarui'
        });
    } catch (error: unknown) {
        console.error('Error updating department:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Delete a department
 */
export const deleteDepartment = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const perusahaanId = authReq.currentCompanyId!;
        const { id } = req.params;

        const department = await prisma.departemen.findFirst({
            where: { id: String(id), perusahaanId }
        });

        if (!department) {
            return res.status(404).json({ success: false, message: 'Departemen tidak ditemukan' });
        }

        // Check if there are employees in this department
        // Note: The Karyawan model has a `departemen` string field.
        // If we want real relational integrity, we should eventually change Karyawan.departemen to a relation.
        // For now, we'll just allow deletion or check if any employee uses this department name.

        await prisma.departemen.delete({
            where: { id: String(id) }
        });

        res.json({
            success: true,
            message: 'Departemen berhasil dihapus'
        });
    } catch (error: unknown) {
        console.error('Error deleting department:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
