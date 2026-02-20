#!/usr/bin/env node

// Build setup script to handle environment variables and offline builds
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Setting up build environment...');

// Create .env.local if it doesn't exist
const envLocalPath = path.join(__dirname, '.env.local');
const envContent = `# Build-time environment variables
DATABASE_URL="mongodb://localhost:27017/marketdotcom"
NEXTAUTH_SECRET="fallback-secret-key-for-build"
NEXTAUTH_URL="http://localhost:3000"
JWT_SECRET="fallback-jwt-secret"
PAYSTACK_PUBLIC_KEY="pk_test_9071bb582b6486e980b86bce551587236426329a"
PAYSTACK_SECRET_KEY="sk_test_9071bb582b6486e980b86bce551587236426329a"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_test_9071bb582b6486e980b86bce551587236426329a"
RESEND_API_KEY="dummy-key-for-build"
GMAIL_USER="dummy@gmail.com"
GMAIL_APP_PASSWORD="dummy-password"
`;

try {
  // Only create if file doesn't exist
  if (!fs.existsSync(envLocalPath)) {
    fs.writeFileSync(envLocalPath, envContent, 'utf8');
    console.log('✅ Created .env.local file');
  } else {
    console.log('ℹ️  .env.local already exists');
  }
} catch (error) {
  console.warn('⚠️  Could not create .env.local:', error.message);
  // Continue anyway
}

// Set environment variables directly
process.env.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/marketdotcom';
process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-key-for-build';
process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'fallback-jwt-secret';
process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_9071bb582b6486e980b86bce551587236426329a';
process.env.NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

console.log('✅ Environment variables set');
console.log('🎯 Ready to build...');

// Exit successfully
process.exit(0);