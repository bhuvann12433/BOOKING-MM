import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./SelectLocationPage.css";
import { theatreAPI, showAPI, handleAPIError } from "../services/api.js";

// ============================================
// FALLBACK DATA (If API fails)
// ============================================

import theatresData from "../data/theatres.json";

function SelectLocationPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // ============================================
  // STATE MANAGEMENT
  // ============================================

  const [selectedCity, setSelectedCity] = useState("");
  const [selectedTheatre, setSelectedTheatre] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedDate, setSelectedDate] = useState("Today");
  const [search, setSearch] = useState("");
  const [theme, setTheme] = useState("dark");
  const [suggestedTime, setSuggestedTime] = useState(null);

  // ============================================
  // API STATE
  // ============================================

  const [cities, setCities] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [shows, setShows] = useState([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingTheatres, setLoadingTheatres] = useState(false);
  const [loadingShows, setLoadingShows] = useState(false);
  const [error, setError] = useState(null);

  const dates = ["Today", "Tomorrow", "18 Apr", "19 Apr"];

  // ============================================
  // FETCH CITIES ON MOUNT
  // ============================================

  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoadingCities(true);
        const response = await theatreAPI.getCities();
        console.log("Cities API Response:", response);

        let cityList = [];
        if (response && response.data) {
          cityList = Array.isArray(response.data.data)
            ? response.data.data
            : Array.isArray(response.data)
              ? response.data
              : [];
        }

        console.log("Extracted cities:", cityList);

        if (!Array.isArray(cityList) || cityList.length === 0) {
          cityList = Object.keys(theatresData);
        }

        setCities(cityList);

        if (state?.city) {
          setSelectedCity(state.city);
        } else if (cityList.length > 0) {
          setSelectedCity(cityList[0]);
        }
      } catch (err) {
        console.error("Failed to fetch cities:", err.message);
        const fallbackCities = Object.keys(theatresData);
        setCities(fallbackCities);
        if (state?.city) {
          setSelectedCity(state.city);
        } else if (fallbackCities.length > 0) {
          setSelectedCity(fallbackCities[0]);
        }
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, [state?.city]);

  // ============================================
  // FETCH THEATRES WHEN CITY CHANGES
  // ============================================

  useEffect(() => {
    if (!selectedCity) return;

    const fetchTheatres = async () => {
      try {
        setLoadingTheatres(true);
        setError(null);

        const response = await theatreAPI.getByCity(selectedCity);
        console.log("Theatres API Response:", response);

        let theatreList = [];
        if (response && response.data) {
          theatreList = Array.isArray(response.data.data)
            ? response.data.data
            : Array.isArray(response.data)
              ? response.data
              : [];
        }

        console.log("Extracted theatres:", theatreList);

        if (!Array.isArray(theatreList) || theatreList.length === 0) {
          const fallbackTheatres = theatresData[selectedCity] || [];
          setTheatres(fallbackTheatres);
        } else {
          setTheatres(theatreList);
        }
      } catch (err) {
        console.error("Failed to fetch theatres:", err.message);
        const fallbackTheatres = theatresData[selectedCity] || [];
        setTheatres(fallbackTheatres);
      } finally {
        setLoadingTheatres(false);
      }
    };

    fetchTheatres();
    setSelectedTheatre(null);
    setShows([]);
  }, [selectedCity]);

  // ============================================
  // FETCH SHOWS WHEN THEATRE CHANGES
  // ============================================

  useEffect(() => {
    if (!selectedTheatre || !selectedCity) return;

    const fetchShows = async () => {
      try {
        setLoadingShows(true);

        if (selectedTheatre.shows && Array.isArray(selectedTheatre.shows)) {
          setShows(selectedTheatre.shows);
          return;
        }

        if (selectedTheatre._id && state?.movieId) {
          const response = await showAPI.getByMovieAndTheatre(
            state.movieId,
            selectedTheatre._id
          );
          console.log("Shows API Response:", response);

          let showList = [];
          if (response && response.data) {
            showList = Array.isArray(response.data.data)
              ? response.data.data
              : Array.isArray(response.data)
                ? response.data
                : [];
          }

          console.log("Extracted shows:", showList);

          if (!Array.isArray(showList) || showList.length === 0) {
            showList = selectedTheatre.shows || [];
          }

          setShows(showList);
        } else {
          setShows(selectedTheatre.shows || []);
        }
      } catch (err) {
        console.error("Failed to fetch shows:", err.message);
        setShows(selectedTheatre.shows || []);
      } finally {
        setLoadingShows(false);
      }
    };

    fetchShows();
    setSelectedTime(null);
  }, [selectedTheatre, state?.movieId]);

  // ============================================
  // AUTO SUGGEST BEST TIME (middle show)
  // ============================================

  useEffect(() => {
    if (selectedCity && selectedTheatre && shows.length > 0) {
      const mid = Math.floor(shows.length / 2);
      setSuggestedTime(shows[mid]);
    }
  }, [selectedCity, selectedTheatre, shows]);

  // ============================================
  // FILTER CITIES BY SEARCH
  // ============================================

  const filteredCities = useMemo(() => {
    return cities.filter((city) =>
      city.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, cities]);

  // ============================================
  // GET SEAT STATUS (Stable hash)
  // ============================================

  const getSeatStatus = (name) => {
    const hash = name.length % 3;
    if (hash === 0) return "🔴 Filling Fast";
    if (hash === 1) return "🟡 Few Seats Left";
    return "🟢 Available";
  };

  // ============================================
  // HANDLE NEXT BUTTON
  // ============================================

  const handleNext = async () => {
    if (!selectedCity || !selectedTheatre || !selectedTime) {
      setError("❌ Please select city, theatre, and show time");
      return;
    }

    // ✅ FIX: Read username and email from localStorage (saved during signup/login)
    const username = localStorage.getItem("username");
    const email = localStorage.getItem("email");

    // ✅ If not logged in, redirect to login
    if (!username || !email) {
      setError("❌ Please login first to continue booking.");
      navigate("/LoginPage");
      return;
    }

    let showId = selectedTime?._id;

    if (!showId && selectedTheatre._id && state?.movieId) {
      try {
        const response = await showAPI.getByMovieAndTheatre(
          state.movieId,
          selectedTheatre._id
        );
        const shows = Array.isArray(response.data?.data)
          ? response.data.data
          : [];
        if (shows.length > 0) {
          showId = shows[0]._id;
        }
      } catch (err) {
        console.error("Failed to fetch showId:", err.message);
      }
    }

    let showTime = selectedTime;
    if (typeof selectedTime === "object") {
      showTime = selectedTime.showTime || selectedTime.time || selectedTime;
    }

    navigate("/SeatBooking", {
      state: {
        movieTitle: state?.movieTitle || "Movie",
        movieId: state?.movieId,
        city: selectedCity,
        theaterName: selectedTheatre.name || selectedTheatre,
        theatreId: selectedTheatre._id,
        showId: showId || null,
        date: selectedDate,
        time: showTime,
        username,  // ✅ ADDED - from localStorage
        email,     // ✅ ADDED - from localStorage
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

          {loadingTheatres ? (
            <p className="sl-loading">Loading theatres...</p>
          ) : theatres.length === 0 ? (
            <p className="sl-error">No theatres available in {selectedCity}</p>
          ) : (
            <div className="sl-grid">
              {theatres.map((theatre) => {
                const theatreName = theatre.name || theatre;
                const theatreId = theatre._id || theatre.name;
                const isSelected =
                  selectedTheatre &&
                  (selectedTheatre._id === theatreId ||
                    selectedTheatre.name === theatreName);

                return (
                  <motion.div
                    key={theatreId}
                    whileHover={{ scale: 1.05 }}
                    className={`sl-theatre-card ${isSelected ? "active" : ""}`}
                    onClick={() => {
                      setSelectedTheatre(theatre);
                      setSelectedTime(null);
                    }}
                  >
                    <img
                      src={`https://source.unsplash.com/300x200/?cinema,${theatreName}`}
                      alt="theatre"
                    />
                    <h4>{theatreName}</h4>
                    <p>{getSeatStatus(theatreName)}</p>
                  </motion.div>
                );
              })}
            </div>
          )}
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

          {loadingShows ? (
            <p className="sl-loading">Loading show times...</p>
          ) : shows.length === 0 ? (
            <p className="sl-error">No shows available</p>
          ) : (
            <>
              {suggestedTime && (
                <p className="suggest">
                  🤖 Best Choice:{" "}
                  <strong>{suggestedTime.time || suggestedTime}</strong>
                </p>
              )}

              <div className="sl-row">
                {shows.map((show) => {
                  const showTime = show.time || show;
                  return (
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      key={showTime}
                      className={`sl-chip ${
                        selectedTime &&
                        (selectedTime.time === showTime ||
                          selectedTime === showTime)
                          ? "active"
                          : ""
                      }`}
                      onClick={() => setSelectedTime(show)}
                    >
                      {showTime}
                    </motion.button>
                  );
                })}
              </div>
            </>
          )}
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
          {selectedTheatre && (
            <p>🎭 {selectedTheatre.name || selectedTheatre}</p>
          )}
          {selectedTime && (
            <p>
              ⏰ {selectedDate} • {selectedTime.time || selectedTime}
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