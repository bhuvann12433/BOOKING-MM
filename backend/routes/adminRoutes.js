import express from "express";
import {
  // Movie Management
  adminCreateMovie,
  adminUpdateMovie,
  adminDeleteMovie,
  
  // Theatre Management
  adminCreateTheatre,
  adminUpdateTheatre,
  adminDeleteTheatre,
  
  // Show Management
  adminCreateShow,
  adminUpdateShow,
  adminDeleteShow,
  
  // Seat Layout Management
  adminCreateSeats,
  adminUpdateSeatLayout,
  adminGetSeatsByShow,
} from "../controllers/adminController.js";

const router = express.Router();

// ============================================
// 🎬 MOVIE MANAGEMENT
// ============================================

router.post("/movies", adminCreateMovie);
router.put("/movies/:id", adminUpdateMovie);
router.delete("/movies/:id", adminDeleteMovie);

// ============================================
// 🏛️ THEATRE MANAGEMENT
// ============================================

router.post("/theatres", adminCreateTheatre);
router.put("/theatres/:id", adminUpdateTheatre);
router.delete("/theatres/:id", adminDeleteTheatre);

// ============================================
// 🎞️ SHOW MANAGEMENT (movie + theatre + time)
// ============================================

router.post("/shows", adminCreateShow);
router.put("/shows/:id", adminUpdateShow);
router.delete("/shows/:id", adminDeleteShow);

// ============================================
// 💺 SEAT LAYOUT MANAGEMENT
// ============================================

router.post("/seats/create", adminCreateSeats);
router.get("/seats/:showId", adminGetSeatsByShow);
router.put("/seats/:showId/layout", adminUpdateSeatLayout);

export default router;
