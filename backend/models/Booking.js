import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Show",
      required: true,
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theatre",
    },
    seats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seat",
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending',
    },
    bookingStatus: {
      type: String,
      enum: ['confirmed', 'cancelled', 'expired'],
      default: 'confirmed',
    },
    bookingReference: {
      type: String,
      unique: true,
    },
    qrCode: String,
    email: String,
    phone: String,
  },
  { timestamps: true }
);

// Generate unique booking reference before saving
bookingSchema.pre('save', function(next) {
  if (!this.bookingReference) {
    this.bookingReference = 'BK' + Date.now() + Math.floor(Math.random() * 1000);
  }
  next();
});

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
