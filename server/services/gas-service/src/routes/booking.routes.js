const express = require("express");
const router = express.Router();
const {
  getUserBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  cancelBooking,
  trackBooking,
  rateDelivery,
} = require("../controllers/booking.controller");
const {
  authenticateToken,
  optionalAuth,
} = require("../middlewares/auth.middleware");

// @route   GET /api/v1/gas/bookings/track/:bookingNumber
// @desc    Track booking by booking number (public endpoint)
// @access  Public
router.get("/track/:bookingNumber", optionalAuth, trackBooking);

// Apply authentication to all other routes
router.use(authenticateToken);

// @route   GET /api/v1/gas/bookings
// @desc    Get all cylinder bookings for user
// @access  Private
router.get("/", getUserBookings);

// @route   GET /api/v1/gas/bookings/:id
// @desc    Get cylinder booking by ID
// @access  Private
router.get("/:id", getBookingById);

// @route   POST /api/v1/gas/bookings
// @desc    Create new cylinder booking
// @access  Private
router.post("/", createBooking);

// @route   PATCH /api/v1/gas/bookings/:id/status
// @desc    Update booking status
// @access  Private (Admin/Agency/Delivery Person)
router.patch("/:id/status", updateBookingStatus);

// @route   POST /api/v1/gas/bookings/:id/cancel
// @desc    Cancel cylinder booking
// @access  Private
router.post("/:id/cancel", cancelBooking);

// @route   POST /api/v1/gas/bookings/:id/rate
// @desc    Rate delivery service
// @access  Private
router.post("/:id/rate", rateDelivery);

module.exports = router;
