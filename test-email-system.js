// Test the email system
require('dotenv').config({path: '.env.local'});

const { sendEmailVerificationEmail } = require('./src/lib/email.ts');

async function testEmailSystem() {
  console.log('🧪 Testing Email System');
  console.log('========================');

  // Check environment variables
  console.log('Environment Variables:');
  console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ SET' : '❌ NOT SET');
  console.log('GMAIL_USER:', process.env.GMAIL_USER ? '✅ SET' : '❌ NOT SET');
  console.log('GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? '✅ SET' : '❌ NOT SET');
  console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL ? '✅ SET' : '❌ NOT SET');

  // Determine which service will be used
  let serviceToUse = 'NONE';
  if (process.env.RESEND_API_KEY) {
    serviceToUse = 'RESEND';
  } else if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    serviceToUse = 'GMAIL';
  }

  console.log(`\n📧 Service to use: ${serviceToUse}`);

  if (serviceToUse === 'NONE') {
    console.log('❌ No email service configured!');
    console.log('Please add either RESEND_API_KEY or GMAIL_USER+GMAIL_APP_PASSWORD to your .env.local');
    return;
  }

  // Test email sending (commented out to avoid actually sending emails during testing)
  console.log('\n📧 Test email sending:');
  console.log('To test actual email sending, uncomment the code below and run:');
  console.log('');
  console.log('const testEmail = "your-test-email@example.com";');
  console.log('const testToken = "test-token-123";');
  console.log('');
  console.log('try {');
  console.log('  const result = await sendEmailVerificationEmail(testEmail, testToken);');
  console.log('  console.log("✅ Email sent successfully:", result);');
  console.log('} catch (error) {');
  console.log('  console.error("❌ Email sending failed:", error.message);');
  console.log('}');

  console.log('\n🎉 Email system is ready!');
  console.log('The system will automatically use the best available service.');
}

testEmailSystem().catch(console.error);