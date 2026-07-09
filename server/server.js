const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./config/db");
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const requestRoutes = require("./routes/requestRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const professionalRoutes = require("./routes/professionalRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/professionals", professionalRoutes);
app.use("/api/reviews", reviewRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("🚀 Service Marketplace Backend is Running!");
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Service Marketplace API is healthy",
    timestamp: new Date().toISOString(),
  });
});

// Server Port
const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});