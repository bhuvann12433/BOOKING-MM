import React, { useState, useEffect, useCallback } from "react";
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

  return dateStr;
};

const Seating = () => {
  const location = useLocation();
  // ✅ FIX 1: Also pull username and email from location.state
  const { date, time, movieTitle, city, theaterName, username, email } =
    location.state || {};

  // 🔹 State
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [lockTimer, setLockTimer] = useState(null);
  const [userLockedSeats, setUserLockedSeats] = useState([]);

  const API = import.meta.env.VITE_API_URL;

  const categoryShort = {
    Premium: "P",
    Executive: "E",
    Normal: "N",
  };

  // 🔹 Fetch booked seats
  // ✅ FIX 2: Backend returns { success, count, data: [...] } not a plain array
  const fetchSeats = async () => {
    try {
      const res = await axios.get(`${API}/seats`);

      // Handle both array response and object response safely
      const seatsArray = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];

      const booked = seatsArray
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
      console.error("Failed to fetch seats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeats();
  }, []);

  // 🔹 Lock seats (local only)
  const lockSeats = useCallback(() => {
    if (selectedSeats.length === 0) return;

    setUserLockedSeats(selectedSeats);
    setLockTimer(300);
    setMessage("Seats locked for 5 minutes");
  }, [selectedSeats]);

  // 🔹 Timer logic
  useEffect(() => {
    if (!lockTimer) return;

    const interval = setInterval(() => {
      setLockTimer((prev) => {
        if (prev <= 1) {
          setMessage("⚠️ Lock expired!");
          setSelectedSeats([]);
          setUserLockedSeats([]);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [lockTimer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // 🔹 Book seats
  // ✅ FIX 3: Send username + email (required by backend)
  // ✅ FIX 4: Send seats in full format e.g. "Premium-3-12" so backend
  //           can correctly calculate price with seat.startsWith('Premium')
  const bookSeats = async () => {
    if (userLockedSeats.length === 0) return;

    // Guard: backend requires username and email
    if (!username || !email) {
      setMessage("❌ Missing user info. Please login again.");
      return;
    }

    try {
      await axios.post(`${API}/save-booking`, {
        username,
        email,
        movieTitle,
        city,
        theaterName,
        date: getFormattedDate(date),
        time,
        // Send full format seats e.g. "Premium-3-12"
        // Backend uses seat.startsWith('Premium'/'Executive') for price
        seats: userLockedSeats,
      });

      setMessage("✅ Booking confirmed!");
      setSelectedSeats([]);
      setUserLockedSeats([]);
      setLockTimer(null);
    } catch (err) {
      console.error("Booking error:", err);
      // Show backend error message if available
      const errMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Booking failed";
      setMessage(`❌ ${errMsg}`);
    }
  };

  // 🔹 Unlock seats
  const unlockSeats = () => {
    setSelectedSeats([]);
    setUserLockedSeats([]);
    setLockTimer(null);
    setMessage("🔓 Seats released");
  };

  // 🔹 Select seat
  const toggleSeatSelection = (category, row, col) => {
    const seatId = `${category}-${row}-${col}`;

    if (bookedSeats.includes(seatId)) return;

    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((s) => s !== seatId)
        : [...prev, seatId]
    );
  };

  // 🔹 Price
  const getPrice = (category) => {
    if (category === "Premium") return 250;
    if (category === "Executive") return 200;
    return 150;
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => {
    const [category] = seat.split("-");
    return sum + getPrice(category);
  }, 0);

  // Display format: P3-12
  const formattedSeats = selectedSeats.map((seat) => {
    const [category, row, col] = seat.split("-");
    return `${categoryShort[category]}${row}-${col}`;
  });

  // 🔹 Render seats
  const renderSeats = (category, price, rows) => (
    <div className="section">
      <h3>
        {category} ₹{price}
      </h3>

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
                onClick={() => toggleSeatSelection(category, r + 1, c + 1)}
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
        {message && <p className="message">{message}</p>}
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

        {lockTimer && (
          <p className="lock-timer">
            ⏱️ Lock expires in: {formatTime(lockTimer)}
          </p>
        )}

        <div className="button-group">
          {!lockTimer ? (
            <button
              disabled={!selectedSeats.length || loading}
              onClick={lockSeats}
              className="btn-lock"
            >
              🔒 Lock Seats (5 min)
            </button>
          ) : (
            <>
              <button onClick={bookSeats} className="btn-book">
                ✅ Complete Booking
              </button>
              <button onClick={unlockSeats} className="btn-unlock">
                🔓 Cancel Selection
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Seating;