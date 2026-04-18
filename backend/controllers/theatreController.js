import Theatre from "../models/Theatre.js";
import Show from "../models/Show.js";

/**
 * Get theatres by city and movie
 * Filters theatres where a specific movie is available
 */
export const getTheatresByCityAndMovie = async (req, res) => {
  try {
    const { city, movieId } = req.query;

    if (!city) {
      return res.status(400).json({
        success: false,
        message: "City parameter is required",
      });
    }

    // If movieId is provided, find theatres with active shows for that movie
    let theatres;
    if (movieId) {
      const activeShows = await Show.find({
        movie: movieId,
        isActive: true,
      }).distinct("theatre");

      theatres = await Theatre.find({
        city,
        isActive: true,
        _id: { $in: activeShows },
      });
    } else {
      // If no movieId, just return all theatres in the city
      theatres = await Theatre.find({ city, isActive: true });
    }

    res.status(200).json({
      success: true,
      count: theatres.length,
      data: theatres,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all theatres by city
export const getTheatresByCity = async (req, res) => {
  try {
    const { city } = req.params;
    const theatres = await Theatre.find({ city, isActive: true });

    res.status(200).json({
      success: true,
      count: theatres.length,
      data: theatres,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all theatres
export const getAllTheatres = async (req, res) => {
  try {
    const theatres = await Theatre.find({ isActive: true });
    res.status(200).json({
      success: true,
      count: theatres.length,
      data: theatres,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single theatre
export const getTheatreById = async (req, res) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: "Theatre not found",
      });
    }
    res.status(200).json({
      success: true,
      data: theatre,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create theatre (admin only)
export const createTheatre = async (req, res) => {
  try {
    const theatre = await Theatre.create(req.body);
    res.status(201).json({
      success: true,
      data: theatre,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Update theatre
export const updateTheatre = async (req, res) => {
  try {
    const theatre = await Theatre.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      success: true,
      data: theatre,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get unique cities
export const getCities = async (req, res) => {
  try {
    const cities = await Theatre.distinct("city", { isActive: true });
    res.status(200).json({
      success: true,
      count: cities.length,
      data: cities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
