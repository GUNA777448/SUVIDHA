const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { validateLogin, validateOTP } = require("../middlewares/validators");

/**
 * @route   POST /api/auth/login
 * @desc    User login
 * @access  Public
 */
router.post("/login", validateLogin, authController.login);

/**
 * @route   POST /api/auth/logout
 * @desc    User logout
 * @access  Private
 */
router.post("/logout", authController.logout);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public
 */
router.post("/refresh-token", authController.refreshToken);

/**
 * @route   POST /api/auth/otp/send
 * @desc    Send OTP to user
 * @access  Public
 */
router.post("/otp/send", authController.sendOTP);

/**
 * @route   POST /api/auth/otp/verify
 * @desc    Verify OTP
 * @access  Public
 */
router.post("/otp/verify", validateOTP, authController.verifyOTP);

/**
 * @route   POST /api/auth/password/reset
 * @desc    Reset password
 * @access  Public
 */
router.post("/password/reset", authController.resetPassword);

module.exports = router;
