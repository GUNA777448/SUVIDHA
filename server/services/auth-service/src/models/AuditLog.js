const mongoose = require("mongoose");
const { authConnection } = require("../config/database");

const auditLogSchema = new mongoose.Schema(
  {
    event: {
      type: String,
      required: true,
      enum: [
        "OTP_REQUESTED",
        "OTP_VERIFIED",
        "OTP_FAILED",
        "OTP_EXPIRED",
        "OTP_LOCKED",
        "LOGIN_SUCCESS",
        "LOGIN_FAILED",
        "LOGOUT",
        "TOKEN_REFRESH",
        "TOKEN_REFRESH_FAILED",
        "USER_CREATED",
        "PROFILE_UPDATED",
      ],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    identifier: {
      type: String,
      trim: true,
    },
    loginType: {
      type: String,
      enum: ["M", "A", "C"],
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
    success: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Index for querying recent events
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });

// Auto-delete logs older than 90 days
auditLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 },
);

let AuditLog;
try {
  AuditLog = authConnection.model("AuditLog");
} catch (error) {
  AuditLog = authConnection.model("AuditLog", auditLogSchema);
}

module.exports = AuditLog;
