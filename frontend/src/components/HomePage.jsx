import "./HomePage.css";
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

function HomePage() {
  const navigate = useNavigate();
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Vijayawada");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Movies");
  const [hovered, setHovered] = useState(null);

 useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) navigate("/LoginPage");
}, [navigate]);

  const movies = [
    { src: first, rating: "4.8", title: "Sankranti ki Vastunnam", language: "Telugu", cert: "UA13+" },
    { src: pushpa2, rating: "4.9", title: "Pushpa 2", language: "Telugu", cert: "UA13+" },

    {
      src: "https://akamaividz2.zee5.com/image/upload/w_504,h_756,c_scale,f_webp,q_auto:eco/resources/0-0-59409/portrait/jerseytrailer1920x770.jpg",
      rating: "4.8",
      title: "Jersey",
      language: "Telugu",
      cert: "UA13+",
      trailer: "https://www.youtube.com/embed/6QurJwqH8uU"
    },

    { src: hissab, rating: "4.7", title: "Hissab Barabar", language: "Telugu", cert: "UA13+" },
    { src: dakuimg1, rating: "4.6", title: "Daku Maharaj", language: "Telugu", cert: "UA13+" },
    { src: second, rating: "4.8", title: "Game Changer", language: "Telugu", cert: "UA13+" },
    { src: virupaksha, rating: "4.7", title: "Virupaksha", language: "Telugu", cert: "UA13+" },

    {
      src: "https://m.media-amazon.com/images/M/MV5BMTNmNjM0OTktNmQ5NC00MWY1LWE4MDEtYWM0MjU4M2U0NTdiXkEyXkFqcGc@._V1_.jpg",
      rating: "4.7",
      title: "Dhurandhar",
      language: "Telugu",
      cert: "A",
      trailer: "https://www.youtube.com/embed/rV6kEsAyrdY"
    },

    {
      src: "https://cdn.gulte.com/wp-content/uploads/2025/04/Nani-the-Paradise.jpg",
      rating: "4.9",
      title: "The Paradise",
      language: "Telugu",
      cert: "UA13+",
      trailer: "https://www.youtube.com/embed/82NQRgVFinI"
    },
    {
      src: "https://pbs.twimg.com/media/G4qQcQ8bQAICq9Z?format=jpg&name=large",
      rating: "4.9",
      title: "Peddi",
      language: "Telugu",
      cert: "UA13+",
      trailer: "https://www.youtube.com/embed/qBDLZA1qXQk"
    },
    {
      src: "https://www.theweek.in/content/dam/week/week/news/entertainment/images/2025/10/18/they-call-him-og-ott-release.jpg",
      rating: "4.8",
      title: "OG",
      language: "Telugu",
      cert: "A",
      trailer: "https://www.youtube.com/embed/kvJCa116VO8"
    },
    {
      src: "https://i.insider.com/67d31ebd69253ccddf992d4d?width=1200&format=jpeg",
      rating: "4.6",
      title: "F1",
      language: "English",
      cert: "UA13+",
      trailer: "https://www.youtube.com/embed/gxmRQqo7Ztk"
    }
  ];

  const filtered = movies.filter(m =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="hp-root">

      <header className="hp-header">

        <div className="hp-logo" onClick={() => navigate("/")}>
          <span className="hp-logo-district">Matter</span>
          <span className="hp-logo-by">BY battle</span>
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
                  onClick={() => {
                    setSelectedCity(city);
                    setShowLocationDropdown(false);
                  }}
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
              onClick={() =>
                navigate("/select-location", {
  state: {
    movieTitle: movie.title,
    city: selectedCity
  }
})
              }
            >
              <div
                className="hp-card-img-wrap"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                {hovered === i && movie.trailer ? (
                  <iframe
                    src={`${movie.trailer}?autoplay=1&controls=1`}
                    title={movie.title}
                    className="hp-card-img"
                    allow="autoplay"
                  />
                ) : (
                  <img
                    src={movie.src}
                    alt={movie.title}
                    className="hp-card-img"
                  />
                )}
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

export default HomePage;