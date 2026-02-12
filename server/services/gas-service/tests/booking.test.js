const request = require("supertest");
const mongoose = require("mongoose");

// ── Mock DB ────────────────────────────────────────────────────────
jest.mock("../src/config/database", () => ({
  dbConnect: jest.fn(),
}));

// ── Mock auth middleware ──────────────────────────────────────────
const {
  mockUser,
  mockAdmin,
  mockConnection,
  validBookingPayload,
  mockBooking,
  connectionId,
  bookingId,
  userId,
} = require("./helpers/mockData");

let mockCurrentUser = mockUser;

jest.mock("../src/middlewares/auth.middleware", () => ({
  authenticateToken: (req, res, next) => {
    req.user = mockCurrentUser;
    next();
  },
  optionalAuth: (req, res, next) => {
    req.user = mockCurrentUser;
    next();
  },
}));

// ── Mock models ───────────────────────────────────────────────────
jest.mock("../src/models/CylinderBooking");
jest.mock("../src/models/GasConnection");

const CylinderBooking = require("../src/models/CylinderBooking");
const GasConnection = require("../src/models/GasConnection");

const app = require("../src/index");

// helper — build a chainable query mock
const chainQuery = (resolvedValue) => {
  const chain = {};
  chain.populate = jest.fn().mockReturnValue(chain);
  chain.sort = jest.fn().mockReturnValue(chain);
  chain.limit = jest.fn().mockReturnValue(chain);
  chain.skip = jest.fn().mockResolvedValue(resolvedValue);
  return chain;
};

// ══════════════════════════════════════════════════════════════════
//  CYLINDER BOOKING ENDPOINTS
// ══════════════════════════════════════════════════════════════════
describe("Cylinder Booking Endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentUser = mockUser;
  });

  // ──────────────────────────────────────────────────────────────
  //  GET /api/v1/gas/bookings — List User Bookings
  // ──────────────────────────────────────────────────────────────
  describe("GET /api/v1/gas/bookings", () => {
    it("should return paginated bookings for the user (200)", async () => {
      CylinderBooking.find.mockReturnValue(chainQuery([mockBooking]));
      CylinderBooking.countDocuments.mockResolvedValue(1);

      const res = await request(app).get("/api/v1/gas/bookings").expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.total).toBe(1);
    });

    it("should support status filter (200)", async () => {
      CylinderBooking.find.mockReturnValue(chainQuery([]));
      CylinderBooking.countDocuments.mockResolvedValue(0);

      const res = await request(app)
        .get("/api/v1/gas/bookings?status=DELIVERED")
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });

    it("should support date range filter (200)", async () => {
      CylinderBooking.find.mockReturnValue(chainQuery([mockBooking]));
      CylinderBooking.countDocuments.mockResolvedValue(1);

      const res = await request(app)
        .get("/api/v1/gas/bookings?startDate=2026-01-01&endDate=2026-02-28")
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it("should support pagination (200)", async () => {
      CylinderBooking.find.mockReturnValue(chainQuery([]));
      CylinderBooking.countDocuments.mockResolvedValue(0);

      const res = await request(app)
        .get("/api/v1/gas/bookings?page=3&limit=5")
        .expect(200);

      expect(res.body.pagination.page).toBe(3);
      expect(res.body.pagination.limit).toBe(5);
    });
  });

  // ──────────────────────────────────────────────────────────────
  //  GET /api/v1/gas/bookings/:id — Get Booking by ID
  // ──────────────────────────────────────────────────────────────
  describe("GET /api/v1/gas/bookings/:id", () => {
    it("should return a booking by ID (200)", async () => {
      const bookingQuery = {
        populate: jest.fn().mockResolvedValue(mockBooking),
      };
      CylinderBooking.findOne.mockReturnValue(bookingQuery);

      const res = await request(app)
        .get(`/api/v1/gas/bookings/${bookingId}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(bookingId);
    });

    it("should return 404 when booking not found", async () => {
      const bookingQuery = {
        populate: jest.fn().mockResolvedValue(null),
      };
      CylinderBooking.findOne.mockReturnValue(bookingQuery);

      const res = await request(app)
        .get(`/api/v1/gas/bookings/${new mongoose.Types.ObjectId()}`)
        .expect(404);

      expect(res.body.error).toMatch(/not found/i);
    });
  });

  // ──────────────────────────────────────────────────────────────
  //  POST /api/v1/gas/bookings — Create Booking
  // ──────────────────────────────────────────────────────────────
  describe("POST /api/v1/gas/bookings", () => {
    it("should create a new cylinder booking (201)", async () => {
      GasConnection.findOne.mockResolvedValue(mockConnection);
      CylinderBooking.findOne.mockResolvedValue(null); // no pending
      CylinderBooking.countDocuments.mockResolvedValue(0); // monthly limit ok

      const savedBooking = {
        ...mockBooking,
        populate: jest.fn().mockResolvedValue(mockBooking),
      };
      CylinderBooking.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(savedBooking),
        populate: jest.fn().mockResolvedValue(savedBooking),
      }));

      const res = await request(app)
        .post("/api/v1/gas/bookings")
        .send(validBookingPayload)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/created successfully/i);
    });

    it("should reject missing cylinderDetails (400)", async () => {
      const { cylinderDetails, ...payload } = validBookingPayload;

      const res = await request(app)
        .post("/api/v1/gas/bookings")
        .send(payload)
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it("should reject missing cylinderType (400)", async () => {
      const payload = {
        ...validBookingPayload,
        cylinderDetails: {
          capacity: 14.2,
          quantity: 1,
        },
      };

      const res = await request(app)
        .post("/api/v1/gas/bookings")
        .send(payload)
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it("should reject invalid cylinder capacity (400)", async () => {
      const payload = {
        ...validBookingPayload,
        cylinderDetails: {
          ...validBookingPayload.cylinderDetails,
          capacity: 10, // not in enum
        },
      };

      const res = await request(app)
        .post("/api/v1/gas/bookings")
        .send(payload)
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it("should reject invalid cylinderType (400)", async () => {
      const payload = {
        ...validBookingPayload,
        cylinderDetails: {
          ...validBookingPayload.cylinderDetails,
          cylinderType: "FREE",
        },
      };

      const res = await request(app)
        .post("/api/v1/gas/bookings")
        .send(payload)
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it("should return 404 when connection not found or not owned by user", async () => {
      GasConnection.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/v1/gas/bookings")
        .send(validBookingPayload)
        .expect(404);

      expect(res.body.error).toMatch(/active gas connection not found/i);
    });

    it("should reject booking when a pending booking exists (400)", async () => {
      GasConnection.findOne.mockResolvedValue(mockConnection);
      CylinderBooking.findOne.mockResolvedValue(mockBooking); // pending exists

      const res = await request(app)
        .post("/api/v1/gas/bookings")
        .send(validBookingPayload)
        .expect(400);

      expect(res.body.error).toMatch(/pending cylinder booking/i);
    });

    it("should reject subsidized booking when monthly limit reached (400)", async () => {
      GasConnection.findOne.mockResolvedValue(mockConnection);
      CylinderBooking.findOne.mockResolvedValue(null); // no pending
      CylinderBooking.countDocuments.mockResolvedValue(1); // already booked this month

      const res = await request(app)
        .post("/api/v1/gas/bookings")
        .send(validBookingPayload)
        .expect(400);

      expect(res.body.error).toMatch(/monthly subsidized cylinder limit/i);
    });

    it("should allow NON_SUBSIDIZED booking when monthly limit reached for subsidized (201)", async () => {
      GasConnection.findOne.mockResolvedValue(mockConnection);
      CylinderBooking.findOne.mockResolvedValue(null);
      CylinderBooking.countDocuments.mockResolvedValue(1); // monthly limit for subsidized

      const nonSubPayload = {
        ...validBookingPayload,
        cylinderDetails: {
          ...validBookingPayload.cylinderDetails,
          cylinderType: "NON_SUBSIDIZED",
        },
      };

      const savedBooking = {
        ...mockBooking,
        populate: jest.fn().mockResolvedValue(mockBooking),
      };
      CylinderBooking.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(savedBooking),
        populate: jest.fn().mockResolvedValue(savedBooking),
      }));

      const res = await request(app)
        .post("/api/v1/gas/bookings")
        .send(nonSubPayload)
        .expect(201);

      expect(res.body.success).toBe(true);
    });

    it("should reject invalid delivery time slot (400)", async () => {
      const payload = {
        ...validBookingPayload,
        bookingDetails: {
          ...validBookingPayload.bookingDetails,
          deliveryTimeSlot: "MIDNIGHT",
        },
      };

      const res = await request(app)
        .post("/api/v1/gas/bookings")
        .send(payload)
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it("should reject invalid payment mode (400)", async () => {
      const payload = {
        ...validBookingPayload,
        paymentDetails: { paymentMode: "CRYPTO" },
      };

      const res = await request(app)
        .post("/api/v1/gas/bookings")
        .send(payload)
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  // ──────────────────────────────────────────────────────────────
  //  PATCH /api/v1/gas/bookings/:id/status — Update Status
  // ──────────────────────────────────────────────────────────────
  describe("PATCH /api/v1/gas/bookings/:id/status", () => {
    it("should update booking status to CONFIRMED (200)", async () => {
      const saveMock = jest.fn().mockResolvedValue(true);
      CylinderBooking.findOne.mockResolvedValue({
        ...mockBooking,
        userId,
        trackingInfo: {},
        deliveryDetails: {},
        save: saveMock,
      });

      const res = await request(app)
        .patch(`/api/v1/gas/bookings/${bookingId}/status`)
        .send({ status: "CONFIRMED" })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/CONFIRMED/);
      expect(saveMock).toHaveBeenCalled();
    });

    it("should update to DELIVERED and mark payment as PAID (200)", async () => {
      const saveMock = jest.fn().mockResolvedValue(true);
      CylinderBooking.findOne.mockResolvedValue({
        ...mockBooking,
        userId,
        status: "OUT_FOR_DELIVERY",
        trackingInfo: {
          orderAcceptedAt: new Date(),
          cylinderDispatchedAt: new Date(),
          outForDeliveryAt: new Date(),
        },
        deliveryDetails: {},
        paymentDetails: {
          paymentMode: "CASH_ON_DELIVERY",
          paymentStatus: "PENDING",
        },
        save: saveMock,
      });

      const res = await request(app)
        .patch(`/api/v1/gas/bookings/${bookingId}/status`)
        .send({ status: "DELIVERED" })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/DELIVERED/);
    });

    it("should reject invalid status (400)", async () => {
      const res = await request(app)
        .patch(`/api/v1/gas/bookings/${bookingId}/status`)
        .send({ status: "INVALID" })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it("should return 404 for non-existent booking", async () => {
      CylinderBooking.findOne.mockResolvedValue(null);

      const res = await request(app)
        .patch(`/api/v1/gas/bookings/${new mongoose.Types.ObjectId()}/status`)
        .send({ status: "CONFIRMED" })
        .expect(404);

      expect(res.body.error).toMatch(/not found/i);
    });

    it("should return 403 when non-owner/non-admin updates", async () => {
      CylinderBooking.findOne.mockResolvedValue({
        ...mockBooking,
        userId: new mongoose.Types.ObjectId(),
        trackingInfo: {},
      });

      const res = await request(app)
        .patch(`/api/v1/gas/bookings/${bookingId}/status`)
        .send({ status: "CONFIRMED" })
        .expect(403);

      expect(res.body.error).toMatch(/access denied/i);
    });

    it("should allow admin to update booking status (200)", async () => {
      mockCurrentUser = mockAdmin;
      const saveMock = jest.fn().mockResolvedValue(true);
      CylinderBooking.findOne.mockResolvedValue({
        ...mockBooking,
        userId: new mongoose.Types.ObjectId(),
        trackingInfo: {},
        deliveryDetails: {},
        save: saveMock,
      });

      const res = await request(app)
        .patch(`/api/v1/gas/bookings/${bookingId}/status`)
        .send({ status: "CONFIRMED" })
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it("should handle CANCELLED status with cancellation details (200)", async () => {
      mockCurrentUser = mockAdmin;
      const saveMock = jest.fn().mockResolvedValue(true);
      CylinderBooking.findOne.mockResolvedValue({
        ...mockBooking,
        userId: new mongoose.Types.ObjectId(),
        status: "PENDING",
        trackingInfo: {},
        deliveryDetails: {},
        cancellation: {},
        save: saveMock,
      });

      const res = await request(app)
        .patch(`/api/v1/gas/bookings/${bookingId}/status`)
        .send({
          status: "CANCELLED",
          cancellation: {
            reason: "Customer not available",
            cancelledBy: "AGENCY",
          },
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/CANCELLED/);
    });

    it("should reject missing status field (400)", async () => {
      const res = await request(app)
        .patch(`/api/v1/gas/bookings/${bookingId}/status`)
        .send({})
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  // ──────────────────────────────────────────────────────────────
  //  POST /api/v1/gas/bookings/:id/cancel — Cancel Booking
  // ──────────────────────────────────────────────────────────────
  describe("POST /api/v1/gas/bookings/:id/cancel", () => {
    it("should cancel a PENDING booking (200)", async () => {
      const saveMock = jest.fn().mockResolvedValue(true);
      CylinderBooking.findOne.mockResolvedValue({
        ...mockBooking,
        userId,
        status: "PENDING",
        paymentDetails: { paymentStatus: "PENDING" },
        save: saveMock,
      });

      const res = await request(app)
        .post(`/api/v1/gas/bookings/${bookingId}/cancel`)
        .send({ reason: "No longer needed" })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/cancelled/i);
      expect(saveMock).toHaveBeenCalled();
    });

    it("should process refund when cancelling a paid booking (200)", async () => {
      const saveMock = jest.fn().mockResolvedValue(true);
      CylinderBooking.findOne.mockResolvedValue({
        ...mockBooking,
        userId,
        status: "CONFIRMED",
        paymentDetails: { paymentStatus: "PAID" },
        pricing: { finalAmount: 625 },
        save: saveMock,
      });

      const res = await request(app)
        .post(`/api/v1/gas/bookings/${bookingId}/cancel`)
        .send({ reason: "Changed plans" })
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it("should reject cancellation without reason (400)", async () => {
      const res = await request(app)
        .post(`/api/v1/gas/bookings/${bookingId}/cancel`)
        .send({})
        .expect(400);

      expect(res.body.error).toMatch(/reason/i);
    });

    it("should return 404 for non-cancellable booking (OUT_FOR_DELIVERY)", async () => {
      CylinderBooking.findOne.mockResolvedValue(null); // query filters by status

      const res = await request(app)
        .post(`/api/v1/gas/bookings/${bookingId}/cancel`)
        .send({ reason: "Too late" })
        .expect(404);

      expect(res.body.error).toMatch(/cannot be cancelled/i);
    });

    it("should return 404 for non-existent booking", async () => {
      CylinderBooking.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post(`/api/v1/gas/bookings/${new mongoose.Types.ObjectId()}/cancel`)
        .send({ reason: "Not needed" })
        .expect(404);

      expect(res.body.error).toMatch(/not found/i);
    });
  });

  // ──────────────────────────────────────────────────────────────
  //  GET /api/v1/gas/bookings/track/:bookingNumber — Track
  //  (optionalAuth — public endpoint)
  // ──────────────────────────────────────────────────────────────
  describe("GET /api/v1/gas/bookings/track/:bookingNumber", () => {
    it("should return booking tracking info (200)", async () => {
      const populateQuery = {
        select: jest.fn().mockResolvedValue({
          bookingNumber: "CB123456780001",
          status: "OUT_FOR_DELIVERY",
          trackingInfo: {
            orderAcceptedAt: new Date("2026-02-10"),
            cylinderDispatchedAt: new Date("2026-02-11"),
            outForDeliveryAt: new Date("2026-02-12"),
          },
          deliveryDetails: {
            estimatedDeliveryTime: new Date("2026-02-12T14:00:00"),
          },
        }),
      };
      const findOneQuery = {
        populate: jest.fn().mockReturnValue(populateQuery),
      };
      CylinderBooking.findOne.mockReturnValue(findOneQuery);

      const res = await request(app)
        .get("/api/v1/gas/bookings/track/CB123456780001")
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.bookingNumber).toBe("CB123456780001");
      expect(res.body.data.currentStatus).toBe("OUT_FOR_DELIVERY");
      expect(res.body.data.timeline).toHaveLength(3);
    });

    it("should return tracking for DELIVERED booking with full timeline (200)", async () => {
      const populateQuery = {
        select: jest.fn().mockResolvedValue({
          bookingNumber: "CB123456780001",
          status: "DELIVERED",
          trackingInfo: {
            orderAcceptedAt: new Date("2026-02-10"),
            cylinderDispatchedAt: new Date("2026-02-11"),
            outForDeliveryAt: new Date("2026-02-12"),
            deliveredAt: new Date("2026-02-12T13:30:00"),
          },
          deliveryDetails: {},
        }),
      };
      const findOneQuery = {
        populate: jest.fn().mockReturnValue(populateQuery),
      };
      CylinderBooking.findOne.mockReturnValue(findOneQuery);

      const res = await request(app)
        .get("/api/v1/gas/bookings/track/CB123456780001")
        .expect(200);

      expect(res.body.data.timeline).toHaveLength(4);
    });

    it("should return 404 for invalid booking number", async () => {
      const populateQuery = { select: jest.fn().mockResolvedValue(null) };
      const findOneQuery = {
        populate: jest.fn().mockReturnValue(populateQuery),
      };
      CylinderBooking.findOne.mockReturnValue(findOneQuery);

      const res = await request(app)
        .get("/api/v1/gas/bookings/track/INVALID000")
        .expect(404);

      expect(res.body.error).toMatch(/not found/i);
    });
  });

  // ──────────────────────────────────────────────────────────────
  //  POST /api/v1/gas/bookings/:id/rate — Rate Delivery
  // ──────────────────────────────────────────────────────────────
  describe("POST /api/v1/gas/bookings/:id/rate", () => {
    it("should submit delivery rating (200)", async () => {
      const saveMock = jest.fn().mockResolvedValue(true);
      CylinderBooking.findOne.mockResolvedValue({
        ...mockBooking,
        userId,
        status: "DELIVERED",
        customerRating: {},
        save: saveMock,
      });

      const res = await request(app)
        .post(`/api/v1/gas/bookings/${bookingId}/rate`)
        .send({
          deliveryRating: 5,
          serviceRating: 4,
          feedback: "Great service, very polite delivery person",
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/rating/i);
    });

    it("should reject rating without any rating value (400)", async () => {
      const res = await request(app)
        .post(`/api/v1/gas/bookings/${bookingId}/rate`)
        .send({ feedback: "Good" })
        .expect(400);

      expect(res.body.error).toMatch(/at least one rating/i);
    });

    it("should return 404 for non-DELIVERED booking", async () => {
      CylinderBooking.findOne.mockResolvedValue(null); // query filters status=DELIVERED

      const res = await request(app)
        .post(`/api/v1/gas/bookings/${bookingId}/rate`)
        .send({ deliveryRating: 5 })
        .expect(404);

      expect(res.body.error).toMatch(/not found/i);
    });

    it("should reject duplicate rating (400)", async () => {
      CylinderBooking.findOne.mockResolvedValue({
        ...mockBooking,
        userId,
        status: "DELIVERED",
        customerRating: {
          deliveryRating: 5,
          serviceRating: 4,
          ratedAt: new Date(),
        },
      });

      const res = await request(app)
        .post(`/api/v1/gas/bookings/${bookingId}/rate`)
        .send({ deliveryRating: 3 })
        .expect(400);

      expect(res.body.error).toMatch(/already rated/i);
    });

    it("should accept rating with only deliveryRating (200)", async () => {
      const saveMock = jest.fn().mockResolvedValue(true);
      CylinderBooking.findOne.mockResolvedValue({
        ...mockBooking,
        userId,
        status: "DELIVERED",
        customerRating: {},
        save: saveMock,
      });

      const res = await request(app)
        .post(`/api/v1/gas/bookings/${bookingId}/rate`)
        .send({ deliveryRating: 4 })
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it("should accept rating with only serviceRating (200)", async () => {
      const saveMock = jest.fn().mockResolvedValue(true);
      CylinderBooking.findOne.mockResolvedValue({
        ...mockBooking,
        userId,
        status: "DELIVERED",
        customerRating: {},
        save: saveMock,
      });

      const res = await request(app)
        .post(`/api/v1/gas/bookings/${bookingId}/rate`)
        .send({ serviceRating: 3 })
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });
});
