import React, { useState } from "react";
import "./Searchbar.css";
import { useNavigate } from "react-router-dom";
import { FaBars } from "react-icons/fa";

const movieData = {
  Vizag: [
    {
      title: "Sankranthi ki Vastunnam",
      hero: "Venkatesh",
      heroine: "Aiswarya Rajesh",
      description: "Description of Movie A",
      rating: 4.7,
      reviews: ["Fantastic!", "A must-watch!"],
      image:"first.jpg",

      theaters: [
        {
          name: "Theater 1",
          address: "123 Street, vizag",
          showtimes: ["10:00 AM", "2:00 PM", "6:00 PM"],
        },
        {
          name: "Theater 2",
          address: "456 Avenue, Vizag",
          showtimes: ["11:00 AM", "3:00 PM", "7:00 PM"],
        },
      ],
    },
    {
      title: "Game Changer",
      hero: "Ram Charan",
      heroine: "Kiara Advani",
      description: "Description of Movie B",
      rating: 4.3,
      reviews: ["Very good!", "Highly enjoyable!"],
      image:"second.jpg",
        
      theaters: [
        {
          name: "Theater 3",
          address: "789 Road, vizag",
          showtimes: ["12:00 PM", "4:00 PM", "8:00 PM"],
        },
      ],
    },
  ],
  Vizianagaram: [
    {
      title: "Movie A",
      hero: "Hero A",
      heroine: "Heroine A",
      description: "Description of Movie A",
      rating: 4.7,
      reviews: ["Fantastic!", "A must-watch!"],
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0hZTW45PKs7eJqqyKj8djWpjtpmg9KTMy7A&s",
      theaters: [
        {
          name: "Theater 1",
          address: "123 Street, Chennai",
          showtimes: ["10:00 AM", "2:00 PM", "6:00 PM"],
        },
        {
          name: "Theater 2",
          address: "456 Avenue, Chennai",
          showtimes: ["11:00 AM", "3:00 PM", "7:00 PM"],
        },
      ],
    },
    {
      title: "Movie B",
      hero: "Hero B",
      heroine: "Heroine B",
      description: "Description of Movie B",
      rating: 4.3,
      reviews: ["Very good!", "Highly enjoyable!"],
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuZ7GDhr0k46V4Nr0kTLAIinM3eHZJa27I4A&s",
      theaters: [
        {
          name: "Theater 3",
          address: "789 Road, Chennai",
          showtimes: ["12:00 PM", "4:00 PM", "8:00 PM"],
        },
      ],
    },
  ],

  srikakulam: [
    {
      title: "Movie A",
      hero: "Hero A",
      heroine: "Heroine A",
      description: "Description of Movie A",
      rating: 4.7,
      reviews: ["Fantastic!", "A must-watch!"],
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0hZTW45PKs7eJqqyKj8djWpjtpmg9KTMy7A&s",
      theaters: [
        {
          name: "Theater 1",
          address: "123 Street, Chennai",
          showtimes: ["10:00 AM", "2:00 PM", "6:00 PM"],
        },
        {
          name: "Theater 2",
          address: "456 Avenue, Chennai",
          showtimes: ["11:00 AM", "3:00 PM", "7:00 PM"],
        },
      ],
    },
    {
      title: "Movie B",
      hero: "Hero B",
      heroine: "Heroine B",
      description: "Description of Movie B",
      rating: 4.3,
      reviews: ["Very good!", "Highly enjoyable!"],
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuZ7GDhr0k46V4Nr0kTLAIinM3eHZJa27I4A&s",
      theaters: [
        {
          name: "Theater 3",
          address: "789 Road, Chennai",
          showtimes: ["12:00 PM", "4:00 PM", "8:00 PM"],
        },
      ],
    },
  ],
  samarlakota: [
    {
      title: "Movie A",
      hero: "Hero A",
      heroine: "Heroine A",
      description: "Description of Movie A",
      rating: 4.7,
      reviews: ["Fantastic!", "A must-watch!"],
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0hZTW45PKs7eJqqyKj8djWpjtpmg9KTMy7A&s",
      theaters: [
        {
          name: "Theater 1",
          address: "123 Street, Chennai",
          showtimes: ["10:00 AM", "2:00 PM", "6:00 PM"],
        },
        {
          name: "Theater 2",
          address: "456 Avenue, Chennai",
          showtimes: ["11:00 AM", "3:00 PM", "7:00 PM"],
        },
      ],
    },
    {
      title: "Movie B",
      hero: "Hero B",
      heroine: "Heroine B",
      description: "Description of Movie B",
      rating: 4.3,
      reviews: ["Very good!", "Highly enjoyable!"],
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuZ7GDhr0k46V4Nr0kTLAIinM3eHZJa27I4A&s",
      theaters: [
        {
          name: "Theater 3",
          address: "789 Road, Chennai",
          showtimes: ["12:00 PM", "4:00 PM", "8:00 PM"],
        },
      ],
    },
  ],
  bobbili: [
    {
      title: "Movie A",
      hero: "Hero A",
      heroine: "Heroine A",
      description: "Description of Movie A",
      rating: 4.7,
      reviews: ["Fantastic!", "A must-watch!"],
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0hZTW45PKs7eJqqyKj8djWpjtpmg9KTMy7A&s",
      theaters: [
        {
          name: "Theater 1",
          address: "123 Street, Chennai",
          showtimes: ["10:00 AM", "2:00 PM", "6:00 PM"],
        },
        {
          name: "Theater 2",
          address: "456 Avenue, Chennai",
          showtimes: ["11:00 AM", "3:00 PM", "7:00 PM"],
        },
      ],
    },
    {
      title: "Movie B",
      hero: "Hero B",
      heroine: "Heroine B",
      description: "Description of Movie B",
      rating: 4.3,
      reviews: ["Very good!", "Highly enjoyable!"],
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuZ7GDhr0k46V4Nr0kTLAIinM3eHZJa27I4A&s",
      theaters: [
        {
          name: "Theater 3",
          address: "789 Road, Chennai",
          showtimes: ["12:00 PM", "4:00 PM", "8:00 PM"],
        },
      ],
    },
  ],



}
function Searchbar() {
  const [selectedCity, setSelectedCity] = useState(""); // Track selected city
  const [selectedMovie, setSelectedMovie] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [movies, setMovies] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // Initialize useNavigate

  const handleInputChange = (e) => {
    const input = e.target.value;
    setCityInput(input);

    if (input) {
      const filteredCities = Object.keys(movieData).filter((city) =>
        city.toLowerCase().includes(input.toLowerCase())
      );
      setSuggestions(filteredCities);

      if (filteredCities.length === 0) {
        setMessage(
          "Oops! We couldn't find any city matching your search. Try again with a different name."
        );
      } else {
        setMessage(""); // Clear message if cities are found
      }
    } else {
      setSuggestions([]);
      setMessage(""); // Clear message when input is empty
    }
  };

  const handleSuggestionClick = (city) => {
    setCityInput(city);
    setSelectedCity(city); // Set the selected city
    displayMoviesForCity(city);
    setSuggestions([]); // Clear suggestions after selection
    setMessage(""); // Clear message when a valid city is selected
  };

  const displayMoviesForCity = (city) => {
    const selectedMovies = movieData[city] || [];
    setMovies(selectedMovies);
  };

  const handleFindTheaters = (movie, city) => {
    navigate("/BuyTicket", { state: { movie, city } }); // Navigate to TheaterList with movie data
  };

  return (
    <div>
      <div className="searchbar-container">
        <h1 className="searchbar-title">Movie Ticket Booking</h1>
        
        <div className="searchbar-input-container">
          <input
            type="text"
            id="cityInput"
            className="searchbar-input"
            placeholder="Search for a city..."
            value={cityInput}
            onChange={handleInputChange}
          />
          <button className="searchbar-search-btn" onClick={() => displayMoviesForCity(cityInput)}>Search</button>
        </div>

        {/* Suggestions Dropdown */}
        {suggestions.length > 0 && (
          <div className="searchbar-suggestions">
            {suggestions.map((city) => (
              <div
                key={city}
                className="searchbar-suggestion-item"
                onClick={() => handleSuggestionClick(city)}
              >
                {city}
              </div>
            ))}
          </div>
        )}

        {/* Message for no city found */}
        {message && <div className="searchbar-no-results">{message}</div>}

        {/* Movie List */}
        <div className="searchbar-movie-list">
          {movies.map((movie, index) => (
            <div key={index} className="searchbar-movie-item">
              <div className="searchbar-movie-inner">
                <div className="searchbar-movie-front">
                  <img src={movie.image} alt={`${movie.title} poster`} className="searchbar-movie-image" />
                </div>
                <div className="searchbar-movie-back">
                  <h3 className="searchbar-movie-title">{movie.title}</h3>
                  <p className="searchbar-movie-detail">
                    <strong>Hero:</strong> {movie.hero}
                  </p>
                  <p className="searchbar-movie-detail">
                    <strong>Heroine:</strong> {movie.heroine}
                  </p>
                  <p className="searchbar-movie-detail">
                    <strong>Description:</strong> {movie.description}
                  </p>
                  <p className="searchbar-movie-detail">
                    <strong>Rating:</strong> {movie.rating}
                  </p>
                  <p className="searchbar-movie-detail">
                    <strong>Reviews:</strong> {movie.reviews.join(", ")}
                  </p>
                  <button
                    className="searchbar-theater-btn"
                    onClick={() => handleFindTheaters(movie, selectedCity)} // Pass selected city to this function
                  >
                    Find Theaters
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Searchbar;