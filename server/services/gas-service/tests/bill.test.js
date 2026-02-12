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
  validBillPayload,
  mockBill,
  connectionId,
  billId,
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
jest.mock("../src/models/GasBill");
jest.mock("../src/models/GasConnection");

const GasBill = require("../src/models/GasBill");
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
//  GAS BILL ENDPOINTS
// ══════════════════════════════════════════════════════════════════
describe("Gas Bill Endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentUser = mockUser;
  });

  // ──────────────────────────────────────────────────────────────
  //  GET /api/v1/gas/bills — List User Bills
  // ──────────────────────────────────────────────────────────────
  describe("GET /api/v1/gas/bills", () => {
    it("should return paginated bills for the user (200)", async () => {
      GasBill.find.mockReturnValue(chainQuery([mockBill]));
      GasBill.countDocuments.mockResolvedValue(1);

      const res = await request(app).get("/api/v1/gas/bills").expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.total).toBe(1);
    });

    it("should support status filter (200)", async () => {
      GasBill.find.mockReturnValue(chainQuery([mockBill]));
      GasBill.countDocuments.mockResolvedValue(1);

      const res = await request(app)
        .get("/api/v1/gas/bills?status=PENDING")
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it("should support date range filter (200)", async () => {
      GasBill.find.mockReturnValue(chainQuery([mockBill]));
      GasBill.countDocuments.mockResolvedValue(1);

      const res = await request(app)
        .get("/api/v1/gas/bills?startDate=2026-01-01&endDate=2026-01-31")
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it("should support pagination params (200)", async () => {
      GasBill.find.mockReturnValue(chainQuery([]));
      GasBill.countDocuments.mockResolvedValue(0);

      const res = await request(app)
        .get("/api/v1/gas/bills?page=2&limit=5")
        .expect(200);

      expect(res.body.pagination.page).toBe(2);
      expect(res.body.pagination.limit).toBe(5);
    });
  });

  // ──────────────────────────────────────────────────────────────
  //  GET /api/v1/gas/bills/:id — Get Bill by ID
  // ──────────────────────────────────────────────────────────────
  describe("GET /api/v1/gas/bills/:id", () => {
    it("should return a bill by ID (200)", async () => {
      const billQuery = {
        populate: jest.fn().mockResolvedValue(mockBill),
      };
      GasBill.findOne.mockReturnValue(billQuery);

      const res = await request(app)
        .get(`/api/v1/gas/bills/${billId}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(billId);
    });

    it("should return 404 when bill not found", async () => {
      const billQuery = { populate: jest.fn().mockResolvedValue(null) };
      GasBill.findOne.mockReturnValue(billQuery);

      const res = await request(app)
        .get(`/api/v1/gas/bills/${new mongoose.Types.ObjectId()}`)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/not found/i);
    });
  });

  // ──────────────────────────────────────────────────────────────
  //  GET /api/v1/gas/bills/consumer/:consumerNumber
  // ──────────────────────────────────────────────────────────────
  describe("GET /api/v1/gas/bills/consumer/:consumerNumber", () => {
    it("should return bills for a consumer number (200)", async () => {
      GasBill.find.mockReturnValue(chainQuery([mockBill]));
      GasBill.countDocuments.mockResolvedValue(1);

      const res = await request(app)
        .get("/api/v1/gas/bills/consumer/GA00112345678")
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it("should return 404 for consumer with no bills", async () => {
      GasBill.find.mockReturnValue(chainQuery([]));

      const res = await request(app)
        .get("/api/v1/gas/bills/consumer/INVALID000")
        .expect(404);

      expect(res.body.error).toMatch(/no bills found/i);
    });

    it("should return 403 when non-admin accesses other user's bills", async () => {
      const otherUserBill = {
        ...mockBill,
        userId: new mongoose.Types.ObjectId(),
      };
      GasBill.find.mockReturnValue(chainQuery([otherUserBill]));

      const res = await request(app)
        .get("/api/v1/gas/bills/consumer/GA00112345678")
        .expect(403);

      expect(res.body.error).toMatch(/access denied/i);
    });

    it("should allow admin to access any user's bills (200)", async () => {
      mockCurrentUser = mockAdmin;
      const otherUserBill = {
        ...mockBill,
        userId: new mongoose.Types.ObjectId(),
      };
      GasBill.find.mockReturnValue(chainQuery([otherUserBill]));
      GasBill.countDocuments.mockResolvedValue(1);

      const res = await request(app)
        .get("/api/v1/gas/bills/consumer/GA00112345678")
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────────────────
  //  POST /api/v1/gas/bills/generate — Generate Bill (Admin)
  // ──────────────────────────────────────────────────────────────
  describe("POST /api/v1/gas/bills/generate", () => {
    it("should generate a new bill as admin (201)", async () => {
      mockCurrentUser = mockAdmin;
      GasConnection.findById.mockResolvedValue(mockConnection);
      GasBill.findOne.mockResolvedValue(null); // no duplicate

      const savedBill = {
        ...mockBill,
        populate: jest.fn().mockResolvedValue(mockBill),
      };
      GasBill.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(savedBill),
        populate: jest.fn().mockResolvedValue(savedBill),
      }));

      const res = await request(app)
        .post("/api/v1/gas/bills/generate")
        .send(validBillPayload)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/generated successfully/i);
    });

    it("should return 403 for non-admin user", async () => {
      mockCurrentUser = mockUser; // citizen role

      const res = await request(app)
        .post("/api/v1/gas/bills/generate")
        .send(validBillPayload)
        .expect(403);

      expect(res.body.error).toMatch(/admin/i);
    });

    it("should reject missing connectionId (400)", async () => {
      mockCurrentUser = mockAdmin;
      const { connectionId: _cid, ...payload } = validBillPayload;

      const res = await request(app)
        .post("/api/v1/gas/bills/generate")
        .send(payload)
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it("should reject missing billType (400)", async () => {
      mockCurrentUser = mockAdmin;
      const { billType, ...payload } = validBillPayload;

      const res = await request(app)
        .post("/api/v1/gas/bills/generate")
        .send(payload)
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it("should reject invalid billType (400)", async () => {
      mockCurrentUser = mockAdmin;

      const res = await request(app)
        .post("/api/v1/gas/bills/generate")
        .send({ ...validBillPayload, billType: "WATER_BILL" })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it("should return 404 when connection doesn't exist", async () => {
      mockCurrentUser = mockAdmin;
      GasConnection.findById.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/v1/gas/bills/generate")
        .send(validBillPayload)
        .expect(404);

      expect(res.body.error).toMatch(/connection not found/i);
    });

    it("should reject duplicate bill for same period (400)", async () => {
      mockCurrentUser = mockAdmin;
      GasConnection.findById.mockResolvedValue(mockConnection);
      GasBill.findOne.mockResolvedValue(mockBill); // duplicate found

      const res = await request(app)
        .post("/api/v1/gas/bills/generate")
        .send(validBillPayload)
        .expect(400);

      expect(res.body.error).toMatch(/already exists/i);
    });

    it("should reject missing billingPeriod (400)", async () => {
      mockCurrentUser = mockAdmin;
      const { billingPeriod, ...payload } = validBillPayload;

      const res = await request(app)
        .post("/api/v1/gas/bills/generate")
        .send(payload)
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it("should reject missing dueDate (400)", async () => {
      mockCurrentUser = mockAdmin;
      const { dueDate, ...payload } = validBillPayload;

      const res = await request(app)
        .post("/api/v1/gas/bills/generate")
        .send(payload)
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  // ──────────────────────────────────────────────────────────────
  //  PATCH /api/v1/gas/bills/:id/status — Update Bill Status
  // ──────────────────────────────────────────────────────────────
  describe("PATCH /api/v1/gas/bills/:id/status", () => {
    it("should update bill status to PAID (200)", async () => {
      const saveMock = jest.fn().mockResolvedValue(true);
      GasBill.findOne.mockResolvedValue({
        ...mockBill,
        userId: userId,
        save: saveMock,
      });

      const res = await request(app)
        .patch(`/api/v1/gas/bills/${billId}/status`)
        .send({
          status: "PAID",
          paymentDetails: {
            paymentId: "PAY-12345",
            paymentMethod: "UPI",
            paidAmount: 717.5,
            transactionId: "TXN-UPI-67890",
          },
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/PAID/);
      expect(saveMock).toHaveBeenCalled();
    });

    it("should reject invalid status (400)", async () => {
      const res = await request(app)
        .patch(`/api/v1/gas/bills/${billId}/status`)
        .send({ status: "INVALID" })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it("should reject missing status (400)", async () => {
      const res = await request(app)
        .patch(`/api/v1/gas/bills/${billId}/status`)
        .send({ paymentDetails: { paymentId: "P1" } })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it("should return 404 for non-existent bill", async () => {
      GasBill.findOne.mockResolvedValue(null);

      const res = await request(app)
        .patch(`/api/v1/gas/bills/${new mongoose.Types.ObjectId()}/status`)
        .send({ status: "PAID" })
        .expect(404);

      expect(res.body.error).toMatch(/not found/i);
    });

    it("should return 403 when non-owner/non-admin updates bill", async () => {
      GasBill.findOne.mockResolvedValue({
        ...mockBill,
        userId: new mongoose.Types.ObjectId(),
      });

      const res = await request(app)
        .patch(`/api/v1/gas/bills/${billId}/status`)
        .send({ status: "PAID" })
        .expect(403);

      expect(res.body.error).toMatch(/access denied/i);
    });

    it("should allow admin to update any bill status (200)", async () => {
      mockCurrentUser = mockAdmin;
      const saveMock = jest.fn().mockResolvedValue(true);
      GasBill.findOne.mockResolvedValue({
        ...mockBill,
        userId: new mongoose.Types.ObjectId(),
        save: saveMock,
      });

      const res = await request(app)
        .patch(`/api/v1/gas/bills/${billId}/status`)
        .send({ status: "CANCELLED" })
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it("should reject invalid paymentMethod (400)", async () => {
      const res = await request(app)
        .patch(`/api/v1/gas/bills/${billId}/status`)
        .send({
          status: "PAID",
          paymentDetails: { paymentMethod: "BITCOIN" },
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  // ──────────────────────────────────────────────────────────────
  //  GET /api/v1/gas/bills/connection/:connectionId/pending
  // ──────────────────────────────────────────────────────────────
  describe("GET /api/v1/gas/bills/connection/:connectionId/pending", () => {
    it("should return pending bills with total amount (200)", async () => {
      GasConnection.findOne.mockResolvedValue(mockConnection);

      const pendingBills = [
        {
          ...mockBill,
          status: "PENDING",
          charges: { amountAfterSubsidy: 717.5 },
        },
        {
          ...mockBill,
          _id: new mongoose.Types.ObjectId(),
          status: "OVERDUE",
          charges: { amountAfterSubsidy: 850 },
        },
      ];
      const sortQuery = { sort: jest.fn().mockResolvedValue(pendingBills) };
      GasBill.find.mockReturnValue(sortQuery);

      const res = await request(app)
        .get(`/api/v1/gas/bills/connection/${connectionId}/pending`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.count).toBe(2);
      expect(res.body.data.totalPendingAmount).toBe(1567.5);
      expect(res.body.data.bills).toHaveLength(2);
    });

    it("should return 404 for non-existent connection", async () => {
      GasConnection.findOne.mockResolvedValue(null);

      const res = await request(app)
        .get(
          `/api/v1/gas/bills/connection/${new mongoose.Types.ObjectId()}/pending`,
        )
        .expect(404);

      expect(res.body.error).toMatch(/connection not found/i);
    });

    it("should return zero total when no pending bills (200)", async () => {
      GasConnection.findOne.mockResolvedValue(mockConnection);
      const sortQuery = { sort: jest.fn().mockResolvedValue([]) };
      GasBill.find.mockReturnValue(sortQuery);

      const res = await request(app)
        .get(`/api/v1/gas/bills/connection/${connectionId}/pending`)
        .expect(200);

      expect(res.body.data.count).toBe(0);
      expect(res.body.data.totalPendingAmount).toBe(0);
    });
  });

  // ──────────────────────────────────────────────────────────────
  //  GET /api/v1/gas/bills/consumer/:consumerNumber/payment-history
  // ──────────────────────────────────────────────────────────────
  describe("GET /api/v1/gas/bills/consumer/:consumerNumber/payment-history", () => {
    it("should return payment history (200)", async () => {
      const paidBill = { ...mockBill, status: "PAID", userId };
      GasBill.find.mockReturnValue(chainQuery([paidBill]));
      GasBill.countDocuments.mockResolvedValue(1);

      const res = await request(app)
        .get("/api/v1/gas/bills/consumer/GA00112345678/payment-history")
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination).toBeDefined();
    });

    it("should return 404 when no payment history exists", async () => {
      GasBill.find.mockReturnValue(chainQuery([]));

      const res = await request(app)
        .get("/api/v1/gas/bills/consumer/GA00112345678/payment-history")
        .expect(404);

      expect(res.body.error).toMatch(/no payment history/i);
    });

    it("should return 403 when non-admin accesses other user's history", async () => {
      const otherUserBill = {
        ...mockBill,
        status: "PAID",
        userId: new mongoose.Types.ObjectId(),
      };
      GasBill.find.mockReturnValue(chainQuery([otherUserBill]));

      const res = await request(app)
        .get("/api/v1/gas/bills/consumer/OTHER000/payment-history")
        .expect(403);

      expect(res.body.error).toMatch(/access denied/i);
    });

    it("should allow admin to access any payment history (200)", async () => {
      mockCurrentUser = mockAdmin;
      const otherUserBill = {
        ...mockBill,
        status: "PAID",
        userId: new mongoose.Types.ObjectId(),
      };
      GasBill.find.mockReturnValue(chainQuery([otherUserBill]));
      GasBill.countDocuments.mockResolvedValue(1);

      const res = await request(app)
        .get("/api/v1/gas/bills/consumer/GA00112345678/payment-history")
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });
});
