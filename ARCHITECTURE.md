# Backend Architecture Visualization

## Request/Response Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│                  (React/Vite Application)                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP Request
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SERVER.JS                               │
│              (Express Application Entry Point)                  │
│                                                                 │
│  1. Middleware Layer:                                           │
│     ├── express.json()        - Parse JSON                      │
│     └── cors()                - Enable CORS                     │
│                                                                 │
│  2. Database Connection:                                        │
│     └── connectDB()           - MongoDB Atlas                   │
│                                                                 │
│  3. Route Mounting:                                             │
│     ├── /auth       → authRoutes                                │
│     ├── /seats      → seatRoutes                                │
│     └── /bookings   → bookingRoutes                             │
│                                                                 │
│  4. Error Handling:                                             │
│     └── Global Error Handler                                    │
└────────────┬─────────────────────────────────────────────────────┘
             │
      ┌──────┴──────┬──────────────┬─────────────────┐
      ▼             ▼              ▼                 ▼
   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐
   │ Routes   │  │ Routes   │  │ Routes   │  │ Middleware   │
   │          │  │          │  │          │  │              │
   │ Auth     │  │ Seats    │  │ Bookings │  │ errorHandler │
   └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────────────┘
        │             │             │
        ▼             ▼             ▼
   ┌──────────────────────────────────────┐
   │         CONTROLLERS                  │
   │   (Business Logic)                   │
   │                                      │
   │ ├─ authController.js                │
   │ │  ├─ signup()                       │
   │ │  └─ login()                        │
   │ │                                    │
   │ ├─ seatController.js                │
   │ │  ├─ getAllSeats()                  │
   │ │  ├─ bookSeat()                     │
   │ │  ├─ getSeatLayout()                │
   │ │  └─ checkSeatAvailability()        │
   │ │                                    │
   │ └─ bookingController.js             │
   │    ├─ createBookingWithEmail()       │
   │    ├─ getBookingHistoryLegacy()      │
   │    ├─ createBooking()                │
   │    └─ cancelBooking()                │
   └──────────────┬───────────────────────┘
                  │
        ┌─────────┼──────────┐
        ▼         ▼          ▼
   ┌────────┐ ┌────────┐ ┌──────────┐
   │ Models │ │ Config │ │ Services │
   │        │ │        │ │          │
   │ User   │ │Database│ │ Nodemailer│
   │ Seat   │ │ Email  │ │ PDFKit   │
   │ Booking│ └────────┘ │ QRCode   │
   └────────┘            └──────────┘
        │
        ▼
   ┌─────────────────────────┐
   │   MONGODB ATLAS         │
   │   (Cloud Database)      │
   │                         │
   │  Collections:           │
   │  ├─ users               │
   │  ├─ seats               │
   │  └─ bookings            │
   └─────────────────────────┘
```

## Layer Responsibilities

### 1. Server Layer (server.js)
**Responsibility:** Orchestration and configuration

```javascript
app.use(middleware)              // Register middleware
connectDB()                      // Initialize database
app.use('/auth', authRoutes)     // Mount routes
app.listen()                     // Start server
```

### 2. Routes Layer
**Responsibility:** HTTP endpoint definitions

```javascript
// authRoutes.js
router.post('/signup', signup)   // Maps HTTP POST to controller
router.post('/login', login)     // Maps HTTP POST to controller
```

### 3. Controllers Layer
**Responsibility:** Business logic execution

```javascript
// authController.js
export const signup = async (req, res) => {
  // 1. Validate input
  // 2. Check if user exists
  // 3. Hash password
  // 4. Create user in database
  // 5. Generate JWT token
  // 6. Return response
}
```

### 4. Models Layer
**Responsibility:** Data structure definition

```javascript
// User.js
const userSchema = new Schema({
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: { type: String, select: false },
  createdAt: { type: Date, default: Date.now }
})
```

### 5. Config Layer
**Responsibility:** External service initialization

```javascript
// database.js
export default async function connectDB() {
  await mongoose.connect(process.env.MONGO_URI)
}

// email.js
export default transporter = nodemailer.createTransport({...})
```

## API Endpoint Mapping

### Authentication Routes (/auth)
```
POST /auth/signup
├─ Route: authRoutes.js → /signup
├─ Handler: authController.js → signup()
├─ Request: { username, email, password }
└─ Response: { token, username, email }

POST /auth/login
├─ Route: authRoutes.js → /login
├─ Handler: authController.js → login()
├─ Request: { email, password }
└─ Response: { token, username, email }
```

### Seat Routes (/seats)
```
GET /seats
├─ Route: seatRoutes.js → /
├─ Handler: seatController.js → getAllSeats()
└─ Response: [{ section, row, col, booked }]

POST /seats/book
├─ Route: seatRoutes.js → /book
├─ Handler: seatController.js → bookSeat()
├─ Request: { section, row, col }
└─ Response: { message: "Seat booked" }

GET /seats/layout/:showId
├─ Route: seatRoutes.js → /layout/:showId
├─ Handler: seatController.js → getSeatLayout()
└─ Response: Organized seat layout

GET /seats/available/:showId
├─ Route: seatRoutes.js → /available/:showId
├─ Handler: seatController.js → getAvailableSeats()
└─ Response: [{ seatId, available }]
```

### Booking Routes (/bookings)
```
POST /bookings/save (LEGACY)
├─ Route: bookingRoutes.js → /save
├─ Handler: bookingController.js → createBookingWithEmail()
├─ Request: { username, email, movieTitle, city, theaterName, date, time, seats }
├─ Actions:
│  ├─ Create booking in DB
│  ├─ Generate QR code
│  ├─ Create PDF ticket
│  └─ Send email with attachment
└─ Response: { success, message, booking }

GET /bookings/history/:username (LEGACY)
├─ Route: bookingRoutes.js → /history/:username
├─ Handler: bookingController.js → getBookingHistoryLegacy()
├─ Request: URL parameter: username
└─ Response: { success, count, data: [bookings] }

POST /bookings (NEW API)
├─ Route: bookingRoutes.js → /
├─ Handler: bookingController.js → createBooking()
├─ Request: { userId, showId, seatIds, email, phone }
└─ Response: { success, data: booking }

GET /bookings/:id
├─ Route: bookingRoutes.js → /:id
├─ Handler: bookingController.js → getBookingDetails()
└─ Response: { success, data: booking }

PUT /bookings/:id/cancel
├─ Route: bookingRoutes.js → /:id/cancel
├─ Handler: bookingController.js → cancelBooking()
└─ Response: { success, message, data: booking }
```

## Data Flow Example: Booking a Seat

```
1. FRONTEND sends HTTP request
   POST /seats/book
   Body: { section: "Premium", row: 1, col: 1 }

2. EXPRESS receives request
   → Matches route in seatRoutes.js
   → Calls bookSeat() from seatController.js

3. CONTROLLER processes business logic
   bookSeat(req, res) {
     ├─ Extract: section, row, col from request
     ├─ Query: Find seat in database
     ├─ Validate: Check if seat exists and is available
     ├─ Update: Mark seat as booked
     ├─ Save: Write to MongoDB
     └─ Respond: Send success message back
   }

4. DATABASE updates
   Seat collection:
   { _id: ..., section: "Premium", row: 1, col: 1, booked: true }

5. RESPONSE sent to frontend
   Status: 201
   Body: { message: "Seat booked ✅" }

6. FRONTEND updates UI
   Display confirmation message
```

## Data Flow Example: Booking with Email

```
1. FRONTEND sends HTTP request
   POST /save-booking
   Body: { username, email, movieTitle, city, theaterName, date, time, seats }

2. ROUTE matches /bookings/save
   → Calls createBookingWithEmail()

3. CONTROLLER executes 5 operations sequentially:

   ├─ ✅ STEP 1: Validate & Create Booking
   │  ├─ Validate all required fields
   │  ├─ Create booking document in DB
   │  └─ Response: Booking saved ✅
   │
   ├─ ✅ STEP 2: Generate QR Code
   │  ├─ Format booking data
   │  ├─ Create QR image
   │  └─ Response: QR code ready ✅
   │
   ├─ ✅ STEP 3: Create PDF Ticket
   │  ├─ Initialize PDFDocument
   │  ├─ Add text: Movie, Theater, Seats, Price
   │  ├─ Embed QR code image
   │  ├─ Finalize PDF in memory
   │  └─ Response: PDF created ✅
   │
   ├─ ✅ STEP 4: Send Email with PDF
   │  ├─ Format HTML email body
   │  ├─ Attach PDF as file
   │  ├─ Send via Nodemailer (Gmail)
   │  └─ Response: Email sent ✅
   │
   └─ ✅ STEP 5: Return Response to Frontend
      └─ { success: true, message: "...", booking }

4. SERVICES called during execution:
   ├─ Booking model → MongoDB insert
   ├─ QRCode library → QR image generation
   ├─ PDFKit → PDF document creation
   └─ Nodemailer → Email sending (Gmail SMTP)

5. EXTERNAL SYSTEMS updated:
   ├─ MongoDB: Booking record created
   ├─ User's Email: Ticket PDF received
   └─ FRONTEND: Confirmation message shown
```

## Error Handling Flow

```
1. ERROR occurs in Controller
   throw new Error("Database connection failed")

2. CONTROLLER doesn't catch it (passes to next middleware)
   → Caught by error handler middleware

3. ERROR HANDLER (middleware/errorHandler.js)
   ├─ Check error type:
   │  ├─ ValidationError → 400 Bad Request
   │  ├─ Duplicate Key Error → 400 Conflict
   │  ├─ JWT Error → 401 Unauthorized
   │  └─ Other → 500 Server Error
   │
   └─ Format response:
      {
        success: false,
        error: "Error message",
        message: "Human-readable message"
      }

4. RESPONSE sent to Frontend
   Status: 400/401/500
   Body: Error details

5. FRONTEND displays error to user
```

## File Organization Benefits

```
config/
  ├─ Centralized configuration
  ├─ Easy to add new services (payment, SMS, etc.)
  └─ Environment variables in one place

models/
  ├─ Single source of truth for data structure
  ├─ Validation rules in one place
  └─ Easy to update schema

controllers/
  ├─ Pure business logic (testable)
  ├─ No HTTP concerns
  ├─ Reusable across routes
  └─ Clear function responsibilities

routes/
  ├─ Clean HTTP definitions
  ├─ Easy to add/remove endpoints
  └─ Parameters validated

middleware/
  ├─ Cross-cutting concerns
  ├─ Error handling
  ├─ Can add: logging, auth, rate-limiting
  └─ Executed in order
```

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│        FRONTEND (Vercel/Netlify)        │
│       (React + Vite + TailwindCSS)      │
└──────────────────┬──────────────────────┘
                   │
                   │ HTTPS
                   │
┌──────────────────▼──────────────────────┐
│     BACKEND (Heroku/Railway/Render)     │
│          (Node.js + Express)            │
│                                         │
│   ├─ server.js (main entry point)       │
│   ├─ config/   (services)               │
│   ├─ models/   (schemas)                │
│   ├─ controllers/ (logic)               │
│   └─ routes/   (endpoints)              │
└──────────────────┬──────────────────────┘
                   │
                   │ TCP Connection
                   │
┌──────────────────▼──────────────────────┐
│    MONGODB ATLAS (Cloud Database)       │
│   (Data persistence & queries)          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  EXTERNAL SERVICES                      │
├─────────────────────────────────────────┤
│ ├─ Gmail (Nodemailer) - Email           │
│ ├─ QRCode (qrcode) - QR generation      │
│ └─ PDFKit (pdfkit) - PDF generation     │
└─────────────────────────────────────────┘
```

---

This architecture makes it easy to:
- ✅ Add new features (new routes + controllers)
- ✅ Modify existing logic (update controllers)
- ✅ Fix bugs (isolated to specific file)
- ✅ Test code (controllers are independent)
- ✅ Scale (separate layers can be optimized)
- ✅ Maintain (clear structure and organization)
