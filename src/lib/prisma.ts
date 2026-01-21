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

  // For now, always create a new client to ensure models are properly loaded
  console.log("Creating new Prisma client")
  return createPrismaClient()
}

// For backward compatibility - use getPrismaClient() instead for lazy loading
// This export is deprecated and should be replaced with getPrismaClient()
export const prisma = undefined as any // Don't create client at module load time
