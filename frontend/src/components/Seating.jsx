import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Seating.css";
import { useLocation } from "react-router-dom";

// 🔹 Convert date strings to DD/MM/YYYY format
const getFormattedDate = (dateStr) => {
  if (!dateStr) return dateStr;

  if (dateStr === "Today") {
    return new Date().toLocaleDateString("en-GB");
  }

  if (dateStr === "Tomorrow") {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toLocaleDateString("en-GB");
  }

  // If already a date, return as-is
  return dateStr;
};

const Seating = () => {
  const location = useLocation();
  const { date, time, movieTitle, city, theaterName } = location.state || {};

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  const API = import.meta.env.VITE_API_URL;

  // 🔹 Mapping frontend → backend
  const categoryMap = {
    Premium: "Sofa",
    Executive: "Chair",
    Normal: "Table",
  };

  const categoryShort = {
    Premium: "P",
    Executive: "E",
    Normal: "N",
  };

  // 🔹 Fetch seats
  const fetchSeats = async () => {
    try {
      const res = await axios.get(`${API}/seats`);

      const booked = res.data
        .filter((s) => s.booked)
        .map((s) => {
          const frontendCategory =
            s.section === "Sofa"
              ? "Premium"
              : s.section === "Chair"
              ? "Executive"
              : "Normal";

          return `${frontendCategory}-${s.row}-${s.col}`;
        });

      setBookedSeats(booked);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeats();
  }, []);

  // 🔹 Select / Deselect
  const toggleSeatSelection = (category, row, col) => {
    const seatId = `${category}-${row}-${col}`;

    if (bookedSeats.includes(seatId)) return;

    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((s) => s !== seatId)
        : [...prev, seatId]
    );
  };

  // 🔹 Booking
  const bookSeats = async () => {
    try {
      for (const seatId of selectedSeats) {
        const [category, row, col] = seatId.split("-");
        const section = categoryMap[category];

        await axios.post(`${API}/book-seat`, {
          section,
          row: Number(row),
          col: Number(col),
        });
      }

      await axios.post(`${API}/save-booking`, {
        username: localStorage.getItem("username"),
        email: localStorage.getItem("email"),
        movieTitle,
        city,
        theaterName,
        date: getFormattedDate(date),
        time,
        seats: selectedSeats,
      });

      alert("Booking Successful ✅");
      setSelectedSeats([]);
      fetchSeats();
    } catch (err) {
      console.error(err);
      alert("Booking failed");
    }
  };

  // 🔹 Seat price
  const getPrice = (category) => {
    if (category === "Premium") return 250;
    if (category === "Executive") return 200;
    return 150;
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => {
    const [category] = seat.split("-");
    return sum + getPrice(category);
  }, 0);

  const formattedSeats = selectedSeats.map((seat) => {
    const [category, row, col] = seat.split("-");
    return `${categoryShort[category]}${row}-${col}`;
  });

  // 🔹 Render seats
  const renderSeats = (category, price, rows) => (
    <div className="section">
      <h3>{category} ₹{price}</h3>

      {Array.from({ length: rows }).map((_, r) => (
        <div className="row" key={r}>
          {Array.from({ length: 20 }).map((_, c) => {
            const seatId = `${category}-${r + 1}-${c + 1}`;
            const isSelected = selectedSeats.includes(seatId);
            const isBooked = bookedSeats.includes(seatId);

            return (
              <button
                key={seatId}
                disabled={isBooked}
                onClick={() =>
                  toggleSeatSelection(category, r + 1, c + 1)
                }
                className={`seat 
                  ${isBooked ? "booked" : ""}
                  ${isSelected ? "selected" : ""}
                `}
              >
                {c + 1}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );

  return (
    <div className="container">

      {/* LEFT */}
      <div className="left">
        <h2>{movieTitle}</h2>
        <p>{city}</p>
        <p>{theaterName}</p>
        <p>{date}</p>
        <p>{time}</p>
      </div>

      {/* CENTER */}
      <div className="center">
        <div className="screen">SCREEN THIS SIDE</div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {renderSeats("Premium", 250, 3)}
            {renderSeats("Executive", 200, 3)}
            {renderSeats("Normal", 150, 3)}
          </>
        )}
      </div>

      {/* RIGHT */}
      <div className="right">
        <h3>{selectedSeats.length} Seats Selected</h3>

        <p>
          {selectedSeats.length
            ? formattedSeats.join(", ")
            : "No seats selected"}
        </p>

        <h4>Total: ₹{totalPrice}</h4>

        <button
          disabled={!selectedSeats.length}
          onClick={bookSeats}
        >
          Book Now
        </button>
      </div>

    </div>
  );
};

export default Seating;