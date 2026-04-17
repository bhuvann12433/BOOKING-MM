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

app.use(express.json());
app.use(cors());

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.log("❌ MONGO_URI missing");
  process.exit(1);
}

// 🔥 CONNECT DB + INIT SEATS
mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected ✅");

    const count = await Seat.countDocuments();

    if (count === 0) {
      const seats = [];
      const sections = ["Sofa", "Chair", "Table"];

      for (const section of sections) {
        for (let row = 1; row <= 3; row++) {
          for (let col = 1; col <= 20; col++) {
            seats.push({
              section,
              row,
              col,
              booked: false,
            });
          }
        }
      }

      await Seat.insertMany(seats);
      console.log("Seats initialized ✅");
    }
  })
  .catch((err) => console.error(err));

// 🔹 TEST
app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

// 🔹 USER MODEL
const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: String,
    email: { type: String, unique: true },
    password: String,
  })
);

// 🔹 SIGNUP
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "User exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashed,
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1h" }
    );

    res.json({ token, username, email });
  } catch (err) {
    res.status(500).json({ error: "Signup error" });
  }
});

// 🔹 LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1h" }
    );

    res.json({ token, username: user.username, email });
  } catch {
    res.status(500).json({ error: "Login error" });
  }
});

// 🔹 GET ALL SEATS
app.get("/seats", async (req, res) => {
  try {
    const seats = await Seat.find().sort({ section: 1, row: 1, col: 1 });
    res.json(seats);
  } catch {
    res.status(500).json({ error: "Seat fetch error" });
  }
});

// 🔥 🔥 MULTI-SEAT BOOKING (UPGRADED)
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
      return res.status(400).json({
        error: `Seat already booked: ${section}-${row}-${col}`,
      });
    }

    seat.booked = true;
    await seat.save();

    res.json({
      message: "Seat booked ✅",
      seat: `${section}-${row}-${col}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Booking failed" });
  }
});

// 🔹 SAVE BOOKING
app.post("/save-booking", async (req, res) => {
  try {
    const booking = await Booking.create(req.body);
    res.json({ message: "Booking saved ✅", booking });
  } catch {
    res.status(500).json({ error: "Save booking error" });
  }
});

// 🔹 HISTORY
app.get("/booking-history/:username", async (req, res) => {
  try {
    const data = await Booking.find({
      username: req.params.username,
    }).sort({ createdAt: -1 });

    res.json(data);
  } catch {
    res.status(500).json({ error: "History error" });
  }
});

// 🔹 RESET
app.put("/reset-seats", async (req, res) => {
  await Seat.updateMany({}, { booked: false });
  res.json({ message: "All seats reset ✅" });
});

// 🔹 START
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});