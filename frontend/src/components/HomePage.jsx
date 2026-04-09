import "./Homepage.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaUser, FaMapMarkerAlt, FaSearch, FaChevronDown } from "react-icons/fa";

import first from "../assets/images/first.jpg";
import pushpa2 from "../assets/images/pushpa2.jpg";
import hissab from "../assets/images/hissab.jpg";
import dakuimg1 from "../assets/images/dakuimg1.jpg";
import virupaksha from "../assets/images/Virupaksha.webp";
import second from "../assets/images/second.jpg";

const AP_CITIES = [
  "Vijayawada", "Visakhapatnam", "Guntur", "Tirupati", "Nellore",
  "Kurnool", "Rajahmundry", "Kakinada", "Kadapa", "Anantapur",
  "Eluru", "Ongole", "Narasaraopet", "Chittoor", "Srikakulam",
  "Vizianagaram", "Tenali", "Proddatur", "Hindupur", "Bhimavaram"
];

function Homepage() {
  const navigate = useNavigate();
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Vijayawada");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Movies");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/LoginPage");
  }, [navigate]);

  const username = localStorage.getItem("username");

  const movies = [
    { src: first,      rating: "4.8", title: "Sankranti ki Vastunnam", language: "Telugu", cert: "UA13+" },
    { src: pushpa2,    rating: "4.9", title: "Pushpa 2",                language: "Telugu", cert: "UA13+" },
    { src: hissab,     rating: "4.7", title: "Hissab Barabar",          language: "Telugu", cert: "UA13+" },
    { src: dakuimg1,   rating: "4.6", title: "Dacoit",                  language: "Telugu", cert: "UA13+" },
    { src: second,     rating: "4.8", title: "Game Changer",            language: "Telugu", cert: "UA13+" },
    { src: virupaksha, rating: "4.7", title: "Virupaksha",              language: "Telugu", cert: "UA13+" },
  ];

  const filtered = movies.filter(m =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="hp-root">

      <header className="hp-header">

        <div className="hp-logo" onClick={() => navigate("/")}>
          <span className="hp-logo-district">Mental</span>
          <span className="hp-logo-by">BY PIG</span>
        </div>

        <div className="hp-location" onClick={() => setShowLocationDropdown(p => !p)}>
          <FaMapMarkerAlt className="hp-loc-icon" />
          <div className="hp-loc-text">
            <span className="hp-loc-city">{selectedCity}</span>
            <span className="hp-loc-state">Andhra Pradesh</span>
          </div>
          <FaChevronDown className="hp-loc-chevron" />

          {showLocationDropdown && (
            <div className="hp-dropdown" onClick={e => e.stopPropagation()}>
              <p className="hp-dropdown-label">Select City — Andhra Pradesh</p>
              {AP_CITIES.map(city => (
                <div
                  key={city}
                  className={`hp-dropdown-item ${city === selectedCity ? "active" : ""}`}
                  onClick={() => { setSelectedCity(city); setShowLocationDropdown(false); }}
                >
                  {city}
                </div>
              ))}
            </div>
          )}
        </div>

        <nav className="hp-nav">
          {["For you", "Movies", "Events"].map(tab => (
            <button
              key={tab}
              className={`hp-nav-btn ${activeTab === tab ? "hp-nav-active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>

        <div className="hp-search-wrap">
          <FaSearch className="hp-search-icon" />
          <input
            className="hp-search"
            type="text"
            placeholder="Search for events, movies and restaurants"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="hp-profile" onClick={() => navigate("/ProfilePage")}>
          <FaUser />
        </div>
      </header>

      <main className="hp-main">
        <h2 className="hp-section-title">Only in Theatres</h2>

        <div className="hp-grid">
          {filtered.map((movie, i) => (
            <div
              key={i}
              className="hp-card"
              onClick={() => navigate("/SeatBooking", { state: movie })}
            >
              <div className="hp-card-img-wrap">
                <img src={movie.src} alt={movie.title} className="hp-card-img" />
              </div>
              <div className="hp-card-info">
                <p className="hp-card-title">{movie.title}</p>
                <p className="hp-card-meta">
                  <span className="hp-cert">{movie.cert}</span>
                  <span className="hp-dot">|</span>
                  <span>{movie.language}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {showLocationDropdown && (
        <div className="hp-backdrop" onClick={() => setShowLocationDropdown(false)} />
      )}
    </div>
  );
}

export default Homepage;