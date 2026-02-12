const mongoose = require("mongoose");

const billSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    connectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ElectricityConnection",
      required: true,
    },
    billNumber: {
      type: String,
      required: true,
      unique: true,
    },
    consumerNumber: {
      type: String,
      required: true,
    },
    billingPeriod: {
      from: {
        type: Date,
        required: true,
      },
      to: {
        type: Date,
        required: true,
      },
    },
    meterReading: {
      previous: {
        type: Number,
        required: true,
      },
      current: {
        type: Number,
        required: true,
      },
      unitsConsumed: {
        type: Number,
        required: true,
      },
    },
    charges: {
      energyCharges: {
        type: Number,
        required: true,
      },
      fixedCharges: {
        type: Number,
        required: true,
      },
      tax: {
        type: Number,
        required: true,
      },
      otherCharges: {
        type: Number,
        default: 0,
      },
      totalAmount: {
        type: Number,
        required: true,
      },
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "overdue", "partial"],
      default: "pending",
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    paidDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
billSchema.index({ userId: 1, billNumber: 1 });
billSchema.index({ consumerNumber: 1 });
billSchema.index({ status: 1 });

module.exports = mongoose.model("ElectricityBill", billSchema);
