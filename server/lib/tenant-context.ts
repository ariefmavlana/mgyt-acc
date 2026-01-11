import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContext {
    companyId: string;
    userId?: string;
    branchId?: string;
}

export const tenantStorage = new AsyncLocalStorage<TenantContext>();

export function getTenantContext() {
    return tenantStorage.getStore();
}

export function runWithTenant<T>(context: TenantContext, fn: () => T): T {
    return tenantStorage.run(context, fn);
}
