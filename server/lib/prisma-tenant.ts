import { Prisma } from '@prisma/client';
import { getTenantContext } from './tenant-context';

// List of models that should NOT be filtered by perusahaanId
const EXCLUDED_MODELS = [
    'MataUang', 'KursHistory', 'Pengguna', 'RefreshToken', 'PasswordHistory',
    'Perusahaan', 'AksesPengguna',
    // Models without direct perusahaanId field or system logs
    'JurnalDetail', 'VoucherDetail', 'TransaksiDetail', 'ProdukVariant',
    'BudgetDetail', 'ProyekTransaksi', 'Gudang', 'StokPersediaan',
    'MutasiPersediaan', 'InventoryLayer', 'AssetFixed', 'JejakAudit'
];

export const tenantExtension = Prisma.defineExtension((client) => {
    return client.$extends({
        model: {
            $allModels: {
                /**
                 * Explicitly run a block for a specific company
                 */
                async forCompany<T, A>(
                    this: T,
                    companyId: string,
                    fn: (model: T) => Promise<A>
                ): Promise<A> {
                    // This is a bit complex to implement correctly via extension on $allModels
                    // because 'this' refers to the model proxy.
                    // For now, we rely on the AsyncLocalStorage context.
                    return fn(this);
                }
            }
        },
        query: {
            $allModels: {
                async $allOperations({ model, operation, args, query }) {
                    // Normalize model name for comparison
                    const modelName = model || '';

                    if (EXCLUDED_MODELS.some(m => m.toLowerCase() === modelName.toLowerCase())) {
                        return query(args);
                    }

                    const context = getTenantContext();
                    const companyId = context?.companyId;

                    if (!companyId) {
                        return query(args);
                    }

                    interface PrismaArgs {
                        where?: Record<string, unknown>;
                        data?: Record<string, unknown> | Record<string, unknown>[];
                        create?: Record<string, unknown>;
                        update?: Record<string, unknown>;
                    }

                    // Inject perusahaanId into where clauses
                    if ([
                        'findMany', 'findFirst', 'findUnique', 'count',
                        'aggregate', 'groupBy', 'update', 'updateMany',
                        'delete', 'deleteMany'
                    ].includes(operation)) {
                        const anyArgs = args as PrismaArgs;
                        anyArgs.where = {
                            ...(anyArgs.where || {}),
                            perusahaanId: companyId
                        };
                    }

                    // Inject perusahaanId into data for creations
                    else if (operation === 'create') {
                        const anyArgs = args as PrismaArgs;
                        anyArgs.data = {
                            ...(anyArgs.data as Record<string, unknown> || {}),
                            perusahaanId: companyId
                        };
                    }
                    else if (operation === 'createMany') {
                        const anyArgs = args as PrismaArgs;
                        if (anyArgs.data && Array.isArray(anyArgs.data)) {
                            anyArgs.data = anyArgs.data.map((item: Record<string, unknown>) => ({
                                ...item,
                                perusahaanId: companyId
                            }));
                        } else if (anyArgs.data) {
                            anyArgs.data = { ...(anyArgs.data as Record<string, unknown>), perusahaanId: companyId };
                        }
                    }
                    else if (operation === 'upsert') {
                        const anyArgs = args as PrismaArgs;
                        anyArgs.where = { ...(anyArgs.where || {}), perusahaanId: companyId };
                        anyArgs.create = { ...(anyArgs.create || {}), perusahaanId: companyId };
                        anyArgs.update = { ...(anyArgs.update || {}), perusahaanId: companyId };
                    }

                    return query(args);
                },
            },
        },
    });
});
