/**
 * 🎬 API Service - Axios Configuration
 * Handles all backend communication for Movie Booking System
 */

import axios from 'axios';

// ============================================
// API BASE URL CONFIGURATION
// ============================================

const API_BASE_URL = process.env.REACT_APP_API_URL || process.env.VITE_API_URL || 'https://booking-mm-1.onrender.com';

// ============================================
// CREATE AXIOS INSTANCE
// ============================================

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// REQUEST INTERCEPTOR
// ============================================

api.interceptors.request.use(
  (config) => {
    // Add JWT token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR
// ============================================

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/LoginPage';
    }
    return Promise.reject(error);
  }
);

// ============================================
// MOVIE API CALLS
// ============================================

export const movieAPI = {
  /**
   * Fetch all movies
   * GET /api/movies
   */
  getAll: () => api.get('/api/movies'),

  /**
   * Fetch single movie by ID
   * GET /api/movies/:id
   */
  getById: (id) => api.get(`/api/movies/${id}`),

  /**
   * Create new movie (admin)
   * POST /api/movies
   */
  create: (movieData) => api.post('/api/movies', movieData),

  /**
   * Update movie (admin)
   * PUT /api/movies/:id
   */
  update: (id, movieData) => api.put(`/api/movies/${id}`, movieData),

  /**
   * Delete movie (admin)
   * DELETE /api/movies/:id
   */
  delete: (id) => api.delete(`/api/movies/${id}`),
};

// ============================================
// THEATRE API CALLS
// ============================================

export const theatreAPI = {
  /**
   * Fetch all theatres
   * GET /api/theatres
   */
  getAll: () => api.get('/api/theatres'),

  /**
   * Fetch theatres by city
   * GET /api/theatres/city/:city
   */
  getByCity: (city) => api.get(`/api/theatres/city/${city}`),

  /**
   * Fetch theatres by city and movie
   * GET /api/theatres/query?city=:city&movieId=:movieId
   */
  getByMovieAndCity: (city, movieId) => 
    api.get('/api/theatres/query', { params: { city, movieId } }),

  /**
   * Fetch all available cities
   * GET /api/theatres/cities
   */
  getCities: () => api.get('/api/theatres/cities'),

  /**
   * Fetch single theatre
   * GET /api/theatres/:id
   */
  getById: (id) => api.get(`/api/theatres/${id}`),

  /**
   * Create new theatre (admin)
   * POST /api/theatres
   */
  create: (theatreData) => api.post('/api/theatres', theatreData),

  /**
   * Update theatre (admin)
   * PUT /api/theatres/:id
   */
  update: (id, theatreData) => api.put(`/api/theatres/${id}`, theatreData),
};

// ============================================
// SHOW API CALLS
// ============================================

export const showAPI = {
  /**
   * Fetch shows by theatre
   * GET /api/shows/theatre/:theatreId
   */
  getByTheatre: (theatreId) => api.get(`/api/shows/theatre/${theatreId}`),

  /**
   * Fetch shows by movie and theatre
   * GET /api/shows?movieId=:movieId&theatreId=:theatreId
   */
  getByMovieAndTheatre: (movieId, theatreId) =>
    api.get('/api/shows', { params: { movieId, theatreId } }),

  /**
   * Fetch single show
   * GET /api/shows/:id
   */
  getById: (id) => api.get(`/api/shows/${id}`),

  /**
   * Create new show (admin)
   * POST /api/shows
   */
  create: (showData) => api.post('/api/shows', showData),
};

// ============================================
// SEAT API CALLS
// ============================================

export const seatAPI = {
  /**
   * Fetch all seats for a show
   * GET /api/seats/show/:showId
   */
  getByShow: (showId) => api.get(`/api/seats/show/${showId}`),

  /**
   * Fetch seat availability statistics
   * GET /api/seats/show/:showId/statistics
   */
  getStatistics: (showId) => api.get(`/api/seats/show/${showId}/statistics`),

  /**
   * Lock a seat
   * POST /api/seats/lock
   */
  lock: (seatData) => api.post('/api/seats/lock', seatData),

  /**
   * Release locked seat
   * POST /api/seats/release
   */
  release: (seatData) => api.post('/api/seats/release', seatData),
};

// ============================================
// BOOKING API CALLS
// ============================================

export const bookingAPI = {
  /**
   * Create new booking
   * POST /api/bookings
   */
  create: (bookingData) => api.post('/api/bookings', bookingData),

  /**
   * Fetch user bookings
   * GET /api/bookings/user/:userId
   */
  getUserBookings: (userId) => api.get(`/api/bookings/user/${userId}`),

  /**
   * Fetch single booking
   * GET /api/bookings/:id
   */
  getById: (id) => api.get(`/api/bookings/${id}`),

  /**
   * Cancel booking
   * POST /api/bookings/:id/cancel
   */
  cancel: (id) => api.post(`/api/bookings/${id}/cancel`),
};

// ============================================
// AUTHENTICATION API CALLS
// ============================================

export const authAPI = {
  /**
   * User login
   * POST /api/auth/login
   */
  login: (credentials) => api.post('/api/auth/login', credentials),

  /**
   * User signup
   * POST /api/auth/signup
   */
  signup: (userData) => api.post('/api/auth/signup', userData),

  /**
   * User logout
   * POST /api/auth/logout
   */
  logout: () => api.post('/api/auth/logout'),

  /**
   * Get current user
   * GET /api/auth/me
   */
  getCurrentUser: () => api.get('/api/auth/me'),
};

// ============================================
// UTILITY FUNCTION: HANDLE API ERRORS
// ============================================

export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error
    return {
      status: error.response.status,
      message: error.response.data?.message || 'Server error occurred',
      data: error.response.data,
    };
  } else if (error.request) {
    // Request made but no response
    return {
      status: null,
      message: 'No response from server. Check your connection.',
      data: null,
    };
  } else {
    // Error in request setup
    return {
      status: null,
      message: error.message || 'An error occurred',
      data: null,
    };
  }
};

export default api;
