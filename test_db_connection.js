import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/smart-edu";

async function testConnection() {
  try {
    console.log('🔄 Testing MongoDB connection...');

    await mongoose.connect(MONGODB_URI);

    console.log('✅ MongoDB connection successful!');
    console.log('📊 Database name:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('🔌 Port:', mongoose.connection.port);

    // Test a simple query
    const db = mongoose.connection.db;
    const collections = await db.collections();
    console.log('📁 Collections:', collections.map(c => c.collectionName));

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
