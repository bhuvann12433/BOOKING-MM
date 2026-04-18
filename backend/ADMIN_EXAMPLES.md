# 📝 Admin API - Example Requests (Copy-Paste Ready)

---

## 🎬 MOVIES

### Example 1: Create Movie - Pushpa 2
```bash
curl -X POST https://booking-mm-1.onrender.com/api/admin/movies \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

### Example 2: Create Movie - Game Changer
```bash
curl -X POST https://booking-mm-1.onrender.com/api/admin/movies \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Game Changer",
    "description": "A political action thriller",
    "rating": 4.8,
    "language": "Telugu",
    "certification": "UA",
    "genre": ["Action", "Politics"],
    "posterUrl": "https://example.com/gc-poster.jpg",
    "trailerUrl": "https://youtube.com/watch?v=abc456",
    "duration": 160,
    "releaseDate": "2024-11-10"
  }'
```

### Example 3: Update Movie Rating
```bash
curl -X PUT https://booking-mm-1.onrender.com/api/admin/movies/{movieId} \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 4.95,
    "description": "Updated with user reviews"
  }'
```

### Example 4: Delete Movie
```bash
curl -X DELETE https://booking-mm-1.onrender.com/api/admin/movies/{movieId}
```

---

## 🏛️ THEATRES

### Example 1: Create Theatre - PVR Cinemas
```bash
curl -X POST https://booking-mm-1.onrender.com/api/admin/theatres \
  -H "Content-Type: application/json" \
  -d '{
    "name": "PVR Cinemas Vijayawada",
    "city": "Vijayawada",
    "address": "123 Main Street, Shopping Mall, Vijayawada 520001",
    "location": {
      "lat": 16.5062,
      "lng": 80.6480
    },
    "screens": 5,
    "facilities": ["AC", "Parking", "Food Court", "Wheelchair Access"],
    "contactPhone": "+91-9876543210"
  }'
```

### Example 2: Create Theatre - INOX Visakhapatnam
```bash
curl -X POST https://booking-mm-1.onrender.com/api/admin/theatres \
  -H "Content-Type: application/json" \
  -d '{
    "name": "INOX Visakhapatnam",
    "city": "Visakhapatnam",
    "address": "Beach Road, Visakhapatnam",
    "location": {
      "lat": 17.6869,
      "lng": 83.2185
    },
    "screens": 7,
    "facilities": ["AC", "Parking", "Food Court", "IMAX Screen"],
    "contactPhone": "+91-9876543211"
  }'
```

### Example 3: Create Theatre - Cinepolis Guntur
```bash
curl -X POST https://booking-mm-1.onrender.com/api/admin/theatres \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cinepolis Guntur",
    "city": "Guntur",
    "address": "Central Mall, Guntur",
    "location": {
      "lat": 16.5889,
      "lng": 80.4572
    },
    "screens": 4,
    "facilities": ["AC", "Parking", "Food Court"],
    "contactPhone": "+91-9876543212"
  }'
```

### Example 4: Update Theatre - Add IMAX
```bash
curl -X PUT https://booking-mm-1.onrender.com/api/admin/theatres/{theatreId} \
  -H "Content-Type: application/json" \
  -d '{
    "screens": 6,
    "facilities": ["AC", "Parking", "Food Court", "Wheelchair Access", "IMAX Screen"]
  }'
```

### Example 5: Delete Theatre
```bash
curl -X DELETE https://booking-mm-1.onrender.com/api/admin/theatres/{theatreId}
```

---

## 🎞️ SHOWS

### Example 1: Create Show - Premium Theatre Layout
```bash
curl -X POST https://booking-mm-1.onrender.com/api/admin/shows \
  -H "Content-Type: application/json" \
  -d '{
    "movie": "607f1f77bcf86cd799439011",
    "theatre": "607f1f77bcf86cd799439012",
    "showDate": "2024-12-25",
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
  }'
```

**Seat Output:**
- Premium: P1-1 to P3-20 (60 seats) @ ₹250
- Executive: E1-1 to E3-20 (60 seats) @ ₹200
- Normal: N1-1 to N4-20 (80 seats) @ ₹150

### Example 2: Create Show - Small Theatre Layout
```bash
curl -X POST https://booking-mm-1.onrender.com/api/admin/shows \
  -H "Content-Type: application/json" \
  -d '{
    "movie": "607f1f77bcf86cd799439011",
    "theatre": "607f1f77bcf86cd799439013",
    "showDate": "2024-12-26",
    "showTime": "16:00",
    "language": "Telugu",
    "format": "2D",
    "screen": "Screen 2",
    "totalSeats": 100,
    "seatLayout": {
      "premium": {
        "rows": 2,
        "cols": 15,
        "price": 300
      },
      "normal": {
        "rows": 4,
        "cols": 15,
        "price": 150
      }
    }
  }'
```

### Example 3: Create Show - IMAX Format
```bash
curl -X POST https://booking-mm-1.onrender.com/api/admin/shows \
  -H "Content-Type: application/json" \
  -d '{
    "movie": "607f1f77bcf86cd799439011",
    "theatre": "607f1f77bcf86cd799439012",
    "showDate": "2024-12-25",
    "showTime": "19:00",
    "language": "Telugu",
    "format": "IMAX",
    "screen": "IMAX Screen",
    "totalSeats": 250,
    "seatLayout": {
      "premium": {
        "rows": 4,
        "cols": 20,
        "price": 500
      },
      "normal": {
        "rows": 6,
        "cols": 20,
        "price": 300
      }
    }
  }'
```

### Example 4: Update Show Time
```bash
curl -X PUT https://booking-mm-1.onrender.com/api/admin/shows/{showId} \
  -H "Content-Type: application/json" \
  -d '{
    "showTime": "18:00",
    "language": "English"
  }'
```

### Example 5: Delete Show
```bash
curl -X DELETE https://booking-mm-1.onrender.com/api/admin/shows/{showId}
```

---

## 💺 SEATS

### Example 1: View All Seats for a Show
```bash
curl https://booking-mm-1.onrender.com/api/admin/seats/{showId}
```

**Response includes:**
- Total seats count
- Breakdown by status (available, locked, booked)
- Breakdown by category (premium, executive, normal)
- Full list of all seats with details

### Example 2: Create Additional Seats for Show
```bash
curl -X POST https://booking-mm-1.onrender.com/api/admin/seats/create \
  -H "Content-Type: application/json" \
  -d '{
    "showId": "607f1f77bcf86cd799439014",
    "seatLayout": {
      "premium": {
        "rows": 1,
        "cols": 10,
        "price": 250
      },
      "normal": {
        "rows": 2,
        "cols": 10,
        "price": 150
      }
    }
  }'
```

### Example 3: Block Defective Seats
```bash
curl -X PUT https://booking-mm-1.onrender.com/api/admin/seats/{showId}/layout \
  -H "Content-Type: application/json" \
  -d '{
    "seatNumbers": ["P1-1", "P1-2", "P1-3"],
    "action": "block"
  }'
```

### Example 4: Unblock Seats
```bash
curl -X PUT https://booking-mm-1.onrender.com/api/admin/seats/{showId}/layout \
  -H "Content-Type: application/json" \
  -d '{
    "seatNumbers": ["P1-1", "P1-2"],
    "action": "unblock"
  }'
```

### Example 5: Mark Seats for Maintenance
```bash
curl -X PUT https://booking-mm-1.onrender.com/api/admin/seats/{showId}/layout \
  -H "Content-Type: application/json" \
  -d '{
    "seatNumbers": ["E3-15", "E3-16", "E3-17"],
    "action": "maintenance"
  }'
```

---

## 🔄 Complete End-to-End Example

```bash
# Step 1: Create a Movie
MOVIE_RESPONSE=$(curl -s -X POST https://booking-mm-1.onrender.com/api/admin/movies \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Daku Maharaj",
    "language": "Telugu",
    "duration": 150,
    "rating": 4.6,
    "certification": "UA"
  }')
MOVIE_ID=$(echo $MOVIE_RESPONSE | jq -r '.data._id')
echo "Created Movie: $MOVIE_ID"

# Step 2: Create a Theatre
THEATRE_RESPONSE=$(curl -s -X POST https://booking-mm-1.onrender.com/api/admin/theatres \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rajhans Cinema",
    "city": "Vijayawada",
    "screens": 3
  }')
THEATRE_ID=$(echo $THEATRE_RESPONSE | jq -r '.data._id')
echo "Created Theatre: $THEATRE_ID"

# Step 3: Create a Show
SHOW_RESPONSE=$(curl -s -X POST https://booking-mm-1.onrender.com/api/admin/shows \
  -H "Content-Type: application/json" \
  -d "{
    \"movie\": \"$MOVIE_ID\",
    \"theatre\": \"$THEATRE_ID\",
    \"showDate\": \"2024-12-28\",
    \"showTime\": \"14:00\",
    \"language\": \"Telugu\",
    \"totalSeats\": 180,
    \"seatLayout\": {
      \"premium\": {\"rows\": 3, \"cols\": 20, \"price\": 250},
      \"executive\": {\"rows\": 3, \"cols\": 20, \"price\": 200},
      \"normal\": {\"rows\": 4, \"cols\": 20, \"price\": 150}
    }
  }")
SHOW_ID=$(echo $SHOW_RESPONSE | jq -r '.data._id')
echo "Created Show: $SHOW_ID"

# Step 4: View Seats
curl -s https://booking-mm-1.onrender.com/api/admin/seats/$SHOW_ID | jq '.data.byStatus'

# Step 5: Block Some Seats
curl -s -X PUT https://booking-mm-1.onrender.com/api/admin/seats/$SHOW_ID/layout \
  -H "Content-Type: application/json" \
  -d '{
    "seatNumbers": ["P1-1", "P1-2"],
    "action": "block"
  }' | jq '.data'

echo "✅ Workflow Complete!"
```

---

## 💡 Tips

1. **Save IDs:** Always save the `_id` from responses for next requests
2. **Test Dates:** Use future dates (2024-12 onwards)
3. **Valid Cities:** Vijayawada, Visakhapatnam, Guntur, etc.
4. **Seat Naming:** Premium=P, Executive=E, Normal=N (auto-generated)
5. **Error Checking:** Check `success` field in response

---

**Last Updated:** April 18, 2026
