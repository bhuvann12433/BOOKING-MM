# Backend Refactoring Verification Checklist ✅

Use this checklist to verify that the refactored backend is working correctly.

## Pre-Deployment Verification

### 1. File Structure
- [x] `config/database.js` - Database connection
- [x] `config/email.js` - Email configuration
- [x] `models/User.js` - User schema with improved docs
- [x] `models/Booking.js` - Original booking model
- [x] `models/Seat.js` - Original seat model
- [x] `controllers/authController.js` - Auth logic
- [x] `controllers/seatController.js` - Seat logic (new + legacy)
- [x] `controllers/bookingController.js` - Booking logic (new + legacy + email)
- [x] `routes/authRoutes.js` - Auth endpoints
- [x] `routes/seatRoutes.js` - Seat endpoints
- [x] `routes/bookingRoutes.js` - Booking endpoints
- [x] `middleware/errorHandler.js` - Error handling
- [x] `server.js` - Refactored main file

### 2. Configuration Files
- [ ] `.env` file exists with required variables:
  - [ ] `MONGO_URI=mongodb+srv://...`
  - [ ] `JWT_SECRET=your-secret-key`
  - [ ] `PORT=5000`
  - [ ] `EMAIL_USER=your-email@gmail.com`
  - [ ] `EMAIL_PASS=your-app-password`
  - [ ] `NODE_ENV=development`

### 3. Dependencies Installed
```bash
npm install
```
Verify these packages are installed:
- [ ] express (4.21.2+)
- [ ] mongoose (8.9.7+)
- [ ] bcryptjs (latest)
- [ ] jsonwebtoken (latest)
- [ ] cors (latest)
- [ ] dotenv (latest)
- [ ] nodemailer (latest)
- [ ] pdfkit (latest)
- [ ] qrcode (latest)

Check with:
```bash
npm list
```

## Local Testing

### 4. Start the Server
```bash
npm start
```

Expected output:
```
╔═══════════════════════════════════════════╗
║   🎬 MOVIE BOOKING BACKEND SERVER         ║
║   ✅ Status: Running                      ║
║   🔗 URL: http://localhost:5000           ║
║   📚 API Docs: http://localhost:5000/     ║
╚═══════════════════════════════════════════╝
```

- [ ] Server starts without errors
- [ ] No connection errors to MongoDB
- [ ] No warnings in console

### 5. Health Check Endpoint
```
GET http://localhost:5000/
```

Expected response:
```json
{
  "message": "🎬 Movie Booking System API",
  "version": "2.0.0",
  "status": "running ✅",
  "endpoints": { ... }
}
```

- [ ] Endpoint responds with 200 status
- [ ] Returns JSON with correct structure
- [ ] All endpoint paths listed

## API Endpoint Testing

### 6. Authentication Routes

#### 6.1 Signup
```bash
curl -X POST http://localhost:5000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

Expected response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "username": "testuser",
  "email": "test@example.com"
}
```

- [ ] Status: 201 Created
- [ ] Returns JWT token
- [ ] User created in MongoDB

#### 6.2 Login
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Expected response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "username": "testuser",
  "email": "test@example.com"
}
```

- [ ] Status: 200 OK
- [ ] Returns JWT token
- [ ] Token is valid (can decode with JWT_SECRET)

### 7. Seat Routes

#### 7.1 Get All Seats
```bash
curl http://localhost:5000/seats
```

Expected response:
```json
[
  { "_id": "...", "section": "A", "row": 1, "col": 1, "booked": false },
  { "_id": "...", "section": "A", "row": 1, "col": 2, "booked": false },
  ...
]
```

- [ ] Status: 200 OK
- [ ] Returns array of seats
- [ ] Each seat has: _id, section, row, col, booked

#### 7.2 Book a Seat
```bash
curl -X POST http://localhost:5000/seats/book \
  -H "Content-Type: application/json" \
  -d '{
    "section": "A",
    "row": "1",
    "col": "1"
  }'
```

Expected response:
```json
{ "message": "Seat booked ✅" }
```

- [ ] Status: 200 OK
- [ ] Seat updated in MongoDB (booked = true)
- [ ] Booking second time returns error

### 8. Booking Routes (Legacy)

#### 8.1 Create Booking with Email
```bash
curl -X POST http://localhost:5000/bookings/save \
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

Expected response:
```json
{
  "success": true,
  "message": "Booking created and email sent ✅",
  "booking": { ... }
}
```

- [ ] Status: 201 Created
- [ ] Booking created in MongoDB
- [ ] Email sent to user (check spam folder)
- [ ] PDF ticket attached to email
- [ ] PDF contains QR code

#### 8.2 Get Booking History
```bash
curl http://localhost:5000/bookings/history/testuser
```

Expected response:
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "...",
      "username": "testuser",
      "movieTitle": "Sankranti Ki Vastunam",
      ...
    }
  ]
}
```

- [ ] Status: 200 OK
- [ ] Returns array of bookings for user
- [ ] Most recent booking first (sorted by createdAt)
- [ ] Count matches number of bookings

## Database Verification

### 9. MongoDB Atlas

- [ ] Connect to MongoDB Atlas cluster
- [ ] Check `users` collection:
  - [ ] Contains user from signup
  - [ ] Password is hashed (starts with `$2b$`)
  
- [ ] Check `bookings` collection:
  - [ ] Contains booking from POST /save-booking
  - [ ] Has all required fields
  
- [ ] Check `seats` collection:
  - [ ] Contains all seat documents
  - [ ] `booked` field reflects bookings

## Email Testing

### 10. Email Functionality

- [ ] Check email inbox for ticket
- [ ] Email contains:
  - [ ] Movie title
  - [ ] Theater name
  - [ ] Date and time
  - [ ] Seat numbers
  - [ ] Total price
  - [ ] PDF attachment
  - [ ] Professional formatting

- [ ] Check PDF ticket contains:
  - [ ] Movie details
  - [ ] Theater details
  - [ ] Seat information
  - [ ] QR code (scannable)
  - [ ] Price information

- [ ] If no email received:
  - [ ] Check spam/junk folder
  - [ ] Verify EMAIL_USER and EMAIL_PASS in .env
  - [ ] Check Gmail account: Settings → Security → App Passwords
  - [ ] Verify "Less secure apps" is enabled (if not using App Password)

## Error Handling

### 11. Error Cases

#### 11.1 Invalid Email on Signup
```bash
curl -X POST http://localhost:5000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test",
    "email": "invalid",
    "password": "123"
  }'
```
- [ ] Returns error with status 400+
- [ ] Error message is helpful

#### 11.2 Duplicate Email
```bash
curl -X POST http://localhost:5000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password"
  }'
```
- [ ] Returns 400 error
- [ ] Message: "email already exists"

#### 11.3 Invalid Seat Booking
```bash
curl -X POST http://localhost:5000/seats/book \
  -H "Content-Type: application/json" \
  -d '{
    "section": "Z",
    "row": "99",
    "col": "99"
  }'
```
- [ ] Returns 404 error
- [ ] Message: "Seat not found"

#### 11.4 Booking Already Booked Seat
Book same seat twice:
- [ ] First time: Success
- [ ] Second time: Error "Seat already booked"

## Frontend Integration

### 12. Frontend Testing

Make sure these endpoints still work with your React app:

- [ ] Signup page → POST /auth/signup
- [ ] Login page → POST /auth/login  
- [ ] Seat selection → GET /seats
- [ ] Seat booking → POST /seats/book
- [ ] Final checkout → POST /save-booking
- [ ] Booking history → GET /booking-history/:username

Test with actual frontend:
1. Open frontend in browser
2. Go through complete booking flow
3. Verify no CORS errors
4. Check console for JavaScript errors
5. Verify email received with PDF

## Performance Checks

### 13. Response Times

- [ ] GET /seats responds in < 500ms
- [ ] POST /auth/signup responds in < 1000ms (includes password hashing)
- [ ] POST /save-booking responds in < 2000ms (includes email sending)
- [ ] GET /booking-history/:username responds in < 500ms

## Cleanup

### 14. Code Review

- [ ] No console.log statements left in production code
- [ ] All error handling in place
- [ ] No hardcoded values (use .env)
- [ ] All imports use .js extensions
- [ ] Code follows consistent style
- [ ] Comments are helpful and up-to-date

### 15. Security Check

- [ ] Passwords are hashed with bcryptjs
- [ ] JWT tokens used for authentication
- [ ] Sensitive data not logged
- [ ] CORS properly configured
- [ ] No secrets in version control (.env in .gitignore)
- [ ] SQL injection not possible (using Mongoose)
- [ ] XSS protected (not using eval)

## Deployment Readiness

### 16. Pre-Deployment Checklist

Before deploying to production:

- [ ] All tests passing
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Security review complete
- [ ] .env file not in git repo
- [ ] .env.example has template values
- [ ] Database backups configured
- [ ] Error logging set up
- [ ] CORS configured for production domain
- [ ] HTTPS enabled on production
- [ ] Rate limiting considered
- [ ] Database indexes created for performance

## Rollback Plan

If issues occur in production:

1. [ ] Keep previous version of server.js accessible
2. [ ] Switch back with: `git revert` or `git checkout`
3. [ ] Monitor error logs
4. [ ] Check database for corruption
5. [ ] Notify users if data affected

## Documentation

### 17. Documentation Review

- [x] REFACTORING_COMPLETE.md - Overview of changes
- [x] ARCHITECTURE.md - System design and flow
- [x] This file - Verification checklist
- [ ] Comments in code - Clear and helpful
- [ ] README.md - Updated with new structure
- [ ] API_REFERENCE.md - All endpoints documented

## Success Criteria

✅ **Refactoring is successful when:**

1. All 13 API endpoints work identically to before
2. No database schema changes required
3. Frontend requires zero code changes
4. Email functionality works with PDF + QR
5. Error handling is consistent
6. Code is more maintainable
7. Performance is equivalent or better
8. Security is maintained

## Troubleshooting Guide

### Issue: "Cannot find module 'express'"
```bash
npm install
```

### Issue: "MongoDB connection failed"
Check .env:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
```

### Issue: "Email not sending"
1. Check .env for EMAIL_USER and EMAIL_PASS
2. Use Gmail App Password, not regular password
3. Enable "Less secure app access" if needed
4. Check spam folder

### Issue: "CORS error"
Update server.js:
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### Issue: "Token invalid"
Regenerate JWT_SECRET in .env and re-login

---

**All checks passing?** 🎉 Your backend is ready for production!

**Still seeing issues?** Check ARCHITECTURE.md for detailed flow diagrams.
