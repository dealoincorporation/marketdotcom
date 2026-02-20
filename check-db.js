// Check database configuration
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

console.log('🔍 Checking Database Configuration...\n');

console.log('DATABASE_URL from .env.local:', process.env.DATABASE_URL || 'NOT SET');
console.log('DATABASE_URL from .env:', process.env.DATABASE_URL || 'NOT SET');

// Check if MongoDB is running locally
const { exec } = require('child_process');

exec('pgrep mongod', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ MongoDB not running locally (mongod process not found)');
  } else {
    console.log('✅ MongoDB is running locally (mongod process found)');
  }

  // Check if we can connect to local MongoDB
  console.log('\n🔌 Testing local MongoDB connection...');
  const { MongoClient } = require('mongodb');

  const localUrl = 'mongodb://localhost:27017/marketdotcom';

  MongoClient.connect(localUrl, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
      console.log('✅ Local MongoDB connection successful!');
      console.log('💡 Suggestion: Update DATABASE_URL to:', localUrl);
    })
    .catch((err) => {
      console.log('❌ Local MongoDB connection failed:', err.message);
      console.log('💡 Suggestion: Start MongoDB locally or check your cloud database credentials');
    });
});