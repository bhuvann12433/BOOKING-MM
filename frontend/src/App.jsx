import React from "react";
import { Routes, Route } from "react-router-dom";

import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import HomePage from "./components/HomePage";
import Searchbar from "./components/Searchbar";
import ProfilePage from "./components/ProfilePage";
import BuyTicket from "./components/BuyTicket";
import Seating from "./components/Seating";
import Ticket from "./components/Ticket"; // 🔥 ADD THIS

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/LandingPage" element={<LandingPage />} />
      <Route path="/LoginPage" element={<LoginPage />} />
      <Route path="/SignupPage" element={<SignupPage />} />
      <Route path="/Searchbar" element={<Searchbar />} />
      <Route path="/ProfilePage" element={<ProfilePage />} />
      <Route path="/BuyTicket" element={<BuyTicket />} />

      {/* Seat Booking */}
      <Route path="/SeatBooking" element={<Seating />} />

      {/* 🔥 Ticket Page (IMPORTANT) */}
      <Route path="/ticket" element={<Ticket />} />
    </Routes>
  );
};

export default App;