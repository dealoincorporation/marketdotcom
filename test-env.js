// Test script to check environment variables
require('dotenv').config();

console.log('🌍 Environment Variables Test');
console.log('==============================\n');

// Check DATABASE_URL
console.log('🔍 DATABASE_URL:');
if (process.env.DATABASE_URL) {
  const url = process.env.DATABASE_URL;
  console.log('  ✅ Exists: YES');
  console.log('  📏 Length:', url.length, 'characters');

  // Check if it's MongoDB
  if (url.startsWith('mongodb://') || url.startsWith('mongodb+srv://')) {
    console.log('  🗄️  Type: MongoDB');

    if (url.includes('mongodb+srv://')) {
      console.log('  ☁️  Provider: MongoDB Atlas');
    } else if (url.includes('mongodb://')) {
      console.log('  🖥️  Provider: Local MongoDB');
    }

    // Check for required parameters
    const hasRetryWrites = url.includes('retryWrites=');
    const hasW = url.includes('w=');

    console.log('  ⚙️  Parameters:');
    console.log('    - retryWrites:', hasRetryWrites ? '✅' : '❌');
    console.log('    - w (write concern):', hasW ? '✅' : '❌');

    if (!hasRetryWrites || !hasW) {
      console.log('\n  ⚠️  WARNING: Missing recommended MongoDB parameters!');
      console.log('     Recommended: ?retryWrites=true&w=majority');
    }

  } else {
    console.log('  ❌ Type: Not MongoDB format');
    console.log('     Expected: mongodb:// or mongodb+srv://');
  }

  // Mask sensitive info for display
  const masked = url.replace(/:([^:@]{4})[^:@]*@/, ':$1****@');
  console.log('  🔗 URL:', masked.substring(0, 50) + '...');

} else {
  console.log('  ❌ Exists: NO');
  console.log('  💡 DATABASE_URL not found in environment');
}

// Check RESEND_API_KEY
console.log('\n📧 RESEND_API_KEY:');
if (process.env.RESEND_API_KEY) {
  console.log('  ✅ Exists: YES');
  console.log('  🔑 Key starts with:', process.env.RESEND_API_KEY.substring(0, 10) + '...');
} else {
  console.log('  ❌ Exists: NO');
}

// Check other important vars
console.log('\n🔧 Other Environment Variables:');
console.log('  NODE_ENV:', process.env.NODE_ENV || 'undefined');
console.log('  NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL || 'undefined');

// Test Prisma connection if DATABASE_URL exists
if (process.env.DATABASE_URL) {
  console.log('\n🗄️  Testing Prisma Connection...');

  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient({
      log: ['error']
    });

    console.log('  🔄 Attempting connection...');

    // Test connection with timeout
    const timeout = setTimeout(() => {
      console.log('  ⏱️  Connection timeout (10s)');
      process.exit(1);
    }, 10000);

    prisma.$connect().then(() => {
      clearTimeout(timeout);
      console.log('  ✅ Successfully connected to MongoDB!');
      console.log('  🎉 Your DATABASE_URL is working correctly!');
      return prisma.$disconnect();
    }).catch((error) => {
      clearTimeout(timeout);
      console.log('  ❌ Connection failed:', error.message);
      console.log('  🔧 Check your MongoDB connection string and network access');
    });

  } catch (error) {
    console.log('  ❌ Prisma initialization error:', error.message);
  }
} else {
  console.log('\n🗄️  Skipping Prisma test (no DATABASE_URL)');
}

console.log('\n📋 Summary:');
console.log('==========');
const dbCheck = process.env.DATABASE_URL ? '✅' : '❌';
const emailCheck = process.env.RESEND_API_KEY ? '✅' : '❌';
console.log(`Database: ${dbCheck} EMAIL: ${emailCheck}`);

if (!process.env.DATABASE_URL || !process.env.RESEND_API_KEY) {
  console.log('\n⚠️  Some environment variables are missing!');
  console.log('   Add them to your .env.local file');
} else {
  console.log('\n🎉 All required environment variables found!');
}