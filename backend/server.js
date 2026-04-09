import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";
import Seat from "./models/Seat.js";
import Booking from "./models/Booking.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Strict ENV usage (no fallback)
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.log("❌ MONGO_URI not found in .env");
  process.exit(1);
}

// Middleware
app.use(express.json());
app.use(cors());

// Connect MongoDB
mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected ✅");

    const count = await Seat.countDocuments();

    if (count === 0) {
      const allSeats = [];
      const sections = ["Sofa", "Chair", "Table"];
      const totalRows = 5;
      const totalCols = 20;

      for (const section of sections) {
        for (let row = 1; row <= totalRows; row++) {
          for (let col = 1; col <= totalCols; col++) {
            allSeats.push({
              section,
              row,
              col,
              booked: false,
            });
          }
        }
      }

      await Seat.insertMany(allSeats);
      console.log("All 300 seats inserted successfully ✅");
    } else {
      console.log(`Seats already exist: ${count}`);
    }
  })
  .catch((err) => {
    console.error("MongoDB Connection Error ❌:", err.message);
  });

// Test route
app.get("/", (req, res) => {
  res.send("Backend working 🚀");
});

// User Schema
const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
});

const User = mongoose.model("User", userSchema);

// Signup
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "1h" }
    );

    res.status(201).json({
      username: newUser.username,
      email: newUser.email,
      token,
      message: "Signup successful",
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ error: "Error signing up" });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "1h" }
    );

    res.status(200).json({
      token,
      username: user.username,
      email: user.email,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Error logging in" });
  }
});

// Save booking
app.post("/save-booking", async (req, res) => {
  const { username, email, movieTitle, city, theaterName, date, time, seats } =
    req.body;

  try {
    const newBooking = new Booking({
      username,
      email,
      movieTitle,
      city,
      theaterName,
      date,
      time,
      seats,
    });

    await newBooking.save();

    res.status(201).json({
      message: "Booking saved successfully ✅",
      booking: newBooking,
    });
  } catch (error) {
    console.error("Save Booking Error:", error);
    res.status(500).json({ error: "Error saving booking" });
  }
});

// Fetch booking history
app.get("/booking-history/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const bookings = await Booking.find({ username }).sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Fetch Booking History Error:", error);
    res.status(500).json({ error: "Error fetching booking history" });
  }
});

// Get all seats
app.get("/seats", async (req, res) => {
  try {
    const seats = await Seat.find().sort({ section: 1, row: 1, col: 1 });
    res.status(200).json(seats);
  } catch (error) {
    console.error("Fetch Seats Error:", error);
    res.status(500).json({ error: "Error fetching seats" });
  }
});

// Book seat
app.post("/book-seat", async (req, res) => {
  const { section, row, col } = req.body;

  try {
    const seat = await Seat.findOne({
      section,
      row: Number(row),
      col: Number(col),
    });

    if (!seat) {
      return res.status(404).json({
        error: `Seat not found: ${section}-${row}-${col}`,
      });
    }

    if (seat.booked) {
      return res.status(400).json({ error: "Seat already booked" });
    }

    seat.booked = true;
    await seat.save();

    const seatId = `${seat.section}-${seat.row}-${seat.col}`;

    res.status(200).json({
      message: "Seat booked successfully ✅",
      seatId,
      seat,
    });
  } catch (error) {
    console.error("Book Seat Error:", error);
    res.status(500).json({ error: "Error booking seat" });
  }
});

// Reset seats
app.put("/reset-seats", async (req, res) => {
  try {
    await Seat.updateMany({}, { $set: { booked: false } });
    res.status(200).json({ message: "All seats reset successfully ✅" });
  } catch (error) {
    console.error("Reset Seats Error:", error);
    res.status(500).json({ error: "Error resetting seats" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});