import express from "express";
import {
  createBooking,
  getUserBookings,
  getBookingDetails,
  cancelBooking,
} from "../controllers/bookingController.js";

const router = express.Router();

// Booking routes
router.post("/", createBooking);
router.get("/user/:userId", getUserBookings);
router.get("/:id", getBookingDetails);
router.put("/:id/cancel", cancelBooking);

export default router;
