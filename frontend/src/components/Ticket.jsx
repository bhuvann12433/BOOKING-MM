import React, { useRef } from "react";
import { useLocation } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react"; // ✅ FIXED IMPORT
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./Ticket.css";

const Ticket = () => {
  const { state } = useLocation();
  const ticketRef = useRef();

  if (!state) {
    return (
      <div className="ticket-error">
        <h2>No booking found</h2>
        <p>Please open from booking history</p>
      </div>
    );
  }

  const categoryShort = {
    Premium: "P",
    Executive: "E",
    Normal: "N",
  };

  // 🔹 Format seats
  const formattedSeats = state.seats.map((seat) => {
    const [category, row, col] = seat.split("-");
    return `${categoryShort[category]}${row}-${col}`;
  });

  // 🔹 Total price
  const totalPrice = state.seats.reduce((sum, seat) => {
    if (seat.startsWith("Premium")) return sum + 250;
    if (seat.startsWith("Executive")) return sum + 200;
    return sum + 150;
  }, 0);

  // 🔥 PDF FUNCTION
  const downloadPDF = async () => {
    const canvas = await html2canvas(ticketRef.current);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    pdf.save("Movie_Ticket.pdf");
  };

  return (
    <div className="ticket-container">

      <div ref={ticketRef} className="ticket-card">

        <h2 className="ticket-title">🎟️ Booking Confirmed</h2>

        <div className="ticket-info">
          <p><strong>Movie:</strong> {state.movieTitle}</p>
          <p><strong>City:</strong> {state.city}</p>
          <p><strong>Theater:</strong> {state.theaterName}</p>
          <p><strong>Date:</strong> {state.date}</p>
          <p><strong>Time:</strong> {state.time}</p>
        </div>

        <div className="ticket-seats">
          <p><strong>Seats:</strong></p>
          <span>{formattedSeats.join(", ")}</span>
        </div>

        <h3 className="ticket-total">Total: ₹{totalPrice}</h3>

        {/* 🔥 FIXED QR */}
        <div className="ticket-qr">
          <QRCodeCanvas
            value={`Movie: ${state.movieTitle}
Seats: ${formattedSeats.join(", ")}
Time: ${state.time}`}
            size={120}
          />
        </div>

        <p className="ticket-id">
          Booking ID: {state._id || "AUTO"}
        </p>

      </div>

      <button className="download-btn" onClick={downloadPDF}>
        Download Ticket PDF
      </button>

    </div>
  );
};

export default Ticket;