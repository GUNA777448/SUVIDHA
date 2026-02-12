const mongoose = require("mongoose");
const { authConnection } = require("../config/database");

const otpSchema = new mongoose.Schema(
  {
    identifier: {
      type: String,
      required: true,
      trim: true,
    },
    loginType: {
      type: String,
      required: true,
      enum: ["M", "A", "C"], // M=Mobile, A=Aadhar, C=Consumer ID
    },
    consumerId: {
      type: String,
      trim: true,
      uppercase: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index - auto delete when expired
    },
    verified: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 5,
    },
    locked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for faster lookups
otpSchema.index({ identifier: 1, loginType: 1 });

// Try to get existing model or create new one
let OTP;
try {
  OTP = authConnection.model("OTP");
} catch (error) {
  OTP = authConnection.model("OTP", otpSchema);
}

module.exports = OTP;
