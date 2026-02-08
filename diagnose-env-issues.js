const fs = require('fs');
const path = require('path');

console.log('🔍 Next.js Environment Diagnostic');
console.log('==================================');

const projectRoot = __dirname;
const envLocalPath = path.join(projectRoot, '.env.local');
const envPath = path.join(projectRoot, '.env');
const nextConfigPath = path.join(projectRoot, 'next.config.ts');
const nextConfigJsPath = path.join(projectRoot, 'next.config.js');

// Check 1: File existence and basic info
console.log('\n1️⃣ File Existence Check:');
console.log('------------------------');

[envLocalPath, envPath].forEach(filePath => {
  const fileName = path.basename(filePath);
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log(`✅ ${fileName} exists`);
      console.log(`   Size: ${stats.size} bytes`);
      console.log(`   Modified: ${stats.mtime.toISOString()}`);
      console.log(`   Permissions: ${stats.mode.toString(8)}`);
    } else {
      console.log(`❌ ${fileName} does not exist`);
    }
  } catch (error) {
    console.log(`❌ Error checking ${fileName}: ${error.message}`);
  }
});

// Check 2: Next.js configuration
console.log('\n2️⃣ Next.js Configuration Check:');
console.log('-------------------------------');

let nextConfigExists = false;
if (fs.existsSync(nextConfigPath)) {
  console.log('✅ next.config.ts exists');
  nextConfigExists = true;
} else if (fs.existsSync(nextConfigJsPath)) {
  console.log('✅ next.config.js exists');
  nextConfigExists = true;
} else {
  console.log('⚠️  No next.config.ts or next.config.js found');
}

if (nextConfigExists) {
  try {
    const configPath = fs.existsSync(nextConfigPath) ? nextConfigPath : nextConfigJsPath;
    const configContent = fs.readFileSync(configPath, 'utf8');

    if (configContent.includes('env')) {
      console.log('⚠️  Next.js config contains env configuration - this might override .env files');
    }

    if (configContent.includes('dotenv')) {
      console.log('⚠️  Next.js config uses dotenv - this might affect loading');
    }

    console.log('✅ Next.js config file is readable');
  } catch (error) {
    console.log(`❌ Error reading Next.js config: ${error.message}`);
  }
}

// Check 3: .gitignore status
console.log('\n3️⃣ .gitignore Check:');
console.log('-------------------');

const gitignorePath = path.join(projectRoot, '.gitignore');
if (fs.existsSync(gitignorePath)) {
  try {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    if (gitignoreContent.includes('.env')) {
      console.log('✅ .env files are properly ignored in .gitignore');
    } else {
      console.log('⚠️  .env files are not mentioned in .gitignore');
    }
  } catch (error) {
    console.log(`❌ Error reading .gitignore: ${error.message}`);
  }
} else {
  console.log('⚠️  No .gitignore file found');
}

// Check 4: Next.js cache
console.log('\n4️⃣ Next.js Cache Check:');
console.log('----------------------');

const nextCachePath = path.join(projectRoot, '.next');
if (fs.existsSync(nextCachePath)) {
  console.log('⚠️  .next cache directory exists - this might cause stale env loading');
  console.log('   💡 Try: rm -rf .next');
} else {
  console.log('✅ No .next cache directory');
}

// Check 5: Package.json scripts
console.log('\n5️⃣ Package.json Scripts Check:');
console.log('-----------------------------');

const packageJsonPath = path.join(projectRoot, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const scripts = packageJson.scripts || {};

    if (scripts.dev) {
      console.log(`✅ Dev script: "${scripts.dev}"`);
      if (!scripts.dev.includes('next dev')) {
        console.log('⚠️  Dev script might not be using Next.js properly');
      }
    } else {
      console.log('❌ No dev script found');
    }
  } catch (error) {
    console.log(`❌ Error reading package.json: ${error.message}`);
  }
}

// Check 6: Current environment
console.log('\n6️⃣ Current Environment Check:');
console.log('-----------------------------');

console.log(`Node.js version: ${process.version}`);
console.log(`Platform: ${process.platform}`);
console.log(`Architecture: ${process.arch}`);
console.log(`Current working directory: ${process.cwd()}`);

// Check 7: Environment variable test
console.log('\n7️⃣ Environment Variables Test:');
console.log('------------------------------');

const testVars = ['RESEND_API_KEY', 'DATABASE_URL', 'NEXT_PUBLIC_APP_URL', 'NEXTAUTH_SECRET'];
testVars.forEach(varName => {
  const exists = process.env[varName] ? true : false;
  console.log(`${varName}: ${exists ? 'EXISTS' : 'NOT FOUND'}`);
});

// Check 8: File encoding and format test (limited)
console.log('\n8️⃣ File Format Analysis:');
console.log('-----------------------');

[envLocalPath, envPath].forEach(filePath => {
  const fileName = path.basename(filePath);
  try {
    if (fs.existsSync(filePath)) {
      // Check file size
      const stats = fs.statSync(filePath);
      if (stats.size === 0) {
        console.log(`❌ ${fileName} is empty (0 bytes)`);
        return;
      }

      // Try to read first few bytes to check for BOM
      const buffer = Buffer.alloc(10);
      const fd = fs.openSync(filePath, 'r');
      fs.readSync(fd, buffer, 0, 10, 0);
      fs.closeSync(fd);

      // Check for BOM (Byte Order Mark)
      if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
        console.log(`❌ ${fileName} has UTF-8 BOM - this breaks env loading!`);
      } else if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
        console.log(`❌ ${fileName} has UTF-16 LE BOM - this breaks env loading!`);
      } else {
        console.log(`✅ ${fileName} BOM check passed`);
      }

      // Check for CRLF line endings in first line
      let hasCRLF = false;
      for (let i = 0; i < Math.min(100, stats.size); i++) {
        if (buffer[i] === 0x0D && buffer[i + 1] === 0x0A) {
          hasCRLF = true;
          break;
        }
      }

      if (hasCRLF) {
        console.log(`⚠️  ${fileName} uses Windows line endings (CRLF) - try Unix (LF)`);
      } else {
        console.log(`✅ ${fileName} uses Unix line endings (LF)`);
      }
    }
  } catch (error) {
    console.log(`❌ Error analyzing ${fileName}: ${error.message}`);
  }
});

// Check 9: Recommendations
console.log('\n9️⃣ Recommendations:');
console.log('------------------');

console.log('🔧 To fix environment loading issues:');
console.log('1. Delete .next cache: rm -rf .next');
console.log('2. Check .env.local format - ensure no BOM, Unix line endings');
console.log('3. Verify variable format: KEY="value" (no spaces around =)');
console.log('4. Restart dev server after changes');
console.log('5. Check that variables don\'t have placeholder values');

console.log('\n🧪 Test commands:');
console.log('node -e "console.log(process.env.RESEND_API_KEY ? \'EXISTS\' : \'NOT FOUND\')"');
console.log('npm run dev (check startup logs for env loading messages)');

console.log('\n📁 Current directory structure:');
try {
  const files = fs.readdirSync(projectRoot).filter(f => f.startsWith('.env') || f.includes('next') || f.includes('config'));
  console.log(files.join(', '));
} catch (error) {
  console.log('❌ Error reading directory');
}