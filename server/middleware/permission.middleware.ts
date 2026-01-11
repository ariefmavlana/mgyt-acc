import { Request, Response, NextFunction } from 'express';
import { Permission, Role as RoleModel } from '@prisma/client';
import { PermissionChecker } from '../utils/permissions';
import { AuthRequest } from './auth.middleware';

/**
 * Middleware factory to check if user has required permissions
 * Uses the role attached to the executed request (from tenantMiddleware or authMiddleware)
 */
export const requirePermission = (...requiredPermissions: Permission[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const authReq = req as AuthRequest;

        // 1. Check if user is authenticated
        if (!authReq.user) {
            return res.status(401).json({
                error: 'Tidak terautentikasi'
            });
        }

        // 2. Determine Role context
        // If inside a tenant context (accessed via tenantMiddleware), use the role from AksesPengguna
        // Otherwise fallback to global user permissions (if implemented) or fail

        let roleForCheck: any = null; // Should be Role enum or Role model

        if (authReq.akses && authReq.akses.roleRef) {
            roleForCheck = authReq.akses.roleRef;
        } else if (authReq.akses && authReq.akses.roleEnum) {
            // Legacy/Fallback for simpler roles if no Role model attached
            // This path might need fetching the actual Role model if we want granular permissions
            // For now, we assume tenantMiddleware attaches the full role relation if possible
            // Or we fetch it here if missing
        }

        // Ideally, tenantMiddleware should load roleRef including permissions
        // If not loaded, we might need to fetch it here. WIll assume it's loaded for performance for now
        // But let's check safety.

        if (!roleForCheck) {
            // Try to fetch role permissions if we have an access record but no loaded role
            // This is a safety fallback, though arguably middleware should load it
            if (authReq.akses?.roleId) {
                // We can't easily query here without importing prisma and causing potential circular deps or overhead
                // So we rely on tenantMiddleware to include { where: ..., include: { roleRef: { include: { permissions: true } } } }
            }
        }

        // 3. Check Permissions
        // If we have a robust Role model with permissions
        if (roleForCheck && 'permissions' in roleForCheck) {
            const checker = new PermissionChecker(roleForCheck);

            // Check if user has ANY of the required permissions (OR logic)
            // You can change this to canAll if you want AND logic
            if (!checker.canAny(requiredPermissions)) {
                return res.status(403).json({
                    error: 'Akses ditolak',
                    message: 'Anda tidak memiliki izin untuk mengakses resource ini',
                    requiredPermissions: requiredPermissions
                });
            }
        }
        // Fallback for Superadmin (Global bypass if needed, or if we trust the deprecated Enum for basic checks)
        // For strict RBAC, default deny if no granular permissions found
        else {
            // Fail safe: if no role context found or permissions not loaded, deny access to protected resource
            return res.status(403).json({
                error: 'Akses ditolak',
                message: 'Data peran tidak ditemukan atau izin tidak valid.'
            });
        }

        next();
    };
};
