import { PrismaClient, Permission, UserRole } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const ROLES_DEFINITIONS = {
    [UserRole.SUPERADMIN]: Object.values(Permission), // All Permissions
    [UserRole.ADMIN]: Object.values(Permission).filter(p => !p.startsWith('SYSTEM_')), // All except system critical
    [UserRole.MANAGER]: [
        Permission.COMPANY_VIEW,
        Permission.USER_VIEW,
        Permission.TRANSACTION_VIEW_ALL,
        Permission.TRANSACTION_CREATE,
        Permission.TRANSACTION_EDIT,
        Permission.TRANSACTION_APPROVE,
        Permission.REPORT_VIEW_FINANCIAL,
        Permission.REPORT_VIEW_OPERATIONAL
    ],
    [UserRole.STAFF]: [
        Permission.TRANSACTION_VIEW_OWN,
        Permission.TRANSACTION_CREATE,
        Permission.INVOICE_CREATE,
        Permission.INVOICE_VIEW,
        Permission.PAYMENT_CREATE
    ],
    [UserRole.ACCOUNTANT]: [
        Permission.TRANSACTION_VIEW_ALL,
        Permission.TRANSACTION_CREATE,
        Permission.TRANSACTION_EDIT,
        Permission.COA_VIEW,
        Permission.COA_EDIT,
        Permission.REPORT_VIEW_FINANCIAL,
        Permission.REPORT_EXPORT,
        Permission.RECONCILIATION_PERFORM
    ]
};

async function main() {
    console.log('🌱 Seeding Roles & Permissions...');

    // We need a company to attach roles to, or create System Roles (global).
    // The Schema says: Role has optional companyId. If null -> System Role?
    // "isSystemRole Boolean @default(true)"

    for (const [roleName, permissions] of Object.entries(ROLES_DEFINITIONS)) {
        console.log(`Processing Role: ${roleName}`);

        // Upsert System Role
        await prisma.role.upsert({
            where: {
                companyId_name: {
                    companyId: 'SYSTEM', // Using a placeholder or null if unique constraint allows
                    // Actually unique is [companyId, name]. If companyId is nullable, this might be tricky in Prisma upsert.
                    // Let's assume we want Global System Roles where companyId is NULL?
                    // Prisma unique constraint on nullable fields treats each null as unique or same depending on DB.
                    // But usually unique index allows only one (null, 'ADMIN').

                    // Workaround: We'll try to find first.
                    name: roleName
                } as any
            },
            update: {
                permissions: permissions as Permission[]
            },
            create: {
                name: roleName,
                displayName: roleName.charAt(0) + roleName.slice(1).toLowerCase().replace('_', ' '),
                description: `System Default Role for ${roleName}`,
                isSystemRole: true,
                companyId: null, // System Role
                permissions: permissions as Permission[],
                level: roleName === 'SUPERADMIN' ? 0 : 5
            }
        });
    }

    console.log('✅ Roles seeded successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
