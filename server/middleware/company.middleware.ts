import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

/**
 * Middleware to ensure the user is accessing data 
 * within their own company context.
 */
export const checkCompanyContext = (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;
    const { user } = authReq;
    const requestedPerusahaanId = req.params.perusahaanId || req.query.perusahaanId || req.body.perusahaanId;

    if (!user) {
        return res.status(401).json({ message: 'Akses ditolak. Sesi tidak valid.' });
    }

    // If a perusahaanId is provided in the request, it must match the user's perusahaanId
    // Unless the user is a SUPERADMIN
    if (requestedPerusahaanId && requestedPerusahaanId !== user.perusahaanId && user.role !== 'SUPERADMIN') {
        return res.status(403).json({
            message: 'Anda tidak memiliki izin untuk mengakses data perusahaan lain.'
        });
    }

    // Inject perusahaanId into request object for easier access in controllers
    req.body = req.body || {};
    req.body.perusahaanId = user.perusahaanId;

    next();
};
