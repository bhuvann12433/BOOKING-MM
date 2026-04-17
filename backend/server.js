import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";

import Seat from "./models/Seat.js";
import Booking from "./models/Booking.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// 🔥 EMAIL TRANSPORTER
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 🔥 DB CONNECT
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
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
  } catch {
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

// 🔹 GET SEATS
app.get("/seats", async (req, res) => {
  try {
    const seats = await Seat.find().sort({ section: 1, row: 1, col: 1 });
    res.json(seats);
  } catch {
    res.status(500).json({ error: "Seat fetch error" });
  }
});

// 🔹 BOOK SEAT
app.post("/book-seat", async (req, res) => {
  const { section, row, col } = req.body;

  try {
    const seat = await Seat.findOne({
      section,
      row: Number(row),
      col: Number(col),
    });

    if (!seat) {
      return res.status(404).json({ error: "Seat not found" });
    }

    if (seat.booked) {
      return res.status(400).json({ error: "Seat already booked" });
    }

    seat.booked = true;
    await seat.save();

    res.json({ message: "Seat booked ✅" });
  } catch {
    res.status(500).json({ error: "Booking failed" });
  }
});

// 🔥 SAVE BOOKING + EMAIL + PDF (FIXED)
app.post("/save-booking", async (req, res) => {
  const {
    username,
    email,
    movieTitle,
    city,
    theaterName,
    date,
    time,
    seats,
  } = req.body;

  try {
    const booking = await Booking.create(req.body);

    console.log("📩 Sending email to:", email);

    const seatText = seats.join(", ");

    const total = seats.reduce((sum, seat) => {
      if (seat.startsWith("Premium")) return sum + 250;
      if (seat.startsWith("Executive")) return sum + 200;
      return sum + 150;
    }, 0);

    // 🔥 CREATE PDF
    const doc = new PDFDocument();
    let buffers = [];

    doc.on("data", buffers.push.bind(buffers));

    doc.on("end", async () => {
      try {
        const pdfData = Buffer.concat(buffers);

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: "🎟️ Your Movie Ticket",
          html: `
            <h2>Booking Confirmed 🎉</h2>
            <p><b>Movie:</b> ${movieTitle}</p>
            <p><b>Theater:</b> ${theaterName}</p>
            <p><b>City:</b> ${city}</p>
            <p><b>Date:</b> ${date}</p>
            <p><b>Time:</b> ${time}</p>
            <p><b>Seats:</b> ${seatText}</p>
            <h3>Total: ₹${total}</h3>
          `,
          attachments: [
            {
              filename: "ticket.pdf",
              content: pdfData,
            },
          ],
        });

        console.log("✅ Email sent successfully");
      } catch (err) {
        console.error("❌ Email failed:", err);
      }
    });

    // PDF content
    doc.fontSize(18).text("Movie Ticket", { align: "center" });
    doc.moveDown();
    doc.text(`Movie: ${movieTitle}`);
    doc.text(`Theater: ${theaterName}`);
    doc.text(`City: ${city}`);
    doc.text(`Date: ${date}`);
    doc.text(`Time: ${time}`);
    doc.text(`Seats: ${seatText}`);
    doc.text(`Total: ₹${total}`);

    doc.end();

    res.json({ message: "Booking saved (email sending...) ✅", booking });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Booking failed" });
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

// 🔹 START
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});