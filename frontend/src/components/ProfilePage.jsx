import React, { useEffect, useState } from "react";
import { FaUser, FaHistory } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // 🔥 ADD
import axios from "axios";
import "./ProfilePage.css";

function ProfilePage() {
  const [bookingHistory, setBookingHistory] = useState([]);
  const username = localStorage.getItem("username");

  const API = import.meta.env.VITE_API_URL;
  const navigate = useNavigate(); // 🔥 ADD

  useEffect(() => {
    const fetchBookingHistory = async () => {
      try {
        const response = await axios.get(
          `${API}/booking-history/${username}`
        );
        setBookingHistory(response.data);
      } catch (error) {
        console.error("Error fetching booking history:", error);
      }
    };

    if (username) {
      fetchBookingHistory();
    }
  }, [username]);

  return (
    <div className="profile-page">

      {/* Header */}
      <div className="header">
        <FaUser className="profile-icon" />
        <h2 className="profile-name">{username || "Guest User"}</h2>
      </div>

      {/* Booking History */}
      <div className="history-box">
        <div className="history-title">
          <FaHistory className="history-icon" />
          <h3>Booking History</h3>
        </div>

        {bookingHistory.length === 0 ? (
          <p className="no-bookings">No bookings right now</p>
        ) : (
          <div className="booking-list">
            {bookingHistory.map((booking, index) => (
              
              // 🔥 CLICKABLE CARD
              <div
                key={index}
                className="booking-card"
                onClick={() => navigate("/ticket", { state: booking })}
                style={{ cursor: "pointer" }}
              >
                <div className="booking-grid">

                  <div>
                    <strong>🎬 Movie:</strong> {booking.movieTitle || "N/A"}
                  </div>

                  <div>
                    <strong>📍 City:</strong> {booking.city || "N/A"}
                  </div>

                  <div>
                    <strong>🎭 Theater:</strong> {booking.theaterName || "N/A"}
                  </div>

                  <div>
                    <strong>📅 Date:</strong> {booking.date || "N/A"}
                  </div>

                  <div>
                    <strong>⏰ Time:</strong> {booking.time || "N/A"}
                  </div>

                  <div>
                    <strong>💺 Seats:</strong>{" "}
                    {booking.seats?.length > 0
                      ? booking.seats.join(", ")
                      : "N/A"}
                  </div>

                </div>

                {/* 🔥 Hint for user */}
                <div style={{ marginTop: "10px", fontSize: "12px", color: "#94a3b8" }}>
                  Click to view ticket 🎟️
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default ProfilePage;