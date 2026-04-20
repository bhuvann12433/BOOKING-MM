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

  const getSeatPrice = (seat) => {
    if (seat.startsWith("P") || seat.startsWith("Premium")) return 250;
    if (seat.startsWith("E") || seat.startsWith("Executive")) return 200;
    return 150;
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

      {/* ===== BANNER ===== */}
      <div className="pp-banner">
        <div className="pp-banner-content">

          <div className="pp-profile-main">
            <div className="pp-avatar-wrap">
              <div className="pp-avatar-inner">{initials}</div>
            </div>

            <div>
              <div className="pp-user-name">{username || "Guest"}</div>
              <div className="pp-user-email">{email || ""}</div>
            </div>
          </div>

          <div className="pp-stats">
            <div className="pp-stat-box">
              <span className="pp-stat-num">{bookingHistory.length}</span>
              <span className="pp-stat-label">Booked</span>
            </div>
            <div className="pp-stat-box">
              <span className="pp-stat-num">₹{totalSpent.toLocaleString()}</span>
              <span className="pp-stat-label">Spent</span>
            </div>
            <div className="pp-stat-box">
              <span className="pp-stat-num">{uniqueMovies}</span>
              <span className="pp-stat-label">Movies</span>
            </div>
          </div>

        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="pp-content-wrapper">

        <div className="pp-sec-head">
          <FaHistory className="pp-sec-icon" />
          <span className="pp-sec-title">Booking History</span>
          <div className="pp-sec-line" />
        </div>

        {loading ? (
          <div className="pp-loading">Loading...</div>
        ) : bookingHistory.length === 0 ? (
          <div className="pp-loading">
            <FaTicketAlt size={40} />
            <p>No bookings yet</p>
          </div>
        ) : (
          <div className="pp-cards">
            {bookingHistory.map((booking, i) => {
              const d = allDetails[i];
              return (
                <div
                  key={i}
                  className="pp-card"
                  onClick={() =>
                    navigate("/ticket", { state: { ...booking, ...d } })
                  }
                >
                  <div className="pp-card-strip" />

                  <div className="pp-card-body">

                    <div className="pp-card-header-row">
                      <div className="pp-movie-title">{d.movieTitle}</div>
                      <div className="pp-status-badge">Confirmed</div>
                    </div>

                    <div className="pp-info-grid">
                      <div className="pp-info-group">
                        <label>City</label>
                        <span>{d.city}</span>
                      </div>
                      <div className="pp-info-group">
                        <label>Theater</label>
                        <span>{d.theaterName}</span>
                      </div>
                      <div className="pp-info-group">
                        <label>Date</label>
                        <span>{d.date}</span>
                      </div>
                      <div className="pp-info-group">
                        <label>Time</label>
                        <span>{d.time}</span>
                      </div>
                      <div className="pp-info-group">
                        <label>Total</label>
                        <span>₹{booking.totalAmount || d.total}</span>
                      </div>
                    </div>

                    <div className="pp-card-footer">
                      <div>
                        {d.seats.map((s, j) => (
                          <span key={j} className="pp-seat-tag">{s}</span>
                        ))}
                      </div>

                      <div className="pp-price-action">
                        <span className="pp-total-price">
                          ₹{booking.totalAmount || d.total}
                        </span>
                        <span className="pp-arrow">→</span>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;