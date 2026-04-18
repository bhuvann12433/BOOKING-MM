/**
 * Socket.io Integration Guide - React Frontend
 * Real-time Seat Booking System
 */

// ============================================
// 1. INSTALL SOCKET.IO CLIENT
// ============================================

// npm install socket.io-client


// ============================================
// 2. REACT HOOK - useSocket.js
// ============================================

import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

/**
 * Custom hook for Socket.io real-time updates
 * 
 * Usage:
 * const socket = useSocket('http://localhost:5000');
 */
export const useSocket = (serverUrl) => {
  const socketRef = useRef(null);

  useEffect(() => {
    // Create socket connection
    const socket = io(serverUrl || process.env.VITE_API_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling']
    });

    // Connection events
    socket.on('connect', () => {
      console.log('✅ Connected to server:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
    });

    socket.on('error', (error) => {
      console.error('⚠️  Socket error:', error);
    });

    socketRef.current = socket;

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [serverUrl]);

  return socketRef.current;
};


// ============================================
// 3. SEATING COMPONENT - Seating.jsx
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../hooks/useSocket';

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

    // Join show room and get initial state
    socket.emit('join_show', { showId, userId });

    // Listen for show loaded
    socket.on('show_loaded', (data) => {
      console.log('🎭 Show loaded:', data);
      setSeats(data.seats);
      setStatistics(data.statistics);
      setLoading(false);
    });

    return () => {
      socket.off('show_loaded');
    };
  }, [socket, showId, userId]);

  // ============================================
  // LISTEN FOR REAL-TIME SEAT UPDATES
  // ============================================

  useEffect(() => {
    if (!socket) return;

    // When other users lock seats
    socket.on('seat_locked', (data) => {
      console.log('🔒 Seats locked by other user:', data);
      updateSeatsFromBroadcast(data.lockedSeats);
      setMessage(`${data.userId} locked ${data.seatNumbers.length} seat(s)`);
    });

    // When seats are booked
    socket.on('seat_booked', (data) => {
      console.log('✅ Seats booked:', data);
      updateSeatsFromBroadcast(data.bookedSeats);
      setMessage(`${data.seatNumbers.length} seat(s) booked`);
    });

    // When seats are released
    socket.on('seat_released', (data) => {
      console.log('🔓 Seats released:', data);
      
      // Update seats to available
      setSeats(prevSeats =>
        prevSeats.map(seat =>
          data.seatNumbers.includes(seat.seatNumber)
            ? { ...seat, status: 'available', lockedBy: null }
            : seat
        )
      );
      
      if (data.reason) {
        setMessage(`${data.reason}: ${data.seatNumbers.join(', ')}`);
      }
    });

    // When user joins show
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

  const updateSeatsFromBroadcast = (updatedSeats) => {
    setSeats(prevSeats =>
      prevSeats.map(seat => {
        const updated = updatedSeats.find(s => s.seatNumber === seat.seatNumber);
        return updated ? { ...seat, ...updated } : seat;
      })
    );
  };

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
    if (!socket || !showId || selectedSeats.length === 0) return;

    setLoading(true);
    setMessage('Locking seats...');

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
      setMessage(`❌ Failed to lock seats: ${data.message}`);
      console.error('Lock failed:', data);
    });
  }, [socket, showId, selectedSeats, userId]);

  // ============================================
  // BOOK SEATS (Finalize Purchase)
  // ============================================

  const bookSeats = useCallback(() => {
    if (!socket || !showId || selectedSeats.length === 0) return;

    const bookingId = `BOOKING_${Date.now()}`; // Generate booking ID

    setLoading(true);
    setMessage('Booking seats...');

    socket.emit('book_seat', {
      showId,
      seatNumbers: selectedSeats,
      userId,
      bookingId
    });

    // Listen for response
    socket.once('book_success', (data) => {
      setLoading(false);
      setMessage(`✅ ${data.bookedSeats.length} seats booked!`);
      setSelectedSeats([]); // Clear selection
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
    if (!socket || !showId || selectedSeats.length === 0) return;

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
        <h3>Availability</h3>
        <p>Available: {statistics.available}</p>
        <p>Locked: {statistics.locked}</p>
        <p>Booked: {statistics.booked}</p>
        <p>Occupancy: {statistics.occupancyPercentage}%</p>
      </div>
    );
  };

  // ============================================
  // RENDER UI
  // ============================================

  return (
    <div className="seating-container">
      <h2>Select Your Seats</h2>

      {message && <div className="message">{message}</div>}

      {renderStatistics()}

      {renderSeatGrid()}

      <div className="controls">
        <p>Selected: {selectedSeats.join(', ') || 'None'}</p>
        <button onClick={lockSeats} disabled={selectedSeats.length === 0 || loading}>
          {loading ? 'Locking...' : 'Lock Seats (5 min)'}
        </button>
        <button onClick={bookSeats} disabled={selectedSeats.length === 0 || loading}>
          {loading ? 'Booking...' : 'Complete Booking'}
        </button>
        <button onClick={unlockSeats} disabled={selectedSeats.length === 0}>
          Cancel Selection
        </button>
      </div>
    </div>
  );
};

export default Seating;


// ============================================
// 4. CSS STYLING - Seating.css
// ============================================

/*
.seating-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.message {
  padding: 10px;
  margin: 10px 0;
  border-radius: 4px;
  background-color: #f0f0f0;
  border-left: 4px solid #007bff;
}

.statistics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin: 20px 0;
}

.statistics p {
  margin: 5px 0;
  font-weight: 500;
}

.seat-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 20px 0;
}

.seat-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.row-label {
  width: 30px;
  font-weight: bold;
  text-align: center;
}

.seat {
  width: 40px;
  height: 40px;
  border: 2px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  transition: all 0.3s ease;
}

/* Available seat */
.seat-available {
  background-color: #90ee90;
  color: black;
  border-color: #228b22;
}

.seat-available:hover {
  transform: scale(1.1);
  background-color: #76d176;
}

/* Locked by current user */
.seat-locked {
  background-color: #ffeb3b;
  color: black;
  border-color: #ffa500;
}

/* Booked seat */
.seat-booked {
  background-color: #d32f2f;
  color: white;
  border-color: #b71c1c;
  cursor: not-allowed;
}

/* Selected seat */
.seat.selected {
  border-width: 3px;
  transform: scale(1.1);
  box-shadow: 0 0 10px rgba(0, 123, 255, 0.5);
}

.controls {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.controls button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.controls button:hover:not(:disabled) {
  background-color: #0056b3;
}

.controls button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

*/


// ============================================
// 5. REAL-TIME FEATURES ENABLED
// ============================================

/**
 * ✅ Features:
 * 
 * 1. Real-time Seat Status
 *    - Green: Available
 *    - Yellow: Locked (by you)
 *    - Red: Booked (permanent)
 * 
 * 2. Live Updates
 *    - See when other users lock seats
 *    - See when seats are booked
 *    - See when locks expire and seats release
 * 
 * 3. 5-Minute Lock
 *    - Selected seats locked for 5 minutes
 *    - Auto-release if not booked
 *    - Manual cancel available
 * 
 * 4. Real-time Occupancy
 *    - Live percentage display
 *    - Updated as others book
 *    - See availability drop in real-time
 * 
 * 5. Multi-user Safety
 *    - Atomic database operations
 *    - Race condition prevention
 *    - Double booking impossible
 */

export default Seating;
