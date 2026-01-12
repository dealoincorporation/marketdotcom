// Check NextAuth environment variables
import { config } from 'dotenv';
import crypto from 'crypto';

// Load environment variables
config({ path: '.env.local' }); // Load .env.local first (takes precedence)
config({ path: '.env' }); // Then load .env as fallback

console.log('🔐 NextAuth Environment Check');
console.log('===============================');

const requiredVars = [
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'DATABASE_URL'
];

const optionalVars = [
  'NODE_ENV',
  'RESEND_API_KEY'
];

console.log('\n📋 Required Variables:');
requiredVars.forEach(varName => {
  const exists = process.env[varName] ? true : false;
  const value = process.env[varName];
  const masked = value ? (value.length > 10 ? value.substring(0, 10) + '...' : value) : 'NOT SET';

  console.log(`${varName}: ${exists ? '✅ EXISTS' : '❌ MISSING'} (${masked})`);

  if (varName === 'NEXTAUTH_SECRET' && value && value.length < 32) {
    console.log(`   ⚠️  WARNING: NEXTAUTH_SECRET should be at least 32 characters long`);
  }

  if (varName === 'NEXTAUTH_URL' && value) {
    try {
      const url = new URL(value);
      if (!url.protocol.startsWith('http')) {
        console.log(`   ⚠️  WARNING: NEXTAUTH_URL should be a valid HTTP/HTTPS URL`);
      }
    } catch {
      console.log(`   ⚠️  WARNING: NEXTAUTH_URL is not a valid URL`);
    }
  }
});

console.log('\n📋 Optional Variables:');
optionalVars.forEach(varName => {
  const exists = process.env[varName] ? true : false;
  console.log(`${varName}: ${exists ? '✅ EXISTS' : '⚠️  NOT SET'}`);
});

console.log('\n🔧 Production Setup Instructions:');
console.log('----------------------------------');
console.log('For Netlify deployment, set these environment variables:');
console.log('1. NEXTAUTH_SECRET: Generate a secure random string (at least 32 chars)');
console.log('2. NEXTAUTH_URL: Your production domain (https://marketdottcom.netlify.app)');
console.log('3. DATABASE_URL: Your MongoDB connection string');

console.log('\n🛠️  To generate a secure NEXTAUTH_SECRET:');
console.log('openssl rand -base64 32');
console.log('OR');
console.log('node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"');

// Generate missing variables
console.log('\n🔧 Generated Values (add these to your environment):');
if (!process.env.NEXTAUTH_SECRET) {
  const secret = crypto.randomBytes(32).toString('base64');
  console.log(`NEXTAUTH_SECRET=${secret}`);
}

if (!process.env.NEXTAUTH_URL) {
  console.log('NEXTAUTH_URL=https://your-production-domain.com');
  console.log('# Replace with your actual production URL');
}

if (!process.env.DATABASE_URL) {
  console.log('DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/marketdotcom');
  console.log('# Replace with your actual MongoDB connection string');
}