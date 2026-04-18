import Movie from "../models/Movie.js";
import Theatre from "../models/Theatre.js";
import Show from "../models/Show.js";
import Seat from "../models/Seat.js";

// ============================================
// 🎬 MOVIE MANAGEMENT
// ============================================

/**
 * @route   POST /api/admin/movies
 * @desc    Create a new movie
 * @access  Admin only
 * @example
 * POST /api/admin/movies
 * {
 *   "title": "Pushpa 2",
 *   "description": "Action thriller",
 *   "rating": 4.9,
 *   "language": "Telugu",
 *   "certification": "UA",
 *   "genre": ["Action", "Drama"],
 *   "posterUrl": "https://example.com/poster.jpg",
 *   "trailerUrl": "https://youtube.com/watch?v=xyz",
 *   "duration": 180,
 *   "releaseDate": "2024-12-05"
 * }
 */
export const adminCreateMovie = async (req, res) => {
  try {
    const {
      title,
      description,
      rating,
      language,
      certification,
      genre,
      posterUrl,
      trailerUrl,
      duration,
      releaseDate,
    } = req.body;

    // Validation
    if (!title || !language || !duration) {
      return res.status(400).json({
        success: false,
        message: "Title, language, and duration are required",
      });
    }

    const movie = await Movie.create({
      title,
      description,
      rating: rating || 4.0,
      language,
      certification: certification || "UA",
      genre: genre || [],
      posterUrl,
      trailerUrl,
      duration,
      releaseDate: releaseDate || new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Movie created successfully",
      data: movie,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error creating movie",
      error: err.message,
    });
  }
};

/**
 * @route   PUT /api/admin/movies/:id
 * @desc    Update a movie
 * @access  Admin only
 */
export const adminUpdateMovie = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const movie = await Movie.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    res.json({
      success: true,
      message: "Movie updated successfully",
      data: movie,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error updating movie",
      error: err.message,
    });
  }
};

/**
 * @route   DELETE /api/admin/movies/:id
 * @desc    Delete a movie
 * @access  Admin only
 */
export const adminDeleteMovie = async (req, res) => {
  try {
    const { id } = req.params;

    const movie = await Movie.findByIdAndDelete(id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    res.json({
      success: true,
      message: "Movie deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error deleting movie",
      error: err.message,
    });
  }
};

// ============================================
// 🏛️ THEATRE MANAGEMENT
// ============================================

/**
 * @route   POST /api/admin/theatres
 * @desc    Create a new theatre
 * @access  Admin only
 * @example
 * POST /api/admin/theatres
 * {
 *   "name": "PVR Cinemas",
 *   "city": "Vijayawada",
 *   "address": "123 Main St",
 *   "location": {
 *     "lat": 16.5062,
 *     "lng": 80.6480
 *   },
 *   "screens": 5,
 *   "facilities": ["AC", "Parking", "Food Court"],
 *   "contactPhone": "9876543210"
 * }
 */
export const adminCreateTheatre = async (req, res) => {
  try {
    const {
      name,
      city,
      address,
      location,
      screens,
      facilities,
      contactPhone,
    } = req.body;

    // Validation
    if (!name || !city) {
      return res.status(400).json({
        success: false,
        message: "Theatre name and city are required",
      });
    }

    const theatre = await Theatre.create({
      name,
      city,
      address,
      location,
      screens: screens || 1,
      facilities: facilities || [],
      contactPhone,
    });

    res.status(201).json({
      success: true,
      message: "Theatre created successfully",
      data: theatre,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error creating theatre",
      error: err.message,
    });
  }
};

/**
 * @route   PUT /api/admin/theatres/:id
 * @desc    Update a theatre
 * @access  Admin only
 */
export const adminUpdateTheatre = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const theatre = await Theatre.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: "Theatre not found",
      });
    }

    res.json({
      success: true,
      message: "Theatre updated successfully",
      data: theatre,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error updating theatre",
      error: err.message,
    });
  }
};

/**
 * @route   DELETE /api/admin/theatres/:id
 * @desc    Delete a theatre
 * @access  Admin only
 */
export const adminDeleteTheatre = async (req, res) => {
  try {
    const { id } = req.params;

    const theatre = await Theatre.findByIdAndDelete(id);

    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: "Theatre not found",
      });
    }

    res.json({
      success: true,
      message: "Theatre deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error deleting theatre",
      error: err.message,
    });
  }
};

// ============================================
// 🎞️ SHOW MANAGEMENT (movie + theatre + time)
// ============================================

/**
 * @route   POST /api/admin/shows
 * @desc    Create a new show (movie screening at theatre at specific time)
 * @access  Admin only
 * @example
 * POST /api/admin/shows
 * {
 *   "movie": "60d5ec49c1234567890abcd1",
 *   "theatre": "60d5ec49c1234567890abcd2",
 *   "showDate": "2024-12-20",
 *   "showTime": "14:00",
 *   "language": "Telugu",
 *   "format": "2D",
 *   "screen": "Screen 1",
 *   "totalSeats": 180,
 *   "seatLayout": {
 *     "premium": { "rows": 3, "cols": 20, "price": 250 },
 *     "executive": { "rows": 3, "cols": 20, "price": 200 },
 *     "normal": { "rows": 4, "cols": 20, "price": 150 }
 *   }
 * }
 */
export const adminCreateShow = async (req, res) => {
  try {
    const {
      movie,
      theatre,
      showDate,
      showTime,
      language,
      format,
      screen,
      totalSeats,
      seatLayout,
    } = req.body;

    // Validation
    if (!movie || !theatre || !showDate || !showTime) {
      return res.status(400).json({
        success: false,
        message:
          "Movie, theatre, show date, and show time are required",
      });
    }

    // Create show
    const show = await Show.create({
      movie,
      theatre,
      showDate,
      showTime,
      language: language || "Telugu",
      format: format || "2D",
      screen: screen || "Screen 1",
      totalSeats: totalSeats || 180,
      seatLayout,
      status: "active",
    });

    // Auto-generate seats if layout provided
    if (seatLayout && totalSeats > 0) {
      const seats = [];

      // Premium seats
      if (seatLayout.premium) {
        for (let row = 1; row <= seatLayout.premium.rows; row++) {
          for (let col = 1; col <= seatLayout.premium.cols; col++) {
            seats.push({
              show: show._id,
              seatNumber: `P${row}-${col}`,
              row: `${row}`,
              col,
              category: "Premium",
              price: seatLayout.premium.price,
              status: "available",
            });
          }
        }
      }

      // Executive seats
      if (seatLayout.executive) {
        for (
          let row = 1;
          row <= seatLayout.executive.rows;
          row++
        ) {
          for (
            let col = 1;
            col <= seatLayout.executive.cols;
            col++
          ) {
            seats.push({
              show: show._id,
              seatNumber: `E${row}-${col}`,
              row: `${row}`,
              col,
              category: "Executive",
              price: seatLayout.executive.price,
              status: "available",
            });
          }
        }
      }

      // Normal seats
      if (seatLayout.normal) {
        for (let row = 1; row <= seatLayout.normal.rows; row++) {
          for (let col = 1; col <= seatLayout.normal.cols; col++) {
            seats.push({
              show: show._id,
              seatNumber: `N${row}-${col}`,
              row: `${row}`,
              col,
              category: "Normal",
              price: seatLayout.normal.price,
              status: "available",
            });
          }
        }
      }

      // Bulk insert seats
      await Seat.insertMany(seats);
    }

    res.status(201).json({
      success: true,
      message: `Show created successfully with ${totalSeats} seats`,
      data: show,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error creating show",
      error: err.message,
    });
  }
};

/**
 * @route   PUT /api/admin/shows/:id
 * @desc    Update a show
 * @access  Admin only
 */
export const adminUpdateShow = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const show = await Show.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!show) {
      return res.status(404).json({
        success: false,
        message: "Show not found",
      });
    }

    res.json({
      success: true,
      message: "Show updated successfully",
      data: show,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error updating show",
      error: err.message,
    });
  }
};

/**
 * @route   DELETE /api/admin/shows/:id
 * @desc    Delete a show and associated seats
 * @access  Admin only
 */
export const adminDeleteShow = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete show
    const show = await Show.findByIdAndDelete(id);

    if (!show) {
      return res.status(404).json({
        success: false,
        message: "Show not found",
      });
    }

    // Delete associated seats
    await Seat.deleteMany({ show: id });

    res.json({
      success: true,
      message: "Show and associated seats deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error deleting show",
      error: err.message,
    });
  }
};

// ============================================
// 💺 SEAT LAYOUT MANAGEMENT
// ============================================

/**
 * @route   POST /api/admin/seats/create
 * @desc    Manually create seats for a show
 * @access  Admin only
 * @example
 * POST /api/admin/seats/create
 * {
 *   "showId": "60d5ec49c1234567890abcd1",
 *   "seatLayout": {
 *     "premium": { "rows": 3, "cols": 20, "price": 250 },
 *     "executive": { "rows": 3, "cols": 20, "price": 200 },
 *     "normal": { "rows": 4, "cols": 20, "price": 150 }
 *   }
 * }
 */
export const adminCreateSeats = async (req, res) => {
  try {
    const { showId, seatLayout } = req.body;

    // Validation
    if (!showId || !seatLayout) {
      return res.status(400).json({
        success: false,
        message: "Show ID and seat layout are required",
      });
    }

    // Check if show exists
    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).json({
        success: false,
        message: "Show not found",
      });
    }

    const seats = [];

    // Premium seats
    if (seatLayout.premium) {
      for (let row = 1; row <= seatLayout.premium.rows; row++) {
        for (let col = 1; col <= seatLayout.premium.cols; col++) {
          seats.push({
            show: showId,
            seatNumber: `P${row}-${col}`,
            row: `${row}`,
            col,
            category: "Premium",
            price: seatLayout.premium.price,
            status: "available",
          });
        }
      }
    }

    // Executive seats
    if (seatLayout.executive) {
      for (let row = 1; row <= seatLayout.executive.rows; row++) {
        for (let col = 1; col <= seatLayout.executive.cols; col++) {
          seats.push({
            show: showId,
            seatNumber: `E${row}-${col}`,
            row: `${row}`,
            col,
            category: "Executive",
            price: seatLayout.executive.price,
            status: "available",
          });
        }
      }
    }

    // Normal seats
    if (seatLayout.normal) {
      for (let row = 1; row <= seatLayout.normal.rows; row++) {
        for (let col = 1; col <= seatLayout.normal.cols; col++) {
          seats.push({
            show: showId,
            seatNumber: `N${row}-${col}`,
            row: `${row}`,
            col,
            category: "Normal",
            price: seatLayout.normal.price,
            status: "available",
          });
        }
      }
    }

    // Bulk insert
    const createdSeats = await Seat.insertMany(seats);

    res.status(201).json({
      success: true,
      message: `${createdSeats.length} seats created successfully`,
      data: { count: createdSeats.length },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error creating seats",
      error: err.message,
    });
  }
};

/**
 * @route   GET /api/admin/seats/:showId
 * @desc    Get all seats for a show (for management)
 * @access  Admin only
 */
export const adminGetSeatsByShow = async (req, res) => {
  try {
    const { showId } = req.params;

    const seats = await Seat.find({ show: showId })
      .sort({ seatNumber: 1 });

    if (!seats) {
      return res.status(404).json({
        success: false,
        message: "Seats not found",
      });
    }

    // Group by category for admin view
    const grouped = {
      premium: seats.filter((s) => s.category === "Premium"),
      executive: seats.filter((s) => s.category === "Executive"),
      normal: seats.filter((s) => s.category === "Normal"),
    };

    res.json({
      success: true,
      data: {
        totalSeats: seats.length,
        byStatus: {
          available: seats.filter((s) => s.status === "available").length,
          locked: seats.filter((s) => s.status === "locked").length,
          booked: seats.filter((s) => s.status === "booked").length,
        },
        byCategory: {
          premium: grouped.premium.length,
          executive: grouped.executive.length,
          normal: grouped.normal.length,
        },
        seats,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching seats",
      error: err.message,
    });
  }
};

/**
 * @route   PUT /api/admin/seats/:showId/layout
 * @desc    Update seat layout for a show (block/unblock seats)
 * @access  Admin only
 * @example
 * PUT /api/admin/seats/:showId/layout
 * {
 *   "seatNumbers": ["P1-5", "P1-6"],
 *   "action": "block" // or "unblock"
 * }
 */
export const adminUpdateSeatLayout = async (req, res) => {
  try {
    const { showId } = req.params;
    const { seatNumbers, action } = req.body;

    // Validation
    if (!seatNumbers || !action) {
      return res.status(400).json({
        success: false,
        message: "Seat numbers and action are required",
      });
    }

    const validActions = ["block", "unblock", "maintenance"];
    if (!validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        message: `Action must be one of: ${validActions.join(", ")}`,
      });
    }

    // Update seats
    const updateData = {
      $set: {
        status: action === "block" ? "blocked" : "available",
      },
    };

    const result = await Seat.updateMany(
      { show: showId, seatNumber: { $in: seatNumbers } },
      updateData
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} seats updated`,
      data: { modifiedCount: result.modifiedCount },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error updating seats",
      error: err.message,
    });
  }
};
