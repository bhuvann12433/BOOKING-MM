import mongoose from "mongoose";

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theatre",
      required: true,
    },
    screen: String,
    showTime: {
      type: Date,
      required: true,
    },
    ticketPrice: {
      type: Number,
      required: true,
    },
    totalSeats: {
      type: Number,
      required: true,
    },
    availableSeats: {
      type: Number,
      required: true,
    },
    language: String,
    format: String, // 2D, 3D, IMAX
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Show = mongoose.model("Show", showSchema);
export default Show;
