import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    username: String,
    email: String,
    movieTitle: String,
    city: String,
    theaterName: String,
    date: String,
    time: String,
    seats: [String],
  },
  { timestamps: true },
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
