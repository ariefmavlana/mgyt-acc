export type Tier = 'UMKM' | 'SMALL' | 'MEDIUM' | 'ENTERPRISE';

export interface TierConfig {
    maxCompanies: number;
    maxBranches: number;
    maxEmployees: number;
    features: string[];
}

export const TIER_LIMITS: Record<Tier, TierConfig> = {
    UMKM: {
        maxCompanies: 1,
        maxBranches: 0,
        maxEmployees: 10,
        features: ['basic_accounting', 'invoices', 'bills', 'inventory', 'products']
    },
    SMALL: {
        maxCompanies: 3,
        maxBranches: 5,
        maxEmployees: 50,
        features: ['basic_accounting', 'invoices', 'bills', 'inventory', 'products', 'tax', 'assets']
    },
    MEDIUM: {
        maxCompanies: 10,
        maxBranches: 20,
        maxEmployees: 200,
        features: ['basic_accounting', 'invoices', 'bills', 'inventory', 'products', 'tax', 'assets', 'budget', 'hr']
    },
    ENTERPRISE: {
        maxCompanies: 999,
        maxBranches: 999,
        maxEmployees: 9999,
        features: ['basic_accounting', 'invoices', 'bills', 'inventory', 'products', 'tax', 'assets', 'budget', 'hr', 'audit', 'multi_branch', 'cost_center', 'profit_center', 'projects']
    }
};

export function hasFeature(tier: Tier, feature: string): boolean {
    return TIER_LIMITS[tier].features.includes(feature);
}

export function getLimit(tier: Tier, limit: keyof Omit<TierConfig, 'features'>): number {
    return TIER_LIMITS[tier][limit];
}
