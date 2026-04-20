/**
 * DEBUG SCRIPT - Shows actual seat data in MongoDB
 * Run: node debug-seats.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL;

const seatSchema = new mongoose.Schema({}, { strict: false });
const Seat = mongoose.model('Seat', seatSchema);

const debug = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected!\n');

    // Show 5 sample seats
    console.log('📋 SAMPLE SEATS (first 5):');
    const sample = await Seat.find().limit(5).lean();
    sample.forEach((s, i) => {
      console.log(`\nSeat ${i + 1}:`);
      console.log(`  show:       "${s.show}"`);
      console.log(`  seatNumber: "${s.seatNumber}"`);
      console.log(`  status:     "${s.status}"`);
      console.log(`  booked:     ${s.booked}`);
    });

    // Show booked seats
    console.log('\n\n🎟️  BOOKED SEATS:');
    const booked = await Seat.find({ 
      $or: [{ status: 'booked' }, { booked: true }] 
    }).limit(10).lean();
    
    if (booked.length === 0) {
      console.log('  No booked seats found!');
    } else {
      booked.forEach((s, i) => {
        console.log(`  ${i + 1}. show="${s.show}" seatNumber="${s.seatNumber}" status="${s.status}"`);
      });
    }

    // Show unique showIds
    console.log('\n\n🎬 UNIQUE SHOW IDs in seats collection:');
    const unique = await Seat.distinct('show');
    unique.forEach((id, i) => {
      console.log(`  ${i + 1}. "${id}"`);
    });

    console.log('\n\n📊 SUMMARY:');
    console.log(`  Total seats: ${await Seat.countDocuments()}`);
    console.log(`  Booked: ${await Seat.countDocuments({ status: 'booked' })}`);
    console.log(`  Available: ${await Seat.countDocuments({ status: 'available' })}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

debug();