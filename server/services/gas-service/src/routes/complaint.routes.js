const express = require("express");
const router = express.Router();
const {
  getUserComplaints,
  getComplaintById,
  createComplaint,
  updateComplaint,
  addComment,
  escalateComplaint,
  rateComplaint,
  getComplaintStats,
} = require("../controllers/complaint.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

// Apply authentication to all routes
router.use(authenticateToken);

// @route   GET /api/v1/gas/complaints
// @desc    Get all complaints for user
// @access  Private
router.get("/", getUserComplaints);

// @route   GET /api/v1/gas/complaints/stats
// @desc    Get complaint statistics (Admin only)
// @access  Private (Admin)
router.get("/stats", getComplaintStats);

// @route   GET /api/v1/gas/complaints/:id
// @desc    Get complaint by ID
// @access  Private
router.get("/:id", getComplaintById);

// @route   POST /api/v1/gas/complaints
// @desc    Create new complaint
// @access  Private
router.post("/", createComplaint);

// @route   PATCH /api/v1/gas/complaints/:id
// @desc    Update complaint (Admin/Staff only)
// @access  Private (Admin/Staff)
router.patch("/:id", updateComplaint);

// @route   POST /api/v1/gas/complaints/:id/comment
// @desc    Add comment to complaint
// @access  Private
router.post("/:id/comment", addComment);

// @route   POST /api/v1/gas/complaints/:id/escalate
// @desc    Escalate complaint
// @access  Private
router.post("/:id/escalate", escalateComplaint);

// @route   POST /api/v1/gas/complaints/:id/rate
// @desc    Rate complaint resolution
// @access  Private
router.post("/:id/rate", rateComplaint);

module.exports = router;
