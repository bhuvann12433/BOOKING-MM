import mongoose from "mongoose";

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide theatre name"],
      trim: true,
    },
    city: {
      type: String,
      required: true,
    },
    address: String,
    phone: String,
    totalScreens: {
      type: Number,
      default: 1,
    },
    screens: [
      {
        screenName: String,
        totalSeats: Number,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Theatre = mongoose.model("Theatre", theatreSchema);
export default Theatre;
