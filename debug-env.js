// Debug script to check environment variables
console.log('🔍 Environment Variable Debug');
console.log('===========================');

console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
if (process.env.DATABASE_URL) {
  const url = process.env.DATABASE_URL;
  console.log('DATABASE_URL length:', url.length);
  console.log('DATABASE_URL starts with:', url.substring(0, 20) + '...');

  // Check if it's MongoDB
  if (url.startsWith('mongodb://') || url.startsWith('mongodb+srv://')) {
    console.log('✅ DATABASE_URL appears to be MongoDB format');
  } else {
    console.log('❌ DATABASE_URL does not appear to be MongoDB format');
    console.log('Expected: mongodb:// or mongodb+srv://');
    console.log('Actual start:', url.split('://')[0]);
  }

  // Check for Atlas format
  if (url.includes('mongodb+srv://') && url.includes('mongodb.net')) {
    console.log('✅ DATABASE_URL appears to be MongoDB Atlas format');
  } else if (url.includes('mongodb://') && url.includes('localhost')) {
    console.log('✅ DATABASE_URL appears to be local MongoDB format');
  } else {
    console.log('⚠️  DATABASE_URL format unclear');
  }
} else {
  console.log('❌ DATABASE_URL not found');
}

console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
console.log('NODE_ENV:', process.env.NODE_ENV);