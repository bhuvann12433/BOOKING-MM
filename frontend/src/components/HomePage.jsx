import "./HomePage.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaUser, FaMapMarkerAlt, FaSearch, FaChevronDown } from "react-icons/fa";
import { movieAPI, theatreAPI, handleAPIError } from "../services/api.js";

// ============================================
// DEFAULT MOVIE FALLBACK DATA
// ============================================

import first from "../assets/images/first.jpg";
import pushpa2 from "../assets/images/pushpa2.jpg";
import hissab from "../assets/images/hissab.jpg";
import dakuimg1 from "../assets/images/dakuimg1.jpg";
import virupaksha from "../assets/images/Virupaksha.webp";
import second from "../assets/images/second.jpg";

const FALLBACK_MOVIES = [
  { src: first, rating: "4.8", title: "Sankranti ki Vastunnam", language: "Telugu", cert: "UA13+" },
  { src: pushpa2, rating: "4.9", title: "Pushpa 2", language: "Telugu", cert: "UA13+" },
  { src: hissab, rating: "4.7", title: "Hissab Barabar", language: "Telugu", cert: "UA13+" },
  { src: dakuimg1, rating: "4.6", title: "Daku Maharaj", language: "Telugu", cert: "UA13+" },
  { src: second, rating: "4.8", title: "Game Changer", language: "Telugu", cert: "UA13+" },
  { src: virupaksha, rating: "4.7", title: "Virupaksha", language: "Telugu", cert: "UA13+" },
];

function HomePage() {
  const navigate = useNavigate();
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Vijayawada");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Movies");
  const [hovered, setHovered] = useState(null);

  // ============================================
  // STATE MANAGEMENT
  // ============================================

  const [movies, setMovies] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ============================================
  // FETCH MOVIES ON MOUNT
  // ============================================

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/LoginPage");

    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await movieAPI.getAll();
        const fetchedMovies = response.data.data || response.data || [];
        
        // Map backend movies to frontend format
        const formattedMovies = fetchedMovies.map(movie => ({
          _id: movie._id,
          title: movie.title,
          src: movie.posterUrl || movie.poster || first, // Use fallback image
          rating: movie.rating || "4.5",
          language: movie.language || "Telugu",
          cert: movie.certification || "UA13+",
          trailer: movie.trailerUrl || movie.trailer,
        }));

        setMovies(formattedMovies.length > 0 ? formattedMovies : FALLBACK_MOVIES);
      } catch (err) {
        console.error("Failed to fetch movies:", err);
        setError("Failed to load movies");
        setMovies(FALLBACK_MOVIES); // Fallback to hardcoded data
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [navigate]);

  // ============================================
  // FETCH CITIES ON MOUNT
  // ============================================

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await theatreAPI.getCities();
        const cityList = response.data.data || response.data || ["Vijayawada"];
        setCities(cityList);
      } catch (err) {
        console.error("Failed to fetch cities:", err);
        setCities(["Vijayawada", "Visakhapatnam"]); // Fallback cities
      }
    };

    fetchCities();
  }, []);

  // ============================================
  // FILTER MOVIES BY SEARCH QUERY
  // ============================================

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
              <p className="hp-dropdown-label">Select City</p>
              {cities.length > 0 ? (
                cities.map(city => (
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
                ))
              ) : (
                <p className="hp-dropdown-label">Loading cities...</p>
              )}
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

        {loading ? (
          <div className="hp-loading">
            <p>🎬 Loading movies...</p>
          </div>
        ) : error ? (
          <div className="hp-error">
            <p>⚠️ {error}</p>
            <p className="hp-error-hint">Showing available movies instead</p>
          </div>
        ) : null}

        <div className="hp-grid">
          {filtered.length > 0 ? (
            filtered.map((movie, i) => (
              <div
                key={movie._id || i}
                className="hp-card"
                onClick={() =>
                  navigate("/select-location", {
                    state: {
                      movieTitle: movie.title,
                      movieId: movie._id,
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
                      onError={(e) => {
                        e.target.src = first; // Fallback image
                      }}
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
            ))
          ) : (
            <div className="hp-no-movies">
              <p>No movies found</p>
            </div>
          )}
        </div>
      </main>

      {showLocationDropdown && (
        <div className="hp-backdrop" onClick={() => setShowLocationDropdown(false)} />
      )}
    </div>
  );
}

export default HomePage;