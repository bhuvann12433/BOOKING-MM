import React from "react";
import "./Theaters.css";
import { useLocation, useNavigate } from "react-router-dom";

const movieData = {
  Chennai: [
    {
      title: "Movie A",
      hero: "Hero A",
      heroine: "Heroine A",
      description: "Description of Movie A",
      rating: 4.7,
      reviews: ["Fantastic!", "A must-watch!"],
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0hZTW45PKs7eJqqyKj8djWpjtpmg9KTMy7A&s",
      theaters: [
        {
          name: "Theater 1",
          address: "123 Street, Chennai",
          showtimes: ["10:00 AM", "2:00 PM", "6:00 PM"],
          ticketCost: "₹200",
          availableSeats: 50,
        },
        {
          name: "Theater 2",
          address: "456 Avenue, Chennai",
          showtimes: ["11:00 AM", "3:00 PM", "7:00 PM"],
          ticketCost: "₹250",
          availableSeats: 30,
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
      image: "https://via.placeholder.com/150",
      theaters: [
        {
          name: "Theater 3",
          address: "789 Road, Chennai",
          showtimes: ["12:00 PM", "4:00 PM", "8:00 PM"],
          ticketCost: "₹220",
          availableSeats: 40,
        },
      ],
    },
  ],
  Bengaluru: [
    {
      title: "Movie C",
      hero: "Hero C",
      heroine: "Heroine C",
      description: "Description of Movie C",
      rating: 4.5,
      reviews: ["Superb!", "Loved it!"],
      image: "https://via.placeholder.com/150",
      theaters: [
        {
          name: "Theater 4",
          address: "123 Main St, Bengaluru",
          showtimes: ["10:30 AM", "2:30 PM", "6:30 PM"],
          ticketCost: "₹240",
          availableSeats: 45,
        },
        {
          name: "Theater 5",
          address: "456 Road, Bengaluru",
          showtimes: ["12:00 PM", "4:00 PM", "8:00 PM"],
          ticketCost: "₹260",
          availableSeats: 25,
        },
      ],
    },
    {
      title: "Movie D",
      hero: "Hero D",
      heroine: "Heroine D",
      description: "Description of Movie D",
      rating: 4.1,
      reviews: ["Great performance!", "Worth watching!"],
      image: "https://via.placeholder.com/150",
      theaters: [
        {
          name: "Theater 6",
          address: "789 Avenue, Bengaluru",
          showtimes: ["1:00 PM", "5:00 PM", "9:00 PM"],
          ticketCost: "₹230",
          availableSeats: 35,
        },
      ],
    },
  ],
  Hyderabad: [
    {
      title: "Movie E",
      hero: "Hero E",
      heroine: "Heroine E",
      description: "Description of Movie E",
      rating: 4.6,
      reviews: ["Amazing!", "Brilliant!"],
      image: "https://via.placeholder.com/150",
      theaters: [
        {
          name: "Theater 7",
          address: "12 Park Street, Hyderabad",
          showtimes: ["10:45 AM", "2:45 PM", "6:45 PM"],
          ticketCost: "₹200",
          availableSeats: 50,
        },
      ],
    },
    {
      title: "Movie F",
      hero: "Hero F",
      heroine: "Heroine F",
      description: "Description of Movie F",
      rating: 4.2,
      reviews: ["Entertaining!", "Enjoyed every bit!"],
      image: "https://via.placeholder.com/150",
      theaters: [
        {
          name: "Theater 8",
          address: "89 Boulevard, Hyderabad",
          showtimes: ["11:15 AM", "3:15 PM", "7:15 PM"],
          ticketCost: "₹210",
          availableSeats: 40,
        },
      ],
    },
  ],
  Kochi: [
    {
      title: "Movie G",
      hero: "Hero G",
      heroine: "Heroine G",
      description: "Description of Movie G",
      rating: 4.8,
      reviews: ["Excellent!", "Highly recommended!"],
      image: "https://via.placeholder.com/150",
      theaters: [
        {
          name: "Theater 9",
          address: "23 Beach Road, Kochi",
          showtimes: ["12:30 PM", "4:30 PM", "8:30 PM"],
          ticketCost: "₹250",
          availableSeats: 30,
        },
      ],
    },
  ],
  Coimbatore: [
    {
      title: "Movie H",
      hero: "Hero H",
      heroine: "Heroine H",
      description: "Description of Movie H",
      rating: 3.9,
      reviews: ["Good!", "Worth a watch."],
      image: "https://via.placeholder.com/150",
      theaters: [
        {
          name: "Theater 10",
          address: "55 Park Road, Coimbatore",
          showtimes: ["11:00 AM", "3:00 PM", "7:00 PM"],
          ticketCost: "₹180",
          availableSeats: 60,
        },
      ],
    },
  ],
  Mysore: [
    {
      title: "Movie I",
      hero: "Hero I",
      heroine: "Heroine I",
      description: "Description of Movie I",
      rating: 4.4,
      reviews: ["Nice!", "Enjoyable!"],
      image: "https://via.placeholder.com/150",
      theaters: [
        {
          name: "Theater 11",
          address: "12 Garden Lane, Mysore",
          showtimes: ["10:15 AM", "2:15 PM", "6:15 PM"],
          ticketCost: "₹190",
          availableSeats: 55,
        },
      ],
    },
  ],
  Thiruvananthapuram: [
    {
      title: "Movie J",
      hero: "Hero J",
      heroine: "Heroine J",
      description: "Description of Movie J",
      rating: 4.6,
      reviews: ["Great!", "Must watch!"],
      image: "https://via.placeholder.com/150",
      theaters: [
        {
          name: "Theater 12",
          address: "67 River Street, Thiruvananthapuram",
          showtimes: ["1:00 PM", "5:00 PM", "9:00 PM"],
          ticketCost: "₹220",
          availableSeats: 40,
        },
      ],
    },
  ],
  Madurai: [
    {
      title: "Movie K",
      hero: "Hero K",
      heroine: "Heroine K",
      description: "Description of Movie K",
      rating: 4.2,
      reviews: ["Good movie!", "Worth it!"],
      image: "https://via.placeholder.com/150",
      theaters: [
        {
          name: "Theater 13",
          address: "89 High Street, Madurai",
          showtimes: ["11:30 AM", "3:30 PM", "7:30 PM"],
          ticketCost: "₹200",
          availableSeats: 50,
        },
      ],
    },
  ],
  Vijayawada: [
    {
      title: "Movie L",
      hero: "Hero L",
      heroine: "Heroine L",
      description: "Description of Movie L",
      rating: 4.3,
      reviews: ["Nice!", "Enjoyed it!"],
      image: "https://via.placeholder.com/150",
      theaters: [
        {
          name: "Theater 14",
          address: "21 Main Road, Vijayawada",
          showtimes: ["12:45 PM", "4:45 PM", "8:45 PM"],
          ticketCost: "₹210",
          availableSeats: 30,
        },
      ],
    },
  ],
  Visakhapatnam: [
    {
      title: "Movie M",
      hero: "Hero M",
      heroine: "Heroine M",
      description: "Description of Movie M",
      rating: 4.5,
      reviews: ["Great!", "Must watch!"],
      image: "https://via.placeholder.com/150",
      theaters: [
        {
          name: "Theater 15",
          address: "100 Market Street, Visakhapatnam",
          showtimes: ["11:30 AM", "3:30 PM", "7:30 PM"],
          ticketCost: "₹230",
          availableSeats: 25,
        },
      ],
    },
  ],
  Puducherry: [
    {
      title: "Movie N",
      hero: "Hero N",
      heroine: "Heroine N",
      description: "Description of Movie N",
      rating: 4.4,
      reviews: ["Nice!", "Enjoyable!"],
      image: "https://via.placeholder.com/150",
      theaters: [
        {
          name: "Theater 16",
          address: "45 Coastal Road, Puducherry",
          showtimes: ["10:30 AM", "2:30 PM", "6:30 PM"],
          ticketCost: "₹200",
          availableSeats: 40,
        },
      ],
    },
  ],
  Kozhikode: [
    {
      title: "Movie O",
      hero: "Hero O",
      heroine: "Heroine O",
      description: "Description of Movie O",
      rating: 4.3,
      reviews: ["Good movie!", "Worth it!"],
      image: "https://via.placeholder.com/150",
      theaters: [
        {
          name: "Theater 17",
          address: "25 City Road, Kozhikode",
          showtimes: ["12:00 PM", "4:00 PM", "8:00 PM"],
          ticketCost: "₹210",
          availableSeats: 35,
        },
      ],
    },
  ],
  Tiruchirappalli: [
    {
      title: "Movie P",
      hero: "Hero P",
      heroine: "Heroine P",
      description: "Description of Movie P",
      rating: 4.2,
      reviews: ["Nice!", "Enjoyable!"],
      image: "https://via.placeholder.com/150",
      theaters: [
        {
          name: "Theater 18",
          address: "99 Park Street, Tiruchirappalli",
          showtimes: ["11:00 AM", "3:00 PM", "7:00 PM"],
          ticketCost: "₹190",
          availableSeats: 50,
        },
      ],
    },
  ],
  Hubli: [
    {
      title: "Movie Q",
      hero: "Hero Q",
      heroine: "Heroine Q",
      description: "Description of Movie Q",
      rating: 4.1,
      reviews: ["Good movie!", "Worth it!"],
      image: "https://via.placeholder.com/150",
      theaters: [
        {
          name: "Theater 19",
          address: "10 Main Road, Hubli",
          showtimes: ["12:00 PM", "4:00 PM", "8:00 PM"],
          ticketCost: "₹200",
          availableSeats: 30,
        },
      ],
    },
  ],
  Kannur: [
    {
      title: "Movie R",
      hero: "Hero R",
      heroine: "Heroine R",
      description: "Description of Movie R",
      rating: 4.0,
      reviews: ["Nice!", "Enjoyable!"],
      image: "https://via.placeholder.com/150",
      theaters: [
        {
          name: "Theater 20",
          address: "12 Avenue, Kannur",
          showtimes: ["11:30 AM", "3:30 PM", "7:30 PM"],
          ticketCost: "₹210",
          availableSeats: 40,
        },
      ],
    },
    {
      title: "Movie S",
      hero: "Hero S",
      heroine: "Heroine S",
      description: "Description of Movie S",
      rating: 3.8,
      reviews: ["Nice movie", "Great watch!"],
      image: "https://via.placeholder.com/150",
      theaters: [
        {
          name: "Theater 22",
          address: "45 City Rd, Kannur",
          showtimes: ["2:00 PM", "6:00 PM", "10:00 PM"],
          ticketCost: "₹220",
          availableSeats: 30,
        },
      ],
    },
  ],
};

function Theaters() {
  const location = useLocation();
  const navigate = useNavigate(); // Initialize the navigate function
  const { movie, city } = location.state;

  const selectedMovie = movieData[city]?.find((m) => m.title === movie.title);

  const handleBuyTicket = (theater) => {
    // Navigate to the Buy Ticket page, passing the selected movie and theater as state
    navigate("/BuyTicket", { state: { movie: selectedMovie, theater } });
  };

  return (
    <div className="theaters-container">
      <header className="theaters-header">
        <h1 className="theaters-title">Theaters for {selectedMovie?.title}</h1>
      </header>

      <div className="theaters-movie-details">
        <div className="theaters-movie-card">
          <img
            src={selectedMovie?.image}
            alt={`${selectedMovie?.title} poster`}
            className="theaters-movie-image"
          />
          <h3 className="theaters-movie-title">{selectedMovie?.title}</h3>
          <p className="theaters-movie-info">
            <strong>Hero:</strong> {selectedMovie?.hero}
          </p>
          <p className="theaters-movie-info">
            <strong>Heroine:</strong> {selectedMovie?.heroine}
          </p>
          <p className="theaters-movie-info">
            <strong>Description:</strong> {selectedMovie?.description}
          </p>
          <p className="theaters-movie-info">
            <strong>Rating:</strong> {selectedMovie?.rating}
          </p>
          <div className="theaters-reviews">
            <h4 className="theaters-reviews-title">Reviews:</h4>
            {selectedMovie?.reviews.map((review, index) => (
              <p key={index} className="theaters-review-item">{review}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="theaters-list">
        <h2 className="theaters-section-title">Theaters showing {selectedMovie?.title}</h2>
        <div className="theaters-grid">
          {selectedMovie?.theaters?.map((theater, index) => (
            <div key={index} className="theaters-item">
              <h3 className="theaters-item-title">{theater.name}</h3>
              <p className="theaters-item-info">
                <strong>Address:</strong> {theater.address}
              </p>
              <p className="theaters-item-info">
                <strong>Showtimes:</strong> {theater.showtimes.join(", ")}
              </p>
              <p className="theaters-item-info">
                <strong>Ticket Cost:</strong> {theater.ticketCost}
              </p>
              <p className="theaters-item-info">
                <strong>Available Seats:</strong> {theater.availableSeats}
              </p>
              <button
                className="theaters-buy-btn"
                onClick={() => handleBuyTicket(theater)}
              >
                Buy Ticket
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Theaters;
