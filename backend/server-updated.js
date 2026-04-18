import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";

// Import models
import User from "./models/User.js";
import Movie from "./models/Movie.js";
import Theatre from "./models/Theatre.js";
import Show from "./models/Show.js";
import Seat from "./models/Seat.js";
import Booking from "./models/Booking.js";

// Import routes
import movieRoutes from "./routes/movies.js";
import theatreRoutes from "./routes/theatres.js";
import showRoutes from "./routes/shows.js";
import seatRoutes from "./routes/seats.js";
import bookingRoutes from "./routes/bookings.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
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

// 🔥 DB CONNECTION
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

// 🔹 ROOT ENDPOINT
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Movie Booking Backend API",
    version: "1.0.0",
    endpoints: {
      auth: ["/signup", "/login"],
      api: [
        "/api/movies",
        "/api/theatres",
        "/api/shows",
        "/api/seats",
        "/api/bookings",
      ],
    },
  });
});

// ========================
// AUTHENTICATION ROUTES
// ========================

// 🔹 SIGNUP
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user exists
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return res
        .status(400)
        .json({ error: "User already exists with this email or username" });
    }

    // Create new user
    const user = await User.create({ username, email, password });

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Signup failed",
    });
  }
});

// 🔹 LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Login failed",
    });
  }
});

// ========================
// API ROUTES
// ========================

app.use("/api/movies", movieRoutes);
app.use("/api/theatres", theatreRoutes);
app.use("/api/shows", showRoutes);
app.use("/api/seats", seatRoutes);
app.use("/api/bookings", bookingRoutes);

// ========================
// LEGACY ENDPOINTS (Backward Compatibility)
// ========================

// 🔹 GET SEATS (Legacy)
app.get("/seats", async (req, res) => {
  try {
    const seats = await Seat.find().populate("show").limit(100);
    res.json(seats);
  } catch (error) {
    res.status(500).json({ error: "Seat fetch error" });
  }
});

// 🔹 BOOK SEAT (Legacy)
app.post("/book-seat", async (req, res) => {
  const { seatId } = req.body;

  try {
    const seat = await Seat.findById(seatId);

    if (!seat) {
      return res.status(404).json({ error: "Seat not found" });
    }

    if (seat.status !== "available") {
      return res.status(400).json({ error: "Seat already booked" });
    }

    seat.status = "blocked";
    await seat.save();

    res.json({ message: "Seat blocked ✅", seat });
  } catch (error) {
    res.status(500).json({ error: "Booking failed" });
  }
});

// 🔥 SAVE BOOKING + EMAIL + QR PDF (Legacy with improvements)
app.post("/save-booking", async (req, res) => {
  const { username, email, movieTitle, city, theaterName, date, time, seats } =
    req.body;

  try {
    // Validate input
    if (
      !username ||
      !email ||
      !movieTitle ||
      !city ||
      !theaterName ||
      !date ||
      !time ||
      !seats ||
      seats.length === 0
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Create booking
    const booking = await Booking.create({
      user: null, // Could be linked if authentication is done
      email,
      seats,
      totalAmount: seats.length * 250,
      bookingStatus: "confirmed",
      paymentStatus: "completed",
    });

    console.log("📩 Sending email to:", email);

    const seatText = seats.join(", ");

    const total = seats.reduce((sum) => sum + 250, 0);

    // 🔥 GENERATE QR
    try {
      const qrData = await QRCode.toDataURL(
        `${movieTitle} | ${theaterName} | ${date} ${time} | Seats: ${seatText} | Ref: ${booking.bookingReference}`
      );

      const doc = new PDFDocument();
      let buffers = [];

      doc.on("data", buffers.push.bind(buffers));

      doc.on("end", async () => {
        try {
          const pdfData = Buffer.concat(buffers);

          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "🎟️ Your Movie Ticket - " + movieTitle,
            html: `
              <div style="font-family: Arial; padding: 20px; background: #f0f0f0;">
                <div style="background: white; padding: 20px; border-radius: 8px;">
                  <h2 style="color:#4f46e5;">🎬 Booking Confirmed</h2>
                  <hr>
                  <p><b>Booking Reference:</b> ${booking.bookingReference}</p>
                  <p><b>Movie:</b> ${movieTitle}</p>
                  <p><b>Theater:</b> ${theaterName}</p>
                  <p><b>City:</b> ${city}</p>
                  <p><b>Date:</b> ${date}</p>
                  <p><b>Time:</b> ${time}</p>
                  <p><b>Seats:</b> ${seatText}</p>
                  <hr>
                  <h3 style="color:green;">Total Amount: ₹${total}</h3>
                  <p style="color: #666;">🍿 Please arrive 15 minutes before show time. Have a great time!</p>
                </div>
              </div>
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

      // 🔥 PDF DESIGN
      doc
        .fontSize(20)
        .fillColor("#4f46e5")
        .text("🎟️ Movie Ticket", { align: "center" });

      doc.moveDown();
      doc.fillColor("black").fontSize(12);

      doc.text(`Booking Reference: ${booking.bookingReference}`);
      doc.text(`Movie: ${movieTitle}`);
      doc.text(`Theater: ${theaterName}`);
      doc.text(`City: ${city}`);
      doc.text(`Date: ${date}`);
      doc.text(`Time: ${time}`);
      doc.text(`Seats: ${seatText}`);

      doc.moveDown();
      doc.fillColor("green").text(`Total: ₹${total}`);

      doc.moveDown();

      // 🔥 QR ADD
      const qrImage = qrData.replace(/^data:image\/png;base64,/, "");
      doc.image(Buffer.from(qrImage, "base64"), {
        fit: [120, 120],
        align: "center",
      });

      doc.end();
    } catch (qrError) {
      console.error("QR Code generation failed:", qrError);
      // Continue without QR if it fails
    }

    res.json({
      success: true,
      message: "Booking + Email Sent ✅",
      booking,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message || "Booking failed",
    });
  }
});

// 🔹 BOOKING HISTORY (Legacy)
app.get("/booking-history/:username", async (req, res) => {
  try {
    const bookings = await Booking.find().limit(50).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "History error",
    });
  }
});

// ========================
// ERROR HANDLING
// ========================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    path: req.path,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// ========================
// START SERVER
// ========================

app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║  🎬 Movie Booking Backend API          ║
  ║  Listening on: http://localhost:${PORT}      ║
  ║  Environment: ${process.env.NODE_ENV || "development"}        ║
  ╚════════════════════════════════════════╝
  `);
});

export default app;
