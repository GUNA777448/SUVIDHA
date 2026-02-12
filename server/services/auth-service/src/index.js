const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const { dbConnect } = require("./config/database");
const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const { generalLimiter } = require("./middlewares/rateLimiter");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(generalLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to database
dbConnect();

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/profile", profileRoutes);

// Swagger API Docs
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "SUVIDHA Auth Service API",
  }),
);

// Welcome route
app.get("/", (req, res) => {
  res.json({
    message: "SUVIDHA Auth Service",
    version: "1.0.0",
    endpoints: {
      health: "/api/v1/auth/health",
      getOTP: "POST /api/v1/auth/get-otp",
      verifyOTP: "POST /api/v1/auth/verify-otp",
      refreshToken: "POST /api/v1/auth/refresh-token",
      logout: "POST /api/v1/auth/logout",
      profile: "GET /api/v1/auth/profile",
      getProfile: "GET /api/v1/profile",
      updateProfile: "PUT /api/v1/profile",
      getProfileByConsumerId: "GET /api/v1/profile/consumer/:consumerId",
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Auth Service running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 Service URL: http://localhost:${PORT}`);
  console.log(`\n✅ Auth Service is ready\n`);
});

module.exports = app;
