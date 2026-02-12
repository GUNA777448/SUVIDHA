const mongoose = require("mongoose");

const gasBillSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    connectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GasConnection",
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
    billType: {
      type: String,
      enum: [
        "MONTHLY_RENTAL",
        "CYLINDER_REFILL",
        "PIPELINE_BILL",
        "SECURITY_DEPOSIT",
      ],
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
    consumption: {
      // For pipeline connections
      meterReading: {
        previous: Number,
        current: Number,
        unitsConsumed: Number,
      },
      // For cylinder refills
      cylinderDetails: {
        cylinderNumber: String,
        capacity: Number,
        refillDate: Date,
        deliveryDate: Date,
      },
    },
    charges: {
      gasCharges: {
        type: Number,
        default: 0,
      },
      fixedCharges: {
        type: Number,
        default: 0,
      },
      subsidyAmount: {
        type: Number,
        default: 0,
      },
      transportCharges: {
        type: Number,
        default: 0,
      },
      taxes: {
        gst: {
          type: Number,
          default: 0,
        },
        serviceTax: {
          type: Number,
          default: 0,
        },
      },
      totalAmount: {
        type: Number,
        required: true,
      },
      amountAfterSubsidy: {
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
      enum: ["PENDING", "PAID", "OVERDUE", "CANCELLED"],
      default: "PENDING",
    },
    paymentDetails: {
      paymentId: String,
      paymentMethod: {
        type: String,
        enum: ["CASH", "CARD", "UPI", "NETBANKING", "WALLET"],
      },
      paidAmount: Number,
      paidDate: Date,
      transactionId: String,
    },
    subsidyDetails: {
      isSubsidized: {
        type: Boolean,
        default: false,
      },
      subsidyType: {
        type: String,
        enum: ["PMUY", "BPL", "AAY", "GENERAL"],
      },
      subsidyAmount: Number,
      aadhaarLinked: {
        type: Boolean,
        default: false,
      },
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

// Generate unique bill number
gasBillSchema.pre("save", function (next) {
  if (!this.billNumber) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    this.billNumber = `GB${timestamp}${random}`;
  }
  next();
});

// Calculate total amount before saving
gasBillSchema.pre("save", function (next) {
  if (this.isModified("charges")) {
    const { gasCharges, fixedCharges, transportCharges, taxes } = this.charges;
    const subtotal =
      (gasCharges || 0) + (fixedCharges || 0) + (transportCharges || 0);
    const totalTax = (taxes.gst || 0) + (taxes.serviceTax || 0);

    this.charges.totalAmount = subtotal + totalTax;
    this.charges.amountAfterSubsidy =
      this.charges.totalAmount - (this.charges.subsidyAmount || 0);
  }
  next();
});

// Index for efficient querying
gasBillSchema.index({ consumerNumber: 1, billingPeriod: 1 });
gasBillSchema.index({ userId: 1, status: 1 });
gasBillSchema.index({ dueDate: 1, status: 1 });

module.exports = mongoose.model("GasBill", gasBillSchema);
