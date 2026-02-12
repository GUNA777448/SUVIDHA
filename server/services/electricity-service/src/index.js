const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const billRoutes = require("./routes/bill.routes");
const connectionRoutes = require("./routes/connection.routes");
const { errorHandler } = require("./middlewares/error.middleware");
const { dbConnect } = require("./config/database");

const app = express();
const PORT = process.env.PORT || 3002;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Database connection
dbConnect();

// Routes
app.use("/api/v1/electricity/bills", billRoutes);
app.use("/api/v1/electricity/connections", connectionRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "electricity-service",
    timestamp: new Date().toISOString(),
  });
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Electricity Service running on port ${PORT}`);
});

module.exports = app;
