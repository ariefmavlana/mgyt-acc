
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import { calculateBPJS, calculatePPh21 } from '../utils/payroll.utils';

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

            const salary = Number(emp.gajiPokok);
            const tunjangan = 0; // Placeholder for now, can be fetched if added to model
            const bonus = 0;
            const grossIncome = salary + tunjangan + bonus;

            // 1. Calculate BPJS (Employee Share)
            // Note: In real world, BPJS basis might differ (Gaji Pokok vs Total), assuming Gaji Pokok here
            const { bpjsKesehatan, bpjsKetenagakerjaan } = calculateBPJS(salary);
            const totalBpjsEmployee = bpjsKesehatan + bpjsKetenagakerjaan;

            // 2. Calculate PPh 21 (TER) based on Gross Income
            // Using statusPernikahan from employee record ("TK/0" default)
            const pph21 = calculatePPh21(grossIncome, emp.statusPernikahan || 'TK/0');

            const totalDeduction = totalBpjsEmployee + pph21;
            const net = grossIncome - totalDeduction;

            const payroll = await prisma.penggajian.create({
                data: {
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
                } as any
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
