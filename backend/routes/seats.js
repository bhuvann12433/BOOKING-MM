import express from "express";
import {
  getSeatLayout,
  getAvailableSeats,
  getBookedSeats,
  checkSeatAvailability,
} from "../controllers/seatController.js";

const router = express.Router();

router.get("/layout/:showId", getSeatLayout);
router.get("/available/:showId", getAvailableSeats);
router.get("/booked/:showId", getBookedSeats);
router.post("/check-availability", checkSeatAvailability);

export default router;
