// Test actual email sending
require('dotenv').config({path: '.env.local'});

const { sendEmailVerificationEmail } = require('./src/lib/email.ts');

async function testEmailSending() {
  console.log('🧪 Testing Actual Email Sending');
  console.log('================================');

  // Check environment variables
  console.log('Environment Variables:');
  console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'SET' : 'NOT SET');
  console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL || 'NOT SET');

  // Test email sending
  const testEmail = 'tajaapp.shop@gmail.com'; // Use the email from logs
  const testToken = 'test-token-12345';

  console.log(`\n📧 Sending test email to: ${testEmail}`);
  console.log('Token:', testToken);

  try {
    const result = await sendEmailVerificationEmail(testEmail, testToken);

    console.log('\n✅ Email sent successfully!');
    console.log('Result:', JSON.stringify(result, null, 2));

    if (result && result.data) {
      console.log('Email ID:', result.data.id);
      console.log('Message: Email has been queued for delivery');
    }

  } catch (error) {
    console.log('\n❌ Email sending failed!');
    console.log('Error:', error.message);

    if (error.message.includes('API key')) {
      console.log('💡 Issue: RESEND_API_KEY is invalid or expired');
    } else if (error.message.includes('network') || error.message.includes('timeout')) {
      console.log('💡 Issue: Network connectivity problem');
    } else if (error.message.includes('rate limit')) {
      console.log('💡 Issue: Too many emails sent (rate limited)');
    } else if (error.message.includes('unauthorized')) {
      console.log('💡 Issue: API key has insufficient permissions');
    }
  }

  console.log('\n🔍 Troubleshooting Tips:');
  console.log('1. Check spam/junk folder');
  console.log('2. Verify RESEND_API_KEY is valid');
  console.log('3. Check Resend dashboard for sent emails');
  console.log('4. Try a different email address');
  console.log('5. Check NEXT_PUBLIC_APP_URL is set correctly');

  console.log('\n📧 Resend Dashboard: https://resend.com/emails');
}

testEmailSending().catch(console.error);