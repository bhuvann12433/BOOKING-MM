/**
 * Socket.io Event Handlers for Real-Time Seat Updates
 * 
 * Architecture:
 * ├── Room Management (per show)
 * ├── Seat Lock/Book/Release Events
 * ├── Disconnect Cleanup
 * ├── Database Synchronization (Atomic)
 * └── Real-time Broadcasting
 */

import Seat from '../models/Seat.js';
import Show from '../models/Show.js';

/**
 * User Tracking Map
 * Tracks which seats each user has locked in each show
 * Format: { userId: { showId: [seatNumbers] } }
 */
const userLocks = new Map();

/**
 * ============================================
 * SOCKET.IO EVENT HANDLERS
 * ============================================
 */

/**
 * Initialize Socket.io event handlers
 * Called when a new user connects
 */
export const initializeSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket] User connected: ${socket.id}`);

    // ============================================
    // 1. JOIN SHOW ROOM
    // ============================================

    /**
     * Event: join_show
     * When user opens a show page
     * 
     * Client sends: { showId }
     * Server action:
     * - Join user to show room
     * - Send current seat status
     */
    socket.on('join_show', async (data) => {
      try {
        const { showId } = data;

        if (!showId) {
          socket.emit('error', { message: 'Show ID required' });
          return;
        }

        // Store socket metadata
        socket.showId = showId;
        socket.userId = data.userId;

        // Join room
        socket.join(showId);
        console.log(`[Socket] User ${socket.id} joined show ${showId}`);

        // Release expired locks in this show
        await Seat.releaseExpiredLocks(showId);

        // Get current seat status
        const seats = await Seat.find({ show: showId })
          .select('seatNumber row col status lockedBy lockExpiry')
          .sort({ row: 1, col: 1 });

        const statistics = await Seat.getShowStatistics(showId);

        // Send current state to joining user
        socket.emit('show_loaded', {
          showId,
          seats: seats.map(s => ({
            seatNumber: s.seatNumber,
            row: s.row,
            col: s.col,
            status: s.status,
            lockedBy: s.lockedBy,
            lockExpiry: s.lockExpiry
          })),
          statistics
        });

        // Notify others a user joined
        socket.to(showId).emit('user_joined', {
          usersInShow: io.sockets.adapter.rooms.get(showId)?.size || 1
        });
      } catch (error) {
        console.error('[Socket Error] join_show:', error.message);
        socket.emit('error', { message: error.message });
      }
    });

    // ============================================
    // 2. LOCK SEATS EVENT
    // ============================================

    /**
     * Event: lock_seat
     * When user selects seats
     * 
     * Client sends: { showId, seatNumbers[], userId }
     * Server action:
     * - Atomic lock in database
     * - Track in memory
     * - Broadcast to room
     */
    socket.on('lock_seat', async (data) => {
      try {
        const { showId, seatNumbers, userId } = data;

        if (!showId || !seatNumbers || !userId) {
          socket.emit('lock_failed', { message: 'Missing required fields' });
          return;
        }

        // Release expired locks first
        await Seat.releaseExpiredLocks(showId);

        const lockedSeats = [];
        const failedSeats = [];

        // Lock each seat atomically
        for (const seatNumber of seatNumbers) {
          const updatedSeat = await Seat.atomicLock(
            showId,
            seatNumber,
            userId,
            300 // 5 minute lock
          );

          if (updatedSeat) {
            lockedSeats.push({
              seatNumber: updatedSeat.seatNumber,
              row: updatedSeat.row,
              col: updatedSeat.col,
              status: updatedSeat.status,
              lockedBy: updatedSeat.lockedBy,
              lockExpiry: updatedSeat.lockExpiry,
              lockRemainingSeconds: updatedSeat.lockRemainingSeconds
            });
          } else {
            failedSeats.push(seatNumber);
          }
        }

        // Track user locks in memory
        if (!userLocks.has(userId)) {
          userLocks.set(userId, {});
        }
        if (!userLocks.get(userId)[showId]) {
          userLocks.get(userId)[showId] = [];
        }
        userLocks.get(userId)[showId].push(...lockedSeats.map(s => s.seatNumber));

        // ============================================
        // BROADCAST TO ROOM
        // ============================================

        // Send success to requesting user
        socket.emit('lock_success', {
          lockedSeats,
          failedSeats,
          message: failedSeats.length > 0
            ? `${lockedSeats.length} locked, ${failedSeats.length} failed`
            : `${lockedSeats.length} seats locked`
        });

        // Broadcast to others in room
        socket.to(showId).emit('seat_locked', {
          seatNumbers: lockedSeats.map(s => s.seatNumber),
          userId,
          lockedSeats,
          timestamp: new Date()
        });

        console.log(`[Socket] ${lockedSeats.length} seats locked by ${userId} in show ${showId}`);
      } catch (error) {
        console.error('[Socket Error] lock_seat:', error.message);
        socket.emit('lock_failed', { message: error.message });
      }
    });

    // ============================================
    // 3. BOOK SEATS EVENT
    // ============================================

    /**
     * Event: book_seat
     * When user completes payment
     * 
     * Client sends: { showId, seatNumbers[], userId, bookingId }
     * Server action:
     * - Atomic book in database
     * - Remove from memory tracking
     * - Broadcast to room
     */
    socket.on('book_seat', async (data) => {
      try {
        const { showId, seatNumbers, userId, bookingId } = data;

        if (!showId || !seatNumbers || !userId) {
          socket.emit('book_failed', { message: 'Missing required fields' });
          return;
        }

        const bookedSeats = [];
        const failedSeats = [];

        // Book each seat atomically
        for (const seatNumber of seatNumbers) {
          const updatedSeat = await Seat.atomicBook(
            showId,
            seatNumber,
            userId,
            bookingId
          );

          if (updatedSeat) {
            bookedSeats.push({
              seatNumber: updatedSeat.seatNumber,
              row: updatedSeat.row,
              col: updatedSeat.col,
              status: updatedSeat.status,
              bookedAt: updatedSeat.bookedAt
            });
          } else {
            failedSeats.push(seatNumber);
          }
        }

        // Remove from user locks in memory
        if (userLocks.has(userId) && userLocks.get(userId)[showId]) {
          userLocks.get(userId)[showId] = userLocks
            .get(userId)[showId]
            .filter(seat => !bookedSeats.map(s => s.seatNumber).includes(seat));
        }

        // ============================================
        // BROADCAST TO ROOM
        // ============================================

        // Send success to requesting user
        socket.emit('book_success', {
          bookedSeats,
          failedSeats,
          message: failedSeats.length > 0
            ? `${bookedSeats.length} booked, ${failedSeats.length} failed`
            : `${bookedSeats.length} seats booked`
        });

        // Broadcast to all in room (including self)
        io.to(showId).emit('seat_booked', {
          seatNumbers: bookedSeats.map(s => s.seatNumber),
          userId,
          bookedSeats,
          timestamp: new Date()
        });

        console.log(`[Socket] ${bookedSeats.length} seats booked by ${userId} in show ${showId}`);
      } catch (error) {
        console.error('[Socket Error] book_seat:', error.message);
        socket.emit('book_failed', { message: error.message });
      }
    });

    // ============================================
    // 4. UNLOCK SEATS EVENT
    // ============================================

    /**
     * Event: unlock_seat
     * When user cancels selection
     * 
     * Client sends: { showId, seatNumbers[], userId }
     * Server action:
     * - Release locks from database
     * - Remove from memory tracking
     * - Broadcast to room
     */
    socket.on('unlock_seat', async (data) => {
      try {
        const { showId, seatNumbers, userId } = data;

        if (!showId || !seatNumbers || !userId) {
          socket.emit('unlock_failed', { message: 'Missing required fields' });
          return;
        }

        const unlockedSeats = [];

        // Unlock each seat
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
          }
        }

        // Remove from user locks in memory
        if (userLocks.has(userId) && userLocks.get(userId)[showId]) {
          userLocks.get(userId)[showId] = userLocks
            .get(userId)[showId]
            .filter(seat => !unlockedSeats.map(s => s.seatNumber).includes(seat));
        }

        // ============================================
        // BROADCAST TO ROOM
        // ============================================

        // Send success to requesting user
        socket.emit('unlock_success', {
          unlockedSeats,
          message: `${unlockedSeats.length} seats unlocked`
        });

        // Broadcast to all in room
        io.to(showId).emit('seat_released', {
          seatNumbers: unlockedSeats.map(s => s.seatNumber),
          userId,
          unlockedSeats,
          timestamp: new Date()
        });

        console.log(`[Socket] ${unlockedSeats.length} seats unlocked by ${userId} in show ${showId}`);
      } catch (error) {
        console.error('[Socket Error] unlock_seat:', error.message);
        socket.emit('unlock_failed', { message: error.message });
      }
    });

    // ============================================
    // 5. REQUEST SEAT STATUS REFRESH
    // ============================================

    /**
     * Event: refresh_seats
     * When user refreshes seat display or opens show
     * Server sends current state from DB
     */
    socket.on('refresh_seats', async (data) => {
      try {
        const { showId } = data;

        if (!showId) {
          socket.emit('error', { message: 'Show ID required' });
          return;
        }

        // Release expired locks
        await Seat.releaseExpiredLocks(showId);

        // Get current seats
        const seats = await Seat.find({ show: showId })
          .select('seatNumber row col status lockedBy lockExpiry')
          .sort({ row: 1, col: 1 });

        const statistics = await Seat.getShowStatistics(showId);

        socket.emit('seats_refreshed', {
          seats: seats.map(s => ({
            seatNumber: s.seatNumber,
            row: s.row,
            col: s.col,
            status: s.status,
            lockedBy: s.lockedBy,
            lockExpiry: s.lockExpiry
          })),
          statistics,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('[Socket Error] refresh_seats:', error.message);
        socket.emit('error', { message: error.message });
      }
    });

    // ============================================
    // 6. DISCONNECT EVENT
    // ============================================

    /**
     * Event: disconnect
     * When user disconnects or refreshes page
     * Release all locks held by that user
     */
    socket.on('disconnect', async () => {
      try {
        const userId = socket.userId;
        const showId = socket.showId;

        console.log(`[Socket] User ${socket.id} disconnected`);

        if (!userId || !showId) {
          return;
        }

        // Get user's locks in this show
        const userShowLocks = userLocks.get(userId)?.[showId] || [];

        if (userShowLocks.length === 0) {
          return;
        }

        // Release all locks in database
        const releaseResult = await Seat.updateMany(
          {
            show: showId,
            seatNumber: { $in: userShowLocks },
            status: 'locked',
            lockedBy: userId
          },
          {
            status: 'available',
            lockedBy: null,
            lockExpiry: null,
            updatedAt: new Date()
          }
        );

        if (releaseResult.modifiedCount > 0) {
          // Remove from memory tracking
          if (userLocks.has(userId)) {
            delete userLocks.get(userId)[showId];
          }

          // Broadcast release to room
          io.to(showId).emit('seat_released', {
            seatNumbers: userShowLocks,
            userId,
            reason: 'User disconnected',
            timestamp: new Date()
          });

          console.log(
            `[Socket Cleanup] Released ${releaseResult.modifiedCount} locks for user ${userId} in show ${showId}`
          );
        }
      } catch (error) {
        console.error('[Socket Error] disconnect cleanup:', error.message);
      }
    });

    // ============================================
    // 7. ERROR HANDLING
    // ============================================

    socket.on('error', (error) => {
      console.error('[Socket] Client error:', error);
    });
  });
};

/**
 * Cleanup expired locks periodically
 * Call this every 5 minutes
 */
export const cleanupExpiredLocks = async () => {
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

    if (result.modifiedCount > 0) {
      console.log(`[Cleanup] Released ${result.modifiedCount} expired locks`);
    }
  } catch (error) {
    console.error('[Cleanup Error]:', error.message);
  }
};

export default initializeSocketHandlers;
