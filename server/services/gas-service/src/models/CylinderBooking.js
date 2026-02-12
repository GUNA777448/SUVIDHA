const mongoose = require("mongoose");

const cylinderBookingSchema = new mongoose.Schema(
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
    bookingNumber: {
      type: String,
      required: true,
      unique: true,
    },
    consumerNumber: {
      type: String,
      required: true,
    },
    cylinderDetails: {
      capacity: {
        type: Number,
        enum: [5, 14.2, 19, 47.5],
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
        min: 1,
        max: 12, // Maximum cylinders per year as per govt regulations
      },
      cylinderType: {
        type: String,
        enum: ["SUBSIDIZED", "NON_SUBSIDIZED", "COMMERCIAL"],
        required: true,
      },
    },
    pricing: {
      unitPrice: {
        type: Number,
        required: true,
      },
      subsidyAmount: {
        type: Number,
        default: 0,
      },
      deliveryCharges: {
        type: Number,
        default: 0,
      },
      totalAmount: {
        type: Number,
        required: true,
      },
      finalAmount: {
        type: Number,
        required: true,
      },
    },
    bookingDetails: {
      bookingDate: {
        type: Date,
        default: Date.now,
      },
      requestedDeliveryDate: Date,
      deliveryTimeSlot: {
        type: String,
        enum: ["MORNING", "AFTERNOON", "EVENING", "ANY"],
        default: "ANY",
      },
      urgentDelivery: {
        type: Boolean,
        default: false,
      },
      specialInstructions: String,
    },
    deliveryDetails: {
      assignedDeliveryPerson: {
        name: String,
        phone: String,
        employeeId: String,
      },
      vehicleNumber: String,
      estimatedDeliveryTime: Date,
      actualDeliveryTime: Date,
      deliveryAddress: {
        street: String,
        landmark: String,
        city: String,
        pincode: String,
        coordinates: {
          latitude: Number,
          longitude: Number,
        },
      },
      deliveryOTP: {
        type: String,
        select: false, // Don't include in normal queries
      },
      deliveryNotes: String,
    },
    status: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "ASSIGNED",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
        "REJECTED",
      ],
      default: "PENDING",
    },
    paymentDetails: {
      paymentMode: {
        type: String,
        enum: ["CASH_ON_DELIVERY", "PREPAID", "WALLET", "UPI"],
        default: "CASH_ON_DELIVERY",
      },
      paymentStatus: {
        type: String,
        enum: ["PENDING", "PAID", "FAILED"],
        default: "PENDING",
      },
      transactionId: String,
      paymentDate: Date,
    },
    trackingInfo: {
      orderAcceptedAt: Date,
      cylinderDispatchedAt: Date,
      outForDeliveryAt: Date,
      deliveredAt: Date,
      trackingNumber: String,
    },
    cancellation: {
      reason: String,
      cancelledBy: {
        type: String,
        enum: ["CUSTOMER", "AGENCY", "SYSTEM"],
      },
      cancelledAt: Date,
      refundAmount: Number,
      refundStatus: {
        type: String,
        enum: ["PENDING", "PROCESSED", "FAILED"],
      },
    },
    customerRating: {
      deliveryRating: {
        type: Number,
        min: 1,
        max: 5,
      },
      serviceRating: {
        type: Number,
        min: 1,
        max: 5,
      },
      feedback: String,
      ratedAt: Date,
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

// Generate unique booking number
cylinderBookingSchema.pre("save", function (next) {
  if (!this.bookingNumber) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    this.bookingNumber = `CB${timestamp}${random}`;
  }
  next();
});

// Generate delivery OTP
cylinderBookingSchema.pre("save", function (next) {
  if (
    this.isModified("status") &&
    this.status === "OUT_FOR_DELIVERY" &&
    !this.deliveryDetails.deliveryOTP
  ) {
    this.deliveryDetails.deliveryOTP = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
  }
  next();
});

// Calculate final amount
cylinderBookingSchema.pre("save", function (next) {
  if (this.isModified("pricing")) {
    const { unitPrice, subsidyAmount, deliveryCharges } = this.pricing;
    const { quantity } = this.cylinderDetails;

    this.pricing.totalAmount = unitPrice * quantity + (deliveryCharges || 0);
    this.pricing.finalAmount = this.pricing.totalAmount - (subsidyAmount || 0);
  }
  next();
});

// Indexes for efficient querying
cylinderBookingSchema.index({ userId: 1, status: 1 });
cylinderBookingSchema.index({ consumerNumber: 1, bookingDate: -1 });
cylinderBookingSchema.index({ status: 1, bookingDate: 1 });
cylinderBookingSchema.index({ "deliveryDetails.estimatedDeliveryTime": 1 });

module.exports = mongoose.model("CylinderBooking", cylinderBookingSchema);
