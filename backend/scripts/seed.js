import mongoose from "mongoose";
import dotenv from "dotenv";
import Movie from "../models/Movie.js";
import Theatre from "../models/Theatre.js";
import Show from "../models/Show.js";
import Seat from "../models/Seat.js";
import User from "../models/User.js";

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await Promise.all([
      Movie.deleteMany({}),
      Theatre.deleteMany({}),
      Show.deleteMany({}),
      Seat.deleteMany({}),
      User.deleteMany({}),
    ]);
    console.log("🗑️  Cleared existing data");

    // Create sample movies
    const movies = await Movie.insertMany([
      {
        title: "The Avengers",
        description: "An unprecedented collection of Marvel superheroes",
        duration: 143,
        genre: ["Action", "Sci-Fi"],
        rating: 8.5,
        releaseDate: new Date("2024-04-26"),
        language: "English",
        isActive: true,
      },
      {
        title: "Sankranthiki Vasthunam",
        description: "A Telugu family drama",
        duration: 128,
        genre: ["Comedy", "Drama"],
        rating: 8.2,
        releaseDate: new Date("2024-01-14"),
        language: "Telugu",
        isActive: true,
      },
      {
        title: "Dune: Part Two",
        description: "Epic sci-fi adventure",
        duration: 166,
        genre: ["Sci-Fi", "Action"],
        rating: 8.8,
        releaseDate: new Date("2024-02-28"),
        language: "English",
        isActive: true,
      },
    ]);
    console.log("🎬 Created movies:", movies.length);

    // Create sample theatres
    const theatres = await Theatre.insertMany([
      {
        name: "Shourya Cineplex",
        city: "Hyderabad",
        address: "Kondapur, Hyderabad",
        phone: "9876543210",
        totalScreens: 3,
        screens: [
          { screenName: "Screen 1", totalSeats: 150 },
          { screenName: "Screen 2", totalSeats: 150 },
          { screenName: "Screen 3", totalSeats: 120 },
        ],
        isActive: true,
      },
      {
        name: "PVR Cinemas",
        city: "Bangalore",
        address: "MG Road, Bangalore",
        phone: "9876543211",
        totalScreens: 4,
        screens: [
          { screenName: "Screen 1", totalSeats: 180 },
          { screenName: "Screen 2", totalSeats: 180 },
          { screenName: "Screen 3", totalSeats: 150 },
          { screenName: "Screen 4", totalSeats: 150 },
        ],
        isActive: true,
      },
    ]);
    console.log("🎭 Created theatres:", theatres.length);

    // Create sample shows
    const shows = await Show.insertMany([
      {
        movie: movies[0]._id,
        theatre: theatres[0]._id,
        screen: "Screen 1",
        showTime: new Date("2024-04-25T10:00:00"),
        ticketPrice: 250,
        totalSeats: 150,
        availableSeats: 120,
        language: "English",
        format: "2D",
        isActive: true,
      },
      {
        movie: movies[1]._id,
        theatre: theatres[0]._id,
        screen: "Screen 2",
        showTime: new Date("2024-04-25T14:30:00"),
        ticketPrice: 280,
        totalSeats: 150,
        availableSeats: 100,
        language: "Telugu",
        format: "2D",
        isActive: true,
      },
      {
        movie: movies[2]._id,
        theatre: theatres[1]._id,
        screen: "Screen 1",
        showTime: new Date("2024-04-25T19:00:00"),
        ticketPrice: 350,
        totalSeats: 180,
        availableSeats: 140,
        language: "English",
        format: "2D",
        isActive: true,
      },
    ]);
    console.log("🎪 Created shows:", shows.length);

    // Create sample seats for first show
    const seatRows = ["A", "B", "C", "D", "E"];
    const seatsPerRow = 30;
    let seats = [];

    for (let row of seatRows) {
      for (let col = 1; col <= seatsPerRow; col++) {
        seats.push({
          show: shows[0]._id,
          seatNumber: `${row}${col}`,
          row: row,
          col: col,
          status: Math.random() > 0.8 ? "booked" : "available",
        });
      }
    }

    await Seat.insertMany(seats);
    console.log("💺 Created seats:", seats.length);

    // Create sample user
    const user = await User.create({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      firstName: "Test",
      lastName: "User",
      phone: "9876543210",
      isAdmin: false,
    });
    console.log("👤 Created test user");

    console.log("\n✅ Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
