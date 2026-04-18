# 🎬 ADMIN APIs - Movie Booking System

**Base URL:** `https://booking-mm-1.onrender.com/api/admin`

---

## 📋 Table of Contents

1. [🎬 Movie Management](#-movie-management)
2. [🏛️ Theatre Management](#-theatre-management)
3. [🎞️ Show Management](#-show-management)
4. [💺 Seat Layout Management](#-seat-layout-management)

---

## 🎬 Movie Management

### CREATE Movie

**Endpoint:** `POST /api/admin/movies`

**Request Body:**
```json
{
  "title": "Pushpa 2",
  "description": "An action thriller about a smuggler",
  "rating": 4.9,
  "language": "Telugu",
  "certification": "UA",
  "genre": ["Action", "Drama"],
  "posterUrl": "https://example.com/pushpa2-poster.jpg",
  "trailerUrl": "https://youtube.com/watch?v=xyz123",
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
    "_id": "60d5ec49c1234567890abcd1",
    "title": "Pushpa 2",
    "rating": 4.9,
    "language": "Telugu",
    "duration": 180,
    "createdAt": "2024-04-18T10:30:00Z"
  }
}
```

---

### UPDATE Movie

**Endpoint:** `PUT /api/admin/movies/:id`

**Request Body:**
```json
{
  "rating": 4.95,
  "description": "Updated description"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Movie updated successfully",
  "data": { /* updated movie object */ }
}
```

---

### DELETE Movie

**Endpoint:** `DELETE /api/admin/movies/:id`

**Response (200):**
```json
{
  "success": true,
  "message": "Movie deleted successfully"
}
```

---

## 🏛️ Theatre Management

### CREATE Theatre

**Endpoint:** `POST /api/admin/theatres`

**Request Body:**
```json
{
  "name": "PVR Cinemas Vijayawada",
  "city": "Vijayawada",
  "address": "123 Main Street, Shopping Mall, Vijayawada",
  "location": {
    "lat": 16.5062,
    "lng": 80.6480
  },
  "screens": 5,
  "facilities": ["AC", "Parking", "Food Court", "Wheelchair Access"],
  "contactPhone": "9876543210"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Theatre created successfully",
  "data": {
    "_id": "60d5ec49c1234567890abcd2",
    "name": "PVR Cinemas Vijayawada",
    "city": "Vijayawada",
    "screens": 5,
    "createdAt": "2024-04-18T10:30:00Z"
  }
}
```

---

### UPDATE Theatre

**Endpoint:** `PUT /api/admin/theatres/:id`

**Request Body:**
```json
{
  "screens": 6,
  "facilities": ["AC", "Parking", "Food Court", "Wheelchair Access", "IMAX"]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Theatre updated successfully",
  "data": { /* updated theatre object */ }
}
```

---

### DELETE Theatre

**Endpoint:** `DELETE /api/admin/theatres/:id`

**Response (200):**
```json
{
  "success": true,
  "message": "Theatre deleted successfully"
}
```

---

## 🎞️ Show Management

### CREATE Show (with Auto-Generated Seats)

**Endpoint:** `POST /api/admin/shows`

**Request Body:**
```json
{
  "movie": "60d5ec49c1234567890abcd1",
  "theatre": "60d5ec49c1234567890abcd2",
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

**Seat Layout Details:**
- **Premium (P):** 3 rows × 20 cols = 60 seats @ ₹250
- **Executive (E):** 3 rows × 20 cols = 60 seats @ ₹200
- **Normal (N):** 4 rows × 20 cols = 80 seats @ ₹150
- **Total:** 180 seats

**Seat Numbering:**
- Premium seats: P1-1 to P3-20
- Executive seats: E1-1 to E3-20
- Normal seats: N1-1 to N4-20

**Response (201):**
```json
{
  "success": true,
  "message": "Show created successfully with 180 seats",
  "data": {
    "_id": "60d5ec49c1234567890abcd3",
    "movie": "60d5ec49c1234567890abcd1",
    "theatre": "60d5ec49c1234567890abcd2",
    "showDate": "2024-12-20",
    "showTime": "14:00",
    "totalSeats": 180,
    "status": "active",
    "createdAt": "2024-04-18T10:30:00Z"
  }
}
```

---

### UPDATE Show

**Endpoint:** `PUT /api/admin/shows/:id`

**Request Body:**
```json
{
  "showTime": "16:00",
  "status": "cancelled"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Show updated successfully",
  "data": { /* updated show object */ }
}
```

---

### DELETE Show (with Seats)

**Endpoint:** `DELETE /api/admin/shows/:id`

**Response (200):**
```json
{
  "success": true,
  "message": "Show and associated seats deleted successfully"
}
```

---

## 💺 Seat Layout Management

### CREATE Seats (Manual)

**Endpoint:** `POST /api/admin/seats/create`

**Use Case:** Manually add seats to an existing show

**Request Body:**
```json
{
  "showId": "60d5ec49c1234567890abcd3",
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

**Response (201):**
```json
{
  "success": true,
  "message": "130 seats created successfully",
  "data": {
    "count": 130
  }
}
```

---

### GET Seats by Show

**Endpoint:** `GET /api/admin/seats/:showId`

**Response (200):**
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
    "seats": [
      {
        "_id": "60d5ec49c1234567890abcd4",
        "show": "60d5ec49c1234567890abcd3",
        "seatNumber": "P1-1",
        "row": "1",
        "col": 1,
        "category": "Premium",
        "price": 250,
        "status": "available",
        "lockedBy": null,
        "bookedBy": null
      },
      /* ... more seats ... */
    ]
  }
}
```

---

### UPDATE Seat Layout (Block/Unblock)

**Endpoint:** `PUT /api/admin/seats/:showId/layout`

**Request Body:**
```json
{
  "seatNumbers": ["P1-5", "P1-6", "P2-3"],
  "action": "block"
}
```

**Available Actions:**
- `"block"` - Block seats (maintenance, defective)
- `"unblock"` - Unblock seats (restore to available)
- `"maintenance"` - Mark for maintenance

**Response (200):**
```json
{
  "success": true,
  "message": "3 seats updated",
  "data": {
    "modifiedCount": 3
  }
}
```

---

## 📊 Complete Workflow Example

### Step 1: Create a Movie
```bash
curl -X POST https://booking-mm-1.onrender.com/api/admin/movies \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Daku Maharaj",
    "language": "Telugu",
    "duration": 150,
    "rating": 4.6,
    "certification": "UA",
    "posterUrl": "https://example.com/poster.jpg"
  }'
```

### Step 2: Create a Theatre
```bash
curl -X POST https://booking-mm-1.onrender.com/api/admin/theatres \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Inox Vijayawada",
    "city": "Vijayawada",
    "screens": 5,
    "contactPhone": "9876543210"
  }'
```

### Step 3: Create a Show (with Seats)
```bash
curl -X POST https://booking-mm-1.onrender.com/api/admin/shows \
  -H "Content-Type: application/json" \
  -d '{
    "movie": "<MOVIE_ID>",
    "theatre": "<THEATRE_ID>",
    "showDate": "2024-12-25",
    "showTime": "14:00",
    "language": "Telugu",
    "totalSeats": 180,
    "seatLayout": {
      "premium": {"rows": 3, "cols": 20, "price": 250},
      "executive": {"rows": 3, "cols": 20, "price": 200},
      "normal": {"rows": 4, "cols": 20, "price": 150}
    }
  }'
```

### Step 4: View Seats for Show
```bash
curl -X GET https://booking-mm-1.onrender.com/api/admin/seats/<SHOW_ID>
```

### Step 5: Block Defective Seats
```bash
curl -X PUT https://booking-mm-1.onrender.com/api/admin/seats/<SHOW_ID>/layout \
  -H "Content-Type: application/json" \
  -d '{
    "seatNumbers": ["P1-1", "P1-2"],
    "action": "block"
  }'
```

---

## 🔐 Security Recommendations

> ⚠️ **IMPORTANT:** Add authentication middleware to protect admin routes!

```javascript
// Example: Add auth middleware
router.use(verifyAdmin); // Add to admin routes
router.post("/movies", verifyAdmin, adminCreateMovie);
```

**Implement JWT token verification:**
- Only allow requests with valid admin JWT token
- Verify user role is "admin"
- Log all admin operations for audit trail

---

## 🚀 Testing with Postman

1. Import the following collection URL (if available)
2. Set variable: `baseUrl = https://booking-mm-1.onrender.com`
3. Execute requests in order:
   - Create Movie
   - Create Theatre
   - Create Show
   - View Seats
   - Update Layout

---

## 📈 Error Responses

**400 - Bad Request:**
```json
{
  "success": false,
  "message": "Title, language, and duration are required"
}
```

**404 - Not Found:**
```json
{
  "success": false,
  "message": "Movie not found"
}
```

**500 - Server Error:**
```json
{
  "success": false,
  "message": "Error creating movie",
  "error": "Detailed error message"
}
```

---

## 🎯 Key Features

✅ **Auto-seat generation** - Creates seats automatically when show is created
✅ **Flexible layouts** - Support for multiple seat categories (Premium, Executive, Normal)
✅ **Real-time updates** - Socket.io integration for live seat status
✅ **Bulk operations** - Create/update multiple items at once
✅ **Seat blocking** - Mark defective or maintenance seats as unavailable
✅ **Analytics** - Get seat status breakdown by category and status
✅ **Atomic operations** - Prevent double booking with database transactions

---

**Last Updated:** April 18, 2026
**Version:** 2.0.0
