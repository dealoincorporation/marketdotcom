/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip static generation for API routes during build
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },

  // Configure images for Netlify
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },

  // Environment variables that should be available at build time
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'fallback-secret-key-for-build',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || process.env.PAYSTACK_PUBLIC_KEY || 'pk_test_9071bb582b6486e980b86bce551587236426329a',
    DATABASE_URL: process.env.DATABASE_URL || 'mongodb://localhost:27017/marketdotcom',
    JWT_SECRET: process.env.JWT_SECRET || 'fallback-jwt-secret',
  },

  // Disable dotenv loading to avoid permission errors
  ...(process.env.SKIP_ENV_LOADING && {
    experimental: {
      ...nextConfig.experimental,
      // This prevents Next.js from trying to load .env files
      env: {},
    },
  }),
}

export default nextConfig;
