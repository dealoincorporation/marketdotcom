// Simple test script to check DATABASE_URL
require('dotenv').config();

console.log('Checking DATABASE_URL...');

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.log('❌ DATABASE_URL not found in .env');
  process.exit(1);
}

console.log('DATABASE_URL exists:', dbUrl.substring(0, 20) + '...');

// Check if it's a MongoDB URL
if (dbUrl.startsWith('mongodb://') || dbUrl.startsWith('mongodb+srv://')) {
  console.log('✅ DATABASE_URL starts with mongodb:// or mongodb+srv://');
} else {
  console.log('❌ DATABASE_URL does not start with mongodb:// or mongodb+srv://');
  console.log('Current format:', dbUrl.split('://')[0]);
}

// Test basic Prisma import
try {
  console.log('\nTesting Prisma import...');
  const { PrismaClient } = require('@prisma/client');
  console.log('✅ Prisma import successful');

  console.log('\nTesting Prisma client creation...');
  const prisma = new PrismaClient({
    log: ['error'],
    datasources: {
      db: {
        url: dbUrl
      }
    }
  });
  console.log('✅ Prisma client creation successful');

} catch (error) {
  console.log('❌ Prisma error:', error.message);
}