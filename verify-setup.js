// Quick verification script
require('dotenv').config({path: '.env.local'});

console.log('🔍 Setup Verification');
console.log('=====================');

// Check environment variables
const checks = [
  { name: 'DATABASE_URL', required: true },
  { name: 'RESEND_API_KEY', required: false },
  { name: 'GMAIL_USER', required: false },
  { name: 'GMAIL_APP_PASSWORD', required: false },
  { name: 'NEXT_PUBLIC_APP_URL', required: true },
  { name: 'NEXTAUTH_SECRET', required: true },
  { name: 'ADMIN_EMAIL', required: false },
];

let allRequired = true;
let hasEmailService = false;

console.log('\n📋 Environment Variables:');
checks.forEach(check => {
  const exists = !!process.env[check.name];
  const status = exists ? '✅' : '❌';
  const required = check.required ? '(required)' : '(optional)';

  console.log(`${status} ${check.name}: ${exists ? 'Loaded' : 'Missing'} ${required}`);

  if (check.required && !exists) {
    allRequired = false;
  }

  if (check.name === 'RESEND_API_KEY' && exists) {
    hasEmailService = true;
  }

  if (check.name === 'GMAIL_USER' && process.env.GMAIL_APP_PASSWORD && exists) {
    hasEmailService = true;
  }
});

// Check email service
console.log('\n📧 Email Service:');
if (process.env.RESEND_API_KEY) {
  console.log('✅ Resend service configured');
} else if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
  console.log('✅ Gmail service configured');
} else {
  console.log('❌ No email service configured');
  hasEmailService = false;
}

// Test database connection (basic)
console.log('\n🗄️ Database:');
if (process.env.DATABASE_URL) {
  if (process.env.DATABASE_URL.includes('mongodb')) {
    console.log('✅ MongoDB URL configured');
  } else {
    console.log('⚠️ Database URL format looks unusual');
  }
} else {
  console.log('❌ Database URL missing');
  allRequired = false;
}

// Summary
console.log('\n📊 Summary:');
if (allRequired && hasEmailService) {
  console.log('🎉 Setup is COMPLETE! Your app should work perfectly.');
  console.log('\n🚀 Next steps:');
  console.log('1. Start your dev server: npm run dev');
  console.log('2. Register a new user');
  console.log('3. Check your email for verification link');
} else {
  console.log('❌ Setup is INCOMPLETE. Please fix the missing items above.');
}

console.log('\n🔧 Quick Fix Commands:');
console.log('npm run dev                    # Start server');
console.log('rm -rf .next                  # Clear cache if needed');
console.log('node verify-setup.js          # Re-run this check');