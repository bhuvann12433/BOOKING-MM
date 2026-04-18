/**
 * Booking Routes
 * Handles booking creation, retrieval, and management endpoints
 */

import express from 'express';
import {
  createBooking,
  getUserBookings,
  getBookingDetails,
  cancelBooking,
  createBookingWithEmail,
  getBookingHistoryLegacy,
} from '../controllers/bookingController.js';

const router = express.Router();

/**
 * LEGACY ENDPOINTS (from original server.js)
 * Kept for backward compatibility with existing frontend
 */

/**
 * POST /save-booking
 * Create booking with email notification and PDF ticket
 * Body: { username, email, movieTitle, city, theaterName, date, time, seats }
 */
router.post('/save', createBookingWithEmail);

/**
 * GET /booking-history/:username
 * Retrieve all bookings for a user
 */
router.get('/history/:username', getBookingHistoryLegacy);

/**
 * ADVANCED ENDPOINTS
 * For the new API structure
 */

/**
 * POST /bookings
 * Create a new booking
 * Body: { userId, showId, seatIds, email, phone }
 */
router.post('/', createBooking);

/**
 * GET /bookings/user/:userId
 * Get all bookings for a specific user
 */
router.get('/user/:userId', getUserBookings);

/**
 * GET /bookings/:id
 * Get details of a specific booking
 */
router.get('/:id', getBookingDetails);

/**
 * PUT /bookings/:id/cancel
 * Cancel a specific booking
 */
router.put('/:id/cancel', cancelBooking);

export default router;
