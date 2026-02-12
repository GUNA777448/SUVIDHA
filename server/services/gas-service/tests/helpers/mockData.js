const mongoose = require("mongoose");

// ─── Reusable ObjectIds ───────────────────────────────────────────
const userId = new mongoose.Types.ObjectId().toString();
const adminId = new mongoose.Types.ObjectId().toString();
const connectionId = new mongoose.Types.ObjectId().toString();
const billId = new mongoose.Types.ObjectId().toString();
const bookingId = new mongoose.Types.ObjectId().toString();
const complaintId = new mongoose.Types.ObjectId().toString();

// ─── Mock Users ───────────────────────────────────────────────────
const mockUser = {
  id: userId,
  name: "Gurunath Shanmugam",
  email: "gurunath@example.com",
  role: "citizen",
};

const mockAdmin = {
  id: adminId,
  name: "Admin User",
  email: "admin@suvidha.gov.in",
  role: "admin",
};

const mockStaff = {
  id: new mongoose.Types.ObjectId().toString(),
  name: "Suresh M",
  email: "suresh.m@suvidha.gov.in",
  role: "staff",
  employeeId: "EMP-GAS-078",
};

// ─── Gas Connection Test Data ─────────────────────────────────────
const validConnectionPayload = {
  connectionType: "DOMESTIC",
  gasAgency: {
    name: "Indane Gas Agency - Coimbatore",
    agencyId: "GA001",
    contact: {
      phone: "9876543210",
      address: "123 Agency Road, Coimbatore, Tamil Nadu",
    },
  },
  customerDetails: {
    name: "Gurunath Shanmugam",
    fatherName: "Shanmugam K",
    phoneNumber: "9876543210",
    email: "gurunath@example.com",
    aadhaarNumber: "123456789012",
    address: {
      street: "45 Gandhi Nagar, RS Puram",
      city: "Coimbatore",
      state: "Tamil Nadu",
      pincode: "641002",
    },
  },
  connectionDetails: {
    securityDeposit: 1450,
    cylinderCapacity: 14.2,
    regulatorNumber: "REG-2026-001",
    pipelineConnection: false,
  },
};

const mockConnection = {
  _id: connectionId,
  userId,
  connectionNumber: "GAS123456789",
  consumerNumber: "GA00112345678",
  ...validConnectionPayload,
  connectionDetails: {
    ...validConnectionPayload.connectionDetails,
    installationDate: new Date(),
  },
  status: "ACTIVE",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  save: jest.fn().mockResolvedValue(true),
  toJSON: function () {
    return { ...this };
  },
};

// ─── Gas Bill Test Data ───────────────────────────────────────────
const validBillPayload = {
  connectionId,
  billType: "CYLINDER_REFILL",
  billingPeriod: {
    from: "2026-01-01T00:00:00.000Z",
    to: "2026-01-31T23:59:59.000Z",
  },
  consumption: {
    cylinderDetails: {
      cylinderNumber: "CYL-2026-00145",
      capacity: 14.2,
      refillDate: "2026-01-15T10:00:00.000Z",
      deliveryDate: "2026-01-16T14:30:00.000Z",
    },
  },
  charges: {
    gasCharges: 850,
    fixedCharges: 50,
    subsidyAmount: 255,
    transportCharges: 30,
    taxes: { gst: 42.5, serviceTax: 0 },
  },
  dueDate: "2026-02-28T23:59:59.000Z",
};

const mockBill = {
  _id: billId,
  userId,
  connectionId,
  billNumber: "GB12345678001",
  consumerNumber: "GA00112345678",
  ...validBillPayload,
  charges: {
    ...validBillPayload.charges,
    totalAmount: 972.5,
    amountAfterSubsidy: 717.5,
  },
  status: "PENDING",
  isActive: true,
  paymentDetails: {},
  createdAt: new Date(),
  updatedAt: new Date(),
  save: jest.fn().mockResolvedValue(true),
  populate: jest.fn().mockReturnThis(),
  toJSON: function () {
    return { ...this };
  },
};

// ─── Cylinder Booking Test Data ────────────────────────────────────
const validBookingPayload = {
  connectionId,
  cylinderDetails: {
    capacity: 14.2,
    quantity: 1,
    cylinderType: "SUBSIDIZED",
  },
  bookingDetails: {
    requestedDeliveryDate: "2026-02-15T10:00:00.000Z",
    deliveryTimeSlot: "MORNING",
    urgentDelivery: false,
    specialInstructions: "Please call before arriving. Gate code: 1234",
  },
  deliveryDetails: {
    deliveryAddress: {
      street: "45 Gandhi Nagar, RS Puram",
      landmark: "Near RS Puram Bus Stand",
      city: "Coimbatore",
      pincode: "641002",
    },
  },
  paymentDetails: {
    paymentMode: "CASH_ON_DELIVERY",
  },
};

const mockBooking = {
  _id: bookingId,
  userId,
  connectionId,
  bookingNumber: "CB123456780001",
  consumerNumber: "GA00112345678",
  ...validBookingPayload,
  pricing: {
    unitPrice: 850,
    subsidyAmount: 255,
    deliveryCharges: 30,
    totalAmount: 880,
    finalAmount: 625,
  },
  status: "PENDING",
  trackingInfo: {},
  customerRating: {},
  cancellation: {},
  paymentDetails: {
    paymentMode: "CASH_ON_DELIVERY",
    paymentStatus: "PENDING",
  },
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  save: jest.fn().mockResolvedValue(true),
  populate: jest.fn().mockReturnThis(),
  toJSON: function () {
    return { ...this };
  },
};

// ─── Complaint Test Data ──────────────────────────────────────────
const validComplaintPayload = {
  connectionId,
  consumerNumber: "GA00112345678",
  complaintDetails: {
    category: "DELIVERY_DELAY",
    subCategory: "DELAYED_DELIVERY",
    priority: "MEDIUM",
    description:
      "LPG cylinder booking placed 5 days ago not delivered. Please expedite.",
  },
};

const mockComplaint = {
  _id: complaintId,
  userId,
  connectionId,
  complaintNumber: "COMP12345678",
  consumerNumber: "GA00112345678",
  complaintDetails: {
    ...validComplaintPayload.complaintDetails,
  },
  status: "OPEN",
  timeline: [
    {
      status: "OPEN",
      description: "Complaint registered",
      timestamp: new Date(),
    },
  ],
  escalation: { level: 0 },
  customerSatisfaction: {},
  assignmentDetails: {},
  resolution: {},
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  save: jest.fn().mockResolvedValue(true),
  populate: jest.fn().mockReturnThis(),
  toJSON: function () {
    return { ...this };
  },
};

module.exports = {
  userId,
  adminId,
  connectionId,
  billId,
  bookingId,
  complaintId,
  mockUser,
  mockAdmin,
  mockStaff,
  validConnectionPayload,
  mockConnection,
  validBillPayload,
  mockBill,
  validBookingPayload,
  mockBooking,
  validComplaintPayload,
  mockComplaint,
};
