import mongoose from 'mongoose';

/**
 * SEAT SCHEMA WITH REAL-TIME LOCKING & SAFETY
 * ✅ Works with both real MongoDB ObjectId showIds (from DB shows)
 * ✅ AND generated string showIds (from theatres.json fallback)
 */

const seatSchema = new mongoose.Schema(
  {
    // ✅ KEY CHANGE: Mixed type — accepts ObjectId OR string
    // Real shows from DB → ObjectId ref
    // JSON fallback shows → generated string like "2b1e3a8f..."
    show: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true,
    },

    seatNumber: {
      type: String,
      required: true,
      trim: true,
    },
    row: {
      type: String,
      required: true,
      trim: true,
    },
    col: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ['available', 'locked', 'booked'],
      default: 'available',
      index: true,
    },

    lockedBy: {
      type: mongoose.Schema.Types.Mixed, // ObjectId or null
      default: null,
    },

    lockExpiry: {
      type: Date,
      default: null,
      index: true,
    },

    bookedBy: {
      type: mongoose.Schema.Types.Mixed, // ObjectId or null
      default: null,
    },

    bookingReference: {
      type: mongoose.Schema.Types.Mixed, // ObjectId or null
      default: null,
    },

    bookedAt: {
      type: Date,
      default: null,
    },

    // Legacy fields
    booked: {
      type: Boolean,
      default: false,
    },

    blocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ============================================
// INDEXES
// ============================================

// ✅ Unique per show+seat combo — works for both ObjectId and string show
seatSchema.index({ show: 1, seatNumber: 1 }, { unique: true });
seatSchema.index({ show: 1, status: 1 });
seatSchema.index({ show: 1, lockedBy: 1 });
seatSchema.index({ lockExpiry: 1 });
seatSchema.index({ status: 1, lockExpiry: 1 });

// ============================================
// VIRTUALS
// ============================================

seatSchema.virtual('isLockExpired').get(function () {
  if (!this.lockExpiry) return false;
  return new Date() > this.lockExpiry;
});

seatSchema.virtual('lockRemainingSeconds').get(function () {
  if (!this.lockExpiry) return null;
  return Math.max(0, Math.ceil((this.lockExpiry - new Date()) / 1000));
});

// ============================================
// STATIC METHODS
// ============================================

/**
 * ATOMIC LOCK — works only for real ObjectId shows
 */
seatSchema.statics.atomicLock = async function (showId, seatNumber, userId, lockDurationSeconds = 300) {
  const lockExpiry = new Date(Date.now() + lockDurationSeconds * 1000);
  return this.findOneAndUpdate(
    {
      show: showId,
      seatNumber,
      $or: [
        { status: 'available' },
        { status: 'locked', lockExpiry: { $lt: new Date() } },
      ],
    },
    { status: 'locked', lockedBy: userId, lockExpiry, updatedAt: new Date() },
    { new: true, runValidators: true }
  );
};

/**
 * ATOMIC BOOK — works only for real ObjectId shows
 */
seatSchema.statics.atomicBook = async function (showId, seatNumber, userId, bookingId) {
  return this.findOneAndUpdate(
    {
      show: showId,
      seatNumber,
      status: 'locked',
      lockedBy: userId,
      lockExpiry: { $gt: new Date() },
    },
    {
      status: 'booked',
      bookedBy: userId,
      bookingReference: bookingId,
      bookedAt: new Date(),
      booked: true,
      updatedAt: new Date(),
    },
    { new: true }
  );
};

/**
 * RELEASE EXPIRED LOCKS for a show
 */
seatSchema.statics.releaseExpiredLocks = async function (showId) {
  return this.updateMany(
    { show: showId, status: 'locked', lockExpiry: { $lt: new Date() } },
    { status: 'available', lockedBy: null, lockExpiry: null, updatedAt: new Date() }
  );
};

/**
 * GET STATISTICS for a show
 */
seatSchema.statics.getShowStatistics = async function (showId) {
  const results = await this.aggregate([
    { $match: { show: showId } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const stats = { available: 0, locked: 0, booked: 0, total: 0 };
  results.forEach((r) => {
    stats[r._id] = r.count;
    stats.total += r.count;
  });
  return stats;
};

const Seat = mongoose.model('Seat', seatSchema);

export default Seat;