import Seat from "../models/Seat.js";
import Show from "../models/Show.js";
import mongoose from "mongoose";

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id) &&
  id.length === 24 &&
  /^[0-9a-f]+$/i.test(id);

const DEFAULT_LAYOUT = {
  premium:   { rows: 3, cols: 20 },
  executive: { rows: 3, cols: 20 },
  normal:    { rows: 3, cols: 20 },
};

const autoCreateSeats = async (showId) => {
  const seats = [];
  for (let r = 1; r <= DEFAULT_LAYOUT.premium.rows; r++)
    for (let c = 1; c <= DEFAULT_LAYOUT.premium.cols; c++)
      seats.push({ show: showId, seatNumber: `P${r}-${c}`, row: `${r}`, col: c, status: "available", booked: false });
  for (let r = 1; r <= DEFAULT_LAYOUT.executive.rows; r++)
    for (let c = 1; c <= DEFAULT_LAYOUT.executive.cols; c++)
      seats.push({ show: showId, seatNumber: `E${r}-${c}`, row: `${r}`, col: c, status: "available", booked: false });
  for (let r = 1; r <= DEFAULT_LAYOUT.normal.rows; r++)
    for (let c = 1; c <= DEFAULT_LAYOUT.normal.cols; c++)
      seats.push({ show: showId, seatNumber: `N${r}-${c}`, row: `${r}`, col: c, status: "available", booked: false });
  await Seat.insertMany(seats, { ordered: false });
  console.log(`✅ Auto-created ${seats.length} seats for show: ${showId}`);
};

const findSeatsByShow = (showId) => {
  if (isValidObjectId(showId))
    return Seat.find({ show: new mongoose.Types.ObjectId(showId) });
  return Seat.find({ show: showId });
};

const releaseLocksSafe = async (showId) => {
  try {
    await Seat.updateMany(
      { show: showId, status: "locked", lockExpiry: { $lt: new Date() } },
      { status: "available", lockedBy: null, lockExpiry: null }
    );
  } catch (err) {
    console.error("Lock release error:", err.message);
  }
};

// ============================================
// GET ALL SEATS — GET /seats?showId=xxx
// ============================================
export const getAllSeats = async (req, res) => {
  try {
    const { showId } = req.query;

    if (!showId) {
      return res.status(400).json({ success: false, error: "showId is required" });
    }

    // ✅ DEBUG LOG — compare this with booking log
    console.log("=".repeat(50));
    console.log("🔍 FETCH showId received:", showId);
    console.log("🔍 FETCH showId type:", typeof showId);
    console.log("=".repeat(50));

    await releaseLocksSafe(showId);

    let seats = await findSeatsByShow(showId).sort({ seatNumber: 1 });

    console.log(`🔍 FETCH found ${seats.length} seats for showId: ${showId}`);

    if (seats.length === 0) {
      console.log(`🎬 Auto-creating seats for show: ${showId}`);
      await autoCreateSeats(showId);
      seats = await findSeatsByShow(showId).sort({ seatNumber: 1 });
      console.log(`✅ After auto-create: ${seats.length} seats`);
    } else {
      const booked = seats.filter(s => s.status === "booked" || s.booked).length;
      console.log(`📊 Seats: total=${seats.length} booked=${booked} available=${seats.length - booked}`);
    }

    res.status(200).json({ success: true, count: seats.length, data: seats });
  } catch (error) {
    console.error("getAllSeats error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const bookSeat = async (req, res) => {
  const { showId, seatNumber } = req.body;
  try {
    if (!showId || !seatNumber)
      return res.status(400).json({ error: "showId and seatNumber are required" });
    const seat = await Seat.findOne({ show: showId, seatNumber });
    if (!seat) return res.status(404).json({ error: "Seat not found" });
    if (seat.booked || seat.status === "booked")
      return res.status(400).json({ error: "Seat already booked" });
    seat.booked = true;
    seat.status = "booked";
    seat.bookedAt = new Date();
    await seat.save();
    res.status(200).json({ success: true, message: "Seat booked ✅", data: seat });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const markSeatsBooked = async (showId, seatNumbers) => {
  try {
    await Seat.updateMany(
      { show: showId, seatNumber: { $in: seatNumbers } },
      { status: "booked", booked: true, bookedAt: new Date(), lockedBy: null, lockExpiry: null }
    );
  } catch (err) {
    console.error("markSeatsBooked error:", err.message);
  }
};

export const getSeatLayout = async (req, res) => {
  try {
    const { showId } = req.params;
    const seats = await findSeatsByShow(showId).sort({ row: 1, col: 1 });
    if (!seats.length)
      return res.status(404).json({ success: false, message: "No seats found" });
    const seatsByRow = seats.reduce((acc, s) => {
      if (!acc[s.row]) acc[s.row] = [];
      acc[s.row].push(s);
      return acc;
    }, {});
    res.status(200).json({ success: true, data: { totalSeats: seats.length, seatsByRow, seats } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAvailableSeats = async (req, res) => {
  try {
    const seats = await Seat.find({ show: req.params.showId, status: "available" }).sort({ row: 1, col: 1 });
    res.status(200).json({ success: true, count: seats.length, data: seats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBookedSeats = async (req, res) => {
  try {
    const seats = await Seat.find({ show: req.params.showId, status: "booked" }).sort({ row: 1, col: 1 });
    res.status(200).json({ success: true, count: seats.length, data: seats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const checkSeatAvailability = async (req, res) => {
  try {
    const unavailable = await Seat.find({ _id: { $in: req.body.seatIds }, status: { $ne: "available" } });
    if (unavailable.length > 0)
      return res.status(200).json({ success: false, available: false, unavailableSeats: unavailable });
    res.status(200).json({ success: true, available: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const lockSeats = async (req, res) => {
  try {
    const { showId, seatNumbers, userId } = req.body;
    if (!showId || !seatNumbers || !Array.isArray(seatNumbers) || !userId)
      return res.status(400).json({ success: false, message: "Required: showId, seatNumbers, userId" });
    await releaseLocksSafe(showId);
    const lockedSeats = [], failedSeats = [];
    for (const seatNumber of seatNumbers) {
      const lockExpiry = new Date(Date.now() + 300 * 1000);
      const updated = await Seat.findOneAndUpdate(
        { show: showId, seatNumber, $or: [{ status: "available" }, { status: "locked", lockExpiry: { $lt: new Date() } }] },
        { status: "locked", lockedBy: userId, lockExpiry },
        { new: true }
      );
      if (updated) lockedSeats.push({ seatNumber });
      else failedSeats.push({ seatNumber, reason: "Unavailable" });
    }
    res.status(200).json({ success: failedSeats.length === 0, lockedSeats, failedSeats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSeatsByShow = async (req, res) => {
  try {
    const { showId } = req.params;
    await releaseLocksSafe(showId);
    const seats = await findSeatsByShow(showId).sort({ row: 1, col: 1 });
    if (!seats.length)
      return res.status(404).json({ success: false, message: "No seats found" });
    const seatsByRow = seats.reduce((acc, s) => {
      if (!acc[s.row]) acc[s.row] = [];
      acc[s.row].push(s);
      return acc;
    }, {});
    res.status(200).json({ success: true, showId, seatLayout: seatsByRow, seats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const unlockSeats = async (req, res) => {
  try {
    const { showId, seatNumbers, userId } = req.body;
    if (!showId || !seatNumbers || !Array.isArray(seatNumbers) || !userId)
      return res.status(400).json({ success: false, message: "Required: showId, seatNumbers, userId" });
    const unlockedSeats = [], failedSeats = [];
    for (const seatNumber of seatNumbers) {
      const result = await Seat.findOneAndUpdate(
        { show: showId, seatNumber, status: "locked", lockedBy: userId },
        { status: "available", lockedBy: null, lockExpiry: null },
        { new: true }
      );
      if (result) unlockedSeats.push({ seatNumber });
      else failedSeats.push({ seatNumber, reason: "Not locked by you" });
    }
    res.status(200).json({ success: true, unlockedSeats, failedSeats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const bookSeatsAtomic = async (req, res) => {
  try {
    const { showId, seatNumbers, userId, bookingId } = req.body;
    if (!showId || !seatNumbers || !Array.isArray(seatNumbers) || !userId)
      return res.status(400).json({ success: false, message: "Required: showId, seatNumbers, userId" });
    const bookedSeats = [], failedSeats = [];
    for (const seatNumber of seatNumbers) {
      const updated = await Seat.findOneAndUpdate(
        { show: showId, seatNumber, status: "locked", lockedBy: userId, lockExpiry: { $gt: new Date() } },
        { status: "booked", bookedBy: userId, bookingReference: bookingId, bookedAt: new Date(), booked: true },
        { new: true }
      );
      if (updated) bookedSeats.push({ seatNumber });
      else failedSeats.push({ seatNumber, reason: "Lock expired or wrong user" });
    }
    res.status(bookedSeats.length === 0 ? 409 : 200).json({
      success: failedSeats.length === 0, bookedSeats, failedSeats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const releaseExpiredLocksManual = async (req, res) => {
  try {
    const result = await Seat.updateMany(
      { status: "locked", lockExpiry: { $lt: new Date() } },
      { status: "available", lockedBy: null, lockExpiry: null }
    );
    res.status(200).json({ success: true, releasedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};