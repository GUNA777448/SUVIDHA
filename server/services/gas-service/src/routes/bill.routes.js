const express = require("express");
const router = express.Router();
const {
  getUserBills,
  getBillById,
  getBillsByConsumerNumber,
  generateBill,
  updateBillStatus,
  getPendingBills,
  getPaymentHistory,
} = require("../controllers/bill.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

// Apply authentication to all routes
router.use(authenticateToken);

// @route   GET /api/v1/gas/bills
// @desc    Get all gas bills for user
// @access  Private
router.get("/", getUserBills);

// @route   GET /api/v1/gas/bills/:id
// @desc    Get gas bill by ID
// @access  Private
router.get("/:id", getBillById);

// @route   GET /api/v1/gas/bills/consumer/:consumerNumber
// @desc    Get gas bills by consumer number
// @access  Private
router.get("/consumer/:consumerNumber", getBillsByConsumerNumber);

// @route   GET /api/v1/gas/bills/consumer/:consumerNumber/payment-history
// @desc    Get payment history for consumer number
// @access  Private
router.get("/consumer/:consumerNumber/payment-history", getPaymentHistory);

// @route   GET /api/v1/gas/bills/connection/:connectionId/pending
// @desc    Get pending bills for a connection
// @access  Private
router.get("/connection/:connectionId/pending", getPendingBills);

// @route   POST /api/v1/gas/bills/generate
// @desc    Generate new gas bill (Admin only)
// @access  Private (Admin)
router.post("/generate", generateBill);

// @route   PATCH /api/v1/gas/bills/:id/status
// @desc    Update bill payment status
// @access  Private
router.patch("/:id/status", updateBillStatus);

module.exports = router;
