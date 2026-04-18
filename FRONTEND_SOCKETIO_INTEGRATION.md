/**
 * Socket.io Frontend Integration - Production Ready
 * For Vercel Frontend + Render Backend + MongoDB Atlas
 */

// ============================================
// STEP 1: INSTALL SOCKET.IO CLIENT
// ============================================

/*
Run in frontend directory:
npm install socket.io-client

Then check:
npm list socket.io-client
*/


// ============================================
// STEP 2: CREATE USESOCKET HOOK
// ============================================

// File: frontend/src/hooks/useSocket.js

import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

/**
 * Custom React hook for Socket.io connection
 * Uses production backend URL from environment or fallback
 */
export const useSocket = () => {
  const socketRef = useRef(null);

  useEffect(() => {
    // Get backend URL from environment or use production fallback
    const socketUrl = process.env.VITE_SOCKET_URL || 'https://booking-mm-1.onrender.com';

    console.log(`[Socket] Connecting to: ${socketUrl}`);

    // Create Socket.io connection
    const socket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    // Connection events
    socket.on('connect', () => {
      console.log(`✅ [Socket] Connected: ${socket.id}`);
    });

    socket.on('disconnect', () => {
      console.log('❌ [Socket] Disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('⚠️  [Socket] Connection error:', error);
    });

    socketRef.current = socket;

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  return socketRef.current;
};

export default useSocket;


// ============================================
// STEP 3: UPDATE SEATING COMPONENT
// ============================================

// File: frontend/src/components/Seating.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../hooks/useSocket';
import './Seating.css';

const Seating = ({ showId, userId }) => {
  const socket = useSocket();
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // ============================================
  // JOIN SHOW ROOM ON MOUNT
  // ============================================

  useEffect(() => {
    if (!socket || !showId || !userId) return;

    console.log(`[Seating] Joining show: ${showId} as user: ${userId}`);

    // Emit join_show event
    socket.emit('join_show', { showId, userId });

    // Listen for show_loaded response
    socket.on('show_loaded', (data) => {
      console.log('[Socket] Show loaded:', data);
      setSeats(data.seats);
      setStatistics(data.statistics);
      setMessage(`✅ ${data.statistics.available} seats available`);
    });

    socket.on('error', (error) => {
      console.error('[Socket] Error:', error);
      setMessage(`❌ Error: ${error.message}`);
    });

    return () => {
      socket.off('show_loaded');
      socket.off('error');
    };
  }, [socket, showId, userId]);

  // ============================================
  // LISTEN FOR REAL-TIME UPDATES
  // ============================================

  useEffect(() => {
    if (!socket) return;

    // When other users lock seats
    socket.on('seat_locked', (data) => {
      console.log('[Socket] Seat locked by other user:', data);
      updateSeatsFromBroadcast(data.lockedSeats);
      setMessage(`🔒 ${data.seatNumbers.length} seat(s) locked by other user`);
    });

    // When seats are booked
    socket.on('seat_booked', (data) => {
      console.log('[Socket] Seats booked:', data);
      updateSeatsFromBroadcast(data.bookedSeats);
      setMessage(`✅ ${data.seatNumbers.length} seat(s) booked`);
    });

    // When seats are released (disconnect or timeout)
    socket.on('seat_released', (data) => {
      console.log('[Socket] Seats released:', data);
      setSeats(prevSeats =>
        prevSeats.map(seat =>
          data.seatNumbers.includes(seat.seatNumber)
            ? { ...seat, status: 'available', lockedBy: null }
            : seat
        )
      );
      setMessage(`🔓 ${data.seatNumbers.join(', ')} now available`);
    });

    // When another user joins
    socket.on('user_joined', (data) => {
      console.log(`👥 Users in show: ${data.usersInShow}`);
    });

    return () => {
      socket.off('seat_locked');
      socket.off('seat_booked');
      socket.off('seat_released');
      socket.off('user_joined');
    };
  }, [socket]);

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  /**
   * Update seats from broadcast data
   */
  const updateSeatsFromBroadcast = (updatedSeats) => {
    setSeats(prevSeats =>
      prevSeats.map(seat => {
        const updated = updatedSeats.find(s => s.seatNumber === seat.seatNumber);
        return updated ? { ...seat, ...updated } : seat;
      })
    );
  };

  /**
   * Handle seat click
   */
  const handleSeatClick = (seatNumber) => {
    const seat = seats.find(s => s.seatNumber === seatNumber);

    if (seat.status === 'available') {
      // Add to selected
      if (!selectedSeats.includes(seatNumber)) {
        setSelectedSeats([...selectedSeats, seatNumber]);
      }
    } else if (seat.status === 'locked' && seat.lockedBy === userId) {
      // Remove if user locked it
      setSelectedSeats(selectedSeats.filter(s => s !== seatNumber));
    }
  };

  // ============================================
  // LOCK SEATS (User Selection)
  // ============================================

  const lockSeats = useCallback(() => {
    if (!socket || selectedSeats.length === 0) {
      setMessage('❌ Select seats first');
      return;
    }

    setLoading(true);
    setMessage('🔒 Locking seats...');

    socket.emit('lock_seat', {
      showId,
      seatNumbers: selectedSeats,
      userId
    });

    // Listen for response
    socket.once('lock_success', (data) => {
      setLoading(false);
      setMessage(`✅ ${data.lockedSeats.length} seats locked for 5 minutes`);
      console.log('Lock success:', data);
    });

    socket.once('lock_failed', (data) => {
      setLoading(false);
      setMessage(`❌ Failed: ${data.message}`);
      console.error('Lock failed:', data);
    });
  }, [socket, showId, selectedSeats, userId]);

  // ============================================
  // BOOK SEATS (Finalize Purchase)
  // ============================================

  const bookSeats = useCallback(() => {
    if (!socket || selectedSeats.length === 0) {
      setMessage('❌ Select seats first');
      return;
    }

    const bookingId = `BOOKING_${Date.now()}`;

    setLoading(true);
    setMessage('💳 Processing payment...');

    socket.emit('book_seat', {
      showId,
      seatNumbers: selectedSeats,
      userId,
      bookingId
    });

    socket.once('book_success', (data) => {
      setLoading(false);
      setMessage(`✅ ${data.bookedSeats.length} seats booked! Booking ID: ${bookingId}`);
      setSelectedSeats([]);
      console.log('Book success:', data);
    });

    socket.once('book_failed', (data) => {
      setLoading(false);
      setMessage(`❌ Booking failed: ${data.message}`);
      console.error('Book failed:', data);
    });
  }, [socket, showId, selectedSeats, userId]);

  // ============================================
  // UNLOCK SEATS (Cancel Selection)
  // ============================================

  const unlockSeats = useCallback(() => {
    if (!socket || selectedSeats.length === 0) return;

    socket.emit('unlock_seat', {
      showId,
      seatNumbers: selectedSeats,
      userId
    });

    socket.once('unlock_success', (data) => {
      setMessage(`🔓 ${data.unlockedSeats.length} seats released`);
      setSelectedSeats([]);
    });
  }, [socket, showId, selectedSeats, userId]);

  // ============================================
  // RENDER SEAT GRID
  // ============================================

  const renderSeatGrid = () => {
    if (seats.length === 0) return <p>Loading seats...</p>;

    // Group seats by row
    const rows = new Map();
    seats.forEach(seat => {
      if (!rows.has(seat.row)) {
        rows.set(seat.row, []);
      }
      rows.get(seat.row).push(seat);
    });

    return (
      <div className="seat-grid">
        {Array.from(rows.entries()).map(([row, rowSeats]) => (
          <div key={row} className="seat-row">
            <div className="row-label">{row}</div>
            {rowSeats.map(seat => (
              <button
                key={seat.seatNumber}
                className={`seat seat-${seat.status} ${
                  selectedSeats.includes(seat.seatNumber) ? 'selected' : ''
                }`}
                onClick={() => handleSeatClick(seat.seatNumber)}
                disabled={
                  seat.status === 'booked' ||
                  (seat.status === 'locked' && seat.lockedBy !== userId)
                }
                title={`Seat ${seat.seatNumber} - ${seat.status}`}
              >
                {seat.seatNumber}
              </button>
            ))}
          </div>
        ))}
      </div>
    );
  };

  // ============================================
  // RENDER STATISTICS
  // ============================================

  const renderStatistics = () => {
    if (!statistics) return null;

    return (
      <div className="statistics">
        <h3>Theater Availability</h3>
        <div className="stat-item">
          <span className="stat-label">Available:</span>
          <span className="stat-value">{statistics.available}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Locked:</span>
          <span className="stat-value">{statistics.locked}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Booked:</span>
          <span className="stat-value">{statistics.booked}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Occupancy:</span>
          <span className="stat-value">{statistics.occupancyPercentage}%</span>
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER UI
  // ============================================

  return (
    <div className="seating-container">
      <h2>Select Your Seats</h2>

      {message && <div className={`message ${message.includes('❌') ? 'error' : ''}`}>{message}</div>}

      {renderStatistics()}

      {renderSeatGrid()}

      <div className="selected-info">
        <p>Selected: {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</p>
      </div>

      <div className="controls">
        <button 
          className="btn-primary"
          onClick={lockSeats} 
          disabled={selectedSeats.length === 0 || loading}
        >
          {loading ? '⏳ Locking...' : '🔒 Lock Seats (5 min)'}
        </button>
        <button 
          className="btn-success"
          onClick={bookSeats} 
          disabled={selectedSeats.length === 0 || loading}
        >
          {loading ? '⏳ Booking...' : '💳 Complete Booking'}
        </button>
        <button 
          className="btn-secondary"
          onClick={unlockSeats} 
          disabled={selectedSeats.length === 0}
        >
          🔓 Cancel Selection
        </button>
      </div>
    </div>
  );
};

export default Seating;


// ============================================
// STEP 4: CSS STYLING
// ============================================

// File: frontend/src/components/Seating.css

/*
.seating-container {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.message {
  padding: 12px;
  margin: 15px 0;
  border-radius: 6px;
  background-color: #e3f2fd;
  border-left: 4px solid #2196f3;
  color: #1565c0;
  font-weight: 500;
}

.message.error {
  background-color: #ffebee;
  border-left-color: #d32f2f;
  color: #c62828;
}

.statistics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin: 20px 0;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 6px;
}

.statistics h3 {
  grid-column: 1 / -1;
  margin: 0 0 10px 0;
  color: #333;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.stat-label {
  font-weight: 600;
  color: #666;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #2196f3;
}

.seat-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 25px 0;
  padding: 15px;
  background-color: #fafafa;
  border-radius: 6px;
}

.seat-row {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
}

.row-label {
  width: 40px;
  font-weight: bold;
  text-align: center;
  color: #666;
}

.seat {
  width: 45px;
  height: 45px;
  border: 2px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  transition: all 0.2s ease;
}

.seat:hover:not(:disabled) {
  transform: scale(1.1);
}

/* Available seat - Green */
.seat-available {
  background-color: #81c784;
  color: white;
  border-color: #388e3c;
}

.seat-available:hover:not(:disabled) {
  background-color: #66bb6a;
}

/* Locked seat - Yellow */
.seat-locked {
  background-color: #fdd835;
  color: #333;
  border-color: #f57f17;
}

.seat-locked:hover:not(:disabled) {
  background-color: #fbc02d;
}

/* Booked seat - Red */
.seat-booked {
  background-color: #ef5350;
  color: white;
  border-color: #c62828;
  cursor: not-allowed;
}

/* Selected seat */
.seat.selected {
  border-width: 3px;
  transform: scale(1.15);
  box-shadow: 0 0 10px rgba(33, 150, 243, 0.5);
}

.selected-info {
  margin: 15px 0;
  padding: 10px;
  background-color: #e8f5e9;
  border-left: 4px solid #4caf50;
  border-radius: 4px;
  font-weight: 500;
  color: #2e7d32;
}

.controls {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.controls button {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  font-size: 14px;
}

.btn-primary {
  background-color: #2196f3;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1976d2;
}

.btn-success {
  background-color: #4caf50;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background-color: #388e3c;
}

.btn-secondary {
  background-color: #757575;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #616161;
}

.controls button:disabled {
  background-color: #bdbdbd;
  cursor: not-allowed;
  opacity: 0.6;
}

*/

export default Seating;


// ============================================
// STEP 5: ENVIRONMENT VARIABLES
// ============================================

// File: frontend/.env.production

/*
VITE_API_URL=https://booking-mm-1.onrender.com
VITE_SOCKET_URL=https://booking-mm-1.onrender.com
*/

// File: frontend/.env.development

/*
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
*/


// ============================================
// USAGE IN COMPONENT
// ============================================

/*
In your main page/route:

import Seating from './components/Seating';

function ShowPage() {
  const showId = getShowIdFromUrl();
  const userId = getUserIdFromAuth();

  return (
    <Seating showId={showId} userId={userId} />
  );
}
*/

export {};
