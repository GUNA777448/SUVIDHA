const Joi = require("joi");

// Connection validation schemas
const createConnectionSchema = Joi.object({
  connectionType: Joi.string()
    .valid("DOMESTIC", "COMMERCIAL", "INDUSTRIAL")
    .required(),
  gasAgency: Joi.object({
    name: Joi.string().required(),
    agencyId: Joi.string().required(),
    contact: Joi.object({
      phone: Joi.string(),
      address: Joi.string(),
    }),
  }).required(),
  customerDetails: Joi.object({
    name: Joi.string().required(),
    fatherName: Joi.string(),
    phoneNumber: Joi.string()
      .pattern(/^[6-9]\d{9}$/)
      .required(),
    email: Joi.string().email(),
    aadhaarNumber: Joi.string()
      .pattern(/^\d{12}$/)
      .required(),
    address: Joi.object({
      street: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      pincode: Joi.string()
        .pattern(/^\d{6}$/)
        .required(),
    }),
  }).required(),
  connectionDetails: Joi.object({
    securityDeposit: Joi.number().positive().required(),
    cylinderCapacity: Joi.number().valid(5, 14.2, 19, 47.5).required(),
    regulatorNumber: Joi.string(),
    pipelineConnection: Joi.boolean(),
  }).required(),
});

const updateConnectionSchema = Joi.object({
  customerDetails: Joi.object({
    phoneNumber: Joi.string().pattern(/^[6-9]\d{9}$/),
    email: Joi.string().email(),
    address: Joi.object({
      street: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      pincode: Joi.string().pattern(/^\d{6}$/),
    }),
  }),
  status: Joi.string().valid("ACTIVE", "INACTIVE", "SUSPENDED", "TERMINATED"),
});

// Bill validation schemas
const createBillSchema = Joi.object({
  connectionId: Joi.string().required(),
  billType: Joi.string()
    .valid(
      "MONTHLY_RENTAL",
      "CYLINDER_REFILL",
      "PIPELINE_BILL",
      "SECURITY_DEPOSIT",
    )
    .required(),
  billingPeriod: Joi.object({
    from: Joi.date().required(),
    to: Joi.date().required(),
  }).required(),
  consumption: Joi.object({
    meterReading: Joi.object({
      previous: Joi.number().min(0),
      current: Joi.number().min(0),
      unitsConsumed: Joi.number().min(0),
    }),
    cylinderDetails: Joi.object({
      cylinderNumber: Joi.string(),
      capacity: Joi.number(),
      refillDate: Joi.date(),
      deliveryDate: Joi.date(),
    }),
  }),
  charges: Joi.object({
    gasCharges: Joi.number().min(0),
    fixedCharges: Joi.number().min(0),
    subsidyAmount: Joi.number().min(0),
    transportCharges: Joi.number().min(0),
    taxes: Joi.object({
      gst: Joi.number().min(0),
      serviceTax: Joi.number().min(0),
    }),
  }),
  dueDate: Joi.date().required(),
});

const updateBillStatusSchema = Joi.object({
  status: Joi.string()
    .valid("PENDING", "PAID", "OVERDUE", "CANCELLED")
    .required(),
  paymentDetails: Joi.object({
    paymentId: Joi.string(),
    paymentMethod: Joi.string().valid(
      "CASH",
      "CARD",
      "UPI",
      "NETBANKING",
      "WALLET",
    ),
    paidAmount: Joi.number().positive(),
    transactionId: Joi.string(),
  }),
});

// Booking validation schemas
const createBookingSchema = Joi.object({
  connectionId: Joi.string().required(),
  cylinderDetails: Joi.object({
    capacity: Joi.number().valid(5, 14.2, 19, 47.5).required(),
    quantity: Joi.number().integer().min(1).max(12),
    cylinderType: Joi.string()
      .valid("SUBSIDIZED", "NON_SUBSIDIZED", "COMMERCIAL")
      .required(),
  }).required(),
  bookingDetails: Joi.object({
    requestedDeliveryDate: Joi.date(),
    deliveryTimeSlot: Joi.string().valid(
      "MORNING",
      "AFTERNOON",
      "EVENING",
      "ANY",
    ),
    urgentDelivery: Joi.boolean(),
    specialInstructions: Joi.string().max(500),
  }),
  deliveryDetails: Joi.object({
    deliveryAddress: Joi.object({
      street: Joi.string(),
      landmark: Joi.string(),
      city: Joi.string(),
      pincode: Joi.string().pattern(/^\d{6}$/),
    }),
  }),
  paymentDetails: Joi.object({
    paymentMode: Joi.string().valid(
      "CASH_ON_DELIVERY",
      "PREPAID",
      "WALLET",
      "UPI",
    ),
  }),
});

const updateBookingStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      "CONFIRMED",
      "ASSIGNED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
    )
    .required(),
  deliveryDetails: Joi.object({
    assignedDeliveryPerson: Joi.object({
      name: Joi.string(),
      phone: Joi.string(),
      employeeId: Joi.string(),
    }),
    vehicleNumber: Joi.string(),
    estimatedDeliveryTime: Joi.date(),
    actualDeliveryTime: Joi.date(),
    deliveryNotes: Joi.string(),
  }),
  cancellation: Joi.object({
    reason: Joi.string().required(),
    cancelledBy: Joi.string().valid("CUSTOMER", "AGENCY", "SYSTEM").required(),
  }),
});

// Complaint validation schemas
const createComplaintSchema = Joi.object({
  connectionId: Joi.string(),
  bookingId: Joi.string(),
  consumerNumber: Joi.string().required(),
  complaintDetails: Joi.object({
    category: Joi.string()
      .valid(
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
      )
      .required(),
    subCategory: Joi.string(),
    priority: Joi.string().valid("LOW", "MEDIUM", "HIGH", "CRITICAL"),
    description: Joi.string().max(1000).required(),
  }).required(),
});

const updateComplaintSchema = Joi.object({
  status: Joi.string().valid(
    "OPEN",
    "IN_PROGRESS",
    "RESOLVED",
    "CLOSED",
    "ESCALATED",
  ),
  assignmentDetails: Joi.object({
    assignedTo: Joi.object({
      employeeId: Joi.string(),
      name: Joi.string(),
      department: Joi.string().valid(
        "TECHNICAL",
        "BILLING",
        "DELIVERY",
        "CUSTOMER_SERVICE",
      ),
      phone: Joi.string(),
      email: Joi.string().email(),
    }),
    estimatedResolutionTime: Joi.date(),
  }),
  resolution: Joi.object({
    resolutionDescription: Joi.string(),
    actionsTaken: Joi.array().items(Joi.string()),
    compensationProvided: Joi.object({
      type: Joi.string().valid(
        "REFUND",
        "FREE_DELIVERY",
        "DISCOUNT",
        "REPLACEMENT",
        "NONE",
      ),
      amount: Joi.number().min(0),
      description: Joi.string(),
    }),
  }),
});

module.exports = {
  createConnectionSchema,
  updateConnectionSchema,
  createBillSchema,
  updateBillStatusSchema,
  createBookingSchema,
  updateBookingStatusSchema,
  createComplaintSchema,
  updateComplaintSchema,
};
