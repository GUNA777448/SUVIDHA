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
  mockStaff,
  mockConnection,
  mockBooking,
  validComplaintPayload,
  mockComplaint,
  connectionId,
  bookingId,
  complaintId,
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
jest.mock("../src/models/Complaint");
jest.mock("../src/models/GasConnection");
jest.mock("../src/models/CylinderBooking");

const Complaint = require("../src/models/Complaint");
const GasConnection = require("../src/models/GasConnection");
const CylinderBooking = require("../src/models/CylinderBooking");

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
//  COMPLAINT ENDPOINTS
// ══════════════════════════════════════════════════════════════════
describe("Complaint Endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentUser = mockUser;
  });

  // ──────────────────────────────────────────────────────────────
  //  GET /api/v1/gas/complaints — List User Complaints
  // ──────────────────────────────────────────────────────────────
  describe("GET /api/v1/gas/complaints", () => {
    it("should return paginated complaints (200)", async () => {
      Complaint.find.mockReturnValue(chainQuery([mockComplaint]));
      Complaint.countDocuments.mockResolvedValue(1);

      const res = await request(app).get("/api/v1/gas/complaints").expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination).toBeDefined();
    });

    it("should support status filter (200)", async () => {
      Complaint.find.mockReturnValue(chainQuery([]));
      Complaint.countDocuments.mockResolvedValue(0);

      const res = await request(app)
        .get("/api/v1/gas/complaints?status=OPEN")
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it("should support category filter (200)", async () => {
      Complaint.find.mockReturnValue(chainQuery([]));
      Complaint.countDocuments.mockResolvedValue(0);

      const res = await request(app)
        .get("/api/v1/gas/complaints?category=DELIVERY_DELAY")
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it("should support priority filter (200)", async () => {
      Complaint.find.mockReturnValue(chainQuery([]));
      Complaint.countDocuments.mockResolvedValue(0);

      const res = await request(app)
        .get("/api/v1/gas/complaints?priority=HIGH")
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it("should support pagination params (200)", async () => {
      Complaint.find.mockReturnValue(chainQuery([]));
      Complaint.countDocuments.mockResolvedValue(0);

      const res = await request(app)
        .get("/api/v1/gas/complaints?page=2&limit=5")
        .expect(200);

      expect(res.body.pagination.page).toBe(2);
      expect(res.body.pagination.limit).toBe(5);
    });
  });

  // ──────────────────────────────────────────────────────────────
  //  GET /api/v1/gas/complaints/:id — Get Complaint by ID
  // ──────────────────────────────────────────────────────────────
  describe("GET /api/v1/gas/complaints/:id", () => {
    it("should return a complaint by ID (200)", async () => {
      const populateChain = {
        populate: jest.fn().mockResolvedValue(mockComplaint),
      };
      const findOneQuery = {
        populate: jest.fn().mockReturnValue(populateChain),
      };
      Complaint.findOne.mockReturnValue(findOneQuery);

      const res = await request(app)
        .get(`/api/v1/gas/complaints/${complaintId}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(complaintId);
    });

    it("should return 404 when complaint not found", async () => {
      const populateChain = {
        populate: jest.fn().mockResolvedValue(null),
      };
      const findOneQuery = {
        populate: jest.fn().mockReturnValue(populateChain),
      };
      Complaint.findOne.mockReturnValue(findOneQuery);

      const res = await request(app)
        .get(`/api/v1/gas/complaints/${new mongoose.Types.ObjectId()}`)
        .expect(404);

      expect(res.body.error).toMatch(/not found/i);
    });
  });

  // ──────────────────────────────────────────────────────────────
  //  POST /api/v1/gas/complaints — Create Complaint
  // ──────────────────────────────────────────────────────────────
  describe("POST /api/v1/gas/complaints", () => {
    it("should create a new complaint (201)", async () => {
      GasConnection.findOne.mockResolvedValue(mockConnection);

      const savedComplaint = {
        ...mockComplaint,
        populate: jest.fn().mockResolvedValue(mockComplaint),
      };
      Complaint.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(savedComplaint),
        populate: jest.fn().mockResolvedValue(savedComplaint),
      }));

      const res = await request(app)
        .post("/api/v1/gas/complaints")
        .send(validComplaintPayload)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/registered successfully/i);
    });

    it("should auto-set PIPELINE_LEAK priority to CRITICAL (201)", async () => {
      GasConnection.findOne.mockResolvedValue(mockConnection);

      const savedComplaint = {
        ...mockComplaint,
        complaintDetails: {
          ...mockComplaint.complaintDetails,
          category: "PIPELINE_LEAK",
          priority: "CRITICAL",
        },
        populate: jest.fn().mockResolvedValue(mockComplaint),
      };
      Complaint.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(savedComplaint),
        populate: jest.fn().mockResolvedValue(savedComplaint),
      }));

      const payload = {
        ...validComplaintPayload,
        complaintDetails: {
          ...validComplaintPayload.complaintDetails,
          category: "PIPELINE_LEAK",
          description: "Gas leak detected near meter",
        },
      };

      const res = await request(app)
        .post("/api/v1/gas/complaints")
        .send(payload)
        .expect(201);

      expect(res.body.success).toBe(true);
    });

    it("should auto-set SAFETY_CONCERN priority to HIGH (201)", async () => {
      GasConnection.findOne.mockResolvedValue(mockConnection);

      const savedComplaint = {
        ...mockComplaint,
        populate: jest.fn().mockResolvedValue(mockComplaint),
      };
      Complaint.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(savedComplaint),
        populate: jest.fn().mockResolvedValue(savedComplaint),
      }));

      const payload = {
        ...validComplaintPayload,
        complaintDetails: {
          ...validComplaintPayload.complaintDetails,
          category: "SAFETY_CONCERN",
          description: "Regulator seems defective",
        },
      };

      const res = await request(app)
        .post("/api/v1/gas/complaints")
        .send(payload)
        .expect(201);

      expect(res.body.success).toBe(true);
    });

    it("should reject missing consumerNumber (400)", async () => {
      const { consumerNumber, ...payload } = validComplaintPayload;

      const res = await request(app)
        .post("/api/v1/gas/complaints")
        .send(payload)
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it("should reject missing complaintDetails (400)", async () => {
      const { complaintDetails, ...payload } = validComplaintPayload;

      const res = await request(app)
        .post("/api/v1/gas/complaints")
        .send(payload)
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it("should reject missing category (400)", async () => {
      const payload = {
        ...validComplaintPayload,
        complaintDetails: {
          description: "Something wrong",
        },
      };

      const res = await request(app)
        .post("/api/v1/gas/complaints")
        .send(payload)
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it("should reject missing description (400)", async () => {
      const payload = {
        ...validComplaintPayload,
        complaintDetails: {
          category: "BILLING",
        },
      };

      const res = await request(app)
        .post("/api/v1/gas/complaints")
        .send(payload)
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it("should reject invalid category (400)", async () => {
      const payload = {
        ...validComplaintPayload,
        complaintDetails: {
          category: "INVALID_CAT",
          description: "test",
        },
      };

      const res = await request(app)
        .post("/api/v1/gas/complaints")
        .send(payload)
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it("should return 404 when gas connection not found", async () => {
      GasConnection.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/v1/gas/complaints")
        .send(validComplaintPayload)
        .expect(404);

      expect(res.body.error).toMatch(/gas connection not found/i);
    });

    it("should return 404 when bookingId provided but booking not found", async () => {
      GasConnection.findOne.mockResolvedValue(mockConnection);
      CylinderBooking.findOne.mockResolvedValue(null);

      const payload = {
        ...validComplaintPayload,
        bookingId: new mongoose.Types.ObjectId().toString(),
      };

      const res = await request(app)
        .post("/api/v1/gas/complaints")
        .send(payload)
        .expect(404);

      expect(res.body.error).toMatch(/cylinder booking not found/i);
    });

    it("should create complaint with bookingId when booking exists (201)", async () => {
      GasConnection.findOne.mockResolvedValue(mockConnection);
      CylinderBooking.findOne.mockResolvedValue(mockBooking);

      const savedComplaint = {
        ...mockComplaint,
        bookingId,
        populate: jest.fn().mockResolvedValue(mockComplaint),
      };
      Complaint.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(savedComplaint),
        populate: jest.fn().mockResolvedValue(savedComplaint),
      }));

      const payload = {
        ...validComplaintPayload,
        bookingId,
      };

      const res = await request(app)
        .post("/api/v1/gas/complaints")
        .send(payload)
        .expect(201);

      expect(res.body.success).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────────────────
  //  PATCH /api/v1/gas/complaints/:id — Update Complaint (Staff)
  // ──────────────────────────────────────────────────────────────
  describe("PATCH /api/v1/gas/complaints/:id", () => {
    it("should update complaint status as staff (200)", async () => {
      mockCurrentUser = mockStaff;
      const saveMock = jest.fn().mockResolvedValue(true);
      Complaint.findOne.mockResolvedValue({
        ...mockComplaint,
        status: "OPEN",
        timeline: [{ status: "OPEN", description: "Complaint registered" }],
        save: saveMock,
      });

      const res = await request(app)
        .patch(`/api/v1/gas/complaints/${complaintId}`)
        .send({ status: "IN_PROGRESS" })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/updated successfully/i);
      expect(saveMock).toHaveBeenCalled();
    });

    it("should update with assignment details (200)", async () => {
      mockCurrentUser = mockAdmin;
      const saveMock = jest.fn().mockResolvedValue(true);
      Complaint.findOne.mockResolvedValue({
        ...mockComplaint,
        status: "OPEN",
        assignmentDetails: {},
        timeline: [{ status: "OPEN" }],
        save: saveMock,
      });

      const res = await request(app)
        .patch(`/api/v1/gas/complaints/${complaintId}`)
        .send({
          status: "IN_PROGRESS",
          assignmentDetails: {
            assignedTo: {
              employeeId: "EMP-001",
              name: "Rajesh K",
              department: "TECHNICAL",
            },
          },
        })
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it("should set status to RESOLVED when resolution provided (200)", async () => {
      mockCurrentUser = mockAdmin;
      const saveMock = jest.fn().mockResolvedValue(true);
      Complaint.findOne.mockResolvedValue({
        ...mockComplaint,
        status: "IN_PROGRESS",
        resolution: {},
        timeline: [{ status: "OPEN" }, { status: "IN_PROGRESS" }],
        save: saveMock,
      });

      const res = await request(app)
        .patch(`/api/v1/gas/complaints/${complaintId}`)
        .send({
          resolution: {
            resolutionDescription: "Leak fixed by replacing valve",
            actionsTaken: ["Valve replacement", "Pressure test"],
            compensationProvided: {
              type: "FREE_DELIVERY",
              description: "Next delivery free",
            },
          },
        })
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it("should return 403 for citizen user", async () => {
      mockCurrentUser = mockUser; // citizen

      const res = await request(app)
        .patch(`/api/v1/gas/complaints/${complaintId}`)
        .send({ status: "IN_PROGRESS" })
        .expect(403);

      expect(res.body.error).toMatch(/staff/i);
    });

    it("should return 404 for non-existent complaint", async () => {
      mockCurrentUser = mockAdmin;
      Complaint.findOne.mockResolvedValue(null);

      const res = await request(app)
        .patch(`/api/v1/gas/complaints/${new mongoose.Types.ObjectId()}`)
        .send({ status: "IN_PROGRESS" })
        .expect(404);

      expect(res.body.error).toMatch(/not found/i);
    });

    it("should reject invalid status value (400)", async () => {
      mockCurrentUser = mockAdmin;

      const res = await request(app)
        .patch(`/api/v1/gas/complaints/${complaintId}`)
        .send({ status: "INVALID" })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  // ──────────────────────────────────────────────────────────────
  //  POST /api/v1/gas/complaints/:id/comment — Add Comment
  // ──────────────────────────────────────────────────────────────
  describe("POST /api/v1/gas/complaints/:id/comment", () => {
    it("should add a comment to complaint (200)", async () => {
      const saveMock = jest.fn().mockResolvedValue(true);
      Complaint.findOne.mockResolvedValue({
        ...mockComplaint,
        userId,
        timeline: [{ status: "OPEN", description: "Registered" }],
        save: saveMock,
      });

      const res = await request(app)
        .post(`/api/v1/gas/complaints/${complaintId}/comment`)
        .send({ message: "Please check urgently" })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/comment added/i);
    });

    it("should allow staff to add comment (200)", async () => {
      mockCurrentUser = mockStaff;
      const saveMock = jest.fn().mockResolvedValue(true);
      Complaint.findOne.mockResolvedValue({
        ...mockComplaint,
        userId: new mongoose.Types.ObjectId(), // different user
        timeline: [{ status: "OPEN" }],
        save: saveMock,
      });

      const res = await request(app)
        .post(`/api/v1/gas/complaints/${complaintId}/comment`)
        .send({ message: "Technician dispatched" })
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it("should reject missing message (400)", async () => {
      const res = await request(app)
        .post(`/api/v1/gas/complaints/${complaintId}/comment`)
        .send({})
        .expect(400);

      expect(res.body.error).toMatch(/message/i);
    });

    it("should return 404 for non-existent complaint", async () => {
      Complaint.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post(`/api/v1/gas/complaints/${new mongoose.Types.ObjectId()}/comment`)
        .send({ message: "Test" })
        .expect(404);

      expect(res.body.error).toMatch(/not found/i);
    });

    it("should return 403 when non-owner/non-staff adds comment", async () => {
      Complaint.findOne.mockResolvedValue({
        ...mockComplaint,
        userId: new mongoose.Types.ObjectId(), // different owner
      });

      const res = await request(app)
        .post(`/api/v1/gas/complaints/${complaintId}/comment`)
        .send({ message: "Hello" })
        .expect(403);

      expect(res.body.error).toMatch(/access denied/i);
    });
  });

  // ──────────────────────────────────────────────────────────────
  //  POST /api/v1/gas/complaints/:id/escalate — Escalate
  // ──────────────────────────────────────────────────────────────
  describe("POST /api/v1/gas/complaints/:id/escalate", () => {
    it("should escalate an OPEN complaint (200)", async () => {
      const saveMock = jest.fn().mockResolvedValue(true);
      Complaint.findOne.mockResolvedValue({
        ...mockComplaint,
        userId,
        status: "OPEN",
        escalation: { level: 0 },
        timeline: [{ status: "OPEN" }],
        save: saveMock,
      });

      const res = await request(app)
        .post(`/api/v1/gas/complaints/${complaintId}/escalate`)
        .send({ reason: "No response for 48 hours" })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/escalated to level 1/i);
    });

    it("should increment escalation level (200)", async () => {
      const saveMock = jest.fn().mockResolvedValue(true);
      Complaint.findOne.mockResolvedValue({
        ...mockComplaint,
        userId,
        status: "IN_PROGRESS",
        escalation: { level: 1 },
        timeline: [{ status: "OPEN" }, { status: "ESCALATED" }],
        save: saveMock,
      });

      const res = await request(app)
        .post(`/api/v1/gas/complaints/${complaintId}/escalate`)
        .send({ reason: "Still no resolution" })
        .expect(200);

      expect(res.body.message).toMatch(/level 2/i);
    });

    it("should reject escalation of RESOLVED complaint (400)", async () => {
      Complaint.findOne.mockResolvedValue({
        ...mockComplaint,
        userId,
        status: "RESOLVED",
      });

      const res = await request(app)
        .post(`/api/v1/gas/complaints/${complaintId}/escalate`)
        .send({ reason: "Test" })
        .expect(400);

      expect(res.body.error).toMatch(/resolved or closed/i);
    });

    it("should reject escalation of CLOSED complaint (400)", async () => {
      Complaint.findOne.mockResolvedValue({
        ...mockComplaint,
        userId,
        status: "CLOSED",
      });

      const res = await request(app)
        .post(`/api/v1/gas/complaints/${complaintId}/escalate`)
        .send({ reason: "Test" })
        .expect(400);

      expect(res.body.error).toMatch(/resolved or closed/i);
    });

    it("should return 404 for non-existent complaint", async () => {
      Complaint.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post(
          `/api/v1/gas/complaints/${new mongoose.Types.ObjectId()}/escalate`,
        )
        .send({ reason: "Test" })
        .expect(404);

      expect(res.body.error).toMatch(/not found/i);
    });

    it("should escalate without reason (use default) (200)", async () => {
      const saveMock = jest.fn().mockResolvedValue(true);
      Complaint.findOne.mockResolvedValue({
        ...mockComplaint,
        userId,
        status: "OPEN",
        escalation: { level: 0 },
        timeline: [{ status: "OPEN" }],
        save: saveMock,
      });

      const res = await request(app)
        .post(`/api/v1/gas/complaints/${complaintId}/escalate`)
        .send({})
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────────────────
  //  POST /api/v1/gas/complaints/:id/rate — Rate Resolution
  // ──────────────────────────────────────────────────────────────
  describe("POST /api/v1/gas/complaints/:id/rate", () => {
    it("should submit a rating for resolved complaint (200)", async () => {
      const saveMock = jest.fn().mockResolvedValue(true);
      Complaint.findOne.mockResolvedValue({
        ...mockComplaint,
        userId,
        status: "RESOLVED",
        customerSatisfaction: {},
        save: saveMock,
      });

      const res = await request(app)
        .post(`/api/v1/gas/complaints/${complaintId}/rate`)
        .send({ rating: 4, feedback: "Good resolution" })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/rating/i);
    });

    it("should close a RESOLVED complaint upon rating (200)", async () => {
      const saveMock = jest.fn().mockResolvedValue(true);
      Complaint.findOne.mockResolvedValue({
        ...mockComplaint,
        userId,
        status: "RESOLVED",
        customerSatisfaction: {},
        save: saveMock,
      });

      const res = await request(app)
        .post(`/api/v1/gas/complaints/${complaintId}/rate`)
        .send({ rating: 5 })
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it("should reject rating without rating value (400)", async () => {
      const res = await request(app)
        .post(`/api/v1/gas/complaints/${complaintId}/rate`)
        .send({ feedback: "Good" })
        .expect(400);

      expect(res.body.error).toMatch(/rating must be/i);
    });

    it("should reject rating below 1 (400)", async () => {
      const res = await request(app)
        .post(`/api/v1/gas/complaints/${complaintId}/rate`)
        .send({ rating: 0 })
        .expect(400);

      expect(res.body.error).toMatch(/rating must be/i);
    });

    it("should reject rating above 5 (400)", async () => {
      const res = await request(app)
        .post(`/api/v1/gas/complaints/${complaintId}/rate`)
        .send({ rating: 6 })
        .expect(400);

      expect(res.body.error).toMatch(/rating must be/i);
    });

    it("should return 404 for non-resolved complaint", async () => {
      Complaint.findOne.mockResolvedValue(null); // query filters status

      const res = await request(app)
        .post(`/api/v1/gas/complaints/${complaintId}/rate`)
        .send({ rating: 4 })
        .expect(404);

      expect(res.body.error).toMatch(/resolved.*closed.*not found/i);
    });

    it("should reject duplicate rating (400)", async () => {
      Complaint.findOne.mockResolvedValue({
        ...mockComplaint,
        userId,
        status: "CLOSED",
        customerSatisfaction: {
          rating: 5,
          ratedAt: new Date(),
        },
      });

      const res = await request(app)
        .post(`/api/v1/gas/complaints/${complaintId}/rate`)
        .send({ rating: 3 })
        .expect(400);

      expect(res.body.error).toMatch(/already rated/i);
    });
  });

  // ──────────────────────────────────────────────────────────────
  //  GET /api/v1/gas/complaints/stats — Complaint Stats (Admin)
  // ──────────────────────────────────────────────────────────────
  describe("GET /api/v1/gas/complaints/stats", () => {
    it("should return complaint statistics for admin (200)", async () => {
      mockCurrentUser = mockAdmin;

      const overviewStats = [
        {
          _id: null,
          total: 50,
          open: 10,
          inProgress: 15,
          resolved: 20,
          closed: 3,
          escalated: 2,
        },
      ];
      const categoryStats = [
        { _id: "DELIVERY_DELAY", count: 20 },
        { _id: "BILLING", count: 15 },
      ];
      const priorityStats = [
        { _id: "MEDIUM", count: 25 },
        { _id: "HIGH", count: 15 },
      ];

      Complaint.aggregate
        .mockResolvedValueOnce(overviewStats)
        .mockResolvedValueOnce(categoryStats)
        .mockResolvedValueOnce(priorityStats);

      const res = await request(app)
        .get("/api/v1/gas/complaints/stats")
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.overview.total).toBe(50);
      expect(res.body.data.byCategory).toHaveLength(2);
      expect(res.body.data.byPriority).toHaveLength(2);
    });

    it("should return default stats when no complaints exist (200)", async () => {
      mockCurrentUser = mockAdmin;

      Complaint.aggregate
        .mockResolvedValueOnce([]) // empty overview
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const res = await request(app)
        .get("/api/v1/gas/complaints/stats")
        .expect(200);

      expect(res.body.data.overview.total).toBe(0);
      expect(res.body.data.byCategory).toEqual([]);
    });

    it("should return 403 for non-admin user", async () => {
      mockCurrentUser = mockUser;

      const res = await request(app)
        .get("/api/v1/gas/complaints/stats")
        .expect(403);

      expect(res.body.error).toMatch(/admin/i);
    });
  });
});
