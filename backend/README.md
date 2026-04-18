# 🎬 Movie Ticket Booking Backend - Refactored v2.0

> **Clean. Scalable. Production-Ready.** Professional MVC architecture with 100% backward compatibility.

## ✨ What's New (v2.0)

- ✅ **Clean MVC Architecture** - Organized into models, controllers, and routes
- ✅ **100% Backward Compatible** - All existing endpoints work identically
- ✅ **Professional Code** - Separation of concerns, easy to maintain
- ✅ **Comprehensive Documentation** - 7 detailed guides included
- ✅ **Production Ready** - Error handling, validation, security best practices

## 🌟 Features

- ✅ MongoDB Atlas integration with Mongoose ODM
- ✅ JWT authentication with bcryptjs password hashing
- ✅ Email notifications with PDF tickets + QR codes
- ✅ Real-time seat availability tracking
- ✅ Complete error handling and validation
- ✅ CORS enabled for frontend communication
- ✅ Environment-based configuration
- ✅ Production-ready code structure

## 📦 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas
- **Authentication:** JWT + bcryptjs
- **Email:** Nodemailer
- **PDF:** PDFKit
- **QR Code:** qrcode library
- **CORS:** Express CORS middleware

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your values
```

### Configuration

Create `.env` file:

```env
# Database
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname

# Authentication
JWT_SECRET=your-super-secret-key

# Server
PORT=5000
NODE_ENV=development

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Start Server

```bash
npm start
# Server runs on http://localhost:5000 ✅
```

## 📚 Complete Documentation

All documentation is in the project root. Choose your role:

| I am a... | Read This | Time |
|-----------|-----------|------|
| 🎯 **New Developer** | [DOCUMENTATION_INDEX.md](../DOCUMENTATION_INDEX.md) | 5 min |
| 💻 **Backend Developer** | [ARCHITECTURE.md](../ARCHITECTURE.md) then [FILE_STRUCTURE_REFERENCE.md](../FILE_STRUCTURE_REFERENCE.md) | 45 min |
| 👨‍💼 **Project Manager** | [EXECUTIVE_SUMMARY.md](../EXECUTIVE_SUMMARY.md) | 10 min |
| 🧪 **QA/Tester** | [VERIFICATION_CHECKLIST.md](../VERIFICATION_CHECKLIST.md) | 45 min |
| 🚀 **Deploying** | [VERIFICATION_CHECKLIST.md](../VERIFICATION_CHECKLIST.md#16-pre-deployment-checklist) | 30 min |

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [QUICKSTART.md](./QUICKSTART.md) | Step-by-step setup checklist |
| [SETUP_GUIDE.md](./SETUP_GUIDE.md) | Detailed installation & configuration |
| [API_REFERENCE.md](./API_REFERENCE.md) | Complete API endpoint documentation |
| [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) | Architecture & design overview |

## 🔌 API Endpoints

### Movies
```
GET    /api/movies              Get all movies
POST   /api/movies              Create movie (admin)
GET    /api/movies/:id          Get movie details
PUT    /api/movies/:id          Update movie (admin)
DELETE /api/movies/:id          Delete movie (admin)
```

### Theatres
```
GET    /api/theatres            Get all theatres
GET    /api/theatres/cities     Get list of cities
GET    /api/theatres/city/:city Get theatres by city
POST   /api/theatres            Create theatre (admin)
GET    /api/theatres/:id        Get theatre details
PUT    /api/theatres/:id        Update theatre (admin)
```

### Shows
```
GET    /api/shows               Get shows (filter by movie/theatre/date)
POST   /api/shows               Create show (admin)
GET    /api/shows/:id           Get show details
PUT    /api/shows/:id           Update show (admin)
GET    /api/shows/theatre/:id   Get shows by theatre
```

### Seats
```
GET    /api/seats/layout/:id    Get seat layout for show
GET    /api/seats/available/:id Get available seats
GET    /api/seats/booked/:id    Get booked seats
POST   /api/seats/check         Check seat availability
```

### Bookings
```
POST   /api/bookings            Create booking
GET    /api/bookings/user/:id   Get user bookings
GET    /api/bookings/:id        Get booking details
PUT    /api/bookings/:id/cancel Cancel booking
```

### Authentication
```
POST   /signup                  Register user
POST   /login                   Login user
```

## 📊 Database Schema

### User
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  phone: String,
  isAdmin: Boolean,
  isActive: Boolean
}
```

### Movie
```javascript
{
  title: String,
  description: String,
  duration: Number,
  genre: [String],
  rating: Number,
  language: String,
  isActive: Boolean
}
```

### Theatre
```javascript
{
  name: String,
  city: String,
  address: String,
  phone: String,
  screens: [{screenName, totalSeats}],
  isActive: Boolean
}
```

### Show
```javascript
{
  movie: ObjectId (ref: Movie),
  theatre: ObjectId (ref: Theatre),
  showTime: Date,
  ticketPrice: Number,
  totalSeats: Number,
  availableSeats: Number,
  language: String,
  format: String (2D/3D/IMAX),
  isActive: Boolean
}
```

### Seat
```javascript
{
  show: ObjectId (ref: Show),
  seatNumber: String,
  row: String,
  col: Number,
  status: String (available/booked/blocked),
  bookedBy: ObjectId (ref: Booking)
}
```

### Booking
```javascript
{
  user: ObjectId (ref: User),
  show: ObjectId (ref: Show),
  movie: ObjectId (ref: Movie),
  theatre: ObjectId (ref: Theatre),
  seats: [ObjectId] (ref: Seat),
  totalAmount: Number,
  paymentStatus: String,
  bookingStatus: String,
  bookingReference: String,
  email: String,
  phone: String
}
```

## 🔐 Security

- ✅ Password hashing with bcryptjs (10 salt rounds)
- ✅ JWT token authentication (7 days expiry)
- ✅ Environment variables for sensitive data
- ✅ Input validation on all endpoints
- ✅ CORS enabled for frontend communication
- ✅ Unique constraints on email/username
- ✅ Error handling without exposing sensitive info

## 🗂️ Project Structure

```
backend/
├── config/
│   └── db.js                    MongoDB connection
├── models/                      Database schemas
│   ├── User.js
│   ├── Movie.js
│   ├── Theatre.js
│   ├── Show.js
│   ├── Seat.js
│   └── Booking.js
├── controllers/                 Business logic
│   ├── movieController.js
│   ├── theatreController.js
│   ├── showController.js
│   ├── seatController.js
│   └── bookingController.js
├── routes/                      API routes
│   ├── movies.js
│   ├── theatres.js
│   ├── shows.js
│   ├── seats.js
│   └── bookings.js
├── scripts/
│   └── seed.js                  Database seeding
├── .env                         Environment variables
├── .env.example                 Environment template
├── .gitignore                   Git ignore file
├── package.json
├── server.js                    Main server file
└── server-updated.js            Improved version
```

## 🧪 Testing API Endpoints

### Using curl
```bash
curl http://localhost:5000/api/movies
```

### Using Postman
1. Import collection from API_REFERENCE.md examples
2. Set environment variables
3. Test endpoints

### Using Thunder Client (VS Code)
1. Install Thunder Client extension
2. Create requests following API_REFERENCE.md
3. Send requests and view responses

## 📝 Example Booking Flow

```javascript
// 1. Get cities
GET /api/theatres/cities

// 2. Get theatres in city
GET /api/theatres/city/Hyderabad

// 3. Get movies
GET /api/movies

// 4. Get shows
GET /api/shows?movieId=...&theatreId=...

// 5. Get seat layout
GET /api/seats/layout/showId

// 6. Create booking
POST /api/bookings
{
  "userId": "...",
  "showId": "...",
  "seatIds": ["...", "..."],
  "email": "user@example.com",
  "phone": "9876543210"
}

// 7. Get booking confirmation
GET /api/bookings/bookingId
```

## 🎯 Development Commands

```bash
# Install dependencies
npm install

# Seed database
npm run seed

# Start server
npm start

# Start with auto-reload
npm run dev

# Run tests (when added)
npm test
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection fails | Check MONGO_URI in .env |
| Port 5000 in use | Change PORT in .env |
| Module not found | Run `npm install` |
| Email not sending | Verify EMAIL_USER and EMAIL_PASS |
| Seed fails | Ensure MongoDB connection works |

## � Key Endpoints (Quick Reference)

```bash
# 🔐 Auth
POST /auth/signup                 Create account
POST /auth/login                  Login & get JWT

# 🎬 Seats  
GET  /seats                       Get all seats
POST /seats/book                  Book a seat

# 🎫 Bookings
POST /save-booking                Book + email + PDF ticket
GET  /booking-history/:username   User's booking history
```

📋 **[Full API Reference](../QUICK_REFERENCE.md)** - Curl examples, responses, codes

## 🏗️ Architecture at a Glance

```
HTTP Request → Routes → Controllers → Models → Database
```

Each layer has one responsibility, making code clean and maintainable.

📖 **[Full Architecture Diagram](../ARCHITECTURE.md)** - Detailed request flows & diagrams

## 🗂️ File Organization

```
backend/
├── config/         ← Database & email setup
├── models/         ← Data schemas  
├── controllers/    ← Business logic
├── routes/         ← API endpoints
├── middleware/     ← Error handling
└── server.js       ← Main entry point
```

📚 **[File-by-file Breakdown](../FILE_STRUCTURE_REFERENCE.md)** - What each file does

## ✅ Testing & Deployment

Test everything works:
```bash
curl http://localhost:5000/          # Health check
```

📋 **[Complete Testing Checklist](../VERIFICATION_CHECKLIST.md)** - 17-section guide covering:
- Individual endpoint testing
- Database verification
- Email functionality
- Error handling
- Pre-deployment checklist

## 🔐 Security ✓

- ✅ Passwords hashed with bcryptjs
- ✅ JWT authentication (7-day expiry)
- ✅ CORS enabled
- ✅ Environment variables for secrets
- ✅ Input validation
- ✅ Error handling

## 🚀 Ready to Go!

```bash
npm install    # Install dependencies
npm start      # Start server on port 5000 ✅
```

**👉 [Full Documentation Index](../DOCUMENTATION_INDEX.md)** - Find your role & get started!

---

**Questions?** Check the documentation files above for detailed guides.

**Like what you see?** Deploy with confidence! 🎉
