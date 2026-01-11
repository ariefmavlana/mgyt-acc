import { Permission, Role } from '@prisma/client';

export class PermissionChecker {
    private rolePermissions: Permission[];

    constructor(role: Role & { permissions: Permission[] } | null | undefined) {
        this.rolePermissions = role?.permissions || [];
    }

    /**
     * Check if user has specific permission
     */
    can(permission: Permission): boolean {
        return this.rolePermissions.includes(permission);
    }

    /**
     * Check if user has ANY of the provided permissions
     */
    canAny(permissions: Permission[]): boolean {
        return permissions.some(p => this.can(p));
    }

    /**
     * Check if user has ALL of the provided permissions
     */
    canAll(permissions: Permission[]): boolean {
        return permissions.every(p => this.can(p));
    }

    /**
     * Check if user does NOT have permission
     */
    cannot(permission: Permission): boolean {
        return !this.can(permission);
    }
}
