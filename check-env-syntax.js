// Check .env.local syntax and format
const fs = require('fs');
const path = require('path');

console.log('🔍 Environment File Syntax Check');
console.log('=================================');

const envLocalPath = path.join(__dirname, '.env.local');
const envPath = path.join(__dirname, '.env');

function checkEnvFile(filePath, fileName) {
  console.log(`\n📄 Checking ${fileName}:`);

  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`❌ ${fileName} does not exist`);
      return;
    }

    console.log(`✅ ${fileName} exists`);

    // Get file stats
    const stats = fs.statSync(filePath);
    console.log(`📏 File size: ${stats.size} bytes`);

    // Read file content (handle permission errors)
    let content;
    try {
      content = fs.readFileSync(filePath, 'utf8');
    } catch (readError) {
      console.log(`❌ Cannot read ${fileName}: ${readError.message}`);
      return;
    }

    console.log(`📝 Content length: ${content.length} characters`);

    // Check for BOM (Byte Order Mark) which can cause issues
    if (content.charCodeAt(0) === 0xFEFF) {
      console.log('⚠️  File contains BOM (Byte Order Mark) - this can cause issues');
    }

    // Check for CRLF vs LF line endings
    if (content.includes('\r\n')) {
      console.log('⚠️  File uses Windows line endings (CRLF) - consider using Unix line endings (LF)');
    }

    // Analyze each line
    const lines = content.split(/\r?\n/);
    let validLines = 0;
    let invalidLines = 0;

    console.log(`📋 Analyzing ${lines.length} lines:`);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      if (!line.trim()) {
        continue; // Skip empty lines
      }

      if (line.trim().startsWith('#')) {
        console.log(`   Line ${lineNum}: Comment - OK`);
        continue; // Skip comments
      }

      // Check for valid key=value format
      const equalIndex = line.indexOf('=');
      if (equalIndex === -1) {
        console.log(`❌ Line ${lineNum}: No '=' found: "${line}"`);
        invalidLines++;
        continue;
      }

      if (equalIndex === 0) {
        console.log(`❌ Line ${lineNum}: Key is empty: "${line}"`);
        invalidLines++;
        continue;
      }

      const key = line.substring(0, equalIndex).trim();
      const value = line.substring(equalIndex + 1);

      // Check for common issues
      if (key.includes(' ')) {
        console.log(`⚠️  Line ${lineNum}: Key contains spaces: "${key}"`);
      }

      if (!value.trim()) {
        console.log(`⚠️  Line ${lineNum}: Value is empty for key: "${key}"`);
      }

      // Check if value is quoted
      if ((value.startsWith('"') && !value.endsWith('"')) ||
          (!value.startsWith('"') && value.endsWith('"'))) {
        console.log(`⚠️  Line ${lineNum}: Mismatched quotes for key: "${key}"`);
      }

      // Check for specific keys we're looking for
      if (key === 'RESEND_API_KEY') {
        console.log(`✅ Line ${lineNum}: Found RESEND_API_KEY`);
        if (value.trim() && !value.includes('your_') && !value.includes('here')) {
          console.log(`   ✅ RESEND_API_KEY appears to have a real value`);
        } else {
          console.log(`   ⚠️  RESEND_API_KEY appears to be a placeholder`);
        }
      }

      if (key === 'DATABASE_URL') {
        console.log(`✅ Line ${lineNum}: Found DATABASE_URL`);
      }

      if (key === 'NEXT_PUBLIC_APP_URL') {
        console.log(`✅ Line ${lineNum}: Found NEXT_PUBLIC_APP_URL`);
      }

      validLines++;
    }

    console.log(`\n📊 Summary for ${fileName}:`);
    console.log(`   Valid lines: ${validLines}`);
    console.log(`   Invalid lines: ${invalidLines}`);

    if (invalidLines > 0) {
      console.log(`❌ ${fileName} has syntax errors that may prevent loading`);
    } else {
      console.log(`✅ ${fileName} syntax appears correct`);
    }

  } catch (error) {
    console.log(`❌ Error checking ${fileName}: ${error.message}`);
  }
}

checkEnvFile(envLocalPath, '.env.local');
checkEnvFile(envPath, '.env');

console.log('\n🔍 Next.js Environment Loading Check');
console.log('=====================================');

// Simulate what Next.js does
console.log('Next.js loads .env.local first, then .env');
console.log('If .env.local exists, .env is ignored for conflicting keys');

console.log('\n💡 Common Issues:');
console.log('1. Missing quotes around values with spaces');
console.log('2. Extra spaces around = sign');
console.log('3. Non-ASCII characters or BOM');
console.log('4. Wrong file encoding');
console.log('5. File permissions');
console.log('6. Next.js cache issues (try deleting .next folder)');