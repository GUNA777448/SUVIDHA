const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const {
  validateRequestOTP,
  validateVerifyOTP,
  validateRefreshToken,
} = require("../validations/auth.validation");
const {
  otpRequestLimiter,
  otpVerifyLimiter,
} = require("../middlewares/rateLimiter");

// Health check
/**
 * @swagger
 * /api/v1/auth/health:
 *   get:
 *     summary: Health check
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Service is healthy
 */
router.get("/health", authController.health);

// ── OTP Routes (Public, rate-limited) ──
/**
 * @swagger
 * /api/v1/auth/get-otp:
 *   post:
 *     summary: Request OTP for login
 *     tags: [Auth]
 *     description: Sends a 6-digit OTP to the user's registered email. Rate-limited to 5 requests per 10 minutes.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OTPRequest'
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Validation error
 *       429:
 *         description: Too many requests
 */
router.post(
  "/get-otp",
  otpRequestLimiter,
  validateRequestOTP,
  authController.requestOTP,
);

/**
 * @swagger
 * /api/v1/auth/verify-otp:
 *   post:
 *     summary: Verify OTP and login
 *     tags: [Auth]
 *     description: Verifies the OTP and returns JWT tokens. Max 5 attempts per OTP. Rate-limited to 5 requests per 15 minutes.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OTPVerify'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid or expired OTP
 *       429:
 *         description: Too many attempts
 */
router.post(
  "/verify-otp",
  otpVerifyLimiter,
  validateVerifyOTP,
  authController.verifyOTP,
);

// ── Token Routes (Public) ──
/**
 * @swagger
 * /api/v1/auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     description: Issues a new access token and rotates the refresh token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: New tokens issued
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post(
  "/refresh-token",
  validateRefreshToken,
  authController.refreshToken,
);

// ── Protected Routes ──
/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Not authenticated
 */
router.post("/logout", verifyToken, authController.logout);

/**
 * @swagger
 * /api/v1/auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *       401:
 *         description: Not authenticated
 */
router.get("/profile", verifyToken, authController.getProfile);

module.exports = router;
