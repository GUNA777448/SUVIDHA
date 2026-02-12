const mongoose = require("mongoose");
const { authConnection } = require("../config/database");

const userSchema = new mongoose.Schema(
  {
    // Identifiers - at least one is required
    mobileNumber: {
      type: String,
      sparse: true,
      unique: true,
      trim: true,
      match: [/^[0-9]{10}$/, "Please enter a valid 10-digit mobile number"],
    },
    aadharNumber: {
      type: String,
      sparse: true,
      unique: true,
      trim: true,
      match: [/^[0-9]{12}$/, "Please enter a valid 12-digit Aadhar number"],
    },
    consumerId: {
      type: String,
      sparse: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    // Login type that was used for registration
    primaryLoginType: {
      type: String,
      enum: ["M", "A", "C"], // M=Mobile, A=Aadhar, C=Consumer ID
      required: true,
    },

    // Role and status
    role: {
      type: String,
      enum: ["user", "admin", "operator"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Authentication tokens
    refreshToken: {
      type: String,
      select: false,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Method to generate auth JSON
userSchema.methods.toAuthJSON = function () {
  return {
    id: this._id,
    mobileNumber: this.mobileNumber,
    aadharNumber: this.aadharNumber,
    consumerId: this.consumerId,
    role: this.role,
    primaryLoginType: this.primaryLoginType,
  };
};

// Try to get existing model or create new one
let User;
try {
  User = authConnection.model("User");
} catch (error) {
  User = authConnection.model("User", userSchema);
}

module.exports = User;
