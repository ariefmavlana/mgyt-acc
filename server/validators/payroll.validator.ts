import { z } from 'zod';

export const calculatePayrollSchema = z.object({
    period: z.string().regex(/^\d{4}-\d{2}$/, 'Format periode harus YYYY-MM'),
    employeeId: z.string().optional(), // If empty, process all active employees
    tanggalBayar: z.string().or(z.date()),
});

export const payrollQuerySchema = z.object({
    perusahaanId: z.string(),
    period: z.string().regex(/^\d{4}-\d{2}$/, 'Format periode harus YYYY-MM').optional(),
    status: z.enum(['DRAFT', 'PAID', 'POSTED']).optional(),
});
