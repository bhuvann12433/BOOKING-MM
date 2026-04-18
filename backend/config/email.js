/**
 * Email Configuration
 * Handles nodemailer setup for sending emails
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Create and configure email transporter
 * Uses Gmail SMTP with app-specific password
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Verify transporter connection on startup
 */
transporter.verify((error, success) => {
  if (error) {
    console.warn('⚠️  Email transporter not configured:', error.message);
  } else {
    console.log('✅ Email service ready');
  }
});

export default transporter;
