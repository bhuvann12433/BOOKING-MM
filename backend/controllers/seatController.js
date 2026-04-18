import Seat from "../models/Seat.js";
import Show from "../models/Show.js";

// Get seat layout for a show
export const getSeatLayout = async (req, res) => {
  try {
    const { showId } = req.params;

    const seats = await Seat.find({ show: showId }).sort({ row: 1, col: 1 });

    if (seats.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No seats found for this show",
      });
    }

    // Organize seats by row
    const seatsByRow = seats.reduce((acc, seat) => {
      if (!acc[seat.row]) {
        acc[seat.row] = [];
      }
      acc[seat.row].push(seat);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        totalSeats: seats.length,
        seatsByRow,
        seats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get available seats for a show
export const getAvailableSeats = async (req, res) => {
  try {
    const { showId } = req.params;

    const availableSeats = await Seat.find({
      show: showId,
      status: "available",
    }).sort({ row: 1, col: 1 });

    res.status(200).json({
      success: true,
      count: availableSeats.length,
      data: availableSeats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get booked seats for a show
export const getBookedSeats = async (req, res) => {
  try {
    const { showId } = req.params;

    const bookedSeats = await Seat.find({
      show: showId,
      status: "booked",
    }).sort({ row: 1, col: 1 });

    res.status(200).json({
      success: true,
      count: bookedSeats.length,
      data: bookedSeats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Check seat availability
export const checkSeatAvailability = async (req, res) => {
  try {
    const { seatIds } = req.body;

    const unavailableSeats = await Seat.find({
      _id: { $in: seatIds },
      status: { $ne: "available" },
    });

    if (unavailableSeats.length > 0) {
      return res.status(200).json({
        success: false,
        available: false,
        message: "Some seats are not available",
        unavailableSeats,
      });
    }

    res.status(200).json({
      success: true,
      available: true,
      message: "All seats are available",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * LEGACY ENDPOINTS (from original server.js)
 * Kept for backward compatibility
 */

/**
 * Get All Seats (Legacy)
 * @route GET /seats
 */
export const getAllSeats = async (req, res) => {
  try {
    const seats = await Seat.find().sort({
      section: 1,
      row: 1,
      col: 1,
    });

    res.status(200).json({
      success: true,
      count: seats.length,
      data: seats,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message || 'Failed to fetch seats',
    });
  }
};

/**
 * Book a Seat (Legacy)
 * @route POST /book-seat
 * Marks a specific seat as booked
 */
export const bookSeat = async (req, res) => {
  const { section, row, col } = req.body;

  try {
    // Validate input
    if (!section || row === undefined || col === undefined) {
      return res.status(400).json({
        error: 'Section, row, and column are required',
      });
    }

    // Find seat
    const seat = await Seat.findOne({
      section,
      row: Number(row),
      col: Number(col),
    });

    // Check if seat exists
    if (!seat) {
      return res.status(404).json({
        error: 'Seat not found',
      });
    }

    // Check if seat is already booked
    if (seat.booked) {
      return res.status(400).json({
        error: 'Seat already booked',
      });
    }

    // Mark seat as booked
    seat.booked = true;
    await seat.save();

    res.status(200).json({
      success: true,
      message: 'Seat booked successfully ✅',
      data: seat,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message || 'Booking failed',
    });
  }
};

// ============================================
// ADVANCED SEAT LOCKING SYSTEM (Real-time Safety)
// ============================================

/**
 * LOCK SEATS - Real-time Seat Reservation
 * 
 * POST /api/seats/lock
 * 
 * When user selects seats:
 * 1. Check if seats are available
 * 2. If available → Mark as "locked" with userId and 5-min expiry
 * 3. If locked by another user → Reject (seat unavailable)
 * 4. If lock expired → Treat as available and lock for current user
 * 
 * Uses atomic findOneAndUpdate to prevent race conditions
 * 
 * @param {string} showId - Show ID
 * @param {string[]} seatNumbers - Array of seat numbers ["A1", "A2", "B1"]
 * @param {string} userId - User ID locking the seats
 * @returns {Object} { success, lockedSeats[], failedSeats[], message }
 */
export const lockSeats = async (req, res) => {
  try {
    const { showId, seatNumbers, userId } = req.body;

    // ============================================
    // VALIDATION
    // ============================================
    if (!showId || !seatNumbers || !Array.isArray(seatNumbers) || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Required: showId, seatNumbers (array), userId'
      });
    }

    if (seatNumbers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one seat required'
      });
    }

    if (seatNumbers.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 10 seats can be locked at once'
      });
    }

    // ============================================
    // RELEASE EXPIRED LOCKS (Cleanup)
    // ============================================
    // Before attempting to lock, release any expired locks in this show
    await Seat.releaseExpiredLocks(showId);

    // ============================================
    // ATTEMPT TO LOCK EACH SEAT (Atomically)
    // ============================================
    const lockedSeats = [];
    const failedSeats = [];

    for (const seatNumber of seatNumbers) {
      try {
        // Atomic operation: Lock seat only if available
        const updatedSeat = await Seat.atomicLock(
          showId,
          seatNumber,
          userId,
          300 // 5 minutes lock duration
        );

        if (updatedSeat) {
          lockedSeats.push({
            _id: updatedSeat._id,
            seatNumber: updatedSeat.seatNumber,
            row: updatedSeat.row,
            col: updatedSeat.col,
            status: updatedSeat.status,
            lockExpiry: updatedSeat.lockExpiry,
            lockRemainingSeconds: updatedSeat.lockRemainingSeconds
          });
        } else {
          // Lock failed - seat unavailable or locked by another user
          const existingSeat = await Seat.findOne({
            show: showId,
            seatNumber
          });

          failedSeats.push({
            seatNumber,
            reason: existingSeat?.status === 'locked' 
              ? 'Locked by another user'
              : existingSeat?.status === 'booked'
              ? 'Already booked'
              : 'Unavailable',
            currentStatus: existingSeat?.status || 'unknown'
          });
        }
      } catch (error) {
        failedSeats.push({
          seatNumber,
          reason: error.message,
          error: 'Lock operation failed'
        });
      }
    }

    // ============================================
    // RESPONSE
    // ============================================
    const allLocked = failedSeats.length === 0;
    const partialLock = lockedSeats.length > 0 && failedSeats.length > 0;

    if (failedSeats.length === seatNumbers.length) {
      // All seats failed
      return res.status(409).json({
        success: false,
        message: 'Could not lock any seats',
        lockedCount: 0,
        failedCount: seatNumbers.length,
        lockedSeats: [],
        failedSeats
      });
    }

    res.status(allLocked ? 200 : 207).json({
      success: allLocked,
      message: allLocked 
        ? `All ${seatNumbers.length} seats locked successfully`
        : partialLock
        ? `${lockedSeats.length} seats locked, ${failedSeats.length} failed`
        : 'Some seats could not be locked',
      lockedCount: lockedSeats.length,
      failedCount: failedSeats.length,
      lockedSeats,
      failedSeats,
      lockDurationSeconds: 300
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: 'Lock operation failed'
    });
  }
};

/**
 * GET SEAT STATUS BY SHOW
 * 
 * GET /api/seats/:showId
 * 
 * Returns:
 * 1. Seat layout organized by row
 * 2. Statistics (available, locked, booked count)
 * 3. Individual seat details with lock info
 * 
 * Automatically releases expired locks before returning data
 * 
 * @param {string} showId - Show ID
 * @returns {Object} { seatLayout, statistics, seats[] }
 */
export const getSeatsByShow = async (req, res) => {
  try {
    const { showId } = req.params;

    if (!showId) {
      return res.status(400).json({
        success: false,
        message: 'Show ID required'
      });
    }

    // ============================================
    // RELEASE EXPIRED LOCKS (Cleanup)
    // ============================================
    const releaseResult = await Seat.releaseExpiredLocks(showId);
    if (releaseResult.modifiedCount > 0) {
      console.log(
        `[SEAT CLEANUP] Released ${releaseResult.modifiedCount} expired locks for show ${showId}`
      );
    }

    // ============================================
    // GET SEAT STATISTICS
    // ============================================
    const statistics = await Seat.getShowStatistics(showId);

    // ============================================
    // GET ALL SEATS
    // ============================================
    const seats = await Seat.find({ show: showId })
      .sort({ row: 1, col: 1 })
      .select(
        'seatNumber row col status lockedBy lockExpiry lockRemainingSeconds bookedBy bookedAt -booked -blocked'
      );

    if (seats.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No seats found for this show'
      });
    }

    // ============================================
    // ORGANIZE SEATS BY ROW (for UI)
    // ============================================
    const seatsByRow = seats.reduce((acc, seat) => {
      if (!acc[seat.row]) {
        acc[seat.row] = [];
      }
      acc[seat.row].push({
        _id: seat._id,
        seatNumber: seat.seatNumber,
        row: seat.row,
        col: seat.col,
        status: seat.status,
        isLocked: seat.status === 'locked',
        isBooked: seat.status === 'booked',
        lockRemainingSeconds: seat.lockRemainingSeconds,
        bookedAt: seat.bookedAt
      });
      return acc;
    }, {});

    // ============================================
    // RESPONSE
    // ============================================
    res.status(200).json({
      success: true,
      showId,
      seatLayout: seatsByRow,
      statistics: {
        total: statistics.total,
        available: statistics.available,
        locked: statistics.locked,
        booked: statistics.booked,
        occupancyPercentage: Math.round(
          ((statistics.locked + statistics.booked) / statistics.total) * 100
        )
      },
      seats: seats.map(seat => ({
        _id: seat._id,
        seatNumber: seat.seatNumber,
        row: seat.row,
        col: seat.col,
        status: seat.status,
        lockRemainingSeconds: seat.lockRemainingSeconds
      }))
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: 'Failed to retrieve seat status'
    });
  }
};

/**
 * BOOK SEATS - Finalize Seat Reservation
 * 
 * POST /api/seats/book
 * 
 * Converts locked seats to booked:
 * 1. Check each seat is locked by same userId
 * 2. Check lock has not expired
 * 3. If valid → Update to "booked" status
 * 4. If invalid → Return error (user cannot book)
 * 
 * Uses atomic findOneAndUpdate to prevent race conditions
 * 
 * @param {string} showId - Show ID
 * @param {string[]} seatNumbers - Seat numbers to book
 * @param {string} userId - User ID (must match who locked)
 * @param {string} bookingId - Reference to booking document
 * @returns {Object} { success, bookedSeats[], failedSeats[], message }
 */
export const bookSeatsAtomic = async (req, res) => {
  try {
    const { showId, seatNumbers, userId, bookingId } = req.body;

    // ============================================
    // VALIDATION
    // ============================================
    if (!showId || !seatNumbers || !Array.isArray(seatNumbers) || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Required: showId, seatNumbers (array), userId'
      });
    }

    if (seatNumbers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one seat required'
      });
    }

    // ============================================
    // BOOK EACH SEAT (Atomically)
    // ============================================
    const bookedSeats = [];
    const failedSeats = [];

    for (const seatNumber of seatNumbers) {
      try {
        // Atomic operation: Book seat only if locked by same user AND lock not expired
        const updatedSeat = await Seat.atomicBook(
          showId,
          seatNumber,
          userId,
          bookingId
        );

        if (updatedSeat) {
          bookedSeats.push({
            _id: updatedSeat._id,
            seatNumber: updatedSeat.seatNumber,
            row: updatedSeat.row,
            col: updatedSeat.col,
            status: updatedSeat.status,
            bookedBy: updatedSeat.bookedBy,
            bookedAt: updatedSeat.bookedAt
          });
        } else {
          // Book failed - seat not locked, lock expired, or locked by different user
          const existingSeat = await Seat.findOne({
            show: showId,
            seatNumber
          });

          let reason = 'Unknown error';
          if (existingSeat?.status === 'available') {
            reason = 'Seat not locked (lock expired or never locked)';
          } else if (existingSeat?.status === 'booked') {
            reason = 'Seat already booked';
          } else if (existingSeat?.status === 'locked' && existingSeat.lockedBy?.toString() !== userId) {
            reason = 'Locked by different user';
          } else if (
            existingSeat?.status === 'locked' &&
            existingSeat.lockExpiry &&
            new Date() > existingSeat.lockExpiry
          ) {
            reason = 'Lock expired (try locking again)';
          }

          failedSeats.push({
            seatNumber,
            reason,
            currentStatus: existingSeat?.status
          });
        }
      } catch (error) {
        failedSeats.push({
          seatNumber,
          reason: error.message,
          error: 'Book operation failed'
        });
      }
    }

    // ============================================
    // RESPONSE
    // ============================================
    const allBooked = failedSeats.length === 0;

    if (failedSeats.length === seatNumbers.length) {
      // All seats failed
      return res.status(409).json({
        success: false,
        message: 'Could not book any seats',
        bookedCount: 0,
        failedCount: seatNumbers.length,
        bookedSeats: [],
        failedSeats
      });
    }

    res.status(allBooked ? 200 : 207).json({
      success: allBooked,
      message: allBooked
        ? `All ${seatNumbers.length} seats booked successfully`
        : `${bookedSeats.length} seats booked, ${failedSeats.length} failed`,
      bookedCount: bookedSeats.length,
      failedCount: failedSeats.length,
      bookedSeats,
      failedSeats
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: 'Booking operation failed'
    });
  }
};

/**
 * UNLOCK SEATS - Release User Locks
 * 
 * POST /api/seats/unlock
 * 
 * User cancels seat selection (releases lock manually)
 * Only unlocks if locked by same user
 * 
 * @param {string} showId - Show ID
 * @param {string[]} seatNumbers - Seats to unlock
 * @param {string} userId - User who locked them
 * @returns {Object} { success, unlockedSeats[], message }
 */
export const unlockSeats = async (req, res) => {
  try {
    const { showId, seatNumbers, userId } = req.body;

    if (!showId || !seatNumbers || !Array.isArray(seatNumbers) || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Required: showId, seatNumbers (array), userId'
      });
    }

    const unlockedSeats = [];
    const failedSeats = [];

    for (const seatNumber of seatNumbers) {
      const result = await Seat.findOneAndUpdate(
        {
          show: showId,
          seatNumber,
          status: 'locked',
          lockedBy: userId
        },
        {
          status: 'available',
          lockedBy: null,
          lockExpiry: null,
          updatedAt: new Date()
        },
        { new: true }
      );

      if (result) {
        unlockedSeats.push({
          seatNumber: result.seatNumber,
          row: result.row,
          col: result.col,
          status: result.status
        });
      } else {
        failedSeats.push({
          seatNumber,
          reason: 'Seat not locked by you or does not exist'
        });
      }
    }

    res.status(200).json({
      success: failedSeats.length === 0,
      message: `${unlockedSeats.length} seats unlocked${failedSeats.length > 0 ? `, ${failedSeats.length} failed` : ''}`,
      unlockedSeats,
      failedSeats
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: 'Unlock operation failed'
    });
  }
};

/**
 * RELEASE ALL EXPIRED LOCKS - Maintenance
 * 
 * POST /api/seats/maintenance/release-expired
 * 
 * Call this periodically (or setup cron job)
 * Releases all locks that have expired across all shows
 * 
 * @returns {Object} { success, releasedCount, message }
 */
export const releaseExpiredLocksManual = async (req, res) => {
  try {
    const result = await Seat.updateMany(
      {
        status: 'locked',
        lockExpiry: { $lt: new Date() }
      },
      {
        status: 'available',
        lockedBy: null,
        lockExpiry: null,
        updatedAt: new Date()
      }
    );

    res.status(200).json({
      success: true,
      message: `Released ${result.modifiedCount} expired locks`,
      releasedCount: result.modifiedCount,
      timestamp: new Date()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: 'Failed to release expired locks'
    });
  }
};
