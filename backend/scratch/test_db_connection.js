import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from the backend directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoURI = process.env.MONGODB_URI;

console.log('Testing connection to:', mongoURI.split('@')[1]); // Log only the host part for security

async function testConnection() {
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ SUCCESS: MongoDB is connected perfectly!');
    
    // Check if we can access the database name
    const dbName = mongoose.connection.name;
    console.log(`📡 Connected to database: ${dbName}`);
    
    // List collections to verify access permissions
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📚 Found ${collections.length} collections in the database.`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ ERROR: Could not connect to MongoDB.');
    console.error('Reason:', error.message);
    process.exit(1);
  }
}

testConnection();
