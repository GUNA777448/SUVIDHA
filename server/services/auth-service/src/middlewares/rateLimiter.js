const rateLimit = require("express-rate-limit");

// Rate limiter for OTP request endpoint
// Max 5 OTP requests per 10 minutes per IP
const otpRequestLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many OTP requests. Please try again after 10 minutes.",
  },
  keyGenerator: (req) => {
    // Rate limit by identifier + IP combination
    return `${req.ip}-${req.body?.identifier || "unknown"}`;
  },
});

// Rate limiter for OTP verification endpoint
// Max 5 verification attempts per 15 minutes per IP
const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many failed verification attempts. Please try again after 15 minutes.",
  },
  keyGenerator: (req) => {
    return `${req.ip}-${req.body?.identifier || "unknown"}`;
  },
});

// General API rate limiter
// Max 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

module.exports = {
  otpRequestLimiter,
  otpVerifyLimiter,
  generalLimiter,
};
