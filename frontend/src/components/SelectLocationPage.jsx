import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./SelectLocationPage.css";

const data = {
  Vijayawada: [
    { name: "PVR Cinemas", shows: ["10:00 AM", "2:00 PM", "7:00 PM"] },
    { name: "INOX", shows: ["11:00 AM", "3:00 PM", "9:00 PM"] },
  ],
  Narasaraopet: [
    { name: "Eswar Mahal", shows: ["11:00 AM", "3:00 PM", "8:00 PM"] },
  ],
};

function SelectLocationPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedTheatre, setSelectedTheatre] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedDate, setSelectedDate] = useState("Today");

  const dates = ["Today", "Tomorrow", "18 Apr", "19 Apr"];

  const handleNext = () => {
    if (!selectedCity || !selectedTheatre || !selectedTime) return;

    navigate("/SeatBooking", {
      state: {
        movieTitle: state.movieTitle,
        city: selectedCity,
        theaterName: selectedTheatre,
        date: selectedDate,
        time: selectedTime,
      },
    });
  };

  return (
    <div className="sl-container">

      <h2 className="sl-title">🎬 {state.movieTitle}</h2>

      {/* CITY */}
      <div className="sl-section">
        <h3>Select City</h3>
        <div className="sl-row">
          {Object.keys(data).map((city) => (
            <button
              key={city}
              className={`sl-btn ${selectedCity === city ? "active" : ""}`}
              onClick={() => {
                setSelectedCity(city);
                setSelectedTheatre(null);
                setSelectedTime(null);
              }}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* THEATRE */}
      {selectedCity && (
        <div className="sl-section">
          <h3>Select Theatre</h3>
          <div className="sl-row">
            {data[selectedCity].map((t) => (
              <button
                key={t.name}
                className={`sl-btn ${
                  selectedTheatre === t.name ? "active" : ""
                }`}
                onClick={() => {
                  setSelectedTheatre(t.name);
                  setSelectedTime(null);
                }}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* DATE */}
      {selectedTheatre && (
        <div className="sl-section">
          <h3>Select Date</h3>
          <div className="sl-row">
            {dates.map((d) => (
              <button
                key={d}
                className={`sl-btn ${
                  selectedDate === d ? "active" : ""
                }`}
                onClick={() => setSelectedDate(d)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TIME */}
      {selectedTheatre && (
        <div className="sl-section">
          <h3>Select Time</h3>
          <div className="sl-row">
            {data[selectedCity]
              .find((t) => t.name === selectedTheatre)
              ?.shows.map((time) => (
                <button
                  key={time}
                  className={`sl-btn ${
                    selectedTime === time ? "active" : ""
                  }`}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* NEXT BUTTON */}
      <button
        className="sl-next"
        disabled={!selectedTime}
        onClick={handleNext}
      >
        Continue to Seat Booking →
      </button>
    </div>
  );
}

export default SelectLocationPage;