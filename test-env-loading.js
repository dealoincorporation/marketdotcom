const fs = require('fs');
const path = require('path');

// Check if .env.local exists and read it
const envLocalPath = path.join(__dirname, '.env.local');
const envPath = path.join(__dirname, '.env');

console.log('🔍 Environment File Check');
console.log('==========================');

try {
  if (fs.existsSync(envLocalPath)) {
    console.log('✅ .env.local exists');
    const content = fs.readFileSync(envLocalPath, 'utf8');
    console.log('📄 .env.local content:');
    console.log(content);
    console.log('---');

    // Check for RESEND_API_KEY
    if (content.includes('RESEND_API_KEY')) {
      console.log('✅ RESEND_API_KEY found in .env.local');
    } else {
      console.log('❌ RESEND_API_KEY NOT found in .env.local');
    }

    // Check for syntax issues
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && !line.startsWith('#') && line.includes('=')) {
        if (!line.includes('=')) {
          console.log(`⚠️  Line ${i + 1}: Missing = sign`);
        }
        if (line.split('=').length > 2) {
          console.log(`⚠️  Line ${i + 1}: Multiple = signs`);
        }
      }
    }
  } else {
    console.log('❌ .env.local does not exist');
  }
} catch (error) {
  console.log('❌ Error reading .env.local:', error.message);
}

try {
  if (fs.existsSync(envPath)) {
    console.log('✅ .env exists');
    const content = fs.readFileSync(envPath, 'utf8');
    console.log('📄 .env content:');
    console.log(content);
  } else {
    console.log('ℹ️  .env does not exist');
  }
} catch (error) {
  console.log('❌ Error reading .env:', error.message);
}

console.log('\n🔍 Process Environment Check');
console.log('=============================');
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'EXISTS' : 'NOT FOUND');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'EXISTS' : 'NOT FOUND');
console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL ? 'EXISTS' : 'NOT FOUND');

// Test Next.js style loading
console.log('\n🔍 Next.js Style Loading Test');
console.log('==============================');
try {
  require('dotenv').config({ path: envLocalPath });
  console.log('After loading .env.local:');
  console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'EXISTS' : 'NOT FOUND');
} catch (error) {
  console.log('❌ Error loading with dotenv:', error.message);
}