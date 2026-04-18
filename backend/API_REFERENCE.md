# API Reference & Usage Examples

## 🔐 Authentication

### 1. Signup
```bash
curl -X POST http://localhost:5000/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

### 2. Login
```bash
curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

---

## 🎬 Movies

### Get All Movies
```bash
curl http://localhost:5000/api/movies
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "The Avengers",
      "description": "An unprecedented collection of Marvel superheroes",
      "duration": 143,
      "genre": ["Action", "Sci-Fi"],
      "rating": 8.5,
      "language": "English",
      "isActive": true,
      "createdAt": "2024-04-25T10:00:00.000Z"
    }
  ]
}
```

### Get Single Movie
```bash
curl http://localhost:5000/api/movies/507f1f77bcf86cd799439011
```

### Create Movie (Admin)
```bash
curl -X POST http://localhost:5000/api/movies \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Inception",
    "description": "A thief who steals corporate secrets",
    "duration": 148,
    "genre": ["Sci-Fi", "Thriller"],
    "rating": 8.8,
    "language": "English",
    "releaseDate": "2024-06-01"
  }'
```

---

## 🎭 Theatres

### Get All Theatres
```bash
curl http://localhost:5000/api/theatres
```

### Get Unique Cities
```bash
curl http://localhost:5000/api/theatres/cities
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": ["Hyderabad", "Bangalore"]
}
```

### Get Theatres by City
```bash
curl http://localhost:5000/api/theatres/city/Hyderabad
```

### Create Theatre (Admin)
```bash
curl -X POST http://localhost:5000/api/theatres \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AMB Cinemas",
    "city": "Chennai",
    "address": "Fort St, Chennai",
    "phone": "9876543210",
    "totalScreens": 5,
    "screens": [
      {"screenName": "Screen 1", "totalSeats": 150},
      {"screenName": "Screen 2", "totalSeats": 180}
    ]
  }'
```

---

## 🎪 Shows

### Get Shows by Movie and Theatre
```bash
curl "http://localhost:5000/api/shows?movieId=507f1f77bcf86cd799439011&theatreId=507f1f77bcf86cd799439012&date=2024-04-25"
```

**Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "movie": {
        "_id": "507f1f77bcf86cd799439011",
        "title": "The Avengers",
        "duration": 143,
        "genre": ["Action", "Sci-Fi"],
        "language": "English"
      },
      "theatre": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Shourya Cineplex",
        "city": "Hyderabad",
        "address": "Kondapur, Hyderabad"
      },
      "screen": "Screen 1",
      "showTime": "2024-04-25T10:00:00.000Z",
      "ticketPrice": 250,
      "totalSeats": 150,
      "availableSeats": 120,
      "language": "English",
      "format": "2D"
    }
  ]
}
```

### Get Shows by Theatre
```bash
curl http://localhost:5000/api/shows/theatre/507f1f77bcf86cd799439012
```

### Create Show (Admin)
```bash
curl -X POST http://localhost:5000/api/shows \
  -H "Content-Type: application/json" \
  -d '{
    "movie": "507f1f77bcf86cd799439011",
    "theatre": "507f1f77bcf86cd799439012",
    "screen": "Screen 1",
    "showTime": "2024-04-26T19:00:00Z",
    "ticketPrice": 280,
    "totalSeats": 150,
    "language": "Telugu",
    "format": "2D"
  }'
```

---

## 💺 Seats

### Get Seat Layout for a Show
```bash
curl http://localhost:5000/api/seats/layout/507f1f77bcf86cd799439013
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSeats": 150,
    "seatsByRow": {
      "A": [
        {
          "_id": "507f1f77bcf86cd799439014",
          "seatNumber": "A1",
          "row": "A",
          "col": 1,
          "status": "available"
        },
        {
          "_id": "507f1f77bcf86cd799439015",
          "seatNumber": "A2",
          "row": "A",
          "col": 2,
          "status": "booked"
        }
      ]
    }
  }
}
```

### Get Available Seats
```bash
curl http://localhost:5000/api/seats/available/507f1f77bcf86cd799439013
```

### Get Booked Seats
```bash
curl http://localhost:5000/api/seats/booked/507f1f77bcf86cd799439013
```

### Check Seat Availability
```bash
curl -X POST http://localhost:5000/api/seats/check-availability \
  -H "Content-Type: application/json" \
  -d '{
    "seatIds": [
      "507f1f77bcf86cd799439014",
      "507f1f77bcf86cd799439016"
    ]
  }'
```

---

## 🎟️ Bookings

### Create Booking
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439001",
    "showId": "507f1f77bcf86cd799439013",
    "seatIds": [
      "507f1f77bcf86cd799439014",
      "507f1f77bcf86cd799439016"
    ],
    "email": "john@example.com",
    "phone": "9876543210"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Booking confirmed",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "user": {
      "_id": "507f1f77bcf86cd799439001",
      "username": "john_doe",
      "email": "john@example.com"
    },
    "show": { ... },
    "movie": { ... },
    "theatre": { ... },
    "seats": [...],
    "totalAmount": 500,
    "paymentStatus": "completed",
    "bookingStatus": "confirmed",
    "bookingReference": "BK1698934400123",
    "email": "john@example.com",
    "phone": "9876543210",
    "createdAt": "2024-04-25T12:00:00.000Z"
  }
}
```

### Get User Bookings
```bash
curl http://localhost:5000/api/bookings/user/507f1f77bcf86cd799439001
```

### Get Booking Details
```bash
curl http://localhost:5000/api/bookings/507f1f77bcf86cd799439020
```

### Cancel Booking
```bash
curl -X PUT http://localhost:5000/api/bookings/507f1f77bcf86cd799439020/cancel
```

---

## 📱 Frontend Integration Examples

### JavaScript/Fetch Example

```javascript
// Get all movies
const getMovies = async () => {
  const response = await fetch("http://localhost:5000/api/movies");
  const data = await response.json();
  console.log(data);
};

// Create booking
const createBooking = async (userId, showId, seatIds) => {
  const response = await fetch("http://localhost:5000/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      showId,
      seatIds,
      email: "user@example.com",
      phone: "9876543210",
    }),
  });
  const data = await response.json();
  return data;
};

// Get available seats
const getAvailableSeats = async (showId) => {
  const response = await fetch(
    `http://localhost:5000/api/seats/available/${showId}`
  );
  const data = await response.json();
  return data.data;
};
```

### React Example

```javascript
import { useState, useEffect } from "react";

function MovieBooking() {
  const [movies, setMovies] = useState([]);
  const [shows, setShows] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);

  useEffect(() => {
    // Fetch movies on component mount
    fetch("http://localhost:5000/api/movies")
      .then((res) => res.json())
      .then((data) => setMovies(data.data));
  }, []);

  const handleSelectShow = async (movieId, theatreId) => {
    const response = await fetch(
      `http://localhost:5000/api/shows?movieId=${movieId}&theatreId=${theatreId}`
    );
    const data = await response.json();
    setShows(data.data);
  };

  const handleBookSeats = async (showId) => {
    const response = await fetch("http://localhost:5000/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "user-id-here",
        showId,
        seatIds: selectedSeats,
        email: "user@example.com",
        phone: "9876543210",
      }),
    });
    const data = await response.json();
    if (data.success) {
      alert("Booking confirmed! Check your email for the ticket.");
    }
  };

  return (
    <div>
      {/* Your component JSX */}
    </div>
  );
}

export default MovieBooking;
```

---

## 🚨 Error Handling

### Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 500 | Server Error |

### Error Response Example

```json
{
  "success": false,
  "message": "Invalid seats",
  "error": "Some seats are not available"
}
```

---

## 📊 Database Seeding

After setting up, seed the database with sample data:

```bash
cd backend
node scripts/seed.js
```

This creates:
- 3 sample movies
- 2 sample theatres
- 3 sample shows
- 150 seats per show
- 1 test user

---

## 🔗 Important Links

- **MongoDB Atlas**: https://cloud.mongodb.com
- **Postman**: https://www.postman.com (For API testing)
- **Thunder Client**: VS Code extension for API testing
- **Documentation**: See SETUP_GUIDE.md in backend folder

---

## 💡 Tips

1. Always validate input on the frontend before sending to API
2. Store JWT token in localStorage or sessionStorage
3. Include token in Authorization header for protected routes
4. Use pagination for large data sets (coming soon)
5. Implement rate limiting in production
6. Use HTTPS in production environment

---

## 📞 Need Help?

- Check SETUP_GUIDE.md for detailed setup instructions
- Review error messages in server console
- Test endpoints using Postman or Thunder Client
- Check browser DevTools Network tab for API responses
