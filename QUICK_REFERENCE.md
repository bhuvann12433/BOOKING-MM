# Backend API Quick Reference Card

## Starting the Server

```bash
cd backend
npm install          # First time only
npm start            # Starts on http://localhost:5000
```

**Health Check:** `GET http://localhost:5000/` → Returns API info

---

## 🔐 Authentication Endpoints

### Signup (Create Account)
```bash
POST /auth/signup
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "username": "testuser",
  "email": "test@example.com"
}
```

### Login (Get Token)
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "username": "testuser",
  "email": "test@example.com"
}
```

---

## 🎬 Seat Management Endpoints

### Get All Seats
```bash
GET /seats

Response:
[
  {
    "_id": "507f...",
    "section": "Premium",
    "row": 1,
    "col": 1,
    "booked": false
  },
  ...
]
```

### Book a Seat
```bash
POST /seats/book
Content-Type: application/json

{
  "section": "Premium",
  "row": "1",
  "col": "1"
}

Response:
{ "message": "Seat booked ✅" }
```

---

## 🎫 Booking Management Endpoints

### Create Booking with Email & PDF Ticket
```bash
POST /save-booking
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "movieTitle": "Sankranti Ki Vastunam",
  "city": "Hyderabad",
  "theaterName": "PVR Cinemas",
  "date": "2024-01-20",
  "time": "10:00 PM",
  "seats": ["Premium-A-1", "Premium-A-2"]
}

Response:
{
  "success": true,
  "message": "Booking created and email sent ✅",
  "booking": {
    "_id": "507f...",
    "username": "testuser",
    "movieTitle": "Sankranti Ki Vastunam",
    ...
  }
}
```

**What happens:**
1. ✅ Booking saved to database
2. ✅ QR code generated
3. ✅ PDF ticket created
4. ✅ Email sent with PDF attachment
5. ✅ Response returned to frontend

### Get Booking History
```bash
GET /booking-history/testuser

Response:
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "507f...",
      "username": "testuser",
      "movieTitle": "Sankranti Ki Vastunam",
      "city": "Hyderabad",
      "theaterName": "PVR Cinemas",
      "date": "2024-01-20",
      "time": "10:00 PM",
      "seats": ["Premium-A-1", "Premium-A-2"],
      "createdAt": "2024-01-15T10:30:00Z"
    }
    ...
  ]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation Error",
  "message": "email is required"
}
```

### 400 Conflict (Duplicate)
```json
{
  "success": false,
  "error": "email already exists"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Invalid token"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Seat not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Curl Examples

### Test Signup
```bash
curl -X POST http://localhost:5000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get All Seats
```bash
curl http://localhost:5000/seats
```

### Book a Seat
```bash
curl -X POST http://localhost:5000/seats/book \
  -H "Content-Type: application/json" \
  -d '{
    "section": "Premium",
    "row": "1",
    "col": "1"
  }'
```

### Save Booking with Email
```bash
curl -X POST http://localhost:5000/save-booking \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "movieTitle": "Sankranti Ki Vastunam",
    "city": "Hyderabad",
    "theaterName": "PVR Cinemas",
    "date": "2024-01-20",
    "time": "10:00 PM",
    "seats": ["Premium-A-1", "Premium-A-2"]
  }'
```

### Get Booking History
```bash
curl http://localhost:5000/booking-history/testuser
```

---

## HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Login successful |
| 201 | Created | Booking created |
| 400 | Bad Request | Invalid email format |
| 401 | Unauthorized | Wrong password |
| 404 | Not Found | Seat doesn't exist |
| 500 | Server Error | Database connection failed |

---

## Environment Variables Required

```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# Authentication
JWT_SECRET=your-super-secret-key-change-this

# Server
PORT=5000
NODE_ENV=development

# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
```

---

## Price Calculation

Seat prices based on section name:
- **Premium:** ₹250
- **Executive:** ₹200
- **Other:** ₹150

Example: 2 Premium seats = ₹500

---

## Testing Checklist

- [ ] Server starts without errors: `npm start`
- [ ] Health check works: `GET /`
- [ ] Signup creates user: `POST /auth/signup`
- [ ] Login returns token: `POST /auth/login`
- [ ] Get seats works: `GET /seats`
- [ ] Book seat works: `POST /seats/book`
- [ ] Save booking works: `POST /save-booking`
- [ ] Email received with PDF
- [ ] Booking history works: `GET /booking-history/:username`
- [ ] Error handling works (try invalid requests)

---

## Common Issues & Solutions

### Issue: "Cannot find module"
```
Solution: Make sure Node.js is installed
$ node --version  # Should be 14+
```

### Issue: Port 5000 already in use
```bash
# Find what's using port 5000
lsof -i :5000

# Kill process (on macOS/Linux)
kill -9 <PID>

# Or change PORT in .env
PORT=5001
```

### Issue: MongoDB connection failed
```
Check .env:
✓ MONGO_URI is correct
✓ Cluster allows your IP in MongoDB Atlas
✓ Database name is correct
```

### Issue: Email not sending
```
Check .env:
✓ EMAIL_USER is your Gmail address
✓ EMAIL_PASS is App Password (not your Gmail password!)
✓ Less secure apps enabled (if not using App Password)
```

### Issue: JWT token invalid
```
Solution:
1. Regenerate JWT_SECRET in .env
2. Clear browser storage (old token won't work)
3. Re-login to get new token
```

---

## Performance Tips

### Response Times
| Endpoint | Time |
|----------|------|
| GET / | ~10ms |
| GET /seats | ~50ms |
| POST /auth/login | ~200ms |
| POST /auth/signup | ~500ms |
| POST /seats/book | ~100ms |
| POST /save-booking | ~1500ms |
| GET /booking-history | ~100ms |

### Optimization Ideas
- ✅ Add caching for seat list
- ✅ Add database indexes
- ✅ Compress responses
- ✅ Add rate limiting

---

## Security Checklist

- ✅ Passwords hashed with bcryptjs
- ✅ JWT tokens expire in 7 days
- ✅ Credentials never logged
- ✅ .env file not in Git
- ✅ CORS enabled
- ✅ HTTPS in production

---

## File Structure

```
backend/
├── server.js                    Main entry point
├── config/
│   ├── database.js             MongoDB connection
│   └── email.js                Nodemailer setup
├── models/
│   ├── User.js
│   ├── Booking.js
│   └── Seat.js
├── controllers/
│   ├── authController.js
│   ├── seatController.js
│   └── bookingController.js
├── routes/
│   ├── authRoutes.js
│   ├── seatRoutes.js
│   └── bookingRoutes.js
├── middleware/
│   └── errorHandler.js
├── .env                        Environment variables
└── package.json
```

---

## Endpoints Summary

```
🔐 Auth
  POST   /auth/signup           Create account
  POST   /auth/login            Login & get token

🎬 Seats
  GET    /seats                 Get all seats
  POST   /seats/book            Book a seat

🎫 Bookings
  POST   /save-booking          Book + email + PDF
  GET    /booking-history/:username  User's bookings
```

---

## React Frontend Integration

```javascript
// Signup
const res = await fetch('http://localhost:5000/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, email, password })
})
const { token } = await res.json()
localStorage.setItem('token', token)

// Login
const res = await fetch('http://localhost:5000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
})
const { token } = await res.json()
localStorage.setItem('token', token)

// Get Seats
const res = await fetch('http://localhost:5000/seats')
const seats = await res.json()

// Book Seat
const res = await fetch('http://localhost:5000/seats/book', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ section, row, col })
})

// Save Booking
const res = await fetch('http://localhost:5000/save-booking', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username, email, movieTitle, city,
    theaterName, date, time, seats
  })
})

// Get History
const res = await fetch(`http://localhost:5000/booking-history/${username}`)
const { data } = await res.json()
```

---

## Production Deployment Checklist

- [ ] All tests passing
- [ ] No console errors
- [ ] .env configured for production
- [ ] Database backups enabled
- [ ] HTTPS enabled
- [ ] Error logging configured
- [ ] CORS configured for production domain
- [ ] Rate limiting enabled
- [ ] Performance optimized
- [ ] Security reviewed

---

**Last Updated:** Phase 3 - Backend Refactoring Complete ✅

**For more details:**
- 📖 Full architecture: See `ARCHITECTURE.md`
- 📋 Testing guide: See `VERIFICATION_CHECKLIST.md`
- 📚 File structure: See `FILE_STRUCTURE_REFERENCE.md`
