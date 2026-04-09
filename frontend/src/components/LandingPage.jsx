import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landingpage-main">
      <div className="landingpage-overlay-container">
        <p className="landingpage-title">
          Welcome to Ticket Booking
        </p>
        <p className="landingpage-subtitle">
          Book your movie tickets easily, choose your seats, and enjoy the show!
        </p>
      </div>
      <div className="landingpage-buttons-container">
        <button
          className="landingpage-btn landingpage-btn-login"
          onClick={() => navigate("/LoginPage")}
        >
          Login
        </button>
        <button
          className="landingpage-btn landingpage-btn-signup"
          onClick={() => navigate("/SignupPage")}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
