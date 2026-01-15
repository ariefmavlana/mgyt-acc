import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

// Prisma 7 with Driver Adapter (PostgreSQL)
// This pattern avoids issues with serverless and provides better connection pooling control

import { tenantExtension } from '../server/lib/prisma-tenant'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
    throw new Error('DATABASE_URL is not defined in environment variables')
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

// Prisma singleton pattern to avoid multiple instances in development
const globalForPrisma = globalThis as unknown as { prisma: any }

console.log('[Prisma] Initializing with connection string present:', !!connectionString);
console.log('[Prisma] pool created:', !!pool);
console.log('[Prisma] adapter created:', !!adapter);

const basePrisma = globalForPrisma.prisma ?? new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

export const prisma = basePrisma.$extends(tenantExtension)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = basePrisma

export default prisma
