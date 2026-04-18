# Movie Booking System - Backend Setup Guide

## 📁 Folder Structure

```
backend/
├── config/
│   └── db.js                 # MongoDB connection utility
├── models/
│   ├── User.js              # User model with password hashing
│   ├── Movie.js             # Movie model
│   ├── Theatre.js           # Theatre model
│   ├── Show.js              # Show model (references Movie & Theatre)
│   ├── Seat.js              # Seat model (references Show)
│   └── Booking.js           # Booking model (references all above)
├── controllers/
│   ├── movieController.js   # Movie CRUD operations
│   ├── theatreController.js # Theatre operations
│   ├── showController.js    # Show filtering & management
│   ├── seatController.js    # Seat availability & layout
│   └── bookingController.js # Booking creation & management
├── routes/
│   ├── movies.js            # Movie endpoints
│   ├── theatres.js          # Theatre endpoints
│   ├── shows.js             # Show endpoints
│   ├── seats.js             # Seat endpoints
│   └── bookings.js          # Booking endpoints
├── scripts/
│   └── seed.js              # Database seeding script
├── .env                     # Environment variables (DO NOT COMMIT)
├── .env.example             # Template for .env file
├── package.json
└── server.js                # Main server file
```

## 🔧 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the backend directory:

```env
# MongoDB Atlas Connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=your-secret-key@2026

# Server Port
PORT=5000

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Node Environment
NODE_ENV=development
```

### 3. MongoDB Atlas Setup

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new project and cluster
4. Add IP whitelist (allow 0.0.0.0/0 for development)
5. Create database user
6. Copy connection string and add to `.env`

### 4. Seed Database with Sample Data

```bash
node scripts/seed.js
```

This will create:
- 3 sample movies
- 2 sample theatres
- 3 sample shows
- Multiple seats for the first show
- 1 test user

### 5. Start the Server

```bash
npm start
```

Server will run on `http://localhost:5000`

## 📊 Database Models & Relationships

### Movie Model
```javascript
{
  title: String,
  description: String,
  duration: Number,
  genre: [String],
  rating: Number (0-10),
  releaseDate: Date,
  posterUrl: String,
  language: String,
  isActive: Boolean
}
```

### Theatre Model
```javascript
{
  name: String,
  city: String,
  address: String,
  phone: String,
  totalScreens: Number,
  screens: [{ screenName, totalSeats }],
  isActive: Boolean
}
```

### Show Model
```javascript
{
  movie: ObjectId → Movie,        // Reference to Movie
  theatre: ObjectId → Theatre,    // Reference to Theatre
  screen: String,
  showTime: Date,
  ticketPrice: Number,
  totalSeats: Number,
  availableSeats: Number,
  language: String,
  format: String (2D/3D/IMAX),
  isActive: Boolean
}
```

### Seat Model
```javascript
{
  show: ObjectId → Show,          // Reference to Show
  seatNumber: String (e.g., "A1"),
  row: String (A-E),
  col: Number,
  status: String (available/booked/blocked),
  bookedBy: ObjectId → Booking,
  timestamps: true
}
```

### Booking Model
```javascript
{
  user: ObjectId → User,
  show: ObjectId → Show,
  movie: ObjectId → Movie,
  theatre: ObjectId → Theatre,
  seats: [ObjectId → Seat],
  totalAmount: Number,
  paymentStatus: String (pending/completed/failed/cancelled),
  bookingStatus: String (confirmed/cancelled/expired),
  bookingReference: String (auto-generated),
  qrCode: String,
  email: String,
  phone: String,
  timestamps: true
}
```

### User Model
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed with bcrypt),
  firstName: String,
  lastName: String,
  phone: String,
  isAdmin: Boolean,
  isActive: Boolean,
  timestamps: true
}
```

## 🔌 API Endpoints

### Movies
- `GET /api/movies` - Get all active movies
- `GET /api/movies/:id` - Get single movie
- `POST /api/movies` - Create movie (admin)
- `PUT /api/movies/:id` - Update movie (admin)
- `DELETE /api/movies/:id` - Delete movie (admin)

### Theatres
- `GET /api/theatres` - Get all theatres
- `GET /api/theatres/cities` - Get unique cities
- `GET /api/theatres/city/:city` - Get theatres by city
- `GET /api/theatres/:id` - Get single theatre
- `POST /api/theatres` - Create theatre (admin)
- `PUT /api/theatres/:id` - Update theatre (admin)

### Shows
- `GET /api/shows?movieId=...&theatreId=...&date=...` - Filter shows
- `GET /api/shows/:id` - Get single show
- `GET /api/shows/theatre/:theatreId` - Get shows by theatre
- `POST /api/shows` - Create show (admin)
- `PUT /api/shows/:id` - Update show (admin)

### Seats
- `GET /api/seats/layout/:showId` - Get seat layout
- `GET /api/seats/available/:showId` - Get available seats
- `GET /api/seats/booked/:showId` - Get booked seats
- `POST /api/seats/check-availability` - Check if seats available

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/user/:userId` - Get user bookings
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id/cancel` - Cancel booking

## 🔐 Security Best Practices

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Use `.env.example`** - Template showing required variables
3. **Hash passwords** - Using bcryptjs (already implemented in User model)
4. **Validate input** - All models have required field validation
5. **Error handling** - All endpoints have try-catch blocks
6. **CORS enabled** - Allow frontend to communicate with backend
7. **MongoDB connection** - Secure connection with Atlas

## 📝 Example Booking Flow

1. **User selects location**
   ```
   GET /api/theatres/cities → Get all cities
   GET /api/theatres/city/Hyderabad → Get theatres in city
   ```

2. **User selects movie and show**
   ```
   GET /api/movies → Get all movies
   GET /api/shows?movieId=...&theatreId=... → Get available shows
   ```

3. **User views seat layout**
   ```
   GET /api/seats/layout/:showId → Get seat arrangement
   GET /api/seats/available/:showId → Get available seats only
   ```

4. **User books seats**
   ```
   POST /api/bookings {
     userId, showId, seatIds, email, phone
   } → Creates booking and updates seats
   ```

5. **User views booking history**
   ```
   GET /api/bookings/user/:userId → Get all user bookings
   GET /api/bookings/:id → Get booking details with QR code
   ```

## 🐛 Troubleshooting

### MongoDB Connection Error
- Check MONGO_URI in .env
- Verify IP is whitelisted in MongoDB Atlas
- Ensure network connection is stable

### Port Already in Use
```bash
# Change PORT in .env or kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### Seed Script Fails
- Check MongoDB connection first
- Ensure all dependencies are installed
- Run with: `node scripts/seed.js`

## 📦 Dependencies Used

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cors** - Cross-origin requests
- **dotenv** - Environment variables
- **nodemailer** - Email sending
- **pdfkit** - PDF generation
- **qrcode** - QR code generation

## 🚀 Next Steps

1. Add JWT authentication middleware
2. Add admin role verification
3. Implement payment gateway integration
4. Add email notifications
5. Generate PDF tickets with QR codes
6. Add rate limiting
7. Add input validation middleware
8. Deploy to production server

## 📞 Support

For issues or questions, refer to:
- MongoDB Docs: https://docs.mongodb.com
- Mongoose Docs: https://mongoosejs.com
- Express Docs: https://expressjs.com
