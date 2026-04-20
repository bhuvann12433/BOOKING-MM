import React, { useEffect, useState } from "react";
import { FaHistory, FaTicketAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ProfilePage.css";

function ProfilePage() {
  const [bookingHistory, setBookingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const username = localStorage.getItem("username");
  const email = localStorage.getItem("email");
  const API = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookingHistory = async () => {
      try {
        const res = await axios.get(`${API}/booking-history/${username}`);
        const bookings = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : [];
        setBookingHistory(bookings);
      } catch (e) {
        console.error(e);
        setBookingHistory([]);
      } finally {
        setLoading(false);
      }
    };
    if (username) fetchBookingHistory();
  }, [username]);

  // ✅ FIX: Correct price calculation for both old and new seat formats
  // New format: "P1-1", "E2-3", "N3-5"
  // Old format: "Premium-1-1", "Executive-2-3", "Normal-3-5"
  const getSeatPrice = (seat) => {
    if (seat.startsWith("P") || seat.startsWith("Premium")) return 250;
    if (seat.startsWith("E") || seat.startsWith("Executive")) return 200;
    return 150; // Normal seats
  };

  const parse = (b) => {
    if (b.qrCode) {
      try {
        const p = JSON.parse(b.qrCode);
        const seats = Array.isArray(p.seats) ? p.seats : [];
        return {
          movieTitle: p.movieTitle || "N/A",
          city: p.city || "N/A",
          theaterName: p.theaterName || "N/A",
          date: p.date || "N/A",
          time: p.time || "N/A",
          seats,
          // ✅ Use getSeatPrice for correct calculation
          total: seats.reduce((s, x) => s + getSeatPrice(x), 0),
        };
      } catch {}
    }
    const seats = Array.isArray(b.seats) ? b.seats : [];
    return {
      movieTitle: b.movieTitle || "N/A",
      city: b.city || "N/A",
      theaterName: b.theaterName || "N/A",
      date: b.date || "N/A",
      time: b.time || "N/A",
      seats,
      total: b.totalAmount || 0,
    };
  };

  const allDetails = bookingHistory.map(parse);
  const totalSpent = allDetails.reduce((s, d) => s + d.total, 0);
  const uniqueMovies = new Set(allDetails.map((d) => d.movieTitle)).size;
  const initials = username ? username.slice(0, 2).toUpperCase() : "GU";

  return (
    <div className="pp-page">

      {/* BANNER */}
      <div className="pp-banner">
        <div className="pp-avatar-wrap">
          <div className="pp-avatar-inner">{initials}</div>
        </div>

        <div className="pp-user-info">
          <div className="pp-user-name">{username || "Guest"}</div>
          <div className="pp-user-email">{email || ""}</div>
        </div>

        <div className="pp-stats">
          <div className="pp-stat-box">
            <div className="pp-stat-num">{bookingHistory.length}</div>
            <div className="pp-stat-label">Booked</div>
          </div>
          <div className="pp-stat-box">
            <div className="pp-stat-num">₹{totalSpent.toLocaleString()}</div>
            <div className="pp-stat-label">Spent</div>
          </div>
          <div className="pp-stat-box">
            <div className="pp-stat-num">{uniqueMovies}</div>
            <div className="pp-stat-label">Movies</div>
          </div>
        </div>
      </div>

      {/* SECTION HEAD */}
      <div className="pp-sec-head">
        <FaHistory style={{ color: "#00ffd5", fontSize: 11, flexShrink: 0 }} />
        <span className="pp-sec-title">Booking History</span>
        <div className="pp-sec-line" />
        <span className="pp-sec-count">{bookingHistory.length}</span>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="pp-loading">Loading...</div>
      ) : bookingHistory.length === 0 ? (
        <div className="pp-empty">
          <FaTicketAlt className="pp-empty-ico" />
          <div className="pp-empty-title">No bookings yet</div>
          <div className="pp-empty-sub">Your confirmed tickets will appear here</div>
        </div>
      ) : (
        <div className="pp-cards">
          {bookingHistory.map((booking, i) => {
            const d = allDetails[i];
            return (
              <div
                key={i}
                className="pp-card"
                onClick={() => navigate("/ticket", { state: { ...booking, ...d } })}
              >
                <div className="pp-card-strip" />
                <div className="pp-card-body">

                  <div className="pp-card-row1">
                    <div className="pp-movie">{d.movieTitle}</div>
                    <div className="pp-confirmed">Confirmed</div>
                  </div>

                  <div className="pp-info-row">
                    <div className="pp-info-item">
                      <span className="pp-info-key">City</span>
                      <span className="pp-info-val">{d.city}</span>
                    </div>
                    <div className="pp-info-item">
                      <span className="pp-info-key">Theater</span>
                      <span className="pp-info-val">{d.theaterName}</span>
                    </div>
                    <div className="pp-info-item">
                      <span className="pp-info-key">Date</span>
                      <span className="pp-info-val">{d.date}</span>
                    </div>
                    <div className="pp-info-item">
                      <span className="pp-info-key">Time</span>
                      <span className="pp-info-val">{d.time}</span>
                    </div>
                    <div className="pp-info-item">
                      <span className="pp-info-key">Total</span>
                      {/* ✅ Show totalAmount from DB if available, else calculated */}
                      <span className="pp-info-val teal">
                        ₹{booking.totalAmount || d.total}
                      </span>
                    </div>
                  </div>

                  {d.seats.length > 0 && (
                    <div className="pp-card-footer">
                      <div className="pp-seats">
                        <span className="pp-seat-key">Seats</span>
                        {d.seats.map((s, j) => (
                          <span key={j} className="pp-seat-chip">{s}</span>
                        ))}
                      </div>
                      <span className="pp-view-hint">View ticket →</span>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ProfilePage;