const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    connectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GasConnection",
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CylinderBooking",
    },
    complaintNumber: {
      type: String,
      required: true,
      unique: true,
    },
    consumerNumber: {
      type: String,
      required: true,
    },
    complaintDetails: {
      category: {
        type: String,
        enum: [
          "BILLING",
          "CONNECTION_ISSUE",
          "DELIVERY_DELAY",
          "CYLINDER_DEFECT",
          "POOR_SERVICE",
          "SAFETY_CONCERN",
          "REGULATOR_ISSUE",
          "PIPELINE_LEAK",
          "SUBSIDY_ISSUE",
          "OTHER",
        ],
        required: true,
      },
      subCategory: {
        type: String,
        enum: [
          "WRONG_BILL_AMOUNT",
          "BILL_NOT_GENERATED",
          "CONNECTION_NOT_WORKING",
          "NEW_CONNECTION_DELAY",
          "CYLINDER_NOT_DELIVERED",
          "DELAYED_DELIVERY",
          "DEFECTIVE_CYLINDER",
          "LEAKING_CYLINDER",
          "RUDE_STAFF",
          "DELIVERY_PERSON_ISSUE",
          "GAS_LEAK",
          "EQUIPMENT_MALFUNCTION",
          "REGULATOR_NOT_WORKING",
          "PIPELINE_DAMAGE",
          "SUBSIDY_NOT_APPLIED",
          "DOCUMENT_ISSUE",
        ],
      },
      priority: {
        type: String,
        enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
        default: "MEDIUM",
      },
      description: {
        type: String,
        required: true,
        maxlength: 1000,
      },
      attachments: [
        {
          fileName: String,
          fileUrl: String,
          fileType: String,
          uploadedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
    assignmentDetails: {
      assignedTo: {
        employeeId: String,
        name: String,
        department: {
          type: String,
          enum: ["TECHNICAL", "BILLING", "DELIVERY", "CUSTOMER_SERVICE"],
        },
        phone: String,
        email: String,
      },
      assignedAt: Date,
      estimatedResolutionTime: Date,
    },
    resolution: {
      resolutionDescription: String,
      actionsTaken: [String],
      resolutionDate: Date,
      resolvedBy: {
        employeeId: String,
        name: String,
      },
      compensationProvided: {
        type: {
          type: String,
          enum: ["REFUND", "FREE_DELIVERY", "DISCOUNT", "REPLACEMENT", "NONE"],
        },
        amount: Number,
        description: String,
      },
    },
    status: {
      type: String,
      enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "ESCALATED"],
      default: "OPEN",
    },
    timeline: [
      {
        status: String,
        description: String,
        updatedBy: {
          employeeId: String,
          name: String,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    customerSatisfaction: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      feedback: String,
      ratedAt: Date,
    },
    followUp: {
      required: {
        type: Boolean,
        default: false,
      },
      scheduledDate: Date,
      completedDate: Date,
      notes: String,
    },
    escalation: {
      level: {
        type: Number,
        default: 0, // 0: No escalation, 1: Level 1, 2: Level 2, etc.
      },
      escalatedTo: {
        department: String,
        supervisor: String,
      },
      escalatedAt: Date,
      reason: String,
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

// Generate unique complaint number
complaintSchema.pre("save", function (next) {
  if (!this.complaintNumber) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    this.complaintNumber = `GC${timestamp}${random}`;
  }
  next();
});

// Add timeline entry when status changes
complaintSchema.pre("save", function (next) {
  if (this.isModified("status") && !this.isNew) {
    this.timeline.push({
      status: this.status,
      description: `Status changed to ${this.status}`,
      timestamp: new Date(),
    });
  }
  next();
});

// Auto-escalate high priority complaints after 24 hours
complaintSchema.pre("save", function (next) {
  if (this.complaintDetails.priority === "HIGH" && this.status === "OPEN") {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (this.createdAt < twentyFourHoursAgo && this.escalation.level === 0) {
      this.escalation.level = 1;
      this.status = "ESCALATED";
      this.escalation.escalatedAt = new Date();
      this.escalation.reason =
        "Auto-escalated due to high priority and time delay";
    }
  }
  next();
});

// Indexes for efficient querying
complaintSchema.index({ userId: 1, status: 1 });
complaintSchema.index({ consumerNumber: 1, createdAt: -1 });
complaintSchema.index({ status: 1, "complaintDetails.priority": 1 });
complaintSchema.index({ "assignmentDetails.assignedTo.employeeId": 1 });

module.exports = mongoose.model("Complaint", complaintSchema);
