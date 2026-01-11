
import { Permission } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export const requirePermission = (permission: Permission) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const authReq = req as AuthRequest;

        if (!authReq.user || !authReq.akses) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // 1. Check if Superadmin (By Role Name or specific flag if we had one)
        // For now, let's assume SUPERADMIN role enum or name has all permissions
        // But we rely on the Role model's permissions list.

        // 2. Check Custom Permissions on AksesPengguna (Override)
        // TODO: Implement custom permission override logic if needed

        // 3. Check Role Permissions
        const role = (authReq.akses as any).roleRef;
        if (!role) {
            // Fallback to old enum check? Or deny?
            // For rigorous RBAC, if no Role model assigned, deny granular actions.
            return res.status(403).json({ message: 'Role not assigned' });
        }

        const hasPermission = role.permissions.some((p: any) => p === permission || p.name === permission);

        // Note: Prisma returns enum array usually, but let's be safe. 
        // In the schema: permissions Permission[] 
        // So it's an array of strings (enums).

        const userPermissions = role.permissions as Permission[];

        if (!userPermissions.includes(permission)) {
            return res.status(403).json({ message: `Anda tidak memiliki izin: ${permission}` });
        }

        next();
    };
};
