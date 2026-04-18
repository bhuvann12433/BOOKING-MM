/**
 * 🎬 MOVIE BOOKING SYSTEM - REFACTORED BACKEND
 *
 * Architecture:
 * ├── config/        - Database and email configuration
 * ├── models/        - Mongoose schemas (User, Movie, Theatre, Show, Seat, Booking)
 * ├── controllers/   - Business logic separated from routes
 * ├── routes/        - Clean API endpoints
 * └── middleware/    - Error handling and utilities
 *
 * Benefits of this structure:
 * ✅ Clean separation of concerns
 * ✅ Easy to test and maintain
 * ✅ Scalable for future features
 * ✅ Backward compatible with existing frontend
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

// ============================================
// INITIALIZE ENVIRONMENT
// ============================================

dotenv.config();

// ============================================
// IMPORT CONFIGURATION
// ============================================

import connectDB from './config/database.js';

// ============================================
// IMPORT SOCKET.IO HANDLERS
// ============================================

import initializeSocketHandlers, { cleanupExpiredLocks } from './socket/socketHandlers.js';

// ============================================
// IMPORT ROUTES
// ============================================

import authRoutes from './routes/authRoutes.js';
import seatRoutes from './routes/seatRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import movieRoutes from './routes/movies.js';
import theatreRoutes from './routes/theatres.js';
import showRoutes from './routes/shows.js';

// ============================================
// IMPORT MIDDLEWARE
// ============================================

import { errorHandler, notFound } from './middleware/errorHandler.js';

// ============================================
// APP INITIALIZATION
// ============================================

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE SETUP
// ============================================

// Parse JSON request bodies
app.use(express.json());

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// ============================================
// DATABASE CONNECTION
// ============================================

// Connect to MongoDB Atlas
connectDB();

// ============================================
// API ROUTES
// ============================================

/**
 * Root Endpoint
 * Returns API information and available endpoints
 */
app.get('/', (req, res) => {
  res.json({
    message: '🎬 Movie Booking System API',
    version: '2.0.0',
    status: 'running ✅',
    endpoints: {
      auth: {
        signup: 'POST /auth/signup',
        login: 'POST /auth/login',
      },
      movies: {
        getAll: 'GET /api/movies',
        getById: 'GET /api/movies/:id',
        create: 'POST /api/movies',
        update: 'PUT /api/movies/:id',
        delete: 'DELETE /api/movies/:id',
      },
      theatres: {
        getAll: 'GET /api/theatres',
        getByCity: 'GET /api/theatres/city/:city',
        getByCityAndMovie: 'GET /api/theatres?city=cityName&movieId=movieId',
        getCities: 'GET /api/theatres/cities',
        getById: 'GET /api/theatres/:id',
        create: 'POST /api/theatres',
        update: 'PUT /api/theatres/:id',
      },
      shows: {
        getAll: 'GET /api/shows',
        getByMovieAndTheatre: 'GET /api/shows?movieId=movieId&theatreId=theatreId',
        getById: 'GET /api/shows/:id',
        getByTheatre: 'GET /api/shows/theatre/:theatreId',
        create: 'POST /api/shows',
        update: 'PUT /api/shows/:id',
      },
      seats: {
        getAll: 'GET /seats',
        bookSeat: 'POST /seats/book',
        layout: 'GET /seats/layout/:showId',
        available: 'GET /seats/available/:showId',
      },
      bookings: {
        saveWithEmail: 'POST /save-booking',
        history: 'GET /booking-history/:username',
        create: 'POST /bookings',
        getByUser: 'GET /bookings/user/:userId',
        getById: 'GET /bookings/:id',
        cancel: 'PUT /bookings/:id/cancel',
      },
    },
  });
});

// ============================================
// CONTROLLER IMPORTS (for direct routing)
// ============================================

import { createBookingWithEmail, getBookingHistoryLegacy } from './controllers/bookingController.js';
import { getAllSeats, bookSeat } from './controllers/seatController.js';

// ============================================
// ROUTE MOUNTING
// ============================================

/**
 * Authentication Routes
 * Base: /auth
 * - POST /auth/signup
 * - POST /auth/login
 */
app.use('/auth', authRoutes);

/**
 * Movie Management Routes
 * Base: /api/movies
 * - GET /api/movies (get all)
 * - GET /api/movies/:id (get by id)
 * - POST /api/movies (create)
 * - PUT /api/movies/:id (update)
 * - DELETE /api/movies/:id (delete)
 */
app.use('/api/movies', movieRoutes);

/**
 * Theatre Management Routes
 * Base: /api/theatres
 * - GET /api/theatres (get all)
 * - GET /api/theatres?city=cityName&movieId=movieId (by city and movie)
 * - GET /api/theatres/cities (get unique cities)
 * - GET /api/theatres/city/:city (by city)
 * - GET /api/theatres/:id (by id)
 * - POST /api/theatres (create)
 * - PUT /api/theatres/:id (update)
 */
app.use('/api/theatres', theatreRoutes);

/**
 * Show Management Routes
 * Base: /api/shows
 * - GET /api/shows (get all, filters: movieId, theatreId, date)
 * - GET /api/shows/:id (get by id)
 * - GET /api/shows/theatre/:theatreId (by theatre)
 * - POST /api/shows (create)
 * - PUT /api/shows/:id (update)
 */
app.use('/api/shows', showRoutes);

/**
 * Seat Management Routes
 * Base: /seats
 * - GET /seats
 * - POST /seats/book
 * - GET /seats/layout/:showId
 * - GET /seats/available/:showId
 */
app.use('/seats', seatRoutes);

/**
 * Booking Management Routes
 * Base: /bookings
 * - POST /bookings/save
 * - GET /bookings/history/:username
 * - POST /bookings
 * - GET /bookings/user/:userId
 * - GET /bookings/:id
 * - PUT /bookings/:id/cancel
 */
app.use('/bookings', bookingRoutes);

/**
 * LEGACY ROUTE COMPATIBILITY
 * Direct routes for backward compatibility with existing frontend
 */

// GET /seats - Get all seats
app.get('/seats-legacy', getAllSeats);

// POST /save-booking - Create booking with email and PDF
app.post('/save-booking', createBookingWithEmail);

// GET /booking-history/:username - Get user booking history
app.get('/booking-history/:username', getBookingHistoryLegacy);

// POST /book-seat - Book specific seat
app.post('/book-seat', bookSeat);

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

// 404 handler for undefined routes
app.use(notFound);

// Global error handler (must be last)
app.use(errorHandler);

// ============================================
// SERVER STARTUP WITH SOCKET.IO
// ============================================

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io with CORS
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || process.env.CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Initialize Socket.io event handlers
initializeSocketHandlers(io);

// Setup periodic cleanup of expired locks (every 5 minutes)
setInterval(cleanupExpiredLocks, 5 * 60 * 1000);

// Start server
server.listen(PORT, () => {
  const backendUrl = process.env.BACKEND_URL || `http://localhost:${PORT}`;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const environment = process.env.NODE_ENV || 'development';

  console.log(`
╔════════════════════════════════════════════════════════════╗
║     🎬 MOVIE BOOKING SYSTEM - BACKEND SERVER (Socket.io)   ║
╠════════════════════════════════════════════════════════════╣
║  ✅ Status: Running                                        ║
║  🔗 Backend: ${backendUrl.padEnd(51)}║
║  🔗 Frontend: ${frontendUrl.padEnd(51)}║
║  📡 Socket.io: Connected ✅                                ║
║  📊 Environment: ${environment.padEnd(47)}║
║  🗄️  Database: MongoDB Atlas (Connected)                  ║
║  🔐 CORS Origin: ${frontendUrl.padEnd(46)}║
╚════════════════════════════════════════════════════════════╝
  `);
});

export default app;