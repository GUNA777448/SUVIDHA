const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// Database Connection
// mongoose
//   .connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("MongoDB Connected"))
//   .catch((err) => console.log(err));

// Routes
app.get("/", (req, res) => {
  res.send("Complain Service is running");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", service: "complain-service" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Complain Service running on port ${PORT}`);
});
