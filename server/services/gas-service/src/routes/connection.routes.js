const express = require("express");
const router = express.Router();
const {
  getUserConnections,
  getConnectionById,
  getConnectionByConsumerNumber,
  createConnection,
  updateConnection,
  transferConnection,
  deactivateConnection,
} = require("../controllers/connection.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

// Apply authentication to all routes
router.use(authenticateToken);

// @route   GET /api/v1/gas/connections
// @desc    Get all gas connections for user
// @access  Private
router.get("/", getUserConnections);

// @route   GET /api/v1/gas/connections/:id
// @desc    Get gas connection by ID
// @access  Private
router.get("/:id", getConnectionById);

// @route   GET /api/v1/gas/connections/consumer/:consumerNumber
// @desc    Get gas connection by consumer number
// @access  Private
router.get("/consumer/:consumerNumber", getConnectionByConsumerNumber);

// @route   POST /api/v1/gas/connections
// @desc    Create new gas connection
// @access  Private
router.post("/", createConnection);

// @route   PATCH /api/v1/gas/connections/:id
// @desc    Update gas connection
// @access  Private
router.patch("/:id", updateConnection);

// @route   POST /api/v1/gas/connections/:id/transfer
// @desc    Request gas connection transfer
// @access  Private
router.post("/:id/transfer", transferConnection);

// @route   DELETE /api/v1/gas/connections/:id
// @desc    Deactivate gas connection
// @access  Private
router.delete("/:id", deactivateConnection);

module.exports = router;
