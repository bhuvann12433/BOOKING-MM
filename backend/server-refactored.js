/**
 * Movie Booking System - Refactored Server
 * 
 * Architecture Overview:
 * - config/        Database and email configuration
 * - models/        Mongoose schemas
 * - controllers/   Business logic for each feature
 * - routes/        API endpoint routing
 * - middleware/    Error handling and utilities
 * 
 * This file orchestrates the entire backend application
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// ============================================
// CONFIGURATION
// ============================================

dotenv.config();

// Import config functions
import connectDB from './config/database.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import seatRoutes from './routes/seatRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';

// Import middleware
import { errorHandler, notFound } from './middleware/errorHandler.js';

// ============================================
// INITIALIZE APP
// ============================================

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================

// Body parser middleware
app.use(express.json());

// CORS middleware - allows frontend to communicate with backend
app.use(cors());

// ============================================
// DATABASE CONNECTION
// ============================================

// Connect to MongoDB Atlas
connectDB();

// ============================================
// ROUTES
// ============================================

/**
 * Health check endpoint
 * Returns server status and available endpoints
 */
app.get('/', (req, res) => {
  res.json({
    message: '🎬 Movie Booking System API',
    version: '2.0.0',
    status: 'running',
    documentation: 'See /api/docs for more info',
    endpoints: {
      auth: {
        signup: 'POST /auth/signup',
        login: 'POST /auth/login',
      },
      seats: {
        getAll: 'GET /seats',
        bookSeat: 'POST /seats/book',
        layout: 'GET /seats/layout/:showId',
        available: 'GET /seats/available/:showId',
      },
      bookings: {
        save: 'POST /save-booking',
        history: 'GET /booking-history/:username',
        create: 'POST /bookings',
        getByUser: 'GET /bookings/user/:userId',
        getById: 'GET /bookings/:id',
        cancel: 'PUT /bookings/:id/cancel',
      },
    },
  });
});

// Authentication routes
app.use('/auth', authRoutes);

// Seat management routes
app.use('/seats', seatRoutes);

// Booking management routes
app.use('/bookings', bookingRoutes);

// Legacy route support (for backward compatibility)
app.post('/save-booking', (req, res, next) => {
  // Delegate to booking controller
  const bookingRoutes = require('./routes/bookingRoutes.js').default;
  bookingRoutes._router.stack[2].handle(req, res, next);
});

app.get('/booking-history/:username', (req, res, next) => {
  // Delegate to booking controller
  const bookingRoutes = require('./routes/bookingRoutes.js').default;
  bookingRoutes._router.stack[3].handle(req, res, next);
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler - must be before error handler
app.use(notFound);

// Global error handler - must be last
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   🎬 Movie Booking Backend Server          ║
║   ✅ Status: Running                       ║
║   🔗 URL: http://localhost:${PORT}              ║
║   📊 Environment: ${process.env.NODE_ENV || 'development'}       ║
║   📚 Docs: http://localhost:${PORT}/            ║
╚════════════════════════════════════════════╝
  `);
});

export default app;
