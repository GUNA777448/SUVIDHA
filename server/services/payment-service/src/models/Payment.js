const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    billType: {
      type: String,
      enum: ["electricity", "gas", "water", "municipal"],
      required: true,
    },
    billId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    billNumber: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["upi", "card", "netbanking", "wallet", "cash"],
      required: true,
    },
    paymentGateway: {
      type: String,
      enum: ["razorpay", "paytm", "phonepe", "gpay", "manual"],
    },
    gatewayTransactionId: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "success", "failed", "refunded"],
      default: "pending",
    },
    paymentDetails: {
      cardLast4: String,
      upiId: String,
      bankName: String,
    },
    metadata: {
      type: Map,
      of: String,
    },
    failureReason: String,
    refundId: String,
    refundAmount: Number,
    refundDate: Date,
  },
  {
    timestamps: true,
  },
);

// Indexes
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ billId: 1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model("Payment", paymentSchema);
