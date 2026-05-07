import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function testRegister() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const testEmail = 'testuser_' + Date.now() + '@example.com';
    const testPhone = '9' + Math.floor(100000000 + Math.random() * 900000000);

    console.log('📝 Attempting to register:', testEmail, testPhone);

    const user = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: testEmail,
      phone: testPhone,
      password: 'password123',
      role: 'user'
    });

    console.log('✅ User created successfully:', user._id);
    
    // Clean up
    await User.deleteOne({ _id: user._id });
    console.log('🗑️  Test user cleaned up');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Registration failed:', err.message);
    process.exit(1);
  }
}

testRegister();
