import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Seating.css";
import { useLocation } from "react-router-dom";

const Seating = () => {
  const location = useLocation();
  const { date, time, movieTitle, city, theaterName } = location.state || {};

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSeats = async () => {
    try {
      const response = await axios.get("http://localhost:5000/seats");
      const updatedSeats = response.data;

      const bookedSeatIds = updatedSeats
        .filter((seat) => seat.booked)
        .map((seat) => `${seat.section}-${seat.row}-${seat.col}`);

      setBookedSeats(bookedSeatIds);
    } catch (error) {
      console.error("Error fetching seats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeats();
  }, []);

  const toggleSeatSelection = (seat) => {
    const seatId = `${seat.section}-${seat.row}-${seat.col}`;

    if (bookedSeats.includes(seatId)) return;

    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId],
    );
  };

  const bookSeats = async () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat");
      return;
    }

    try {
      for (const seatId of selectedSeats) {
        const [section, row, col] = seatId.split("-");

        console.log("Booking seat:", { section, row, col });

        await axios.post("http://localhost:5000/book-seat", {
          section,
          row: Number(row),
          col: Number(col),
        });
      }

      const username = localStorage.getItem("username");
      const email = localStorage.getItem("email");

      await axios.post("http://localhost:5000/save-booking", {
        username,
        email,
        movieTitle,
        city,
        theaterName,
        date,
        time,
        seats: selectedSeats,
      });

      alert("Seats booked successfully ✅");
      setSelectedSeats([]);
      fetchSeats();
    } catch (error) {
      console.error("Error booking seats:", error);
      console.log("Backend response:", error.response?.data);
      alert(
        error?.response?.data?.error ||
          "Failed to book seats. Please try again.",
      );
    }
  };

  const renderSeats = (category, rate, rows) => (
    <div className="seating-section">
      <h3 className="seating-section-title">
        {category} - Rs. {rate}
      </h3>

      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="seating-rows">
          {Array.from({ length: 20 }).map((_, colIndex) => {
            const seatId = `${category}-${rowIndex + 1}-${colIndex + 1}`;
            const isSelected = selectedSeats.includes(seatId);
            const isBooked = bookedSeats.includes(seatId);

            return (
              <button
                key={seatId}
                type="button"
                onClick={() =>
                  toggleSeatSelection({
                    section: category,
                    row: rowIndex + 1,
                    col: colIndex + 1,
                  })
                }
                disabled={isBooked}
                className={`seat-btn ${
                  isBooked
                    ? "seat-booked"
                    : isSelected
                      ? "seat-selected"
                      : "seat-available"
                }`}
              >
                {colIndex + 1}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );

  return (
    <div className="seating-container">
      <h1 className="seating-main-title">Movie Ticket Booking</h1>

      <div className="seating-movie-details">
        <p>
          <strong>Movie:</strong> {movieTitle || "N/A"}
        </p>
        <p>
          <strong>City:</strong> {city || "N/A"}
        </p>
        <p>
          <strong>Theater:</strong> {theaterName || "N/A"}
        </p>
        <p>
          <strong>Date:</strong> {date || "N/A"}
        </p>
        <p>
          <strong>Time:</strong> {time || "N/A"}
        </p>
      </div>

      {loading ? (
        <p className="seating-loading">Loading seats...</p>
      ) : (
        <div className="seating-layout">
          {renderSeats("Sofa", 200, 5)}
          {renderSeats("Chair", 150, 5)}
          {renderSeats("Table", 100, 5)}
        </div>
      )}

      <div className="seating-selection">
        <h2 className="seating-selection-title">Selected Seats</h2>
        <p className="seating-selected-seats">
          {selectedSeats.length > 0
            ? selectedSeats.join(", ")
            : "No seats selected"}
        </p>

        <button
          onClick={bookSeats}
          disabled={selectedSeats.length === 0}
          className="seating-book-button"
        >
          Book Seats
        </button>
      </div>
    </div>
  );
};

export default Seating;
