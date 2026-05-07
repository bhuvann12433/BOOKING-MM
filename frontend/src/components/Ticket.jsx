import React, { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./Ticket.css";

// ✅ Same price logic as bookingController and ProfilePage
const getSeatPrice = (seat) => {
  if (seat.startsWith("P") || seat.startsWith("Premium")) return 250;
  if (seat.startsWith("E") || seat.startsWith("Executive")) return 200;
  return 150;
};

// ✅ Format seat for display — handles both old and new formats
// New: "P1-1" → "P1-1" (already clean)
// Old: "Premium-1-1" → "P1-1"
const formatSeat = (seat) => {
  if (seat.startsWith("Premium-")) {
    const parts = seat.replace("Premium-", "").split("-");
    return `P${parts[0]}-${parts[1]}`;
  }
  if (seat.startsWith("Executive-")) {
    const parts = seat.replace("Executive-", "").split("-");
    return `E${parts[0]}-${parts[1]}`;
  }
  if (seat.startsWith("Normal-")) {
    const parts = seat.replace("Normal-", "").split("-");
    return `N${parts[0]}-${parts[1]}`;
  }
  // Already in new format (P1-1, E2-3, N3-5)
  return seat;
};

// ✅ Normalize date — always show clean format
const formatDate = (date) => {
  if (!date) return "N/A";
  // Already formatted like "20/04/2026" → keep as is
  if (date.includes("/")) return date;
  // Raw like "19 Apr", "Today", "Tomorrow" → show as is
  return date;
};

const Ticket = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const ticketRef = useRef();

  if (!state) {
    return (
      <div className="ticket-error">
        <h2>No booking found</h2>
        <p>Please open from booking history</p>
        <button onClick={() => navigate("/ProfilePage")} style={{
          marginTop: "16px", padding: "8px 20px",
          background: "#00ffd5", border: "none",
          borderRadius: "8px", cursor: "pointer", fontWeight: "600"
        }}>
          Go to Profile
        </button>
      </div>
    );
  }

  // ✅ Safely get seats array
  const rawSeats = Array.isArray(state.seats) ? state.seats : [];

  // ✅ Format seats for display
  const formattedSeats = rawSeats.map(formatSeat);

  // ✅ Use totalAmount from DB if available, else calculate
  const totalPrice = state.totalAmount ||
    rawSeats.reduce((sum, seat) => sum + getSeatPrice(seat), 0);

  // ✅ QR code data
  const qrValue = `Movie: ${state.movieTitle}
Theater: ${state.theaterName}
City: ${state.city}
Date: ${formatDate(state.date)}
Time: ${state.time}
Seats: ${formattedSeats.join(", ")}
Total: ₹${totalPrice}
ID: ${state._id || state.bookingReference || "N/A"}`;

  // ✅ Download PDF
  const downloadPDF = async () => {
    const canvas = await html2canvas(ticketRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    pdf.save(`Ticket_${state.movieTitle}_${state.time}.pdf`);
  };

  return (
    <div className="ticket-container">
      <div ref={ticketRef} className="ticket-card">

        <h2 className="ticket-title">🎟️ Booking Confirmed</h2>

        <div className="ticket-info">
          <p><strong>Movie:</strong> {state.movieTitle}</p>
          <p><strong>City:</strong> {state.city}</p>
          <p><strong>Theater:</strong> {state.theaterName}</p>
          {/* ✅ Always show clean date */}
          <p><strong>Date:</strong> {formatDate(state.date)}</p>
          <p><strong>Time:</strong> {state.time}</p>
        </div>

        <div className="ticket-seats">
          <p><strong>Seats:</strong></p>
          {/* ✅ Show formatted seat names */}
          <span>{formattedSeats.length > 0 ? formattedSeats.join(", ") : "N/A"}</span>
        </div>

        {/* ✅ Correct total from DB or calculated */}
        <h3 className="ticket-total">Total: ₹{totalPrice}</h3>

        <div className="ticket-qr">
          <QRCodeCanvas value={qrValue} size={120} />
        </div>

        <p className="ticket-id">
          Booking ID: {state._id || state.bookingReference || "AUTO"}
        </p>

      </div>

      {/* ✅ PDF download button */}
      <button className="download-btn" onClick={downloadPDF}>
        Download Ticket PDF
      </button>

      {/* ✅ Back button — was missing before! */}
      <button
        className="back-btn"
        onClick={() => navigate("/ProfilePage")}
      >
        ← Back to Profile
      </button>

    </div>
  );
};

export default Ticket;