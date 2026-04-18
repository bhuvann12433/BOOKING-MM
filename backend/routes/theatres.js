import express from "express";
import {
  getTheatresByCityAndMovie,
  getTheatresByCity,
  getAllTheatres,
  getTheatreById,
  createTheatre,
  updateTheatre,
  getCities,
} from "../controllers/theatreController.js";

const router = express.Router();

// Public routes
// Specific routes first (before :id)
router.get("/query", getTheatresByCityAndMovie);
router.get("/cities", getCities);
router.get("/city/:city", getTheatresByCity);

// Generic routes
router.get("/", getAllTheatres);
router.get("/:id", getTheatreById);

// Admin routes
router.post("/", createTheatre);
router.put("/:id", updateTheatre);

export default router;
