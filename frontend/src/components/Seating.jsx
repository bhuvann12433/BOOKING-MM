import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./Seating.css";
import { useLocation, useNavigate } from "react-router-dom";
import { generateShowId } from "./SelectLocationPage";

const getFormattedDate = (dateStr) => {
  if (!dateStr) return dateStr;
  if (dateStr === "Today") return new Date().toLocaleDateString("en-GB");
  if (dateStr === "Tomorrow") {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    return t.toLocaleDateString("en-GB");
  }
  return dateStr;
};

const getCategoryFromSeatNumber = (sn) => {
  if (sn.startsWith("P")) return "Premium";
  if (sn.startsWith("E")) return "Executive";
  return "Normal";
};

const getPrice = (category) => {
  if (category === "Premium") return 250;
  if (category === "Executive") return 200;
  return 150;
};

const Seating = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    date, time, movieTitle, city, theaterName,
    username, email, showId: passedShowId, movieId,
  } = location.state || {};

  const showId = passedShowId || generateShowId(
    movieId || movieTitle || "movie",
    city || "", theaterName || "",
    date || "", time || ""
  );

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [allSeats, setAllSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [lockTimer, setLockTimer] = useState(null);
  const [userLockedSeats, setUserLockedSeats] = useState([]);

  const API = import.meta.env.VITE_API_URL;

  const fetchSeats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/seats?showId=${showId}`);
      const seatsArray = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];
      setAllSeats(seatsArray);
    } catch (err) {
      console.error("Failed to fetch seats:", err);
      setMessage("Failed to load seats. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, [showId, API]);

  useEffect(() => { fetchSeats(); }, [fetchSeats]);

  const bookedSeatNumbers = new Set(
    allSeats
      .filter((s) => s.status === "booked" || s.booked === true)
      .map((s) => s.seatNumber)
  );

  const lockSeats = useCallback(() => {
    if (selectedSeats.length === 0) return;
    setUserLockedSeats(selectedSeats);
    setLockTimer(300);
    setMessage("Seats locked for 5 minutes");
  }, [selectedSeats]);

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
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const bookSeats = async () => {
    if (userLockedSeats.length === 0) return;
    if (!username || !email) {
      setMessage("❌ Missing user info. Please login again.");
      return;
    }

    try {
      await axios.post(`${API}/save-booking`, {
        username, email, movieTitle, city, theaterName,
        date: getFormattedDate(date),
        time, showId,
        seats: userLockedSeats,
      });

      setMessage("✅ Booking confirmed! Redirecting...");
      setSelectedSeats([]);
      setUserLockedSeats([]);
      setLockTimer(null);

      // ✅ Refresh seat map immediately
      fetchSeats();

      // ✅ Navigate to profile with refresh flag after 1.5s
      setTimeout(() => {
        navigate("/ProfilePage", { state: { refresh: true } });
      }, 1500);

    } catch (err) {
      console.error("Booking error:", err);
      const errMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Booking failed";
      setMessage(`❌ ${errMsg}`);
    }
  };

  const unlockSeats = () => {
    setSelectedSeats([]);
    setUserLockedSeats([]);
    setLockTimer(null);
    setMessage("🔓 Seats released");
  };

  const toggleSeat = (seatNumber) => {
    if (bookedSeatNumbers.has(seatNumber)) return;
    setSelectedSeats((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((s) => s !== seatNumber)
        : prev.length < 8 ? [...prev, seatNumber] : prev
    );
  };

  const totalPrice = selectedSeats.reduce(
    (sum, sn) => sum + getPrice(getCategoryFromSeatNumber(sn)), 0
  );

  const renderCategory = (prefix, categoryName, price, rows, cols) => (
    <div className="section">
      <h3>{categoryName} ₹{price}</h3>
      {Array.from({ length: rows }).map((_, r) => (
        <div className="row" key={r}>
          {Array.from({ length: cols }).map((_, c) => {
            const seatNumber = `${prefix}${r + 1}-${c + 1}`;
            const isSelected = selectedSeats.includes(seatNumber);
            const isBooked = bookedSeatNumbers.has(seatNumber);
            return (
              <button
                key={seatNumber}
                disabled={isBooked}
                onClick={() => toggleSeat(seatNumber)}
                className={`seat ${isBooked ? "booked" : ""} ${isSelected ? "selected" : ""}`}
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
      <div className="left">
        <h2>{movieTitle}</h2>
        <p>{city}</p>
        <p>{theaterName}</p>
        <p>{getFormattedDate(date)}</p>
        <p>{time}</p>
        {message && <p className="message">{message}</p>}
      </div>

      <div className="center">
        <div className="screen">SCREEN THIS SIDE</div>
        {loading ? <p>Loading seats...</p> : (
          <>
            {renderCategory("P", "Premium", 250, 3, 20)}
            {renderCategory("E", "Executive", 200, 3, 20)}
            {renderCategory("N", "Normal", 150, 3, 20)}
          </>
        )}
      </div>

      <div className="right">
        <h3>{selectedSeats.length} Seats Selected</h3>
        <p>{selectedSeats.length ? selectedSeats.join(", ") : "No seats selected"}</p>
        <h4>Total: ₹{totalPrice}</h4>
        {lockTimer && <p className="lock-timer">⏱️ Lock expires in: {formatTime(lockTimer)}</p>}
        <div className="button-group">
          {!lockTimer ? (
            <button disabled={!selectedSeats.length || loading} onClick={lockSeats} className="btn-lock">
              🔒 Lock Seats (5 min)
            </button>
          ) : (
            <>
              <button onClick={bookSeats} className="btn-book">✅ Complete Booking</button>
              <button onClick={unlockSeats} className="btn-unlock">🔓 Cancel Selection</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Seating;