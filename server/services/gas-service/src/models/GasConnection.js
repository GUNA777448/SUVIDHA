const mongoose = require("mongoose");

const gasConnectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    connectionNumber: {
      type: String,
      required: true,
      unique: true,
    },
    consumerNumber: {
      type: String,
      required: true,
      unique: true,
    },
    connectionType: {
      type: String,
      enum: ["DOMESTIC", "COMMERCIAL", "INDUSTRIAL"],
      required: true,
    },
    gasAgency: {
      name: {
        type: String,
        required: true,
      },
      agencyId: {
        type: String,
        required: true,
      },
      contact: {
        phone: String,
        address: String,
      },
    },
    customerDetails: {
      name: {
        type: String,
        required: true,
      },
      fatherName: String,
      phoneNumber: {
        type: String,
        required: true,
      },
      email: String,
      aadhaarNumber: {
        type: String,
        required: true,
      },
      address: {
        street: String,
        city: String,
        state: String,
        pincode: {
          type: String,
          required: true,
        },
      },
    },
    connectionDetails: {
      installationDate: {
        type: Date,
        required: true,
      },
      securityDeposit: {
        type: Number,
        required: true,
      },
      cylinderCapacity: {
        type: Number,
        enum: [5, 14.2, 19, 47.5], // Standard LPG cylinder sizes in kg
        required: true,
      },
      regulatorNumber: String,
      pipelineConnection: {
        type: Boolean,
        default: false,
      },
    },
    status: {
      type: String,
      enum: [
        "ACTIVE",
        "INACTIVE",
        "SUSPENDED",
        "TERMINATED",
        "PENDING_ACTIVATION",
      ],
      default: "PENDING_ACTIVATION",
    },
    safetyInspection: {
      lastInspectionDate: Date,
      nextInspectionDate: Date,
      inspectorName: String,
      certificationNumber: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Generate unique connection number
gasConnectionSchema.pre("save", function (next) {
  if (!this.connectionNumber) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    this.connectionNumber = `GAS${timestamp}${random}`;
  }
  next();
});

// Generate unique consumer number
gasConnectionSchema.pre("save", function (next) {
  if (!this.consumerNumber) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 100)
      .toString()
      .padStart(2, "0");
    this.consumerNumber = `${this.gasAgency.agencyId}${timestamp}${random}`;
  }
  next();
});

module.exports = mongoose.model("GasConnection", gasConnectionSchema);
