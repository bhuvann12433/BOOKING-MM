# 🎯 Admin APIs Quick Reference

## Base URL
```
https://booking-mm-1.onrender.com/api/admin
```

---

## 🎬 MOVIE APIs

### Add Movie
```bash
POST /api/admin/movies
```

**Request:**
```json
{
  "title": "Pushpa 2",
  "description": "Action thriller",
  "rating": 4.9,
  "language": "Telugu",
  "certification": "UA",
  "genre": ["Action", "Drama"],
  "posterUrl": "https://...",
  "trailerUrl": "https://youtube.com/watch?v=...",
  "duration": 180,
  "releaseDate": "2024-12-05"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Movie created successfully",
  "data": {
    "_id": "607f1f77bcf86cd799439011",
    "title": "Pushpa 2",
    ...
  }
}
```

---

### Update Movie
```bash
PUT /api/admin/movies/{movieId}
```

**Request:**
```json
{
  "rating": 4.95,
  "description": "Updated description"
}
```

---

### Delete Movie
```bash
DELETE /api/admin/movies/{movieId}
```

---

## 🏛️ THEATRE APIs

### Add Theatre
```bash
POST /api/admin/theatres
```

**Request:**
```json
{
  "name": "PVR Cinemas",
  "city": "Vijayawada",
  "address": "123 Main St",
  "location": {
    "lat": 16.5062,
    "lng": 80.6480
  },
  "screens": 5,
  "facilities": ["AC", "Parking", "Food Court"],
  "contactPhone": "9876543210"
}
```

---

### Update Theatre
```bash
PUT /api/admin/theatres/{theatreId}
```

---

### Delete Theatre
```bash
DELETE /api/admin/theatres/{theatreId}
```

---

## 🎞️ SHOW APIs

### Add Show (Auto-generates Seats)
```bash
POST /api/admin/shows
```

**Request:**
```json
{
  "movie": "607f1f77bcf86cd799439011",
  "theatre": "607f1f77bcf86cd799439012",
  "showDate": "2024-12-20",
  "showTime": "14:00",
  "language": "Telugu",
  "format": "2D",
  "screen": "Screen 1",
  "totalSeats": 180,
  "seatLayout": {
    "premium": {
      "rows": 3,
      "cols": 20,
      "price": 250
    },
    "executive": {
      "rows": 3,
      "cols": 20,
      "price": 200
    },
    "normal": {
      "rows": 4,
      "cols": 20,
      "price": 150
    }
  }
}
```

**Seat Breakdown:**
- Premium: 3×20 = 60 seats @ ₹250
- Executive: 3×20 = 60 seats @ ₹200
- Normal: 4×20 = 80 seats @ ₹150
- **Total: 180 seats**

**Seat Format:** P1-1 to P3-20, E1-1 to E3-20, N1-1 to N4-20

---

### Update Show
```bash
PUT /api/admin/shows/{showId}
```

---

### Delete Show (+ all seats)
```bash
DELETE /api/admin/shows/{showId}
```

---

## 💺 SEAT APIs

### View All Seats for Show
```bash
GET /api/admin/seats/{showId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSeats": 180,
    "byStatus": {
      "available": 170,
      "locked": 5,
      "booked": 5
    },
    "byCategory": {
      "premium": 60,
      "executive": 60,
      "normal": 80
    },
    "seats": [...]
  }
}
```

---

### Create Seats (Manual)
```bash
POST /api/admin/seats/create
```

**Request:**
```json
{
  "showId": "607f1f77bcf86cd799439013",
  "seatLayout": {
    "premium": {
      "rows": 2,
      "cols": 15,
      "price": 300
    },
    "normal": {
      "rows": 5,
      "cols": 20,
      "price": 150
    }
  }
}
```

---

### Block/Unblock Seats
```bash
PUT /api/admin/seats/{showId}/layout
```

**Request:**
```json
{
  "seatNumbers": ["P1-5", "P1-6", "E2-3"],
  "action": "block"
}
```

**Actions:** `block`, `unblock`, `maintenance`

---

## 📊 Complete Workflow

```bash
# 1️⃣ Create Movie
curl -X POST https://booking-mm-1.onrender.com/api/admin/movies \
  -H "Content-Type: application/json" \
  -d '{"title":"Daku Maharaj","language":"Telugu","duration":150}'

# 2️⃣ Create Theatre
curl -X POST https://booking-mm-1.onrender.com/api/admin/theatres \
  -H "Content-Type: application/json" \
  -d '{"name":"Inox","city":"Vijayawada","screens":5}'

# 3️⃣ Create Show with Seats
curl -X POST https://booking-mm-1.onrender.com/api/admin/shows \
  -H "Content-Type: application/json" \
  -d '{"movie":"<ID>","theatre":"<ID>","showDate":"2024-12-25","showTime":"14:00","seatLayout":{...}}'

# 4️⃣ View Seats
curl https://booking-mm-1.onrender.com/api/admin/seats/<SHOW_ID>

# 5️⃣ Block Bad Seats
curl -X PUT https://booking-mm-1.onrender.com/api/admin/seats/<SHOW_ID>/layout \
  -H "Content-Type: application/json" \
  -d '{"seatNumbers":["P1-1"],"action":"block"}'
```

---

## ✅ Features

| Feature | Details |
|---------|---------|
| 🎬 Movie Management | Add, Update, Delete movies |
| 🏛️ Theatre Management | Add, Update, Delete theatres |
| 🎞️ Show Management | Add shows with auto-seat generation |
| 💺 Seat Customization | Create custom seat layouts |
| 🔒 Seat Blocking | Block defective or maintenance seats |
| 📊 Analytics | View seat breakdown by status/category |
| ⚡ Real-time | Socket.io integration for live updates |

---

## 🚀 Test with Postman

1. Import collection
2. Set `baseUrl = https://booking-mm-1.onrender.com`
3. Create Movie → Copy `_id`
4. Create Theatre → Copy `_id`
5. Create Show (paste IDs) → Copy `_id`
6. View Seats
7. Block Seats

---

**All endpoints documented in:** [ADMIN_API_GUIDE.md](./ADMIN_API_GUIDE.md)

**Last Updated:** April 18, 2026
