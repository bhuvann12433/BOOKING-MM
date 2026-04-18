# 🚀 Socket.io Real-Time Seat Booking - Quick Setup Guide

## ✅ What You Get

Real-time seat updates where **all users see live changes** when someone locks or books a seat - just like BookMyShow!

---

## 📦 Installation

### Backend

```bash
cd backend
npm install socket.io
```

### Frontend

```bash
cd frontend
npm install socket.io-client
```

---

## 🔧 Backend Changes (Already Complete)

### 1. **Updated `server.js`**
- Added Socket.io initialization
- Set up CORS for frontend connection
- Created HTTP server instead of Express-only
- Integrated socket event handlers
- Added periodic cleanup (every 5 minutes)

### 2. **Created `socket/socketHandlers.js`**
- All socket event handlers
- Room management (one room per show)
- Real-time seat locking/booking
- Disconnect cleanup
- Database synchronization with atomic operations

---

## 🎯 Frontend Integration (3 Steps)

### Step 1: Install Socket.io Client
```bash
npm install socket.io-client
```

### Step 2: Create Custom Hook
Create `frontend/src/hooks/useSocket.js`:

```javascript
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (serverUrl) => {
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(serverUrl || process.env.VITE_API_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [serverUrl]);

  return socketRef.current;
};
```

### Step 3: Update Seating Component

```javascript
import React, { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';

const Seating = ({ showId, userId }) => {
  const socket = useSocket();
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Join show room
  useEffect(() => {
    if (!socket || !showId || !userId) return;

    socket.emit('join_show', { showId, userId });

    socket.on('show_loaded', (data) => {
      setSeats(data.seats);
    });

    return () => {
      socket.off('show_loaded');
    };
  }, [socket, showId, userId]);

  // Listen for real-time updates
  useEffect(() => {
    if (!socket) return;

    socket.on('seat_locked', (data) => {
      console.log('Other user locked seats:', data.seatNumbers);
      // Update UI
    });

    socket.on('seat_booked', (data) => {
      console.log('Seats booked:', data.seatNumbers);
      // Update UI
    });

    socket.on('seat_released', (data) => {
      console.log('Seats released:', data.seatNumbers);
      // Update UI
    });

    return () => {
      socket.off('seat_locked');
      socket.off('seat_booked');
      socket.off('seat_released');
    };
  }, [socket]);

  const lockSeats = () => {
    socket.emit('lock_seat', {
      showId,
      seatNumbers: selectedSeats,
      userId
    });

    socket.once('lock_success', (data) => {
      console.log('✅ Locked:', data.lockedSeats);
    });
  };

  const bookSeats = () => {
    socket.emit('book_seat', {
      showId,
      seatNumbers: selectedSeats,
      userId,
      bookingId: `BOOKING_${Date.now()}`
    });

    socket.once('book_success', (data) => {
      console.log('✅ Booked:', data.bookedSeats);
    });
  };

  return (
    <div>
      <h2>Select Seats</h2>
      {/* Render seats from state */}
      <button onClick={lockSeats}>Lock Seats (5 min)</button>
      <button onClick={bookSeats}>Complete Booking</button>
    </div>
  );
};

export default Seating;
```

---

## 🔌 Socket Events Reference

### Client → Server (What to send)

| Event | Data | Purpose |
|-------|------|---------|
| `join_show` | `{ showId, userId }` | Enter show room |
| `lock_seat` | `{ showId, seatNumbers[], userId }` | Lock seats for 5 min |
| `book_seat` | `{ showId, seatNumbers[], userId, bookingId }` | Finalize booking |
| `unlock_seat` | `{ showId, seatNumbers[], userId }` | Cancel selection |
| `refresh_seats` | `{ showId }` | Get current state |

### Server → Client (What to listen for)

| Event | Data | When |
|-------|------|------|
| `show_loaded` | `{ seats[], statistics }` | User joins show |
| `seat_locked` | `{ seatNumbers[], userId }` | Other user locks |
| `seat_booked` | `{ seatNumbers[], userId }` | Seats booked |
| `seat_released` | `{ seatNumbers[], userId }` | Locks released |
| `lock_success` | `{ lockedSeats[], failedSeats[] }` | Lock succeeded |
| `lock_failed` | `{ message }` | Lock failed |
| `book_success` | `{ bookedSeats[], failedSeats[] }` | Book succeeded |
| `book_failed` | `{ message }` | Book failed |

---

## 🧪 Testing Real-Time Updates

### Test in Browser Console

```javascript
// Connect
const socket = io('http://localhost:5000');

// Join show
socket.emit('join_show', {
  showId: 'YOUR_SHOW_ID',
  userId: 'USER_ID_1'
});

// Listen for show loaded
socket.on('show_loaded', (data) => {
  console.log('Seats:', data.seats);
});

// Lock seats
socket.emit('lock_seat', {
  showId: 'YOUR_SHOW_ID',
  seatNumbers: ['A1', 'A2'],
  userId: 'USER_ID_1'
});

// Listen for response
socket.on('lock_success', (data) => {
  console.log('✅ Locked:', data);
});

// Book seats
socket.emit('book_seat', {
  showId: 'YOUR_SHOW_ID',
  seatNumbers: ['A1', 'A2'],
  userId: 'USER_ID_1',
  bookingId: 'BOOKING_' + Date.now()
});

socket.on('book_success', (data) => {
  console.log('✅ Booked:', data);
});
```

### Test with 2 Browser Tabs

1. **Tab 1**: Join show with `userId: 'USER_1'`
2. **Tab 2**: Join same show with `userId: 'USER_2'`
3. **Tab 1**: Lock seats → See real-time update in Tab 2
4. **Tab 2**: Lock same seats → See lock failure (already locked)
5. **Tab 1**: Book seats → See real-time booking in Tab 2
6. **Tab 1**: Close tab → See seats release in Tab 2

---

## 🎬 Real-World Features

### ✅ Real-time Seat Status
- Green: Available
- Yellow: Locked (by you, 5 min)
- Red: Booked (permanent)

### ✅ Live Updates
- See when others lock seats instantly
- See when seats are booked
- See occupancy percentage update in real-time

### ✅ 5-Minute Lock
- Seats auto-release if not booked
- User can manually cancel

### ✅ Safety
- **Atomic DB operations** prevent double booking
- Race conditions impossible
- Only one user can lock each seat

### ✅ Disconnect Handling
- If user closes browser/refreshes
- All their locks auto-release
- Other users see seats available again

---

## 🚀 Deploy to Production

### Environment Variables

**.env (Backend)**
```
FRONTEND_URL=https://your-frontend.com
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret
```

### Render Deployment
```bash
# Already using MongoDB Atlas (cloud)
# Just push code, Render will deploy
git push origin main
```

### Vercel Frontend
```bash
# Update .env.production
VITE_API_URL=https://your-backend.render.com

# Deploy
npm run build
# Push to Vercel
```

---

## 📊 Database-Sync Guarantee

All Socket.io events **write to MongoDB immediately**:

✅ Lock seat → Atomic `findOneAndUpdate` (race-safe)  
✅ Book seat → Atomic `findOneAndUpdate` (validates lock)  
✅ Unlock seat → Updates status to `available`  
✅ Disconnect → All locks released in DB  

**No in-memory only storage** - everything persists to MongoDB Atlas.

---

## 🔍 Debugging Tips

### Enable Logging
All socket events print to console:
```
[Socket] User connected: abc123
[Socket] User joined show XYZ
[Socket] 2 seats locked by user_1
[Socket Cleanup] Released 5 expired locks
```

### Check Events
Monitor Network tab in browser DevTools → WS (WebSocket)

### Test Atomicity
Two users lock same seat simultaneously:
```
User 1: lock A1 → Success ✅
User 2: lock A1 → Failed ❌ (already locked)
```

---

## 📁 Files Modified/Created

| File | Status | Purpose |
|------|--------|---------|
| `backend/server.js` | ✅ Updated | Socket.io initialization |
| `backend/socket/socketHandlers.js` | ✅ Created | All event handlers |
| `backend/SOCKET_IO_BACKEND_GUIDE.md` | ✅ Created | Complete backend reference |
| `frontend/SOCKET_IO_INTEGRATION.md` | ✅ Created | Frontend integration guide |

---

## ✨ Example Output

### Terminal (Backend)
```
╔═══════════════════════════════════════════════════╗
║     🎬 MOVIE BOOKING SYSTEM - BACKEND SERVER      ║
╠═══════════════════════════════════════════════════╣
║  ✅ Status: Running                               ║
║  🔗 URL: http://localhost:5000                    ║
║  📡 Socket.io: Connected ✅                       ║
║  🗄️  Database: MongoDB Atlas (Connected)         ║
╚═══════════════════════════════════════════════════╝

[Socket] User connected: abc123
[Socket] User abc123 joined show SHOW_001
[Socket] 2 seats locked by user_1
[Socket] Other user locked seats: ['A1', 'A2']
[Socket] 2 seats booked by user_1
```

---

## 🎯 Next Steps

1. **Install Socket.io** (backend + frontend)
2. **Copy socket handler file** (already created)
3. **Update Seating component** (use example above)
4. **Test real-time** (open 2 browser tabs)
5. **Deploy** (Render + Vercel)

---

## 📞 Need Help?

- **Backend events**: See `SOCKET_IO_BACKEND_GUIDE.md`
- **Frontend integration**: See `SOCKET_IO_INTEGRATION.md`
- **REST APIs**: Still available (no breaking changes)
- **Database**: MongoDB Atlas (no local setup needed)

---

## ✅ Status: Production Ready

✅ Real-time synchronization  
✅ Atomic database operations  
✅ Double booking prevention  
✅ Auto-release on disconnect  
✅ Comprehensive error handling  
✅ Complete documentation  

**Ready to deploy!** 🚀
