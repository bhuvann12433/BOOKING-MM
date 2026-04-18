import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./Seating.css";
import { useLocation } from "react-router-dom";
import { useSocket } from "../hooks/useSocket";

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
  const { date, time, movieTitle, city, theaterName } = location.state || {};

  // Socket.io setup
  const socket = useSocket();

  // State
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [lockedSeats, setLockedSeats] = useState([]); // Seats locked by other users
  const [userLockedSeats, setUserLockedSeats] = useState([]); // Seats locked by current user
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [lockTimer, setLockTimer] = useState(null);
  const [showId, setShowId] = useState("");
  const [userId, setUserId] = useState("");

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

  // 🔹 Initialize Socket.io connection
  useEffect(() => {
    if (!socket) return;

    const username = localStorage.getItem("username") || "Guest";
    const uid = localStorage.getItem("userId") || `user_${Date.now()}`;
    setUserId(uid);

    // Generate showId from location state (movie + theater + date)
    const generatedShowId = `${movieTitle}_${theaterName}_${date}`.replace(/\s+/g, "_");
    setShowId(generatedShowId);

    // Join show room
    socket.emit("join_show", {
      showId: generatedShowId,
      userId: uid,
    });

    console.log(`📡 Joining show room: ${generatedShowId}`);

    // Listen for show loaded
    socket.on("show_loaded", (data) => {
      console.log("🎭 Show loaded:", data);
      setLoading(false);
      setMessage("✅ Connected to live seat updates");
      setTimeout(() => setMessage(""), 3000);
    });

    // Cleanup
    return () => {
      socket.off("show_loaded");
    };
  }, [socket, movieTitle, theaterName, date]);

  // 🔹 Listen for real-time seat updates
  useEffect(() => {
    if (!socket) return;

    // When other users lock seats
    socket.on("seat_locked", (data) => {
      console.log("🔒 Other user locked seats:", data.seatNumbers);
      setLockedSeats((prev) => [
        ...new Set([...prev, ...data.seatNumbers]),
      ]);
      setMessage(`🔒 ${data.userId} locked seats`);
      setTimeout(() => setMessage(""), 2000);
    });

    // When seats are booked
    socket.on("seat_booked", (data) => {
      console.log("✅ Seats booked:", data.seatNumbers);
      setBookedSeats((prev) => [
        ...new Set([...prev, ...data.seatNumbers]),
      ]);
      setLockedSeats((prev) =>
        prev.filter((s) => !data.seatNumbers.includes(s))
      );
      setMessage("✅ Seats booked");
      setTimeout(() => setMessage(""), 2000);
    });

    // When seats are released
    socket.on("seat_released", (data) => {
      console.log("🔓 Seats released:", data.seatNumbers);
      setLockedSeats((prev) =>
        prev.filter((s) => !data.seatNumbers.includes(s))
      );
      setMessage("🔓 Seats available again");
      setTimeout(() => setMessage(""), 2000);
    });

    // Lock response
    socket.on("lock_success", (data) => {
      console.log("✅ Lock success:", data);
      setMessage(`✅ ${data.lockedSeats.length} seats locked for 5 minutes`);
      setTimeout(() => setMessage(""), 3000);
    });

    socket.on("lock_failed", (data) => {
      console.error("❌ Lock failed:", data.message);
      setMessage(`❌ ${data.message}`);
      setTimeout(() => setMessage(""), 3000);
      setSelectedSeats([]); // Clear failed selections
    });

    // Book response
    socket.on("book_success", (data) => {
      console.log("✅ Book success:", data);
      setUserLockedSeats([]);
      setSelectedSeats([]);
    });

    socket.on("book_failed", (data) => {
      console.error("❌ Book failed:", data.message);
      setMessage(`❌ Book failed: ${data.message}`);
      setTimeout(() => setMessage(""), 3000);
    });

    return () => {
      socket.off("seat_locked");
      socket.off("seat_booked");
      socket.off("seat_released");
      socket.off("lock_success");
      socket.off("lock_failed");
      socket.off("book_success");
      socket.off("book_failed");
    };
  }, [socket]);

  // 🔹 Fetch initial seats (REST API fallback)
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

  // 🔹 Lock seats (5-minute timeout)
  const lockSeats = useCallback(() => {
    if (!socket || !showId || selectedSeats.length === 0) return;

    const seatNumbers = selectedSeats.map((s) => {
      const [category, row, col] = s.split("-");
      return `${categoryShort[category]}${row}-${col}`;
    });

    console.log("🔒 Locking seats:", seatNumbers);

    socket.emit("lock_seat", {
      showId,
      seatNumbers,
      userId,
    });

    // Set timer for lock expiry
    setLockTimer(300); // 5 minutes
    setUserLockedSeats(selectedSeats);
  }, [socket, showId, selectedSeats, userId]);

  // 🔹 Lock countdown timer
  useEffect(() => {
    if (!lockTimer || lockTimer <= 0) return;

    const interval = setInterval(() => {
      setLockTimer((prev) => {
        if (prev <= 1) {
          setMessage("⚠️ Lock expired! Select seats again.");
          setUserLockedSeats([]);
          setSelectedSeats([]);
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

  // 🔹 Book seats (finalize)
  const bookSeatsSocket = useCallback(async () => {
    if (!socket || !showId || userLockedSeats.length === 0) return;

    const bookingId = `BOOKING_${Date.now()}`;
    const seatNumbers = userLockedSeats.map((s) => {
      const [category, row, col] = s.split("-");
      return `${categoryShort[category]}${row}-${col}`;
    });

    console.log("📦 Booking seats:", seatNumbers);

    // Emit socket event
    socket.emit("book_seat", {
      showId,
      seatNumbers,
      userId,
      bookingId,
    });

    // Also save to backend
    try {
      await axios.post(`${API}/save-booking`, {
        username: localStorage.getItem("username"),
        email: localStorage.getItem("email"),
        movieTitle,
        city,
        theaterName,
        date: getFormattedDate(date),
        time,
        seats: userLockedSeats,
        bookingId,
      });

      setMessage("✅ Booking confirmed!");
      setUserLockedSeats([]);
      setSelectedSeats([]);
      setLockTimer(null);
    } catch (err) {
      console.error("Booking failed:", err);
      setMessage("❌ Booking failed");
    }
  }, [socket, showId, userLockedSeats, userId, movieTitle, city, theaterName, date]);

  // 🔹 Unlock seats (manual cancel)
  const unlockSeats = useCallback(() => {
    if (!socket || !showId || selectedSeats.length === 0) return;

    const seatNumbers = selectedSeats.map((s) => {
      const [category, row, col] = s.split("-");
      return `${categoryShort[category]}${row}-${col}`;
    });

    socket.emit("unlock_seat", {
      showId,
      seatNumbers,
      userId,
    });

    setSelectedSeats([]);
    setUserLockedSeats([]);
    setLockTimer(null);
    setMessage("🔓 Seats released");
    setTimeout(() => setMessage(""), 2000);
  }, [socket, showId, selectedSeats, userId]);

  // 🔹 Select / Deselect
  const toggleSeatSelection = (category, row, col) => {
    const seatId = `${category}-${row}-${col}`;

    // Can't select if booked or locked by others
    const seatDisplay = `${categoryShort[category]}${row}-${col}`;
    if (bookedSeats.includes(seatId) || lockedSeats.includes(seatDisplay))
      return;

    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((s) => s !== seatId)
        : [...prev, seatId]
    );
  };

  // 🔹 Get price
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
      <h3>
        {category} ₹{price}
      </h3>

      {Array.from({ length: rows }).map((_, r) => (
        <div className="row" key={r}>
          {Array.from({ length: 20 }).map((_, c) => {
            const seatId = `${category}-${r + 1}-${c + 1}`;
            const seatDisplay = `${categoryShort[category]}${r + 1}-${c + 1}`;
            const isSelected = selectedSeats.includes(seatId);
            const isBooked = bookedSeats.includes(seatId);
            const isLockedByOther = lockedSeats.includes(seatDisplay);
            const isLockedByUser = userLockedSeats.includes(seatId);

            return (
              <button
                key={seatId}
                disabled={isBooked || isLockedByOther}
                onClick={() => toggleSeatSelection(category, r + 1, c + 1)}
                className={`seat 
                  ${isBooked ? "booked" : ""}
                  ${isLockedByOther ? "locked-other" : ""}
                  ${isLockedByUser ? "locked-by-user" : ""}
                  ${isSelected ? "selected" : ""}
                `}
                title={
                  isBooked
                    ? "Booked"
                    : isLockedByOther
                    ? "Locked by other user"
                    : ""
                }
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
              <button
                disabled={userLockedSeats.length === 0}
                onClick={bookSeatsSocket}
                className="btn-book"
              >
                ✅ Complete Booking
              </button>
              <button
                onClick={unlockSeats}
                className="btn-unlock"
              >
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