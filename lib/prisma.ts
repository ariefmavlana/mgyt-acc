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

const globalForPrisma = globalThis as unknown as { prisma: any }

const basePrisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

export const prisma = basePrisma.$extends(tenantExtension)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
