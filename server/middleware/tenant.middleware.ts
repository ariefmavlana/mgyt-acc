import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { runWithTenant } from '../lib/tenant-context';
import prisma from '../../lib/prisma';

/**
 * Middleware to enforce tenant isolation and inject context
 */
export const tenantMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;
    // 1. Determine company ID from header, query, or session default
    const headerCompanyId = authReq.headers['x-company-id'] as string;
    const companyId = headerCompanyId || authReq.currentCompanyId;

    if (!companyId) {
        // If no user/company context, but it's a public route, just continue
        // Public routes should probably not reach here if using 'protect'
        return next();
    }

    try {
        // 2. Validate User has access to this company
        const userId = authReq.user?.id;

        if (userId) {
            const access = await (prisma as any).aksesPengguna.findUnique({
                where: {
                    penggunaId_perusahaanId: {
                        penggunaId: userId,
                        perusahaanId: companyId
                    }
                }
            });

            if (!access || !access.isAktif) {
                return res.status(403).json({
                    message: 'Anda tidak memiliki akses ke perusahaan ini.'
                });
            }

            // Update request with verified access
            authReq.akses = access;
            authReq.currentCompanyId = companyId;
        }

        // 3. Initialize tenant context for Prisma and downstream
        runWithTenant({
            companyId: companyId,
            userId: userId,
            branchId: authReq.akses?.cabangId || undefined
        }, () => {
            next();
        });

    } catch (error) {
        console.error('Tenant Middleware Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
