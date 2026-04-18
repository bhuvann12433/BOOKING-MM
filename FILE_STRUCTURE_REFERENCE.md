# Backend File Structure Reference

## Complete File Tree

```
backend/
│
├── server.js                          ⭐ MAIN ENTRY POINT
│   ├─ Imports all routes and config
│   ├─ Sets up Express app
│   ├─ Mounts middleware
│   └─ Starts server on PORT
│
├── config/
│   ├── database.js                    ✅ MongoDB connection
│   │   ├─ connectDB() function
│   │   ├─ Error handling
│   │   └─ Exports ready to import
│   │
│   └── email.js                       ✅ Nodemailer setup
│       ├─ Gmail SMTP configuration
│       ├─ Exports transporter
│       └─ Used by bookingController
│
├── models/
│   ├── User.js                        ✅ User schema
│   │   ├─ Fields: username, email, password
│   │   ├─ Pre-save: Password hashing
│   │   ├─ Instance method: comparePassword()
│   │   └─ Export: User model
│   │
│   ├── Booking.js                     ✅ Booking schema (original)
│   │   ├─ Fields: username, email, movieTitle, city, etc.
│   │   ├─ Timestamps: createdAt, updatedAt
│   │   └─ Export: Booking model
│   │
│   └── Seat.js                        ✅ Seat schema (original)
│       ├─ Fields: section, row, col, booked
│       └─ Export: Seat model
│
├── controllers/
│   ├── authController.js              ✅ Authentication logic
│   │   ├─ signup() → Create user + JWT
│   │   ├─ login() → Validate + JWT
│   │   ├─ generateToken() → Helper
│   │   └─ Exports: signup, login, generateToken
│   │
│   ├── seatController.js              ✅ Seat management
│   │   ├─ LEGACY:
│   │   │  ├─ getAllSeats() → GET /seats
│   │   │  └─ bookSeat() → POST /book-seat
│   │   │
│   │   ├─ NEW API:
│   │   │  ├─ getSeatLayout()
│   │   │  ├─ getAvailableSeats()
│   │   │  ├─ getBookedSeats()
│   │   │  └─ checkSeatAvailability()
│   │   │
│   │   └─ Exports: All functions
│   │
│   └── bookingController.js           ✅ Booking management
│       ├─ NEW API:
│       │  ├─ createBooking()
│       │  ├─ getUserBookings()
│       │  ├─ getBookingDetails()
│       │  └─ cancelBooking()
│       │
│       ├─ LEGACY:
│       │  ├─ createBookingWithEmail() → POST /save-booking
│       │  │   ├─ Creates booking in DB
│       │  │   ├─ Generates QR code
│       │  │   ├─ Creates PDF ticket
│       │  │   ├─ Sends email with PDF
│       │  │   └─ Returns success response
│       │  │
│       │  └─ getBookingHistoryLegacy() → GET /booking-history/:username
│       │      ├─ Finds all user bookings
│       │      ├─ Sorts by createdAt
│       │      └─ Returns paginated data
│       │
│       └─ Exports: All functions
│
├── routes/
│   ├── authRoutes.js                  ✅ Auth endpoints
│   │   ├─ POST /auth/signup
│   │   ├─ POST /auth/login
│   │   └─ Router mounted at /auth
│   │
│   ├── seatRoutes.js                  ✅ Seat endpoints
│   │   ├─ LEGACY:
│   │   │  ├─ GET /seats/          → getAllSeats
│   │   │  └─ POST /seats/book     → bookSeat
│   │   │
│   │   ├─ NEW API:
│   │   │  ├─ GET /seats/layout/:showId
│   │   │  ├─ GET /seats/available/:showId
│   │   │  ├─ GET /seats/booked/:showId
│   │   │  └─ POST /seats/check
│   │   │
│   │   └─ Router mounted at /seats
│   │
│   └── bookingRoutes.js               ✅ Booking endpoints
│       ├─ LEGACY:
│       │  ├─ POST /bookings/save → createBookingWithEmail
│       │  └─ GET /bookings/history/:username → getBookingHistoryLegacy
│       │
│       ├─ NEW API:
│       │  ├─ POST /bookings/
│       │  ├─ GET /bookings/user/:userId
│       │  ├─ GET /bookings/:id
│       │  └─ PUT /bookings/:id/cancel
│       │
│       └─ Router mounted at /bookings
│
├── middleware/
│   └── errorHandler.js                ✅ Error handling
│       ├─ asyncHandler() → Wraps async functions
│       ├─ errorHandler() → Global error middleware
│       ├─ notFound() → 404 handler
│       └─ Exports: asyncHandler, errorHandler, notFound
│
├── .env                               🔐 Environment variables
│   ├─ MONGO_URI=mongodb+srv://...
│   ├─ JWT_SECRET=your-secret
│   ├─ PORT=5000
│   ├─ EMAIL_USER=your@gmail.com
│   ├─ EMAIL_PASS=your-app-password
│   └─ NODE_ENV=development
│
├── .env.example                       📋 Environment template
│   └─ Same as .env but with placeholder values
│
├── .gitignore                         🔒 Git ignore file
│   ├─ .env
│   ├─ node_modules/
│   ├─ package-lock.json
│   └─ .DS_Store
│
├── package.json                       📦 Dependencies
│   ├─ Main: server.js
│   ├─ Start script: node server.js
│   ├─ Dev script: nodemon server.js
│   └─ Dependencies: express, mongoose, etc.
│
└── package-lock.json                  🔒 Locked versions

frontend/
├── src/
│   ├── components/
│   │   ├── LoginPage.jsx              📱 User login
│   │   ├── SignupPage.jsx             📱 User registration
│   │   ├── HomePage.jsx               📱 Main page
│   │   ├── SelectLocationPage.jsx     📱 City selection
│   │   ├── Theaters.jsx               📱 Theater listing
│   │   ├── Seating.jsx                📱 Seat selection
│   │   ├── BuyTicket.jsx              📱 Booking confirmation
│   │   └── ProfilePage.jsx            📱 User profile
│   │
│   ├── App.jsx                        🎬 Root component
│   ├── main.jsx                       🔗 App entry point
│   └── data/
│       └── theatres.json              📊 Theater data
│
└── ... (Vite + React setup)
```

## File Relationships

### Request Flow: Signup Example

```
1. Frontend
   └─ LoginPage.jsx → Sends POST /auth/signup

2. Server
   └─ server.js → Routes request to /auth

3. Route
   └─ authRoutes.js → Matches /signup → Calls signup()

4. Controller
   └─ authController.js → signup()
      ├─ Validates input
      ├─ Hashes password using bcryptjs
      ├─ Creates user in database
      ├─ Generates JWT token
      └─ Returns token + user info

5. Model
   └─ models/User.js → Defines schema
      ├─ username field
      ├─ email field (unique)
      ├─ password field (select: false)
      └─ Pre-save hook (hash password)

6. Database
   └─ MongoDB → Stores user document
      {
        _id: ObjectId,
        username: "testuser",
        email: "test@example.com",
        password: "$2b$10$...",  ← Hashed
        createdAt: ISODate,
        updatedAt: ISODate
      }

7. Response
   └─ Frontend receives
      {
        token: "eyJhbGciOiJIUzI1NiIs...",
        username: "testuser",
        email: "test@example.com"
      }
```

### Request Flow: Booking with Email Example

```
1. Frontend
   └─ BuyTicket.jsx → Sends POST /bookings/save

2. Server
   └─ server.js → Routes request to /bookings

3. Route
   └─ bookingRoutes.js → Matches /save → Calls createBookingWithEmail()

4. Controller
   └─ bookingController.js → createBookingWithEmail()
      ├─ Step 1: Validate input
      ├─ Step 2: Create booking in DB
      ├─ Step 3: Generate QR code (using qrcode library)
      ├─ Step 4: Create PDF (using PDFKit library)
      │   ├─ Add text (movie, theater, seats, price)
      │   └─ Embed QR code image
      ├─ Step 5: Send email (using Nodemailer)
      │   ├─ Attach PDF file
      │   └─ Send to user email
      └─ Return success response

5. Models
   ├─ Booking.js → Stores booking record
   ├─ Seat.js → Updates seat status (if needed)
   └─ User.js → Validates user exists

6. Config
   └─ email.js → Exports Nodemailer transporter
      └─ Uses Gmail SMTP with EMAIL_USER & EMAIL_PASS

7. Database
   └─ MongoDB → Stores booking document
      {
        _id: ObjectId,
        username: "testuser",
        email: "test@example.com",
        movieTitle: "Sankranti Ki Vastunam",
        city: "Hyderabad",
        theaterName: "PVR Cinemas",
        date: "2024-01-20",
        time: "10:00 PM",
        seats: ["Premium-A-1", "Premium-A-2"],
        createdAt: ISODate,
        updatedAt: ISODate
      }

8. External Services
   ├─ QRCode → Generates QR image
   ├─ PDFKit → Creates PDF document with QR
   └─ Gmail SMTP → Sends email with PDF attachment

9. Response
   └─ Frontend receives
      {
        success: true,
        message: "Booking created and email sent ✅",
        booking: { ... }
      }

10. User Effects
    ├─ Email received with PDF ticket
    ├─ PDF contains QR code
    └─ Booking stored in database
```

## Import Order (Dependencies)

```
External Libraries:
├─ express              (HTTP server)
├─ cors                 (CORS middleware)
├─ dotenv               (Environment config)
├─ mongoose            (MongoDB driver)
├─ bcryptjs            (Password hashing)
├─ jsonwebtoken        (JWT tokens)
├─ nodemailer          (Email sending)
├─ pdfkit              (PDF generation)
└─ qrcode              (QR code generation)

Internal Files:
├─ config/database.js  (Depends on: mongoose, dotenv)
├─ config/email.js     (Depends on: nodemailer, dotenv)
├─ models/             (Depends on: mongoose)
│  ├─ User.js          (Depends on: bcryptjs, jsonwebtoken)
│  ├─ Booking.js
│  └─ Seat.js
├─ controllers/        (Depends on: models, config, libraries)
│  ├─ authController.js
│  ├─ seatController.js
│  └─ bookingController.js
├─ routes/             (Depends on: controllers)
│  ├─ authRoutes.js
│  ├─ seatRoutes.js
│  └─ bookingRoutes.js
├─ middleware/         (Depends on: none or specific libraries)
│  └─ errorHandler.js
└─ server.js           (Depends on: everything)
```

## File Sizes (Approximate)

```
config/
├─ database.js           ~50 lines
└─ email.js              ~30 lines

models/
├─ User.js               ~80 lines
├─ Booking.js            ~40 lines (original)
└─ Seat.js               ~30 lines (original)

controllers/
├─ authController.js     ~80 lines
├─ seatController.js     ~150 lines
└─ bookingController.js  ~250 lines

routes/
├─ authRoutes.js         ~30 lines
├─ seatRoutes.js         ~50 lines
└─ bookingRoutes.js      ~60 lines

middleware/
└─ errorHandler.js       ~60 lines

server.js                ~170 lines

Total backend code:      ~1,050 lines
(Compared to original ~300 lines in monolithic server.js)
```

> Note: New architecture has more lines because code is properly organized and documented. Each line is clearer and more maintainable.

## How to Add a New Feature

### Example: Add Phone Number to Booking

1. **Update Model** (`models/Booking.js`)
   ```javascript
   // Add field to schema
   phone: { type: String, required: true }
   ```

2. **Update Controller** (`controllers/bookingController.js`)
   ```javascript
   // Extract phone from request
   const { ..., phone } = req.body;
   
   // Validate phone
   if (!phone) return res.status(400).json({ error: 'Phone required' });
   ```

3. **Update Route** (`routes/bookingRoutes.js`)
   ```javascript
   // No change needed - route stays same
   // API automatically includes phone
   ```

4. **Test**
   ```bash
   POST /bookings/save
   {
     ...,
     phone: "9876543210"
   }
   ```

That's it! Clean separation makes adding features simple.

## Maintenance Tasks

### Regular Backups
```bash
# Backup .env file (do NOT commit)
cp .env .env.backup

# Backup database (MongoDB Atlas handles this)
```

### Update Dependencies
```bash
npm update              # Update minor/patch versions
npm outdated            # Check for updates
```

### Monitor Logs
```bash
# View logs (on production server)
tail -f logs/app.log
```

### Clean Up
```bash
# Remove unused console.log statements
# Delete temporary files
# Archive old logs
```

## Performance Optimization Tips

1. **Add Database Indexes**
   ```javascript
   // In models
   email: { type: String, unique: true, index: true }
   username: { type: String, index: true }
   ```

2. **Add Caching**
   ```javascript
   import redis from 'redis';
   // Cache theater list, seat availability
   ```

3. **Add Rate Limiting**
   ```javascript
   import rateLimit from 'express-rate-limit';
   app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
   ```

4. **Add Compression**
   ```javascript
   import compression from 'compression';
   app.use(compression());
   ```

---

**New to this architecture?** Start by reading a request through each layer:
1. Check `server.js` to see how it starts
2. Follow to `routes/authRoutes.js` to see endpoint definitions
3. Follow to `controllers/authController.js` to see business logic
4. Follow to `models/User.js` to see data structure
5. Understand the complete flow! 🎯
