const express = require("express");
const paymentController = require("../controllers/payment.controller");
const { authenticate } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/initiate", authenticate, paymentController.initiatePayment);
router.get(
  "/verify/:transactionId",
  authenticate,
  paymentController.verifyPayment,
);
router.get("/", authenticate, paymentController.getPayments);
router.get("/:paymentId", authenticate, paymentController.getPaymentById);
router.patch(
  "/:paymentId/status",
  authenticate,
  paymentController.updatePaymentStatus,
);
router.post(
  "/:paymentId/refund",
  authenticate,
  paymentController.initiateRefund,
);

module.exports = router;
