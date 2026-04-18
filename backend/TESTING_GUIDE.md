# Quick Testing Guide - Movie Booking APIs

## 🧪 Testing Your New Endpoints

This guide helps you verify all 18 new/updated endpoints are working correctly.

---

## 📌 Quick Access

### Production API
```
Base URL: https://booking-mm-1.onrender.com
```

### Local Development
```
Base URL: http://localhost:5000
```

---

## 🎬 Test Endpoints

### 1️⃣ Root Endpoint (Check Server Status)

**Command:**
```bash
curl http://localhost:5000/
```

**Expected Response:** JSON with all available endpoints listed

---

## 🎥 Movie Endpoints

### Get All Movies
```bash
curl http://localhost:5000/api/movies
```
**Expected:** Array of movies with count

### Get Movie by ID
```bash
# Replace with actual movie ID
curl http://localhost:5000/api/movies/507f1f77bcf86cd799439011
```
**Expected:** Single movie object

---

## 🏢 Theatre Endpoints

### Get All Theatres
```bash
curl http://localhost:5000/api/theatres
```
**Expected:** Array of all theatres

### Get Unique Cities
```bash
curl http://localhost:5000/api/theatres/cities
```
**Expected:** Array of city names
```json
{
  "success": true,
  "count": 3,
  "data": ["Hyderabad", "Bangalore", "Mumbai"]
}
```

### Get Theatres by City
```bash
curl http://localhost:5000/api/theatres/city/Hyderabad
```
**Expected:** Theatres in Hyderabad

### Get Theatres by City and Movie (NEW!)
```bash
# First get a movie ID from /api/movies
curl "http://localhost:5000/api/theatres?city=Hyderabad&movieId=507f1f77bcf86cd799439011"
```
**Expected:** Only theatres in Hyderabad showing that specific movie

### Get Theatre by ID
```bash
curl http://localhost:5000/api/theatres/507f1f77bcf86cd799439012
```
**Expected:** Single theatre object

---

## 🎞️ Shows Endpoints

### Get All Shows
```bash
curl http://localhost:5000/api/shows
```
**Expected:** Array of shows with populated movie and theatre

### Get Shows by Movie
```bash
curl "http://localhost:5000/api/shows?movieId=507f1f77bcf86cd799439011"
```
**Expected:** Shows for that movie

### Get Shows by Theatre (FIXED!)
```bash
curl "http://localhost:5000/api/shows/theatre/507f1f77bcf86cd799439012"
```
**Expected:** All shows in that theatre, sorted by time

### Get Show by ID
```bash
curl http://localhost:5000/api/shows/507f1f77bcf86cd799439013
```
**Expected:** Single show with full details

### Advanced: Get Shows by Movie + Theatre + Date
```bash
curl "http://localhost:5000/api/shows?movieId=507f1f77bcf86cd799439011&theatreId=507f1f77bcf86cd799439012&date=2024-01-20"
```
**Expected:** Filtered shows

---

## 📱 Complete Booking Flow Test

### Step 1: Get Cities
```bash
curl http://localhost:5000/api/theatres/cities
```
**Save:** City name (e.g., "Hyderabad")

### Step 2: Get Movies
```bash
curl http://localhost:5000/api/movies
```
**Save:** Movie ID (e.g., "507f1f77bcf86cd799439011")

### Step 3: Get Theatres
```bash
curl "http://localhost:5000/api/theatres?city=Hyderabad&movieId=507f1f77bcf86cd799439011"
```
**Save:** Theatre ID (e.g., "507f1f77bcf86cd799439012")

### Step 4: Get Shows
```bash
curl "http://localhost:5000/api/shows?movieId=507f1f77bcf86cd799439011&theatreId=507f1f77bcf86cd799439012"
```
**Save:** Show ID and details

### Step 5: Get Show Details
```bash
curl http://localhost:5000/api/shows/507f1f77bcf86cd799439013
```
**Expected:** Full show with availableSeats, ticketPrice, etc.

---

## 🧪 Using Postman (Optional)

### Import Collection
1. Open Postman
2. Click **Import**
3. Paste this collection JSON:

```json
{
  "info": {
    "name": "Movie Booking API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Movies",
      "item": [
        {
          "name": "Get All Movies",
          "request": {
            "method": "GET",
            "url": "{{base_url}}/api/movies"
          }
        },
        {
          "name": "Get Movie by ID",
          "request": {
            "method": "GET",
            "url": "{{base_url}}/api/movies/{{movieId}}"
          }
        }
      ]
    },
    {
      "name": "Theatres",
      "item": [
        {
          "name": "Get All Theatres",
          "request": {
            "method": "GET",
            "url": "{{base_url}}/api/theatres"
          }
        },
        {
          "name": "Get Cities",
          "request": {
            "method": "GET",
            "url": "{{base_url}}/api/theatres/cities"
          }
        },
        {
          "name": "Get Theatres by City & Movie",
          "request": {
            "method": "GET",
            "url": "{{base_url}}/api/theatres?city=Hyderabad&movieId={{movieId}}"
          }
        },
        {
          "name": "Get Theatre by ID",
          "request": {
            "method": "GET",
            "url": "{{base_url}}/api/theatres/{{theatreId}}"
          }
        }
      ]
    },
    {
      "name": "Shows",
      "item": [
        {
          "name": "Get All Shows",
          "request": {
            "method": "GET",
            "url": "{{base_url}}/api/shows"
          }
        },
        {
          "name": "Get Shows by Theatre",
          "request": {
            "method": "GET",
            "url": "{{base_url}}/api/shows/theatre/{{theatreId}}"
          }
        },
        {
          "name": "Get Show by ID",
          "request": {
            "method": "GET",
            "url": "{{base_url}}/api/shows/{{showId}}"
          }
        },
        {
          "name": "Get Shows with Filters",
          "request": {
            "method": "GET",
            "url": "{{base_url}}/api/shows?movieId={{movieId}}&theatreId={{theatreId}}"
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:5000"
    },
    {
      "key": "movieId",
      "value": ""
    },
    {
      "key": "theatreId",
      "value": ""
    },
    {
      "key": "showId",
      "value": ""
    }
  ]
}
```

---

## ✅ Expected Response Format

All endpoints should return this format:

**Success (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [ ... ]
}
```

**Error (400/404/500):**
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 🔍 Troubleshooting

### Issue: Getting 404 on /api endpoints
**Solution:** 
1. Check if server is running: `npm start`
2. Verify imports in server.js
3. Check route paths match exactly
4. Try restarting: `npm start`

### Issue: Shows not showing movie details
**Solution:** 
- This is automatic via mongoose `.populate()`
- Check that movie ID exists in Movie collection
- Verify Show has reference to movie

### Issue: No shows for theatre
**Solution:**
1. Verify theatre ID exists
2. Check if shows are created with this theatre ID
3. Ensure shows have `isActive: true`

### Issue: Filtering not working
**Solution:**
1. Verify query parameter names match exactly
2. Use proper MongoDB ObjectId format
3. Check controller logic for filter implementation

---

## 📊 Sample Data Queries

### Get Count of Movies
```bash
curl http://localhost:5000/api/movies | grep count
```

### Get All Cities with Theatres
```bash
curl http://localhost:5000/api/theatres/cities
```

### Check a Theatre has Screens
```bash
curl http://localhost:5000/api/theatres/[THEATRE_ID]
# Look for screens array in response
```

### Check Show Availability
```bash
curl http://localhost:5000/api/shows/[SHOW_ID]
# Look for availableSeats field
```

---

## 🚀 Performance Tips

1. **Limit Results:**
   ```bash
   # Future enhancement: Add pagination
   curl "http://localhost:5000/api/movies?page=1&limit=10"
   ```

2. **Cache Shows:**
   - Call `/api/shows/theatre/{theatreId}` once and cache

3. **Batch Requests:**
   - Get cities, then movies, then filter theatres

---

## ✨ What to Verify

### Basic Functionality
- [ ] Root endpoint returns all available endpoints
- [ ] Movies endpoint returns all movies
- [ ] Theatres endpoint returns all theatres
- [ ] Shows endpoint returns all shows

### Filtering
- [ ] Theatres can be filtered by city
- [ ] Theatres can be filtered by city AND movie
- [ ] Shows can be filtered by theatre
- [ ] Shows can be filtered by movie
- [ ] Shows can be filtered by multiple criteria

### Data Integrity
- [ ] Shows have populated movie details
- [ ] Shows have populated theatre details
- [ ] Shows have availableSeats and totalSeats
- [ ] Theatres have screens array
- [ ] Response counts match data array length

### Backward Compatibility
- [ ] `/auth/signup` still works
- [ ] `/auth/login` still works
- [ ] `/save-booking` still works
- [ ] `/booking-history/:username` still works

---

## 🎯 Success Criteria

✅ All 18 endpoints respond with 200/201 status
✅ Responses follow consistent format
✅ Filtering works correctly
✅ Data is properly populated
✅ No breaking changes to existing endpoints
✅ Performance is acceptable

---

## 📝 Response Examples

### Get Theatres by City + Movie
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "PVR Cinemas",
      "city": "Hyderabad",
      "address": "Banjara Hills",
      "phone": "040-1234-5678",
      "totalScreens": 3,
      "screens": [
        {
          "screenName": "Screen 1",
          "totalSeats": 150
        }
      ]
    }
  ]
}
```

### Get Shows by Theatre
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "movie": {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Sankranti Ki Vastunam",
        "duration": 142,
        "genre": ["Drama", "Comedy"]
      },
      "theatre": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "PVR Cinemas"
      },
      "showTime": "2024-01-20T10:00:00.000Z",
      "ticketPrice": 150,
      "availableSeats": 120,
      "totalSeats": 150
    }
  ]
}
```

---

## 🎬 Next: Frontend Integration

Once you've verified all endpoints work, update your React components:

```javascript
// src/components/SelectLocationPage.jsx
const cities = await fetch(`${API_URL}/api/theatres/cities`).then(r => r.json());

// Get theatres for selected city and movie
const theatres = await fetch(
  `${API_URL}/api/theatres?city=${city}&movieId=${movieId}`
).then(r => r.json());

// Get shows for selected theatre
const shows = await fetch(
  `${API_URL}/api/shows/theatre/${theatreId}`
).then(r => r.json());
```

---

## 📞 Have Issues?

1. Check server is running: `npm start`
2. Verify MongoDB is connected
3. Check .env file has correct credentials
4. Look for errors in terminal output
5. Check response format matches examples above

---

**API Version:** 2.0  
**Status:** Production Ready ✅  
**Last Updated:** 2026-04-18
