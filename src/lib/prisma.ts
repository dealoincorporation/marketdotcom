import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma client with proper configuration for serverless environments
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    // Important for serverless: don't pool connections
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
}

// For serverless environments, create a new client for each request
export async function getPrismaClient() {
  // In serverless environments, don't reuse the global client
  if (process.env.NODE_ENV === "production" || process.env.VERCEL || process.env.NETLIFY) {
    return createPrismaClient()
  }

  // In development, reuse the global client to avoid connection limits
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient()
  }
  return globalForPrisma.prisma
}

// For backward compatibility - only use this in places where lazy loading isn't critical
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production" && !process.env.VERCEL && !process.env.NETLIFY) {
  globalForPrisma.prisma = prisma
}
