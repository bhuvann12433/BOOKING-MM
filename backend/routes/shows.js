import express from "express";
import {
  getShowsByMovieAndTheatre,
  getShowById,
  createShow,
  updateShow,
  getShowsByTheatre,
} from "../controllers/showController.js";

const router = express.Router();

// Public routes
// Specific routes first (before :id)
router.get("/theatre/:theatreId", getShowsByTheatre);

// Generic routes
router.get("/", getShowsByMovieAndTheatre);
router.get("/:id", getShowById);

// Admin routes
router.post("/", createShow);
router.put("/:id", updateShow);

export default router;
