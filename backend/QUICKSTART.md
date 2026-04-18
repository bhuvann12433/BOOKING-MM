# 🚀 Quick Start Checklist

Complete these steps to get your MongoDB Atlas backend running:

## ✅ Step 1: MongoDB Atlas Setup (5 minutes)

- [ ] Go to https://www.mongodb.com/cloud/atlas
- [ ] Create a free account
- [ ] Create a new Project
- [ ] Create a new Cluster (M0 Free tier is fine for development)
- [ ] Wait for cluster to be created (5-10 minutes)
- [ ] Click "Connect" button
- [ ] Choose "Connect your application"
- [ ] Select Node.js driver
- [ ] Copy the connection string

**Connection String Format:**
```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority&appName=Cluster0
```

## ✅ Step 2: Environment Setup (2 minutes)

In your backend directory:

```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env and add your MongoDB Atlas connection string
```

Your `.env` should look like:
```env
MONGO_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/movietickets?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=movieAppSecret@2026
PORT=5000
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=development
```

## ✅ Step 3: Install Dependencies (2 minutes)

```bash
cd backend
npm install
```

## ✅ Step 4: Seed Database (1 minute)

```bash
npm run seed
```

Expected output:
```
✅ Connected to MongoDB
🗑️  Cleared existing data
🎬 Created movies: 3
🎭 Created theatres: 2
🎪 Created shows: 3
💺 Created seats: 150
👤 Created test user

✅ Database seeded successfully!
```

## ✅ Step 5: Start Server (1 minute)

```bash
npm start
```

You should see:
```
╔════════════════════════════════════════╗
║  🎬 Movie Booking Backend API          ║
║  Listening on: http://localhost:5000   ║
║  Environment: development              ║
╚════════════════════════════════════════╝
```

## ✅ Step 6: Test API (2 minutes)

Open a new terminal and test:

```bash
# Test root endpoint
curl http://localhost:5000

# Get all movies
curl http://localhost:5000/api/movies

# Get all theatres
curl http://localhost:5000/api/theatres

# Get cities
curl http://localhost:5000/api/theatres/cities
```

## 📁 Project Structure Created

```
backend/
├── config/
│   └── db.js                    ✅ New
├── models/
│   ├── User.js                  ✅ New (improved)
│   ├── Movie.js                 ✅ New
│   ├── Theatre.js               ✅ New
│   ├── Show.js                  ✅ New
│   ├── Seat.js                  ✅ Updated (with ObjectId refs)
│   └── Booking.js               ✅ Updated (with ObjectId refs)
├── controllers/
│   ├── movieController.js       ✅ New
│   ├── theatreController.js     ✅ New
│   ├── showController.js        ✅ New
│   ├── seatController.js        ✅ New
│   └── bookingController.js     ✅ New
├── routes/
│   ├── movies.js                ✅ New
│   ├── theatres.js              ✅ New
│   ├── shows.js                 ✅ New
│   ├── seats.js                 ✅ New
│   └── bookings.js              ✅ New
├── scripts/
│   └── seed.js                  ✅ New
├── .env                         📝 Edit with your keys
├── .env.example                 ✅ New (reference template)
├── server-updated.js            ✅ New (improved version)
├── SETUP_GUIDE.md               ✅ New
├── API_REFERENCE.md             ✅ New
└── package.json                 ✅ Updated (with seed script)
```

## 🎯 Key Features Implemented

✅ **Models with ObjectId References**
- Movie ← Show ← Seat ← Booking
- Theatre ← Show ← Seat ← Booking
- User ← Booking

✅ **RESTful API Endpoints**
- /api/movies - Full CRUD
- /api/theatres - Query by city
- /api/shows - Filter by movie/theatre/date
- /api/seats - Layout, availability, booking status
- /api/bookings - Create, view, cancel

✅ **Database Features**
- Password hashing with bcryptjs
- JWT authentication
- Automatic timestamps
- Unique constraints
- Pre-save hooks (auto-generate booking reference)

✅ **Production Ready**
- Error handling on all endpoints
- Input validation
- Secure .env configuration
- Proper HTTP status codes
- Structured folder organization

## 🔄 Next Development Steps

### For Backend:
1. Add authentication middleware to protect routes
2. Implement admin verification
3. Add payment gateway integration (Stripe, Razorpay)
4. Implement pagination for large datasets
5. Add rate limiting
6. Set up logging system
7. Add unit tests

### For Frontend Integration:
1. Update React components to use new API endpoints
2. Implement seat selection UI with real-time availability
3. Add booking confirmation screen
4. Implement payment processing
5. Add booking history view
6. Show booking QR code

## 📊 Database Collections

After seeding, your MongoDB will have:

| Collection | Count | Purpose |
|-----------|-------|---------|
| movies | 3 | Store movie information |
| theatres | 2 | Store theatre details |
| shows | 3 | Link movies to theatres with timings |
| seats | 150 | Individual seat management |
| bookings | 0 | User bookings (starts empty) |
| users | 1 | Test user (testuser@example.com) |

## 🧪 Test User Credentials

After running seed script:

- **Username:** testuser
- **Email:** test@example.com
- **Password:** password123

Use these to test login/signup functionality!

## ⚠️ Important Notes

1. **Keep .env secure** - Never commit to git
2. **MongoDB Atlas limits** - Free tier has 512MB storage
3. **Email configuration** - Requires Gmail app-specific password
4. **CORS enabled** - Frontend can communicate with backend on port 5000
5. **Development mode** - NODE_ENV=development shows detailed error messages

## 🔗 Useful Commands

```bash
# Start server in development (auto-reload on file changes)
npm run dev

# Seed database with sample data
npm run seed

# Check if MongoDB is connected
# Server logs will show "✅ MongoDB Connected"
```

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| "MongoDB Connection Error" | Check MONGO_URI in .env |
| "Port 5000 already in use" | Change PORT in .env or kill process |
| "Cannot find module" | Run `npm install` |
| "Seed script fails" | Ensure MongoDB connection works first |
| "Email not sending" | Check EMAIL_USER and EMAIL_PASS in .env |

## 📞 Need Help?

1. Check SETUP_GUIDE.md for detailed documentation
2. Review API_REFERENCE.md for endpoint examples
3. Check server console for error messages
4. Test endpoints with Postman or Thunder Client
5. Verify .env variables are set correctly

---

## ✨ You're All Set!

Your Movie Booking Backend is now ready to use!

**Next:** Connect your React frontend to the API endpoints documented in API_REFERENCE.md

Happy coding! 🎬🍿
