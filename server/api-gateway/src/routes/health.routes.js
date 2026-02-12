const express = require("express");
const router = express.Router();
const axios = require("axios");

// Services to check
const services = [
  {
    name: "Auth Service",
    url: process.env.AUTH_SERVICE_URL || "http://localhost:3001",
    endpoint: "/health",
  },
  {
    name: "Electricity Service",
    url: process.env.ELECTRICITY_SERVICE_URL || "http://localhost:3002",
    endpoint: "/health",
  },
  {
    name: "Payment Service",
    url: process.env.PAYMENT_SERVICE_URL || "http://localhost:3003",
    endpoint: "/health",
  },
  {
    name: "Document Service",
    url: process.env.DOCUMENT_SERVICE_URL || "http://localhost:3004",
    endpoint: "/health",
  },
  {
    name: "Admin Service",
    url: process.env.ADMIN_SERVICE_URL || "http://localhost:3005",
    endpoint: "/health",
  },
  {
    name: "Gas Service",
    url: process.env.GAS_SERVICE_URL || "http://localhost:3006",
    endpoint: "/health",
  },
  {
    name: "Water Service",
    url: process.env.WATER_SERVICE_URL || "http://localhost:3007",
    endpoint: "/health",
  },
  {
    name: "Notification Service",
    url: process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3008",
    endpoint: "/health",
  },
];

// Gateway health check
router.get("/", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "api-gateway",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Check all services health
router.get("/services", async (req, res) => {
  const results = await Promise.all(
    services.map(async (service) => {
      try {
        const response = await axios.get(`${service.url}${service.endpoint}`, {
          timeout: 5000,
        });
        return {
          name: service.name,
          status: "healthy",
          url: service.url,
          responseTime: response.headers["x-response-time"] || "N/A",
          timestamp: response.data.timestamp,
        };
      } catch (error) {
        return {
          name: service.name,
          status: "unhealthy",
          url: service.url,
          error: error.message,
          timestamp: new Date().toISOString(),
        };
      }
    }),
  );

  const healthyCount = results.filter((r) => r.status === "healthy").length;
  const totalCount = results.length;

  res.status(healthyCount === totalCount ? 200 : 503).json({
    gateway: "healthy",
    services: results,
    summary: {
      total: totalCount,
      healthy: healthyCount,
      unhealthy: totalCount - healthyCount,
    },
    timestamp: new Date().toISOString(),
  });
});

// Check specific service health
router.get("/services/:serviceName", async (req, res) => {
  const { serviceName } = req.params;
  const service = services.find((s) =>
    s.name.toLowerCase().includes(serviceName.toLowerCase()),
  );

  if (!service) {
    return res.status(404).json({
      success: false,
      message: `Service '${serviceName}' not found`,
      availableServices: services.map((s) => s.name),
    });
  }

  try {
    const response = await axios.get(`${service.url}${service.endpoint}`, {
      timeout: 5000,
    });

    res.status(200).json({
      name: service.name,
      status: "healthy",
      url: service.url,
      data: response.data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      name: service.name,
      status: "unhealthy",
      url: service.url,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;
