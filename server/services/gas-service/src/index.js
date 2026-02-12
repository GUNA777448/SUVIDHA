const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
const billRoutes = require("./routes/bill.routes");
const connectionRoutes = require("./routes/connection.routes");
const bookingRoutes = require("./routes/booking.routes");
const complaintRoutes = require("./routes/complaint.routes");
const { errorHandler } = require("./middlewares/error.middleware");
const { dbConnect } = require("./config/database");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Database connection
dbConnect();

// Routes
app.use("/api/v1/gas/bills", billRoutes);
app.use("/api/v1/gas/connections", connectionRoutes);
app.use("/api/v1/gas/bookings", bookingRoutes);
app.use("/api/v1/gas/complaints", complaintRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "gas-service",
    timestamp: new Date().toISOString(),
    port: PORT,
  });
});

// Welcome route
app.get("/", (req, res) => {
  res.json({
    message: "SUVIDHA Gas Service API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      bills: "/api/v1/gas/bills",
      connections: "/api/v1/gas/connections",
      bookings: "/api/v1/gas/bookings",
      complaints: "/api/v1/gas/complaints",
    },
  });
});

// Error handling
app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`🔥 Gas Service running on port ${PORT}`);
    console.log(`📍 Service URL: http://localhost:${PORT}`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  });
}

module.exports = app;
