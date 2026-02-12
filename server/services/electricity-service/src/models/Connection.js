const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    consumerNumber: {
      type: String,
      required: true,
      unique: true,
    },
    consumerName: {
      type: String,
      required: true,
    },
    connectionType: {
      type: String,
      enum: ["residential", "commercial", "industrial"],
      default: "residential",
    },
    tariffCategory: {
      type: String,
      required: true,
    },
    sanctionedLoad: {
      type: Number,
      required: true,
    },
    meterNumber: {
      type: String,
      required: true,
    },
    serviceAddress: {
      street: String,
      area: String,
      city: String,
      state: String,
      pincode: String,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "disconnected", "suspended"],
      default: "active",
    },
    connectionDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
connectionSchema.index({ userId: 1 });
connectionSchema.index({ consumerNumber: 1 });

module.exports = mongoose.model("ElectricityConnection", connectionSchema);
