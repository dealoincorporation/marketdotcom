#!/usr/bin/env node

// Script to download Space Grotesk font files locally
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fontsDir = path.join(__dirname, 'public', 'fonts');

// Create fonts directory if it doesn't exist
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

console.log('🚀 Downloading Space Grotesk fonts...');

// Space Grotesk font URLs (woff2 format for better performance)
const fontFiles = [
  {
    url: 'https://fonts.gstatic.com/s/spacegrotesk/v16/V8mQoQDjQSkFtoMM3T6r8XjO.woff2',
    filename: 'SpaceGrotesk-Regular.woff2',
    weight: '400'
  },
  {
    url: 'https://fonts.gstatic.com/s/spacegrotesk/v16/V8mQoQDjQSkFtoMM3T6r8XjN.woff2',
    filename: 'SpaceGrotesk-Medium.woff2',
    weight: '500'
  },
  {
    url: 'https://fonts.gstatic.com/s/spacegrotesk/v16/V8mQoQDjQSkFtoMM3T6r8XjM.woff2',
    filename: 'SpaceGrotesk-Bold.woff2',
    weight: '700'
  }
];

function downloadFont(font) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(fontsDir, font.filename);

    // Skip if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${font.filename} already exists`);
      resolve();
      return;
    }

    console.log(`📥 Downloading ${font.filename}...`);

    const file = fs.createWriteStream(filePath);
    const request = https.get(font.url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${font.filename}: ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log(`✅ Downloaded ${font.filename}`);
        resolve();
      });
    });

    request.on('error', (err) => {
      fs.unlink(filePath, () => {}); // Delete the file on error
      reject(err);
    });

    file.on('error', (err) => {
      fs.unlink(filePath, () => {}); // Delete the file on error
      reject(err);
    });
  });
}

async function downloadAllFonts() {
  try {
    for (const font of fontFiles) {
      await downloadFont(font);
    }
    console.log('🎉 All Space Grotesk fonts downloaded successfully!');
    console.log('📁 Fonts saved to: public/fonts/');
  } catch (error) {
    console.error('❌ Error downloading fonts:', error.message);
    console.log('⚠️  Build will continue with fallback fonts');
    process.exit(0); // Don't fail the build
  }
}

downloadAllFonts();