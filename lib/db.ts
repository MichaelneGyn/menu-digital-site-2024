import { PrismaClient } from '@prisma/client'

// Force new connection for each serverless invocation to avoid prepared statement conflicts
const createPrismaClient = () => {
  return new PrismaClient({
    log: ['query'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
}

// In production (Vercel), always create a new instance to avoid connection reuse issues
export const prisma = process.env.NODE_ENV === 'production' 
  ? createPrismaClient()
  : (() => {
      const globalForPrisma = globalThis as unknown as {
        prisma: PrismaClient | undefined
      }
      if (!globalForPrisma.prisma) {
        globalForPrisma.prisma = createPrismaClient()
      }
      return globalForPrisma.prisma
    })()
