# Socket.io Real-Time Seat Booking - System Architecture Diagram

## 1. High-Level System Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                         USERS' BROWSERS                            │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────┐      ┌──────────────────┐                 │
│  │   Tab 1          │      │   Tab 2          │                 │
│  │   User A         │      │   User B         │                 │
│  │  Seating.jsx     │      │  Seating.jsx     │                 │
│  │  ┌────────────┐  │      │  ┌────────────┐  │                 │
│  │  │ socket.io  │  │      │  │ socket.io  │  │                 │
│  │  │ client     │  │      │  │ client     │  │                 │
│  │  └────────────┘  │      │  └────────────┘  │                 │
│  └────────┬─────────┘      └─────────┬────────┘                 │
│           │                          │                           │
│           │   WebSocket Connection   │                           │
│           └──────────────┬───────────┘                           │
│                          │                                       │
└──────────────────────────┼───────────────────────────────────────┘
                           │
                ┌──────────▼──────────┐
                │   Socket.io         │
                │   Server            │
                │   (Port 5000)       │
                │                     │
                │  Event Handlers:    │
                │  ├─ join_show       │
                │  ├─ lock_seat       │
                │  ├─ book_seat       │
                │  ├─ unlock_seat     │
                │  └─ disconnect      │
                └──────────┬──────────┘
                           │
                ┌──────────▼──────────┐
                │  MongoDB Atlas      │
                │  (Cloud Database)   │
                │                     │
                │  Collections:       │
                │  ├─ Seats           │
                │  ├─ Shows           │
                │  ├─ Bookings        │
                │  └─ Users           │
                └─────────────────────┘
```

---

## 2. Real-Time Seat Update Flow

```
SCENARIO: User A locks seats, User B sees update instantly

┌─────────────────────────────────────────────────────────────┐
│ TIME = 0ms                                                  │
│                                                             │
│  User A (Browser)              Socket.io Server            │
│  ───────────────────────────────────────────────           │
│  Clicks: Lock A1, A2                                        │
│  │                                                          │
│  └──► emit('lock_seat', {
│        showId: 'SHOW_123',
│        seatNumbers: ['A1', 'A2'],
│        userId: 'USER_A'
│      })
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TIME = 1-5ms (Atomic DB Operation)                          │
│                                                             │
│  Socket.io Server              MongoDB Atlas               │
│  ───────────────────────────────────────────────           │
│  Receives lock_seat event                                   │
│  │                                                          │
│  ├─► Seat.atomicLock(showId, 'A1', userId)                │
│  │   └─ Query: show=X, seat=A1, status=available          │
│  │   └─ Update: status=locked, lockedBy=USER_A,           │
│  │             lockExpiry=now+5min                        │
│  │   └─ MongoDB: ONE operation (atomic)                   │
│  │   └─ Result: ✅ Success (seat locked)                  │
│  │                                                          │
│  ├─► Seat.atomicLock(showId, 'A2', userId)                │
│  │   └─ Result: ✅ Success (seat locked)                  │
│  │                                                          │
│  └─► Send response to User A: 'lock_success'              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TIME = 5-10ms (Broadcast to Room)                           │
│                                                             │
│  Socket.io Server           All Users in Room              │
│  ───────────────────────────────────────────────           │
│  Broadcast to room 'SHOW_123'                              │
│  │                                                          │
│  ├─► io.to('SHOW_123').emit('seat_locked', {             │
│  │     seatNumbers: ['A1', 'A2'],
│  │     userId: 'USER_A',
│  │     lockedSeats: [{...}, {...}]
│  │   })
│  │                                                          │
│  ├──────────────────────────────────────────              │
│  │                           │                             │
│  │                           ├─►  User A: Ignore (sender) │
│  │                           │                             │
│  │                           └─►  User B (Browser)        │
│  │                                 │                       │
│  │                                 └─► Receives event      │
│  │                                     │                   │
│  │                                     └─► Socket listener │
│  │                                         │                │
│  │                                         └─► Update UI    │
│  │                                             ✅ A1, A2    │
│  │                                             Yellow ●●    │
│  │                                                          │
│  └────────────────────────────────────────────────────────────┘

RESULT @ TIME = 10-20ms: ✅ User B sees seats locked in real-time!
```

---

## 3. Complete User Journey

```
┌──────────────────────────────────────────────────────────────────┐
│ STEP 1: User Opens Show                                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User Browser              Socket.io             MongoDB        │
│  ──────────────────────────────────────────────────────────────  │
│  Load Seating.jsx                                               │
│  useSocket() hook                                               │
│      │                                                           │
│      └─► socket.connect()                                       │
│          └─► emit('join_show', {showId, userId})               │
│              │                                                  │
│              └─► Receive 'show_loaded'                         │
│                  ├─ Get all seats from DB                      │
│                  ├─ Release expired locks                      │
│                  ├─ Get statistics                             │
│                  └─ Send to user                               │
│                      │                                          │
│                      └─► Render seat grid ✅                   │
│                          Green: Available                      │
│                          Yellow: Locked                        │
│                          Red: Booked                           │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ STEP 2: User Selects Seats                                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User Browser          Socket.io            MongoDB            │
│  ──────────────────────────────────────────────────────────────  │
│  Click: A1, A2                                                  │
│  Click: Lock Button                                             │
│      │                                                          │
│      └─► emit('lock_seat', {...})                              │
│          │                                                      │
│          ├─► ATOMIC LOCK OPERATION:                            │
│          │   ├─ A1: findOneAndUpdate (success) ✅             │
│          │   └─ A2: findOneAndUpdate (success) ✅             │
│          │                                                      │
│          └─► Receive 'lock_success'                            │
│              │                                                  │
│              ├─► Show timer: 5:00                              │
│              ├─► Highlight selected seats                      │
│              ├─► Disable same seats for others                 │
│              └─► Countdown timer                               │
│                                                                 │
│          Broadcast to room: 'seat_locked'                       │
│              └─► Other users see A1, A2 locked instantly       │
│                  (< 100ms)                                      │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ STEP 3: User Completes Payment                                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User Browser          Socket.io            MongoDB            │
│  ──────────────────────────────────────────────────────────────  │
│  Click: Complete Booking                                        │
│      │                                                          │
│      └─► emit('book_seat', {showId, seats, userId, bookingId})
│          │                                                      │
│          ├─► ATOMIC BOOK OPERATION:                            │
│          │   ├─ A1: Validate lock exists ✅                   │
│          │   ├─ A1: Validate not expired ✅                   │
│          │   ├─ A1: Update to booked ✅                        │
│          │   └─ A2: Same for A2 ✅                            │
│          │                                                      │
│          └─► Receive 'book_success'                            │
│              │                                                  │
│              ├─► Confirmation page                             │
│              ├─► Send confirmation email                       │
│              ├─► Generate ticket PDF                           │
│              └─► Update profile                                │
│                                                                 │
│          Broadcast to room: 'seat_booked'                       │
│              └─► ALL users see A1, A2 now RED (booked)        │
│                  └─► Cannot be selected                        │
│                  └─► Other users' bookings continue            │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ STEP 4: User Disconnects (or 5min timeout)                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User Browser          Socket.io            MongoDB            │
│  ──────────────────────────────────────────────────────────────  │
│  Close browser tab OR timeout after 5 minutes                    │
│      │                                                          │
│      └─► socket.disconnect() [automatic]                       │
│          │                                                      │
│          ├─► Get all locks by this user in this show           │
│          ├─► Find: showId=X, lockedBy=userA, status=locked    │
│          │                                                      │
│          ├─► updateMany() - Release all locks                  │
│          │   └─ status: locked → available                    │
│          │   └─ lockedBy: userA → null                         │
│          │   └─ lockExpiry: 5min → null                        │
│          │                                                      │
│          └─► Broadcast to room: 'seat_released'                │
│              └─► ALL users see seats available again           │
│                  └─► Green ✅                                  │
│                  └─► Can now select                            │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. Race Condition Prevention

```
SCENARIO: Two users try to lock SAME seat simultaneously

┌──────────────────────────────────────────────────────────────────┐
│ WITHOUT ATOMIC OPERATIONS (❌ VULNERABLE):                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User A              Database                    User B          │
│  ──────────────────────────────────────────────────────────────  │
│  Read A1                                                         │
│  └─ Status = available                                           │
│                                              Read A1             │
│                                              └─ Status = available
│                                              (reads same state!)  │
│                                                                  │
│  Write: A1 = locked by UserA                                    │
│  └─ Status = locked                                              │
│     lockedBy = UserA                                             │
│                                              Write: A1 = locked  │
│                                              └─ Status = locked   │
│                                                 lockedBy = UserB  │
│                                                 ❌ OVERWRITE!     │
│                                                                  │
│  RESULT: Both think they locked seat A1 ❌ DOUBLE BOOKING!      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ WITH ATOMIC OPERATIONS (✅ SAFE):                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User A              MongoDB                    User B          │
│  ──────────────────────────────────────────────────────────────  │
│  emit('lock_seat')                                              │
│  └─ findOneAndUpdate(                                           │
│       query: {show=X, seat=A1, status=available},              │
│       update: {status=locked, lockedBy=UserA, lockExpiry=+5m}  │
│     )                                                            │
│     ├─ ATOMIC: Read + Write TOGETHER                           │
│     ├─ Query checks: A1 is available? YES ✅                   │
│     ├─ Update: A1 → locked by UserA                            │
│     └─ SUCCESS ✅                                               │
│                                              emit('lock_seat')  │
│                                              └─ findOneAndUpdate(
│                                                   query: same,   │
│                                                   update: same   │
│                                                 )               │
│                                                 ├─ ATOMIC        │
│                                                 ├─ Query: A1     │
│                                                 │ available? NO! │
│                                                 │ (already locked)
│                                                 └─ FAIL ❌       │
│                                                                  │
│  RESULT: UserA succeeds ✅, UserB fails ❌ NO DOUBLE BOOKING! │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 5. Room & Broadcasting Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Socket.io Server                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Room "SHOW_001"                    Room "SHOW_002"            │
│  ──────────────────────              ──────────────────────    │
│  ├─ User A (socket_1)     ✅        ├─ User C (socket_3)       │
│  ├─ User B (socket_2)     ✅        └─ User D (socket_4)       │
│  └─ User E (socket_5)     ✅                                    │
│     (3 users watching                (2 users watching          │
│      same show)                       different show)           │
│                                                                 │
│  When event in SHOW_001:                                        │
│  ├─ emit('lock_seat') from User A                              │
│  │  └─ io.to('SHOW_001').emit('seat_locked')                 │
│  │     ├─ → User A: Receives (sender)                          │
│  │     ├─ → User B: Receives (same room)                       │
│  │     └─ → User E: Receives (same room)                       │
│  │        Users in SHOW_002 don't get notified ✅             │
│  │        (Efficient broadcasting - only relevant users)       │
│  │                                                              │
│  └─ Result: Only users watching SHOW_001 see update           │
│             Users watching SHOW_002 unaffected                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Lock Expiry & Auto-Release Timeline

```
TIME LINE:
═════════════════════════════════════════════════════════════════

0s  ┌─────────────────────────────────────────────────────────┐
    │ User locks seats A1, A2                                 │
    │ lockExpiry = now + 300 seconds                          │
    │ status = 'locked'                                       │
    └─────────────────────────────────────────────────────────┘
    
    ┌─────────────────────────────────────────────────────────┐
    │ Frontend: Show timer                                     │
    │ "Lock expires in: 5:00"                                │
    └─────────────────────────────────────────────────────────┘

60s ┌─────────────────────────────────────────────────────────┐
    │ User still selecting                                    │
    │ Frontend countdown: 4:00                               │
    └─────────────────────────────────────────────────────────┘

240s ┌─────────────────────────────────────────────────────────┐
     │ User still deciding                                    │
     │ Frontend countdown: 1:00                              │
     │ WARNING: Seats will release soon!                     │
     └─────────────────────────────────────────────────────────┘

300s ┌─────────────────────────────────────────────────────────┐
(5m) │ Lock expires!                                           │
     │ If user didn't book:                                   │
     │   - Periodic cleanup runs                              │
     │   - Finds: lockExpiry < now                            │
     │   - Updates: status = 'available'                      │
     │   - Removes: lockedBy, lockExpiry                      │
     │ Broadcast: 'seat_released'                            │
     │ Other users: Can now lock same seats                  │
     └─────────────────────────────────────────────────────────┘

Next ┌─────────────────────────────────────────────────────────┐
     │ Another periodic cleanup runs every 5 minutes           │
     │ Catches any missed expirations                          │
     │ Ensures consistency                                     │
     └─────────────────────────────────────────────────────────┘
```

---

## 7. Complete Event Lifecycle

```
┌────────────────────────────────────────────────────────────────┐
│                   EVENT LIFECYCLE                              │
└────────────────────────────────────────────────────────────────┘

join_show Event:
  Client → emit('join_show')
  Server ├─ Enter room 'showId'
         ├─ Release expired locks
         ├─ Fetch seats from DB
         ├─ Get statistics
         └─ emit('show_loaded') → Client

lock_seat Event:
  Client → emit('lock_seat')
  Server ├─ Atomic lock in DB
         ├─ Track in memory
         ├─ emit('lock_success') → Client
         └─ io.to(room).emit('seat_locked') → Room

book_seat Event:
  Client → emit('book_seat')
  Server ├─ Atomic book in DB
         ├─ Remove from tracking
         ├─ emit('book_success') → Client
         └─ io.to(room).emit('seat_booked') → Room

unlock_seat Event:
  Client → emit('unlock_seat')
  Server ├─ Release lock in DB
         ├─ Remove from tracking
         ├─ emit('unlock_success') → Client
         └─ io.to(room).emit('seat_released') → Room

disconnect Event:
  Client → [closes browser/loses connection]
  Server ├─ Find all locks by user
         ├─ Release all locks in DB
         ├─ Clean up memory tracking
         └─ io.to(room).emit('seat_released') → Room
```

---

## 8. Database Operations Flow

```
┌────────────────────────────────────────────────────────────────┐
│              MongoDB Atomic Operations                         │
└────────────────────────────────────────────────────────────────┘

LOCK OPERATION:
  findOneAndUpdate({
    query: {
      show: ObjectId,
      seatNumber: String,
      $or: [
        { status: 'available' },
        { status: 'locked', lockExpiry: { $lt: now } }
      ]
    },
    update: {
      status: 'locked',
      lockedBy: UserId,
      lockExpiry: now + 300_000ms,
      updatedAt: now
    }
  })
  ├─ Atomic: Query + Update together
  ├─ No race conditions
  └─ Returns updated seat or null

BOOK OPERATION:
  findOneAndUpdate({
    query: {
      show: ObjectId,
      seatNumber: String,
      status: 'locked',
      lockedBy: UserId,        ← Validates ownership
      lockExpiry: { $gt: now } ← Validates not expired
    },
    update: {
      status: 'booked',
      bookedBy: UserId,
      bookingReference: BookingId,
      bookedAt: now,
      updatedAt: now
    }
  })
  ├─ Atomic: Validates + Updates together
  ├─ Prevents unauthorized booking
  └─ Prevents expired lock booking

RELEASE OPERATION (on disconnect):
  updateMany({
    query: {
      show: ObjectId,
      seatNumber: { $in: userLocks },
      status: 'locked',
      lockedBy: UserId
    },
    update: {
      status: 'available',
      lockedBy: null,
      lockExpiry: null,
      updatedAt: now
    }
  })
  ├─ Releases ALL user locks in show
  ├─ Efficient bulk operation
  └─ Immediate cleanup

CLEANUP OPERATION (periodic):
  updateMany({
    query: {
      status: 'locked',
      lockExpiry: { $lt: now }
    },
    update: {
      status: 'available',
      lockedBy: null,
      lockExpiry: null,
      updatedAt: now
    }
  })
  ├─ Finds all expired locks
  ├─ Releases them automatically
  ├─ Runs every 5 minutes
  └─ Ensures consistency
```

---

## 9. Performance & Scalability

```
THROUGHPUT ANALYSIS:
═════════════════════════════════════════════════════════════════

Lock Operations:
  ├─ Query execution: 1ms
  ├─ Update execution: 1-2ms
  └─ Total per seat: 5-10ms
  └─ Throughput: 100-200 locks/sec per database
  └─ With connection pool (50 connections): 500-1000 locks/sec

Broadcast:
  ├─ Event serialization: <1ms
  ├─ WebSocket transmission: 10-50ms (network dependent)
  ├─ Client processing: 5-10ms
  └─ Total latency: 15-61ms
  └─ With WebSocket (no polling): <100ms typical

Concurrent Users per Show:
  ├─ Per connection: <1KB memory
  ├─ 1000 users = ~1MB in memory
  ├─ Database supports: 1000+ concurrent queries
  └─ Total: Can handle 1000+ users per show

Example Load:
  1000 users watching show
  ├─ 500 lock/unlock per minute
  ├─ 100 book operations per minute
  ├─ Database load: Minimal (< 10% CPU)
  └─ Network: < 10Mbps (broadcasts only)
```

---

## 10. Error Scenarios & Recovery

```
SCENARIO 1: Lock Fails (Seat Already Locked)
═════════════════════════════════════════════
Client: emit('lock_seat', {A1})
Server:
  ├─ Query: find {seat=A1, available} → NOT FOUND
  ├─ Return: null (failure)
  └─ emit('lock_failed') → Client
Client: Show error "Seat A1 locked by another user"
Recovery: User selects different seat

SCENARIO 2: Book Fails (Lock Expired)
══════════════════════════════════════
Client: emit('book_seat', {A1}) [after 6 minutes]
Server:
  ├─ Query: find {seat=A1, locked, by=userA, not expired}
  ├─ lockExpiry check: 5min old → EXPIRED
  ├─ Query fails → NOT FOUND
  └─ emit('book_failed') → Client
Client: Show error "Lock expired, select seats again"
Recovery: User locks seat again

SCENARIO 3: User Disconnects
═════════════════════════════
User: Closes browser
Server:
  ├─ on('disconnect') triggered
  ├─ Find all locks by user
  ├─ Release all locks in DB
  └─ Broadcast 'seat_released' to room
Room: See seats A1, A2 released
Recovery: Automatic, no user action needed

SCENARIO 4: Server Crashes
═══════════════════════════
Server: Crashes
Clients: Try to reconnect automatically
  ├─ Reconnection attempts: 5
  ├─ Reconnection delay: 1s
  └─ After 5s: Connection fails (user must refresh)
After Recovery:
  ├─ User refresh page
  ├─ Re-join show
  ├─ Get current state from DB
  └─ All data intact (persisted in MongoDB)
```

---

**Version**: 1.0  
**Created**: April 18, 2026  
**Status**: ✅ Production Ready
