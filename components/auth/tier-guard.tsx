'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useCompany } from '@/hooks/use-company';
import { Tier, hasFeature } from '@/lib/tier-config';
import { Loader2 } from 'lucide-react';

interface TierGuardProps {
    children: React.ReactNode;
    feature?: string;
    allowedRoles?: string[];
}

export const TierGuard: React.FC<TierGuardProps> = ({ children, feature, allowedRoles }) => {
    const { user, loading: authLoading } = useAuth();
    const { currentCompany, loading: companyLoading } = useCompany();
    const router = useRouter();

    const loading = authLoading || companyLoading;

    useEffect(() => {
        if (loading) return;

        if (!user) {
            router.push('/login');
            return;
        }

        // RBAC Check
        if (allowedRoles && !allowedRoles.includes(user.role)) {
            router.push('/unauthorized');
            return;
        }

        // TBAC Check
        const tier = (currentCompany?.tier || 'UMKM') as Tier;
        if (feature && !hasFeature(tier, feature)) {
            router.push('/unauthorized');
            return;
        }
    }, [user, currentCompany, feature, allowedRoles, loading, router]);

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Safety check for final render
    const tier = (currentCompany?.tier || 'UMKM') as Tier;
    const isRoleAllowed = !allowedRoles || (user && allowedRoles.includes(user.role));
    const isFeatureAllowed = !feature || hasFeature(tier, feature);

    if (!user || !isRoleAllowed || !isFeatureAllowed) {
        return null;
    }

    return <>{children}</>;
};
