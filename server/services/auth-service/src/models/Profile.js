const mongoose = require("mongoose");
const { profileConnection } = require("../config/database");

const profileSchema = new mongoose.Schema(
  {
    // Foreign key to User in auth DB (using consumerId as primary reference)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    // Reference identifiers (for linking)
    consumerId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    mobileNumber: {
      type: String,
      index: true,
    },
    aadharNumber: {
      type: String,
      index: true,
    },

    // Personal Information
    fullName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },

    // Contact Information
    alternatePhone: {
      type: String,
      trim: true,
    },

    // Address
    address: {
      line1: {
        type: String,
        trim: true,
      },
      line2: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      district: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
        default: "Tamil Nadu",
      },
      pincode: {
        type: String,
        trim: true,
        match: [/^[0-9]{6}$/, "Please enter a valid 6-digit pincode"],
      },
      country: {
        type: String,
        trim: true,
        default: "India",
      },
    },

    // Additional Information
    occupation: {
      type: String,
      trim: true,
    },
    emergencyContact: {
      name: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
      relation: {
        type: String,
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster lookups
profileSchema.index({ userId: 1, consumerId: 1 });

// Try to get existing model or create new one
let Profile;
try {
  Profile = profileConnection.model("Profile");
} catch (error) {
  Profile = profileConnection.model("Profile", profileSchema);
}

module.exports = Profile;
