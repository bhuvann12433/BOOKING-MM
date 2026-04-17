import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./SelectLocationPage.css";
import data from "../data/theatres.json";

function SelectLocationPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [selectedCity, setSelectedCity] = useState("");
  const [selectedTheatre, setSelectedTheatre] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedDate, setSelectedDate] = useState("Today");
  const [search, setSearch] = useState("");
  const [theme, setTheme] = useState("dark");
  const [suggestedTime, setSuggestedTime] = useState(null);

  const dates = ["Today", "Tomorrow", "18 Apr", "19 Apr"];

  // 🔍 FILTER CITIES
  const filteredCities = useMemo(() => {
    return Object.keys(data).filter((city) =>
      city.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  // 🎯 AUTO SUGGEST BEST TIME (middle show = balanced crowd)
  useEffect(() => {
    if (selectedCity && selectedTheatre) {
      const theatre = data[selectedCity].find(
        (t) => t.name === selectedTheatre
      );

      if (theatre?.shows?.length) {
        const mid = Math.floor(theatre.shows.length / 2);
        setSuggestedTime(theatre.shows[mid]);
      }
    }
  }, [selectedCity, selectedTheatre]);

  // 📊 STABLE SEAT STATUS (no flicker)
  const getSeatStatus = (name) => {
    const hash = name.length % 3;
    if (hash === 0) return "🔴 Filling Fast";
    if (hash === 1) return "🟡 Few Seats Left";
    return "🟢 Available";
  };

  const handleNext = () => {
    if (!selectedCity || !selectedTheatre || !selectedTime) return;

    navigate("/SeatBooking", {
      state: {
        movieTitle: state?.movieTitle || "Movie",
        city: selectedCity,
        theaterName: selectedTheatre,
        date: selectedDate,
        time: selectedTime,
      },
    });
  };

  return (
    <div className={`sl-container ${theme}`}>

      {/* 🌙 THEME TOGGLE */}
      <button
        className="theme-toggle"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
      </button>

      {/* 🎬 HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sl-header"
      >
        <h2 className="sl-title">
          🎬 {state?.movieTitle || "Select Show"}
        </h2>
        <p className="sl-sub">Choose your perfect experience</p>
      </motion.div>

      {/* 📍 CITY */}
      <div className="sl-section">
        <h3>📍 Select City</h3>

        <input
          className="sl-search"
          placeholder="Search city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="sl-grid">
          {filteredCities.map((city) => (
            <motion.div
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              key={city}
              className={`sl-card ${selectedCity === city ? "active" : ""}`}
              onClick={() => {
                setSelectedCity(city);
                setSelectedTheatre(null);
                setSelectedTime(null);
              }}
            >
              🏙️ {city}
            </motion.div>
          ))}
        </div>
      </div>

      {/* 🎭 THEATRE */}
      {selectedCity && (
        <motion.div
          className="sl-section"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3>🎭 Select Theatre</h3>

          <div className="sl-grid">
            {data[selectedCity].map((t) => (
              <motion.div
                key={t.name}
                whileHover={{ scale: 1.05 }}
                className={`sl-theatre-card ${
                  selectedTheatre === t.name ? "active" : ""
                }`}
                onClick={() => {
                  setSelectedTheatre(t.name);
                  setSelectedTime(null);
                }}
              >
                <img
                  src={`https://source.unsplash.com/300x200/?cinema,${t.name}`}
                  alt="theatre"
                />
                <h4>{t.name}</h4>
                <p>{getSeatStatus(t.name)}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 📅 DATE */}
      {selectedTheatre && (
        <motion.div
          className="sl-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h3>📅 Select Date</h3>
          <div className="sl-row">
            {dates.map((d) => (
              <button
                key={d}
                className={`sl-chip ${selectedDate === d ? "active" : ""}`}
                onClick={() => setSelectedDate(d)}
              >
                {d}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* ⏰ TIME */}
      {selectedTheatre && (
        <motion.div
          className="sl-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h3>⏰ Select Time</h3>

          {suggestedTime && (
            <p className="suggest">
              🤖 Best Choice: <strong>{suggestedTime}</strong>
            </p>
          )}

          <div className="sl-row">
            {data[selectedCity]
              .find((t) => t.name === selectedTheatre)
              ?.shows.map((time) => (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  key={time}
                  className={`sl-chip ${
                    selectedTime === time ? "active" : ""
                  }`}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </motion.button>
              ))}
          </div>
        </motion.div>
      )}

      {/* 📋 SUMMARY */}
      {selectedCity && (
        <motion.div
          className="sl-summary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h4>Your Selection</h4>
          <p>📍 {selectedCity}</p>
          {selectedTheatre && <p>🎭 {selectedTheatre}</p>}
          {selectedTime && (
            <p>
              ⏰ {selectedDate} • {selectedTime}
            </p>
          )}
        </motion.div>
      )}

      {/* 🚀 NEXT */}
      <button
        className="sl-next"
        disabled={!selectedTime}
        onClick={handleNext}
      >
        Continue →
      </button>
    </div>
  );
}

export default SelectLocationPage;