import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Calendar } from "lucide-react";
import "./BuyTicket.css";

const BuyTicket = () => {
  const dateScrollRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { movie, city } = location.state || {};

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [minDate, setMinDate] = useState("");
  const [selectedTheater, setSelectedTheater] = useState("");

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setMinDate(today);
    setSelectedDate(today);
  }, []);

  const checkIfTimeIsPast = (time) => {
    if (!selectedDate) return false;

    const now = new Date();

    const [timePart, modifier] = time.split(" ");
    let [hours, minutes] = timePart.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    const selectedDateTime = new Date(selectedDate);
    selectedDateTime.setHours(hours, minutes, 0, 0);

    const today = new Date().toISOString().split("T")[0];
    return selectedDate === today && selectedDateTime < now;
  };

  const handleTimeSelection = (time, theater) => {
    if (checkIfTimeIsPast(time)) return;

    setSelectedTime(time);
    setSelectedTheater(theater);

    console.log("Selected time:", time);
    console.log("Selected theater:", theater);
  };

  const handleCalendarChange = (event) => {
    setSelectedDate(event.target.value);
    setShowCalendar(false);
    setSelectedTime("");
    setSelectedTheater("");
  };

  const handleSeatingRedirect = () => {
    if (selectedDate && selectedTime && selectedTheater) {
      navigate("/Seating", {
        state: {
          date: selectedDate,
          time: selectedTime,
          movieTitle: movie?.title || movie || "Movie",
          city: typeof city === "object" ? city?.name || "City" : city,
          theaterName: selectedTheater,
        },
      });
    } else {
      alert("Please select date, time, and theater");
    }
  };

  const cinemas = [
    {
      name: "Alankar A/C 4K Dolby Surround",
      location: "Vijayawada",
      times: ["10:50 AM", "01:45 PM", "03:00 PM", "06:30 PM", "09:30 PM"],
    },
    {
      name: "Balaji Iconia A/C 2K Dolby Surround",
      location: "Ibrahimpatnam",
      times: ["10:00 AM", "02:00 PM", "06:30 PM", "09:30 PM"],
    },
    {
      name: "Cinepolis: Power One Mall",
      location: "Vijayawada",
      times: ["10:50 AM", "02:00 PM", "05:00 PM", "08:30 PM"],
    },
  ];

  return (
    <div>
      <header className="buyticket-header">Buy Ticket</header>

      <div className="buyticket-datepicker-container">
        <button
          className="buyticket-datepicker"
          onClick={() => setShowCalendar(true)}
        >
          <Calendar size={20} /> Choose from Calendar
        </button>
      </div>

      {showCalendar && (
        <div className="buyticket-calendar-popup">
          <div className="buyticket-calendar-content">
            <h3>Select Date</h3>
            <input
              type="date"
              className="buyticket-datepicker-input"
              onChange={handleCalendarChange}
              min={minDate}
              value={selectedDate}
            />
            <button
              className="buyticket-close-button"
              onClick={() => setShowCalendar(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="buyticket-container">
        <h3>Select Theater and Show Time</h3>
        <p>
          <strong>Selected Date:</strong> {selectedDate || "Not selected"}
        </p>
        <p>
          <strong>Selected Time:</strong> {selectedTime || "Not selected"}
        </p>
        <p>
          <strong>Selected Theater:</strong> {selectedTheater || "Not selected"}
        </p>
      </div>

      {cinemas.map((cinema, index) => (
        <div className="buyticket-cinema" key={index}>
          <strong>
            {cinema.name}
            <br />
            <i>{cinema.location}</i>
          </strong>

          <div className="buyticket-timing-buttons">
            {cinema.times.map((time, timeIndex) => {
              const isTimeDisabled = checkIfTimeIsPast(time);
              const isSelected =
                selectedTime === time && selectedTheater === cinema.name;

              return (
                <button
                  type="button"
                  className={`buyticket-show-time ${isSelected ? "active" : ""}`}
                  key={timeIndex}
                  onClick={() => handleTimeSelection(time, cinema.name)}
                  disabled={isTimeDisabled}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="buyticket-seating-button-container">
        <button
          className="buyticket-seating-button"
          onClick={handleSeatingRedirect}
          disabled={!selectedDate || !selectedTime || !selectedTheater}
        >
          Go to Seating
        </button>
      </div>
    </div>
  );
};

export default BuyTicket;
