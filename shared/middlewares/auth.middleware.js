/**
 * Shared Auth Middleware for SUVIDHA Microservices
 *
 * Usage in any microservice:
 *   const { verifyToken, requireRole } = require('../../../shared/middlewares/auth.middleware');
 *
 *   router.get('/protected', verifyToken, handler);
 *   router.get('/admin-only', verifyToken, requireRole('admin'), handler);
 *
 * Requires:
 *   - jsonwebtoken package installed in the service
 *   - JWT_SECRET set in environment variables
 */

const jwt = require("jsonwebtoken");

/**
 * Verify JWT access token from Authorization header.
 * Attaches decoded user info to req.user on success.
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Authentication required.",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format. Use: Bearer <token>",
      });
    }

    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is empty.",
      });
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error("JWT_SECRET is not configured");
      return res.status(500).json({
        success: false,
        message: "Server configuration error.",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = {
      id: decoded.id,
      mobileNumber: decoded.mobileNumber,
      aadharNumber: decoded.aadharNumber,
      consumerId: decoded.consumerId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please login again.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Authentication failed.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Authentication error.",
    });
  }
};

/**
 * Role-based authorization middleware.
 * Must be used AFTER verifyToken.
 *
 * @param  {...string} roles - Allowed roles (e.g., 'admin', 'operator')
 * @returns Express middleware
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(" or ")}`,
      });
    }

    next();
  };
};

module.exports = { verifyToken, requireRole };
