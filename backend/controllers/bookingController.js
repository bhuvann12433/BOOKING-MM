import Booking from "../models/Booking.js";
import Seat from "../models/Seat.js";
import Show from "../models/Show.js";
import User from "../models/User.js";

export const createBooking = async (req, res) => {
  try {
    const { userId, showId, seatIds, email, phone } = req.body;
    const show = await Show.findById(showId).populate("movie theatre");
    if (!show) return res.status(404).json({ success: false, message: "Show not found" });
    const seats = await Seat.find({ _id: { $in: seatIds }, show: showId });
    if (seats.length !== seatIds.length)
      return res.status(400).json({ success: false, message: "Invalid seats" });
    const unavailable = seats.filter((s) => s.status !== "available");
    if (unavailable.length > 0)
      return res.status(400).json({ success: false, message: "Some seats are not available" });
    const totalAmount = seats.length * show.ticketPrice;
    const booking = await Booking.create({
      user: userId, show: showId, movie: show.movie._id,
      theatre: show.theatre._id, seats: seatIds, totalAmount,
      email, phone, paymentStatus: "completed", bookingStatus: "confirmed",
    });
    await Seat.updateMany({ _id: { $in: seatIds } }, { status: "booked", bookedBy: booking._id });
    await Show.findByIdAndUpdate(showId, { availableSeats: show.availableSeats - seatIds.length });
    res.status(201).json({ success: true, message: "Booking confirmed", data: booking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.params.userId })
      .populate("show").populate("movie").populate("theatre").sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBookingDetails = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "username email phone")
      .populate("show").populate("movie").populate("theatre").populate("seats");
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    if (booking.bookingStatus === "cancelled")
      return res.status(400).json({ success: false, message: "Already cancelled" });
    booking.bookingStatus = "cancelled";
    await booking.save();
    await Seat.updateMany({ _id: { $in: booking.seats } }, { status: "available", bookedBy: null });
    const show = await Show.findById(booking.show);
    await Show.findByIdAndUpdate(booking.show, { availableSeats: show.availableSeats + booking.seats.length });
    res.status(200).json({ success: true, message: "Booking cancelled", data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// LEGACY: POST /save-booking
// ============================================

import transporter from "../config/email.js";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";

const getSeatPrice = (seat) => {
  if (seat.startsWith("P") || seat.startsWith("Premium")) return 250;
  if (seat.startsWith("E") || seat.startsWith("Executive")) return 200;
  return 150;
};

export const createBookingWithEmail = async (req, res) => {
  const { username, email, movieTitle, city, theaterName, date, time, seats, showId } = req.body;

  try {
    if (!username || !email || !movieTitle || !theaterName || !date || !time || !seats || seats.length === 0) {
      return res.status(400).json({ error: "All booking fields are required" });
    }

    const user = await User.findOne({ $or: [{ username }, { email }] });
    if (!user) return res.status(404).json({ error: "User not found. Please login again." });

    const seatText = seats.join(", ");
    const totalAmount = seats.reduce((sum, seat) => sum + getSeatPrice(seat), 0);

    const booking = await Booking.create({
      user: user._id,
      show: user._id,
      totalAmount,
      email,
      paymentStatus: "completed",
      bookingStatus: "confirmed",
      qrCode: JSON.stringify({ movieTitle, city, theaterName, date, time, seats }),
    });

    // ✅ DEBUG LOGS — check these in Render logs
    console.log("=".repeat(50));
    console.log("🎯 BOOKING showId received:", showId);
    console.log("🎯 BOOKING showId type:", typeof showId);
    console.log("🎯 BOOKING seats:", seats);
    console.log("🎯 BOOKING totalAmount:", totalAmount);
    console.log("=".repeat(50));

    if (showId && seats.length > 0) {
      // First check how many seats exist for this showId
      const existingSeats = await Seat.countDocuments({ show: showId });
      console.log(`🔍 Seats found in DB for show ${showId}: ${existingSeats}`);

      const updateResult = await Seat.updateMany(
        { show: showId, seatNumber: { $in: seats } },
        {
          status: "booked",
          booked: true,
          bookedAt: new Date(),
          lockedBy: null,
          lockExpiry: null,
        }
      );
      console.log(`✅ Seat updateMany result: matched=${updateResult.matchedCount} modified=${updateResult.modifiedCount}`);

      if (updateResult.modifiedCount === 0) {
        console.log("❌ NO SEATS WERE UPDATED — showId mismatch or seats not found!");
        // Try to find what showIds exist in DB
        const distinctShows = await Seat.distinct("show");
        console.log("📋 All showIds in DB:", distinctShows);
      }
    } else {
      console.log("⚠️ showId missing or seats empty — skipping seat update");
    }

    // Generate QR
    const qrData = await QRCode.toDataURL(
      `${movieTitle} | ${theaterName} | ${date} ${time} | Seats: ${seatText}`
    );

    const doc = new PDFDocument();
    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));

    doc.on("end", async () => {
      try {
        const pdfData = Buffer.concat(buffers);
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: "🎟️ Your Movie Ticket",
          html: `
            <div style="font-family:Arial;padding:20px;">
              <h2 style="color:#4f46e5;">🎬 Booking Confirmed</h2>
              <p><b>Movie:</b> ${movieTitle}</p>
              <p><b>Theater:</b> ${theaterName}</p>
              <p><b>City:</b> ${city}</p>
              <p><b>Date:</b> ${date}</p>
              <p><b>Time:</b> ${time}</p>
              <p><b>Seats:</b> ${seatText}</p>
              <h3 style="color:green;">Total: ₹${totalAmount}</h3>
              <p>🍿 Enjoy your show!</p>
            </div>`,
          attachments: [{ filename: "ticket.pdf", content: pdfData }],
        });
        console.log("✅ Email sent to:", email);
      } catch (err) {
        console.error("❌ Email failed:", err.message);
      }
    });

    doc.fontSize(20).fillColor("#4f46e5").text("🎟️ Movie Ticket", { align: "center" });
    doc.moveDown();
    doc.fillColor("black").fontSize(12);
    doc.text(`Movie: ${movieTitle}`);
    doc.text(`Theater: ${theaterName}`);
    doc.text(`City: ${city}`);
    doc.text(`Date: ${date}`);
    doc.text(`Time: ${time}`);
    doc.text(`Seats: ${seatText}`);
    doc.moveDown();
    doc.fillColor("green").text(`Total: ₹${totalAmount}`);
    doc.moveDown();
    const qrImage = qrData.replace(/^data:image\/png;base64,/, "");
    doc.image(Buffer.from(qrImage, "base64"), { fit: [120, 120], align: "center" });
    doc.end();

    res.status(201).json({
      success: true,
      message: "Booking created and email sent ✅",
      booking: {
        _id: booking._id,
        bookingReference: booking.bookingReference,
        movieTitle, theaterName, city, date, time, seats, totalAmount, email,
      },
    });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ error: error.message || "Booking failed" });
  }
};

// ============================================
// LEGACY: GET /booking-history/:username
// ============================================

export const getBookingHistoryLegacy = async (req, res) => {
  const { username } = req.params;
  try {
    if (!username) return res.status(400).json({ error: "Username is required" });
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });
    const bookings = await Booking.find({ user: user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch booking history" });
  }
};