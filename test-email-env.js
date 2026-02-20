// Test environment variables in the context of the email module
console.log('🔍 Email Environment Test');
console.log('==========================');

// Test what Node.js sees
console.log('Node.js process.env:');
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'EXISTS' : 'NOT FOUND');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'EXISTS' : 'NOT FOUND');
console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL ? 'EXISTS' : 'NOT FOUND');

// Try to simulate Next.js environment loading
console.log('\n🔍 Simulating Next.js env loading:');

// Check if we can find the .env files
const fs = require('fs');
const path = require('path');

const envLocalPath = path.join(__dirname, '.env.local');
const envPath = path.join(__dirname, '.env');

try {
  // Load .env.local first (Next.js priority)
  if (fs.existsSync(envLocalPath)) {
    console.log('Found .env.local, attempting to load...');
    // This is a very basic parser - just for testing
    const content = fs.readFileSync(envLocalPath, 'utf8');
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const equalIndex = trimmed.indexOf('=');
        if (equalIndex > 0) {
          const key = trimmed.substring(0, equalIndex).trim();
          const value = trimmed.substring(equalIndex + 1).trim();

          // Remove quotes if present
          let cleanValue = value;
          if ((cleanValue.startsWith('"') && cleanValue.endsWith('"')) ||
              (cleanValue.startsWith("'") && cleanValue.endsWith("'"))) {
            cleanValue = cleanValue.slice(1, -1);
          }

          if (key === 'RESEND_API_KEY' || key === 'DATABASE_URL' || key === 'NEXT_PUBLIC_APP_URL') {
            console.log(`${key}: "${cleanValue.substring(0, 20)}${cleanValue.length > 20 ? '...' : ''}"`);
          }
        }
      }
    }
  }
} catch (error) {
  console.log('❌ Error loading .env.local:', error.message);
}

// Test the email module
console.log('\n🔍 Testing email module:');
try {
  const emailModule = require('./src/lib/email.ts');
  console.log('Email module loaded successfully');
} catch (error) {
  console.log('❌ Error loading email module:', error.message);
}