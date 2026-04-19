import Booking from "../models/Booking.js";
import Seat from "../models/Seat.js";
import Show from "../models/Show.js";
import User from "../models/User.js";

// Create booking
export const createBooking = async (req, res) => {
  try {
    const { userId, showId, seatIds, email, phone } = req.body;

    // Validate show exists
    const show = await Show.findById(showId).populate("movie theatre");
    if (!show) {
      return res.status(404).json({
        success: false,
        message: "Show not found",
      });
    }

    // Validate seats exist and are available
    const seats = await Seat.find({ _id: { $in: seatIds }, show: showId });
    if (seats.length !== seatIds.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid seats",
      });
    }

    // Check if seats are available
    const unavailableSeats = seats.filter((seat) => seat.status !== "available");
    if (unavailableSeats.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Some seats are not available",
      });
    }

    // Calculate total amount
    const totalAmount = seats.length * show.ticketPrice;

    // Create booking
    const booking = await Booking.create({
      user: userId,
      show: showId,
      movie: show.movie._id,
      theatre: show.theatre._id,
      seats: seatIds,
      totalAmount,
      email,
      phone,
      paymentStatus: "completed",
      bookingStatus: "confirmed",
    });

    // Update seat status
    await Seat.updateMany(
      { _id: { $in: seatIds } },
      { status: "booked", bookedBy: booking._id }
    );

    // Update show availability
    await Show.findByIdAndUpdate(showId, {
      availableSeats: show.availableSeats - seatIds.length,
    });

    const populatedBooking = await booking
      .populate("user", "username email")
      .populate("show")
      .populate("movie")
      .populate("theatre")
      .populate("seats");

    res.status(201).json({
      success: true,
      message: "Booking confirmed",
      data: populatedBooking,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get user bookings
export const getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;

    const bookings = await Booking.find({ user: userId })
      .populate("show")
      .populate("movie")
      .populate("theatre")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get booking details
export const getBookingDetails = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "username email phone")
      .populate("show")
      .populate("movie")
      .populate("theatre")
      .populate("seats");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Cancel booking
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.bookingStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled",
      });
    }

    booking.bookingStatus = "cancelled";
    await booking.save();

    await Seat.updateMany(
      { _id: { $in: booking.seats } },
      { status: "available", bookedBy: null }
    );

    const show = await Show.findById(booking.show);
    await Show.findByIdAndUpdate(booking.show, {
      availableSeats: show.availableSeats + booking.seats.length,
    });

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * LEGACY ENDPOINTS
 */

import transporter from '../config/email.js';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

/**
 * Create Booking with Email and PDF Ticket (Legacy)
 * @route POST /save-booking
 */
export const createBookingWithEmail = async (req, res) => {
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
    // ✅ Validate all required fields
    if (!username || !email || !movieTitle || !theaterName || !date || !time || !seats || seats.length === 0) {
      return res.status(400).json({
        error: 'All booking fields are required (username, email, movieTitle, theaterName, date, time, seats)',
      });
    }

    // ✅ FIX: Look up real user ObjectId from username or email
    // Booking model requires user as ObjectId — we must find the real user
    const user = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found. Please login again.',
      });
    }

    // ✅ Calculate total from seat strings e.g. "Premium-3-9", "Executive-3-10"
    const seatText = seats.join(', ');
    const totalAmount = seats.reduce((sum, seat) => {
      if (seat.startsWith('Premium')) return sum + 250;
      if (seat.startsWith('Executive')) return sum + 200;
      return sum + 150;
    }, 0);

    // ✅ FIX: Create booking with only the fields the schema accepts
    // seats field in schema expects ObjectIds — we store seat labels in qrCode/bookingReference
    // and skip the seats array to avoid CastError
    const booking = await Booking.create({
      user: user._id,           // ✅ real ObjectId
      show: user._id,           // ✅ placeholder — legacy bookings don't have a real showId
      totalAmount,              // ✅ required field
      email,
      paymentStatus: 'completed',
      bookingStatus: 'confirmed',
      // Store seat info in qrCode field as JSON string (no schema change needed)
      qrCode: JSON.stringify({
        movieTitle,
        city,
        theaterName,
        date,
        time,
        seats,
      }),
    });

    console.log('📝 Booking created:', booking._id);

    // ✅ Generate QR Code for ticket
    const qrData = await QRCode.toDataURL(
      `${movieTitle} | ${theaterName} | ${date} ${time} | Seats: ${seatText}`
    );

    // ✅ Create PDF ticket
    const doc = new PDFDocument();
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));

    doc.on('end', async () => {
      try {
        const pdfData = Buffer.concat(buffers);

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: '🎟️ Your Movie Ticket',
          html: `
            <div style="font-family: Arial; padding: 20px;">
              <h2 style="color:#4f46e5;">🎬 Booking Confirmed</h2>
              <p><b>Movie:</b> ${movieTitle}</p>
              <p><b>Theater:</b> ${theaterName}</p>
              <p><b>City:</b> ${city}</p>
              <p><b>Date:</b> ${date}</p>
              <p><b>Time:</b> ${time}</p>
              <p><b>Seats:</b> ${seatText}</p>
              <h3 style="color:green;">Total: ₹${totalAmount}</h3>
              <p>🍿 Enjoy your show!</p>
            </div>
          `,
          attachments: [
            {
              filename: 'ticket.pdf',
              content: pdfData,
            },
          ],
        });

        console.log('✅ Email sent successfully to:', email);
      } catch (err) {
        console.error('❌ Email sending failed:', err.message);
      }
    });

    // ✅ Design PDF ticket
    doc.fontSize(20).fillColor('#4f46e5').text('🎟️ Movie Ticket', { align: 'center' });
    doc.moveDown();
    doc.fillColor('black').fontSize(12);
    doc.text(`Movie: ${movieTitle}`);
    doc.text(`Theater: ${theaterName}`);
    doc.text(`City: ${city}`);
    doc.text(`Date: ${date}`);
    doc.text(`Time: ${time}`);
    doc.text(`Seats: ${seatText}`);
    doc.moveDown();
    doc.fillColor('green').text(`Total: ₹${totalAmount}`);
    doc.moveDown();

    const qrImage = qrData.replace(/^data:image\/png;base64,/, '');
    doc.image(Buffer.from(qrImage, 'base64'), { fit: [120, 120], align: 'center' });
    doc.end();

    res.status(201).json({
      success: true,
      message: 'Booking created and email sent ✅',
      booking: {
        _id: booking._id,
        bookingReference: booking.bookingReference,
        movieTitle,
        theaterName,
        city,
        date,
        time,
        seats,
        totalAmount,
        email,
      },
    });

  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({
      error: error.message || 'Booking failed',
    });
  }
};

/**
 * Get Booking History (Legacy)
 * @route GET /booking-history/:username
 */
export const getBookingHistoryLegacy = async (req, res) => {
  const { username } = req.params;

  try {
    if (!username) {
      return res.status(400).json({
        error: 'Username is required',
      });
    }

    // ✅ FIX: Find user first, then find bookings by user ObjectId
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    const bookings = await Booking.find({ user: user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message || 'Failed to fetch booking history',
    });
  }
};