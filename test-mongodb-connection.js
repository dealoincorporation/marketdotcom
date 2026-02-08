require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

// Test MongoDB connection
async function testConnection() {
  console.log('🔍 MongoDB Connection Test');
  console.log('===========================');

  // Get DATABASE_URL from environment
  const databaseUrl = process.env.DATABASE_URL;
  console.log('DATABASE_URL:', databaseUrl ? 'EXISTS' : 'NOT FOUND');

  if (!databaseUrl) {
    console.log('❌ DATABASE_URL environment variable not found');
    console.log('💡 Make sure your .env.local file has the correct DATABASE_URL');
    return;
  }

  // Mask sensitive info for logging
  const maskedUrl = databaseUrl.replace(/:([^:@]{4})[^:@]*@/, ':****@');
  console.log('Connection URL:', maskedUrl);

  const client = new MongoClient(databaseUrl, {
    serverSelectionTimeoutMS: 5000, // 5 second timeout
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });

  try {
    console.log('\n🔌 Attempting to connect to MongoDB...');

    // Test connection
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!');

    // Test database access
    const db = client.db();
    const dbName = db.databaseName;
    console.log(`📊 Connected to database: ${dbName}`);

    // Test a simple operation
    const collections = await db.collections();
    console.log(`📁 Found ${collections.length} collections in database`);

    // List collection names
    const collectionNames = collections.map(col => col.collectionName);
    console.log('Collections:', collectionNames.join(', '));

    console.log('\n🎉 MongoDB connection test PASSED!');
    console.log('Your DATABASE_URL is working correctly.');

  } catch (error) {
    console.log('\n❌ MongoDB connection test FAILED!');
    console.log('Error details:', error.message);

    // Provide specific troubleshooting based on error type
    if (error.message.includes('authentication failed')) {
      console.log('\n🔧 Possible causes:');
      console.log('• Wrong username/password in DATABASE_URL');
      console.log('• User doesn\'t have proper permissions');
      console.log('• Database user was deleted or changed');
    } else if (error.message.includes('getaddrinfo ENOTFOUND')) {
      console.log('\n🔧 Possible causes:');
      console.log('• Invalid hostname in DATABASE_URL');
      console.log('• DNS resolution failed');
      console.log('• Network connectivity issue');
    } else if (error.message.includes('connection timed out') || error.message.includes('Server selection timeout')) {
      console.log('\n🔧 Possible causes:');
      console.log('• MongoDB Atlas cluster is paused (free tier auto-pauses)');
      console.log('• IP address not whitelisted in MongoDB Atlas');
      console.log('• Firewall blocking outbound connections');
      console.log('• Network connectivity issue');
      console.log('• MongoDB Atlas cluster is in maintenance');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('\n🔧 Possible causes:');
      console.log('• MongoDB server is not running');
      console.log('• Wrong port number in DATABASE_URL');
      console.log('• Local MongoDB not started (if using localhost)');
    }

    console.log('\n💡 Troubleshooting steps:');
    console.log('1. Check MongoDB Atlas dashboard - cluster might be paused');
    console.log('2. Verify IP whitelist in MongoDB Atlas Network Access');
    console.log('3. Test connection from MongoDB Compass or mongosh');
    console.log('4. Check your internet connection');
    console.log('5. Verify DATABASE_URL format and credentials');

  } finally {
    await client.close();
    console.log('\n🔌 Connection closed.');
  }
}

testConnection().catch(console.error);