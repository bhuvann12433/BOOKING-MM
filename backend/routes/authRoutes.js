/**
 * Authentication Routes
 * Handles user signup and login endpoints
 */

import express from 'express';
import { signup, login } from '../controllers/authController.js';

const router = express.Router();

/**
 * POST /auth/signup
 * Create a new user account
 * Body: { username, email, password }
 */
router.post('/signup', signup);

/**
 * POST /auth/login
 * Authenticate user and return JWT token
 * Body: { email, password }
 */
router.post('/login', login);

export default router;
