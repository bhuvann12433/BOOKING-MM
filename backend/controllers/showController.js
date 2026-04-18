import Show from "../models/Show.js";
import Movie from "../models/Movie.js";
import Theatre from "../models/Theatre.js";

// Get shows by movie and theatre
export const getShowsByMovieAndTheatre = async (req, res) => {
  try {
    const { movieId, theatreId, date } = req.query;

    const filter = { isActive: true };
    if (movieId) filter.movie = movieId;
    if (theatreId) filter.theatre = theatreId;

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.showTime = { $gte: startDate, $lt: endDate };
    }

    const shows = await Show.find(filter)
      .populate("movie", "title duration genre language")
      .populate("theatre", "name city address")
      .sort({ showTime: 1 });

    res.status(200).json({
      success: true,
      count: shows.length,
      data: shows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single show with availability
export const getShowById = async (req, res) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate("movie")
      .populate("theatre");

    if (!show) {
      return res.status(404).json({
        success: false,
        message: "Show not found",
      });
    }

    res.status(200).json({
      success: true,
      data: show,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create show (admin only)
export const createShow = async (req, res) => {
  try {
    // Validate movie and theatre exist
    const movie = await Movie.findById(req.body.movie);
    const theatre = await Theatre.findById(req.body.theatre);

    if (!movie || !theatre) {
      return res.status(404).json({
        success: false,
        message: "Invalid movie or theatre ID",
      });
    }

    // availableSeats should equal totalSeats for new show
    req.body.availableSeats = req.body.totalSeats;

    const show = await Show.create(req.body);
    res.status(201).json({
      success: true,
      data: show,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Update show
export const updateShow = async (req, res) => {
  try {
    const show = await Show.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      success: true,
      data: show,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get shows by theatre
export const getShowsByTheatre = async (req, res) => {
  try {
    const shows = await Show.find({
      theatre: req.params.theatreId,
      isActive: true,
      showTime: { $gte: new Date() },
    })
      .populate("movie", "title duration")
      .sort({ showTime: 1 });

    res.status(200).json({
      success: true,
      count: shows.length,
      data: shows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
