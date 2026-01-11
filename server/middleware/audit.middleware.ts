
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { AuditService } from '../services/audit.service';
import { Prisma } from '@prisma/client';

/**
 * Middleware to strictly log data modification requests (POST, PUT, DELETE, PATCH)
 */
export const auditLog = async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as unknown as AuthRequest;
    // Only intercept modification methods
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        return next();
    }

    const originalSend = res.send;

    // Capture response to ensure we only log successful operations (2xx)
    res.send = function (body: unknown) {
        const responseData = body;
        res.send = originalSend; // Restore original

        // Process log asynchronously after response is sent to avoid latency
        if (res.statusCode >= 200 && res.statusCode < 300) {
            // Determine Action
            let action = 'UNKNOWN';
            if (req.method === 'POST') action = 'CREATE';
            if (req.method === 'PUT' || req.method === 'PATCH') action = 'UPDATE';
            if (req.method === 'DELETE') action = 'DELETE';

            // Determine Entity/Module from URL
            // e.g. /api/companies/123 -> entity: companies
            const segments = req.baseUrl.split('/').filter(Boolean); // [api, companies]
            const entity = segments.length > 1 ? segments[1] : 'SYSTEM';

            // Extract ID if present in params
            const entityId = req.params.id || req.params.companyId || req.body.id || '';

            // Extract User/Company Context
            const userId = authReq.user?.id;
            const perusahaanId = authReq.currentCompanyId;

            if (userId && perusahaanId) {
                AuditService.log({
                    perusahaanId,
                    userId,
                    action,
                    entity,
                    entityId: String(entityId),
                    module: entity,
                    details: `Auto-logged ${action} on ${entity}`,
                    req: req,
                    // Optionally capture body for 'dataAfter' (be careful with sensitive data)
                    // We skip passwords etc.
                    dataAfter: req.body as Prisma.InputJsonValue
                }).catch(err => console.error('Audit Middleware Error:', err));
            }
        }

        return res.send(responseData);
    } as any;

    next();
};
