const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
const { setupProxies } = require("./config/proxy");
const { rateLimiter } = require("./middlewares/rateLimiter");
const { errorHandler } = require("./middlewares/errorHandler");
const healthRoutes = require("./routes/health.routes");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Rate limiting
app.use(rateLimiter);

// Health check routes
app.use("/health", healthRoutes);

// Setup service proxies
setupProxies(app);

// Welcome route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to SUVIDHA Platform API Gateway",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/health",
      services: {
        auth: "/api/v1/auth",
        electricity: "/api/v1/electricity",
        payment: "/api/v1/payment",
        document: "/api/v1/document",
        admin: "/api/v1/admin",
        gas: "/api/v1/gas",
        water: "/api/v1/water",
        notification: "/api/v1/notification",
      },
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 API Gateway running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 Gateway URL: http://localhost:${PORT}`);
  console.log(`\n📋 Service Routes:`);
  console.log(`   • Auth Service:         /api/v1/auth`);
  console.log(`   • Electricity Service:  /api/v1/electricity`);
  console.log(`   • Payment Service:      /api/v1/payment`);
  console.log(`   • Document Service:     /api/v1/document`);
  console.log(`   • Admin Service:        /api/v1/admin`);
  console.log(`   • Gas Service:          /api/v1/gas`);
  console.log(`   • Water Service:        /api/v1/water`);
  console.log(`   • Notification Service: /api/v1/notification`);
  console.log(`\n✅ Gateway is ready to accept requests\n`);
});

module.exports = app;
