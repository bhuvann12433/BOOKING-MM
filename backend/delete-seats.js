/**
 * DELETE ALL CORRUPT SEATS
 * Run: node delete-seats.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL;

const seatSchema = new mongoose.Schema({}, { strict: false });
const Seat = mongoose.model('Seat', seatSchema);

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected!');

    const before = await Seat.countDocuments();
    console.log(`📊 Seats before: ${before}`);

    // Delete ALL seats — corrupt ones with null/undefined will be wiped
    // Fresh correct seats auto-create when user opens any show
    const result = await Seat.deleteMany({});
    console.log(`🗑️  Deleted: ${result.deletedCount} seats`);

    const after = await Seat.countDocuments();
    console.log(`📊 Seats after: ${after}`);
    console.log('✅ Done! Fresh seats will auto-create when you open a show.');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

run();