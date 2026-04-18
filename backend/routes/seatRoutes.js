/**
 * Seat Routes
 * Handles seat management and booking endpoints
 */

import express from 'express';
import {
  getAllSeats,
  bookSeat,
  getSeatLayout,
  getAvailableSeats,
  getBookedSeats,
  checkSeatAvailability,
  lockSeats,
  getSeatsByShow,
  bookSeatsAtomic,
  unlockSeats,
  releaseExpiredLocksManual,
} from '../controllers/seatController.js';

const router = express.Router();

/**
 * LEGACY ENDPOINTS (from original server.js)
 * Kept for backward compatibility
 */

/**
 * GET /seats
 * Retrieve all seats
 */
router.get('/', getAllSeats);

/**
 * POST /book-seat
 * Book a specific seat
 * Body: { section, row, col }
 */
router.post('/book', bookSeat);

/**
 * ============================================
 * REAL-TIME SEAT LOCKING SYSTEM (NEW)
 * ============================================
 * 
 * Flow:
 * 1. User selects seats → POST /api/seats/lock
 * 2. System locks for 5 minutes
 * 3. User confirms booking → POST /api/seats/book
 * 4. Lock converted to permanent booking
 * 5. Expired locks auto-release to available
 * 
 * Benefits:
 * ✅ Prevents double booking
 * ✅ Handles concurrent users
 * ✅ Atomic operations for safety
 * ✅ Real-time seat status
 */

/**
 * POST /api/seats/lock
 * Lock seats for a user (5-minute timeout)
 * 
 * Body:
 * {
 *   showId: "ObjectId",
 *   seatNumbers: ["A1", "A2", "B1"],
 *   userId: "ObjectId"
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   lockedCount: number,
 *   failedCount: number,
 *   lockedSeats: [{ seatNumber, row, col, status, lockExpiry, lockRemainingSeconds }],
 *   failedSeats: [{ seatNumber, reason }],
 *   lockDurationSeconds: 300
 * }
 */
router.post('/lock', lockSeats);

/**
 * POST /api/seats/unlock
 * Release seats manually (user cancels selection)
 * 
 * Body:
 * {
 *   showId: "ObjectId",
 *   seatNumbers: ["A1", "A2"],
 *   userId: "ObjectId"
 * }
 * 
 * Only unlocks if locked by same user
 */
router.post('/unlock', unlockSeats);

/**
 * POST /api/seats/book
 * Book locked seats (convert to booked state)
 * 
 * Body:
 * {
 *   showId: "ObjectId",
 *   seatNumbers: ["A1", "A2"],
 *   userId: "ObjectId",
 *   bookingId: "ObjectId" (optional, booking reference)
 * }
 * 
 * Validation:
 * - Each seat must be locked by same user
 * - Lock must not be expired
 * - Only then converts to booked
 */
router.post('/book-atomic', bookSeatsAtomic);

/**
 * GET /api/seats/:showId
 * Get complete seat status for a show
 * 
 * Automatically releases expired locks before returning
 * 
 * Response:
 * {
 *   showId: "ObjectId",
 *   seatLayout: { "A": [seats], "B": [seats] },
 *   statistics: { total, available, locked, booked, occupancyPercentage },
 *   seats: [{ _id, seatNumber, row, col, status, lockRemainingSeconds }]
 * }
 */
router.get('/:showId', getSeatsByShow);

/**
 * ============================================
 * ADVANCED ENDPOINTS (Existing)
 * ============================================
 */

/**
 * GET /seats/layout/:showId
 * Get seat layout organized by rows for a show
 */
router.get('/layout/:showId', getSeatLayout);

/**
 * GET /seats/available/:showId
 * Get only available seats for a show
 */
router.get('/available/:showId', getAvailableSeats);

/**
 * GET /seats/booked/:showId
 * Get only booked seats for a show
 */
router.get('/booked/:showId', getBookedSeats);

/**
 * POST /seats/check
 * Check availability of specific seat IDs
 * Body: { seatIds: [...] }
 */
router.post('/check', checkSeatAvailability);

/**
 * ============================================
 * MAINTENANCE ENDPOINTS
 * ============================================
 */

/**
 * POST /api/seats/maintenance/release-expired
 * Maintenance endpoint: Release all expired locks
 * 
 * Call periodically (e.g., every 5 minutes via cron)
 * OR before critical operations
 * 
 * Response: { success, releasedCount, timestamp }
 */
router.post('/maintenance/release-expired', releaseExpiredLocksManual);

export default router;
