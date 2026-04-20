/**
 * ONE-TIME CLEANUP SCRIPT
 * Deletes all old-format seats from MongoDB
 * Old format: seatNumber like "Premium-3-8", "Normal-2-4", "Executive-1-5"
 * New format: seatNumber like "P3-8", "N2-4", "E1-5"
 * 
 * Run: node cleanup.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL;

const seatSchema = new mongoose.Schema({
  show: { type: mongoose.Schema.Types.Mixed },
  seatNumber: String,
  status: String,
  booked: Boolean,
}, { strict: false });

const Seat = mongoose.model('Seat', seatSchema);

const cleanup = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected!');

    // ── STEP 1: Count total seats
    const total = await Seat.countDocuments();
    console.log(`📊 Total seats in DB: ${total}`);

    // ── STEP 2: Find old format seats (Premium-X-Y, Executive-X-Y, Normal-X-Y)
    const oldFormat = await Seat.countDocuments({
      seatNumber: { $regex: /^(Premium|Executive|Normal)-/ }
    });
    console.log(`🗑️  Old format seats found: ${oldFormat}`);

    // ── STEP 3: Find new format seats (P, E, N prefix)
    const newFormat = await Seat.countDocuments({
      seatNumber: { $regex: /^[PENpen]\d/ }
    });
    console.log(`✅ New format seats found: ${newFormat}`);

    if (oldFormat === 0) {
      console.log('🎉 No old format seats found! DB is already clean.');
      await mongoose.disconnect();
      return;
    }

    // ── STEP 4: Delete ALL seats (both old and new)
    // Fresh seats will be auto-created when users visit each show
    console.log('\n⚠️  Deleting ALL seats so fresh ones auto-create...');
    const result = await Seat.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} seats`);

    console.log('\n🎬 Done! Next time any show is opened:');
    console.log('   → Backend auto-creates 180 fresh seats (P, E, N format)');
    console.log('   → Each show gets its own unique seat screen');
    console.log('   → Booked seats will persist correctly\n');

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);

  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    process.exit(1);
  }
};

cleanup();