// Test Next.js environment loading
const fs = require('fs');
const path = require('path');

console.log('🔍 Next.js Environment Loading Test');
console.log('====================================');

// Simulate Next.js environment loading logic
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);

    let loadedCount = 0;
    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const equalIndex = trimmed.indexOf('=');
      if (equalIndex <= 0) {
        continue; // Invalid format
      }

      const key = trimmed.substring(0, equalIndex).trim();
      const value = trimmed.substring(equalIndex + 1).trim();

      // Remove quotes if present
      let cleanValue = value;
      if ((cleanValue.startsWith('"') && cleanValue.endsWith('"')) ||
          (cleanValue.startsWith("'") && cleanValue.endsWith("'"))) {
        cleanValue = cleanValue.slice(1, -1);
      }

      // Set in process.env (simulating what Next.js does)
      process.env[key] = cleanValue;
      loadedCount++;

      // Log the variables we're interested in
      if (['RESEND_API_KEY', 'DATABASE_URL', 'NEXT_PUBLIC_APP_URL', 'NEXTAUTH_SECRET'].includes(key)) {
        console.log(`✅ Loaded ${key}: "${cleanValue.substring(0, 20)}${cleanValue.length > 20 ? '...' : ''}"`);
      }
    }

    console.log(`📄 Loaded ${loadedCount} variables from ${path.basename(filePath)}`);
    return true;
  } catch (error) {
    console.log(`❌ Error loading ${path.basename(filePath)}: ${error.message}`);
    return false;
  }
}

// Test loading in Next.js priority order
console.log('Testing environment loading...');

const projectRoot = __dirname;
const envLocalPath = path.join(projectRoot, '.env.local');
const envPath = path.join(projectRoot, '.env');

// Next.js loads .env.local first, then .env (but .env is ignored if .env.local exists for same keys)
let envLocalLoaded = loadEnvFile(envLocalPath);
let envLoaded = false;

if (!envLocalLoaded || !process.env.RESEND_API_KEY) {
  // Only load .env if .env.local doesn't exist or doesn't have our key
  envLoaded = loadEnvFile(envPath);
}

// Check results
console.log('\n🔍 Final Environment Check:');
console.log('---------------------------');

const testVars = ['RESEND_API_KEY', 'DATABASE_URL', 'NEXT_PUBLIC_APP_URL', 'NEXTAUTH_SECRET'];
let allFound = true;

testVars.forEach(varName => {
  const exists = process.env[varName] ? true : false;
  const status = exists ? '✅ EXISTS' : '❌ NOT FOUND';
  console.log(`${varName}: ${status}`);

  if (!exists) {
    allFound = false;
  }
});

console.log('\n📊 Summary:');
console.log('-----------');

if (envLocalLoaded) {
  console.log('✅ .env.local was loaded');
} else {
  console.log('❌ .env.local failed to load');
}

if (envLoaded) {
  console.log('✅ .env was loaded');
} else if (!envLocalLoaded) {
  console.log('❌ .env was not loaded (fallback)');
}

if (allFound) {
  console.log('🎉 All required environment variables are loaded!');
} else {
  console.log('❌ Some environment variables are missing');

  if (!envLocalLoaded) {
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check .env.local file permissions');
    console.log('2. Verify file format: KEY="value"');
    console.log('3. Ensure no BOM (Byte Order Mark)');
    console.log('4. Try Unix line endings (LF not CRLF)');
    console.log('5. Check for syntax errors in the file');
  }
}

// Test the actual email module
console.log('\n🔍 Testing Email Module:');
console.log('------------------------');

try {
  // Clear require cache to force reload
  delete require.cache[require.resolve('./src/lib/email.ts')];

  const emailModule = require('./src/lib/email.ts');
  console.log('✅ Email module loaded successfully');

  // Try to access the resend instance
  if (emailModule.sendEmailVerificationEmail) {
    console.log('✅ Email functions are available');
  }
} catch (error) {
  console.log(`❌ Email module error: ${error.message}`);

  if (error.message.includes('API key')) {
    console.log('💡 This confirms RESEND_API_KEY is not loaded');
  }
}