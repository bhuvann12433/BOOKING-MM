/**
 * DELETE ALL BOOKINGS
 * Clears all booking history from MongoDB
 * Run: node delete-bookings.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL;

const bookingSchema = new mongoose.Schema({}, { strict: false });
const Booking = mongoose.model('Booking', bookingSchema);

const seatSchema = new mongoose.Schema({}, { strict: false });
const Seat = mongoose.model('Seat', seatSchema);

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected!');

    // Count before
    const bookingsBefore = await Booking.countDocuments();
    const seatsBefore = await Seat.countDocuments();
    console.log(`📊 Bookings before: ${bookingsBefore}`);
    console.log(`📊 Seats before:    ${seatsBefore}`);

    // Delete all bookings
    const b = await Booking.deleteMany({});
    console.log(`🗑️  Deleted bookings: ${b.deletedCount}`);

    // Delete all seats (fresh ones auto-create per show)
    const s = await Seat.deleteMany({});
    console.log(`🗑️  Deleted seats:    ${s.deletedCount}`);

    // Confirm
    console.log(`📊 Bookings after: ${await Booking.countDocuments()}`);
    console.log(`📊 Seats after:    ${await Seat.countDocuments()}`);

    console.log('\n✅ All cleared! Fresh start 🎬');
    console.log('   → Profile page will show 0 bookings');
    console.log('   → Every show will have fresh seat screen');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

run();