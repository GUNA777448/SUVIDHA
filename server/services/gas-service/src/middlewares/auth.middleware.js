const jwt = require("jsonwebtoken");
const axios = require("axios");

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Access token required",
      });
    }

    // Verify token with auth service
    try {
      const authServiceUrl =
        process.env.AUTH_SERVICE_URL || "http://localhost:3001";
      const response = await axios.post(
        `${authServiceUrl}/api/v1/auth/verify-token`,
        {
          token: token,
        },
      );

      if (response.data.success) {
        req.user = response.data.user;
        next();
      } else {
        return res.status(403).json({
          success: false,
          error: "Invalid token",
        });
      }
    } catch (error) {
      // Fallback to JWT verification if auth service is down
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "suvidha-secret-key",
      );
      req.user = decoded;
      next();
    }
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: "Invalid or expired token",
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      try {
        const authServiceUrl =
          process.env.AUTH_SERVICE_URL || "http://localhost:3001";
        const response = await axios.post(
          `${authServiceUrl}/api/v1/auth/verify-token`,
          {
            token: token,
          },
        );

        if (response.data.success) {
          req.user = response.data.user;
        }
      } catch (error) {
        // Continue without auth if token verification fails
        console.log("Optional auth failed:", error.message);
      }
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = { authenticateToken, optionalAuth };
