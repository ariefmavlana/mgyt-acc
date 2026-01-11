
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';

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
            ...(status ? { status: String(status) } : {}),
            ...(department ? { departemen: String(department) } : {}),
            ...(search ? {
                OR: [
                    { nama: { contains: String(search), mode: 'insensitive' } },
                    { nik: { contains: String(search), mode: 'insensitive' } }
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
    } catch (error) {
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
            where: { id, perusahaanId }
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
            where: { id, perusahaanId }
        });

        if (!employee) {
            return res.status(404).json({ success: false, message: 'Karyawan tidak ditemukan' });
        }

        const updated = await prisma.karyawan.update({
            where: { id },
            data: {
                ...data,
                gajiPokok: data.gajiPokok ? new Prisma.Decimal(data.gajiPokok) : undefined
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
            karyawan: {
                perusahaanId
            },
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

        const payrolls = [];

        for (const emp of employees) {
            // Check if already exists
            const existing = await prisma.penggajian.findUnique({
                where: {
                    karyawanId_periode: {
                        karyawanId: emp.id,
                        periode: period
                    }
                }
            });

            if (existing) continue;

            // Simple Calculation (Placeholder for complex logic)
            const salary = Number(emp.gajiPokok);
            // Example: fixed 2% JP, 1% JK... just using placeholder logic
            const bpjsCost = salary * 0.03;
            const pph21Cost = salary * 0.05; // Simplified tax

            const totalIncome = salary;
            const totalDeduction = bpjsCost + pph21Cost;
            const net = totalIncome - totalDeduction;

            const payroll = await prisma.penggajian.create({
                data: {
                    karyawanId: emp.id,
                    periode: period,
                    tanggalBayar: new Date(date || new Date()),
                    gajiPokok: new Prisma.Decimal(salary),
                    tunjangan: new Prisma.Decimal(0),
                    lembur: new Prisma.Decimal(0),
                    bonus: new Prisma.Decimal(0),
                    totalPenghasilan: new Prisma.Decimal(totalIncome),
                    potonganBpjs: new Prisma.Decimal(bpjsCost),
                    potonganPph21: new Prisma.Decimal(pph21Cost),
                    potonganLainnya: new Prisma.Decimal(0),
                    totalPotongan: new Prisma.Decimal(totalDeduction),
                    netto: new Prisma.Decimal(net),
                    status: 'DRAFT' // Assuming we might add status field or handle with boolean 'sudahBayar'
                } as any // Bypass strict typing for dynamic decimal calc if needed
            });
            payrolls.push(payroll);
        }

        res.json({
            success: true,
            count: payrolls.length,
            message: `Berhasil generate ${payrolls.length} data penggajian.`
        });

    } catch (error) {
        console.error('Error generating payroll:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
