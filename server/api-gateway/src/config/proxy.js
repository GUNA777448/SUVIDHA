const { createProxyMiddleware } = require("http-proxy-middleware");
const { verifyToken } = require("../middlewares/auth");

// Service configurations
const services = [
  {
    route: "/api/v1/auth",
    target: process.env.AUTH_SERVICE_URL || "http://localhost:3001",
    protected: false, // Auth routes are public
  },
  {
    route: "/api/v1/electricity",
    target: process.env.ELECTRICITY_SERVICE_URL || "http://localhost:3002",
    protected: true,
  },
  {
    route: "/api/v1/payment",
    target: process.env.PAYMENT_SERVICE_URL || "http://localhost:3003",
    protected: true,
  },
  {
    route: "/api/v1/document",
    target: process.env.DOCUMENT_SERVICE_URL || "http://localhost:3004",
    protected: true,
  },
  {
    route: "/api/v1/admin",
    target: process.env.ADMIN_SERVICE_URL || "http://localhost:3005",
    protected: true,
  },
  {
    route: "/api/v1/gas",
    target: process.env.GAS_SERVICE_URL || "http://localhost:3006",
    protected: true,
  },
  {
    route: "/api/v1/water",
    target: process.env.WATER_SERVICE_URL || "http://localhost:3007",
    protected: true,
  },
  {
    route: "/api/v1/notification",
    target: process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3008",
    protected: true,
  },
];

const setupProxies = (app) => {
  services.forEach(({ route, target, protected: isProtected }) => {
    const proxyOptions = {
      target,
      changeOrigin: true,
      pathRewrite: {
        [`^${route}`]: "",
      },
      onProxyReq: (proxyReq, req, res) => {
        // Forward user information from auth middleware
        if (req.user) {
          proxyReq.setHeader("x-user-id", req.user.id);
          proxyReq.setHeader("x-user-role", req.user.role);
          if (req.user.mobileNumber) {
            proxyReq.setHeader("x-user-mobile", req.user.mobileNumber);
          }
          if (req.user.aadharNumber) {
            proxyReq.setHeader("x-user-aadhar", req.user.aadharNumber);
          }
          if (req.user.consumerId) {
            proxyReq.setHeader("x-user-consumer-id", req.user.consumerId);
          }
        }
      },
      onProxyRes: (proxyRes, req, res) => {
        // Log proxy responses
        console.log(
          `[Proxy] ${req.method} ${req.originalUrl} -> ${target} | Status: ${proxyRes.statusCode}`,
        );
      },
      onError: (err, req, res) => {
        console.error(`[Proxy Error] ${route} -> ${target}:`, err.message);
        res.status(503).json({
          success: false,
          message: `Service temporarily unavailable`,
          service: route,
          error:
            process.env.NODE_ENV === "development" ? err.message : undefined,
        });
      },
    };

    // Apply authentication middleware for protected routes
    if (isProtected) {
      app.use(route, verifyToken, createProxyMiddleware(proxyOptions));
    } else {
      app.use(route, createProxyMiddleware(proxyOptions));
    }

    console.log(
      `✓ Proxy configured: ${route} -> ${target} ${isProtected ? "(Protected)" : "(Public)"}`,
    );
  });
};

module.exports = { setupProxies, services };
