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
  console.log("Getting Prisma client for environment:", {
    nodeEnv: process.env.NODE_ENV,
    isProduction: process.env.NODE_ENV === "production",
    isNetlify: !!process.env.NETLIFY,
    isVercel: !!process.env.VERCEL
  })

  // In serverless environments, don't reuse the global client
  if (process.env.NODE_ENV === "production" || process.env.VERCEL || process.env.NETLIFY) {
    console.log("Creating new Prisma client for serverless environment")
    return createPrismaClient()
  }

  // In development, reuse the global client to avoid connection limits
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient()
    console.log("Created and cached Prisma client for development")
  }
  return globalForPrisma.prisma
}

// For backward compatibility - use getPrismaClient() instead for lazy loading
// This export is deprecated and should be replaced with getPrismaClient()
export const prisma = undefined as any // Don't create client at module load time
