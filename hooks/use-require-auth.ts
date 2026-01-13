'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './use-auth';

/**
 * Hook to protect client-side routes.
 * Forces redirect to login if user is not authenticated.
 */
export const useRequireAuth = (redirectTo: string = '/login', allowedRoles: string[] = []) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        if (!user) {
            router.push(redirectTo);
            return;
        }

        // Check for role access if allowedRoles is provided and not empty
        if (allowedRoles.length > 0 && user.role) {
            const hasAccess = allowedRoles.includes(user.role);
            if (!hasAccess) {
                router.push('/unauthorized');
            }
        }

    }, [user, loading, router, redirectTo, allowedRoles]);

    return { user, loading };
};
