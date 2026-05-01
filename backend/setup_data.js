import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Pricing from './models/Pricing.js';
import connectDB from './config/database.js';

dotenv.config();

const ADMIN_EMAIL = 'admin@goelectriq.com';
const ADMIN_PASSWORD = 'Admin@123';

async function setupData() {
  try {
    await connectDB();

    // 1. Setup Admin User
    const emailLower = ADMIN_EMAIL.toLowerCase().trim();
    await User.deleteOne({ email: emailLower });
    await User.create({
      firstName: 'GoElectriQ',
      lastName: 'Admin',
      email: emailLower,
      password: ADMIN_PASSWORD,
      phone: '9876543210',
      role: 'admin',
      isActive: true,
    });
    console.log('✅ Admin user created successfully');

    // 2. Setup Default Pricing
    await Pricing.deleteMany({});
    const defaultPricing = [
      {
        cabType: 'economy',
        displayName: 'Economy',
        description: 'Compact and economical electric ride',
        capacity: { passengers: 4, luggage: 2 },
        baseFare: 50,
        perKmRate: 10,
        minimumFare: 100,
        isActive: true,
        airportCharges: {
          pickup: { fixedCharge: 500, parkingCharge: 100 },
          drop: { fixedCharge: 400, parkingCharge: 50 },
        }
      },
      {
        cabType: 'premium',
        displayName: 'Premium',
        description: 'Luxurious and spacious electric ride',
        capacity: { passengers: 6, luggage: 4 },
        baseFare: 100,
        perKmRate: 18,
        minimumFare: 200,
        isActive: true,
        airportCharges: {
          pickup: { fixedCharge: 800, parkingCharge: 150 },
          drop: { fixedCharge: 700, parkingCharge: 100 },
        }
      }
    ];

    await Pricing.insertMany(defaultPricing);
    console.log('✅ Default pricing data seeded successfully');

    console.log('\n========================================');
    console.log('   PROJECT SETUP COMPLETE');
    console.log('========================================');
    console.log('   ADMIN LOGIN CREDENTIALS');
    console.log('   Email:    ' + ADMIN_EMAIL);
    console.log('   Password: ' + ADMIN_PASSWORD);
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupData();
