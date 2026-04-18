# Movie Booking System - REST API Documentation

> Complete API reference for the enhanced movie ticket booking backend

## Base URL

```
Production: https://booking-mm-1.onrender.com
Development: http://localhost:5000
```

---

## 🎬 1. Movies Endpoints

### Get All Movies

```http
GET /api/movies
```

**Description:** Retrieve all active movies in the system

**Query Parameters:** None

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Sankranti Ki Vastunam",
      "description": "A Telugu drama film",
      "duration": 142,
      "genre": ["Drama", "Comedy"],
      "rating": 7.5,
      "releaseDate": "2024-01-10T00:00:00.000Z",
      "posterUrl": "https://...",
      "language": "Telugu",
      "isActive": true,
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-01-01T10:00:00.000Z"
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Movies retrieved successfully
- `500 Internal Server Error` - Server error

**Example cURL:**
```bash
curl -X GET "http://localhost:5000/api/movies"
```

---

### Get Movie by ID

```http
GET /api/movies/:id
```

**Description:** Retrieve a specific movie by its ID

**Path Parameters:**
- `id` (required) - Movie MongoDB ObjectId

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Sankranti Ki Vastunam",
    "description": "A Telugu drama film",
    "duration": 142,
    "genre": ["Drama", "Comedy"],
    "rating": 7.5,
    "releaseDate": "2024-01-10T00:00:00.000Z",
    "posterUrl": "https://...",
    "language": "Telugu",
    "isActive": true,
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z"
  }
}
```

**Status Codes:**
- `200 OK` - Movie found
- `404 Not Found` - Movie not found
- `500 Internal Server Error` - Server error

**Example cURL:**
```bash
curl -X GET "http://localhost:5000/api/movies/507f1f77bcf86cd799439011"
```

---

### Create Movie (Admin)

```http
POST /api/movies
```

**Description:** Create a new movie (admin only)

**Request Body:**
```json
{
  "title": "Sankranti Ki Vastunam",
  "description": "A Telugu drama film",
  "duration": 142,
  "genre": ["Drama", "Comedy"],
  "rating": 7.5,
  "releaseDate": "2024-01-10T00:00:00.000Z",
  "posterUrl": "https://...",
  "language": "Telugu",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Sankranti Ki Vastunam",
    ...
  }
}
```

**Status Codes:**
- `201 Created` - Movie created successfully
- `400 Bad Request` - Validation error
- `500 Internal Server Error` - Server error

---

### Update Movie (Admin)

```http
PUT /api/movies/:id
```

**Description:** Update an existing movie

**Path Parameters:**
- `id` (required) - Movie MongoDB ObjectId

**Request Body:**
```json
{
  "title": "Updated Title",
  "rating": 8.0
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Updated Title",
    ...
  }
}
```

**Status Codes:**
- `200 OK` - Movie updated successfully
- `400 Bad Request` - Validation error
- `500 Internal Server Error` - Server error

---

### Delete Movie (Admin)

```http
DELETE /api/movies/:id
```

**Description:** Delete a movie

**Path Parameters:**
- `id` (required) - Movie MongoDB ObjectId

**Response:**
```json
{
  "success": true,
  "message": "Movie deleted successfully"
}
```

**Status Codes:**
- `200 OK` - Movie deleted successfully
- `500 Internal Server Error` - Server error

---

## 🏢 2. Theatres Endpoints

### Get All Theatres

```http
GET /api/theatres
```

**Description:** Retrieve all active theatres

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "PVR Cinemas",
      "city": "Hyderabad",
      "address": "Banjara Hills, Hyderabad",
      "phone": "040-1234-5678",
      "totalScreens": 3,
      "screens": [
        {
          "screenName": "Screen 1",
          "totalSeats": 150
        }
      ],
      "isActive": true,
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-01-01T10:00:00.000Z"
    }
  ]
}
```

**Example cURL:**
```bash
curl -X GET "http://localhost:5000/api/theatres"
```

---

### Get Theatres by City and Movie

```http
GET /api/theatres?city=cityName&movieId=movieId
```

**Description:** Get theatres where a specific movie is available in a given city

**Query Parameters:**
- `city` (required) - City name (e.g., "Hyderabad", "Bangalore")
- `movieId` (optional) - Movie MongoDB ObjectId. If provided, only returns theatres with active shows for that movie

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "PVR Cinemas",
      "city": "Hyderabad",
      "address": "Banjara Hills, Hyderabad",
      "phone": "040-1234-5678",
      "totalScreens": 3,
      "screens": [
        {
          "screenName": "Screen 1",
          "totalSeats": 150
        }
      ],
      "isActive": true,
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-01-01T10:00:00.000Z"
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Theatres retrieved
- `400 Bad Request` - City parameter missing
- `500 Internal Server Error` - Server error

**Example cURL:**
```bash
# Get all theatres in Hyderabad
curl -X GET "http://localhost:5000/api/theatres?city=Hyderabad"

# Get theatres in Hyderabad where movie is available
curl -X GET "http://localhost:5000/api/theatres?city=Hyderabad&movieId=507f1f77bcf86cd799439011"
```

---

### Get Theatres by City (Path Parameter)

```http
GET /api/theatres/city/:city
```

**Description:** Get all theatres in a specific city

**Path Parameters:**
- `city` (required) - City name

**Response:** Same as Get All Theatres

**Example cURL:**
```bash
curl -X GET "http://localhost:5000/api/theatres/city/Hyderabad"
```

---

### Get Unique Cities

```http
GET /api/theatres/cities
```

**Description:** Get list of all cities where theatres are available

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": ["Hyderabad", "Bangalore", "Mumbai"]
}
```

**Example cURL:**
```bash
curl -X GET "http://localhost:5000/api/theatres/cities"
```

---

### Get Theatre by ID

```http
GET /api/theatres/:id
```

**Description:** Get a specific theatre by its ID

**Path Parameters:**
- `id` (required) - Theatre MongoDB ObjectId

**Example cURL:**
```bash
curl -X GET "http://localhost:5000/api/theatres/507f1f77bcf86cd799439012"
```

---

### Create Theatre (Admin)

```http
POST /api/theatres
```

**Description:** Create a new theatre

**Request Body:**
```json
{
  "name": "PVR Cinemas",
  "city": "Hyderabad",
  "address": "Banjara Hills, Hyderabad",
  "phone": "040-1234-5678",
  "totalScreens": 3,
  "screens": [
    {
      "screenName": "Screen 1",
      "totalSeats": 150
    }
  ],
  "isActive": true
}
```

---

### Update Theatre (Admin)

```http
PUT /api/theatres/:id
```

**Description:** Update an existing theatre

**Path Parameters:**
- `id` (required) - Theatre MongoDB ObjectId

**Request Body:**
```json
{
  "name": "Updated Theatre Name",
  "phone": "040-9999-8888"
}
```

---

## 🎥 3. Shows Endpoints

### Get All Shows (with filters)

```http
GET /api/shows
```

**Description:** Retrieve shows with optional filters for movie, theatre, and date

**Query Parameters:**
- `movieId` (optional) - Filter by movie ID
- `theatreId` (optional) - Filter by theatre ID
- `date` (optional) - Filter by date (YYYY-MM-DD format)

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "movie": {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Sankranti Ki Vastunam",
        "duration": 142,
        "genre": ["Drama", "Comedy"],
        "language": "Telugu"
      },
      "theatre": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "PVR Cinemas",
        "city": "Hyderabad",
        "address": "Banjara Hills, Hyderabad"
      },
      "screen": "Screen 1",
      "showTime": "2024-01-20T10:00:00.000Z",
      "ticketPrice": 150,
      "totalSeats": 150,
      "availableSeats": 120,
      "language": "Telugu",
      "format": "2D",
      "isActive": true,
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-01-01T10:00:00.000Z"
    }
  ]
}
```

**Example cURL:**
```bash
# Get all shows
curl -X GET "http://localhost:5000/api/shows"

# Get shows for a specific movie
curl -X GET "http://localhost:5000/api/shows?movieId=507f1f77bcf86cd799439011"

# Get shows in a specific theatre
curl -X GET "http://localhost:5000/api/shows?theatreId=507f1f77bcf86cd799439012"

# Get shows for a specific movie in a specific theatre on a specific date
curl -X GET "http://localhost:5000/api/shows?movieId=507f1f77bcf86cd799439011&theatreId=507f1f77bcf86cd799439012&date=2024-01-20"
```

---

### Get Show by ID

```http
GET /api/shows/:id
```

**Description:** Get a specific show with full details

**Path Parameters:**
- `id` (required) - Show MongoDB ObjectId

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "movie": { ... },
    "theatre": { ... },
    "screen": "Screen 1",
    "showTime": "2024-01-20T10:00:00.000Z",
    "ticketPrice": 150,
    "totalSeats": 150,
    "availableSeats": 120,
    "language": "Telugu",
    "format": "2D",
    "isActive": true
  }
}
```

**Example cURL:**
```bash
curl -X GET "http://localhost:5000/api/shows/507f1f77bcf86cd799439013"
```

---

### Get Shows by Theatre

```http
GET /api/shows/theatre/:theatreId
```

**Description:** Get all upcoming shows for a specific theatre

**Path Parameters:**
- `theatreId` (required) - Theatre MongoDB ObjectId

**Response:** Same format as Get All Shows, filtered by theatre

**Example cURL:**
```bash
curl -X GET "http://localhost:5000/api/shows/theatre/507f1f77bcf86cd799439012"
```

---

### Create Show (Admin)

```http
POST /api/shows
```

**Description:** Create a new show

**Request Body:**
```json
{
  "movie": "507f1f77bcf86cd799439011",
  "theatre": "507f1f77bcf86cd799439012",
  "screen": "Screen 1",
  "showTime": "2024-01-20T10:00:00.000Z",
  "ticketPrice": 150,
  "totalSeats": 150,
  "language": "Telugu",
  "format": "2D",
  "isActive": true
}
```

**Note:** `availableSeats` is automatically set to `totalSeats` for new shows

**Status Codes:**
- `201 Created` - Show created successfully
- `404 Not Found` - Invalid movie or theatre ID
- `400 Bad Request` - Validation error

---

### Update Show (Admin)

```http
PUT /api/shows/:id
```

**Description:** Update an existing show

**Path Parameters:**
- `id` (required) - Show MongoDB ObjectId

**Request Body:**
```json
{
  "ticketPrice": 200,
  "availableSeats": 50
}
```

---

## Complete Example: Movie Booking Flow

### Step 1: Get Cities

```bash
curl -X GET "http://localhost:5000/api/theatres/cities"
# Response: ["Hyderabad", "Bangalore", "Mumbai"]
```

### Step 2: Get Movies

```bash
curl -X GET "http://localhost:5000/api/movies"
# Response: List of all movies
```

### Step 3: Get Theatres by City and Movie

```bash
curl -X GET "http://localhost:5000/api/theatres?city=Hyderabad&movieId=507f1f77bcf86cd799439011"
# Response: Theatres in Hyderabad where this movie is showing
```

### Step 4: Get Shows for Selected Theatre

```bash
curl -X GET "http://localhost:5000/api/shows?theatreId=507f1f77bcf86cd799439012&movieId=507f1f77bcf86cd799439011"
# Response: All shows for this movie in this theatre
```

### Step 5: Get Show Details

```bash
curl -X GET "http://localhost:5000/api/shows/507f1f77bcf86cd799439013"
# Response: Full show details with seat availability
```

### Step 6: Book Seats (Use existing booking endpoint)

```bash
curl -X POST "http://localhost:5000/save-booking" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "movieTitle": "Sankranti Ki Vastunam",
    "city": "Hyderabad",
    "theaterName": "PVR Cinemas",
    "date": "2024-01-20",
    "time": "10:00 AM",
    "seats": ["A1", "A2"]
  }'
```

---

## Error Responses

### Bad Request (400)

```json
{
  "success": false,
  "message": "City parameter is required"
}
```

### Not Found (404)

```json
{
  "success": false,
  "message": "Movie not found"
}
```

### Server Error (500)

```json
{
  "success": false,
  "message": "Error message details"
}
```

---

## Response Format

All responses follow this format:

```json
{
  "success": true|false,
  "count": number,
  "data": object|array,
  "message": "optional message"
}
```

---

## Key Features

✅ **Population Support** - Shows include full movie and theatre details
✅ **Filtering** - Shows support movieId, theatreId, and date filtering
✅ **Sorting** - Shows are sorted by showTime in ascending order
✅ **Active Records Only** - Only active movies, theatres, and shows are returned
✅ **Clean JSON** - Unnecessary fields excluded from responses
✅ **Proper References** - Uses Mongoose populate for related data

---

## Integration Notes

### Frontend Integration Example (React)

```javascript
// Get theatres by city and movie
const response = await fetch(
  `${process.env.VITE_API_URL}/api/theatres?city=Hyderabad&movieId=${movieId}`
);
const { data: theatres } = await response.json();

// Get shows for theatre
const showsResponse = await fetch(
  `${process.env.VITE_API_URL}/api/shows?theatreId=${theatreId}&movieId=${movieId}`
);
const { data: shows } = await showsResponse.json();
```

---

## Rate Limiting

Currently no rate limiting is implemented. Add `express-rate-limit` for production.

---

**API Version:** 2.0  
**Last Updated:** 2026-04-18  
**Status:** Production Ready ✅
