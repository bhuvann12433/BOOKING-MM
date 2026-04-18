import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a movie title"],
      trim: true,
    },
    description: String,
    duration: {
      type: Number,
      required: true,
    },
    genre: [String],
    rating: {
      type: Number,
      min: 0,
      max: 10,
    },
    releaseDate: Date,
    posterUrl: String,
    language: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Movie = mongoose.model("Movie", movieSchema);
export default Movie;
