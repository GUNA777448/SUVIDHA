const express = require("express");
const billController = require("../controllers/bill.controller");
const { authenticate } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", authenticate, billController.getBills);
router.get("/:billNumber", authenticate, billController.getBillByNumber);
router.get(
  "/consumer/:consumerNumber",
  authenticate,
  billController.getBillByConsumerNumber,
);
router.post("/generate", authenticate, billController.generateBill);
router.patch("/:billId/status", authenticate, billController.updateBillStatus);

module.exports = router;
