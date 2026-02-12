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
  validConnectionPayload,
  connectionId,
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

// ── Mock GasConnection model ──────────────────────────────────────
jest.mock("../src/models/GasConnection");
const GasConnection = require("../src/models/GasConnection");

const app = require("../src/index");

// ══════════════════════════════════════════════════════════════════
//  GAS CONNECTION ENDPOINTS
// ══════════════════════════════════════════════════════════════════
describe("Gas Connection Endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentUser = mockUser;
  });

  // ──────────────────────────────────────────────────────────────
  //  POST /api/v1/gas/connections — Create Connection
  // ──────────────────────────────────────────────────────────────
  describe("POST /api/v1/gas/connections", () => {
    it("should create a new gas connection (201)", async () => {
      GasConnection.findOne.mockResolvedValue(null); // no duplicate
      GasConnection.prototype.save = jest.fn().mockResolvedValue({
        ...mockConnection,
        _id: new mongoose.Types.ObjectId(),
      });
      // Make the constructor return an object with save()
      GasConnection.mockImplementation(() => ({
        ...mockConnection,
        save: jest.fn().mockResolvedValue(mockConnection),
      }));

      const res = await request(app)
        .post("/api/v1/gas/connections")
        .send(validConnectionPayload)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/submitted successfully/i);
    });

    it("should reject duplicate Aadhaar number (400)", async () => {
      GasConnection.findOne.mockResolvedValue(mockConnection); // duplicate found

      const res = await request(app)
        .post("/api/v1/gas/connections")
        .send(validConnectionPayload)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/already exists/i);
    });

    it("should reject missing connectionType (400)", async () => {
      const { connectionType, ...payload } = validConnectionPayload;

      const res = await request(app)
        .post("/api/v1/gas/connections")
        .send(payload)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });

    it("should reject invalid connectionType value (400)", async () => {
      const payload = {
        ...validConnectionPayload,
        connectionType: "RESIDENTIAL",
      };

      const res = await request(app)
        .post("/api/v1/gas/connections")
        .send(payload)
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it("should reject missing customerDetails (400)", async () => {
      const { customerDetails, ...payload } = validConnectionPayload;

      const res = await request(app)
        .post("/api/v1/gas/connections")
        .send(payload)
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it("should reject invalid Aadhaar number (400)", async () => {
      const payload = {
        ...validConnectionPayload,
        customerDetails: {
          ...validConnectionPayload.customerDetails,
          aadhaarNumber: "12345", // Only 5 digits
        },
      };

      const res = await request(app)
        .post("/api/v1/gas/connections")
        .send(payload)
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it("should reject invalid phone number format (400)", async () => {
      const payload = {
        ...validConnectionPayload,
        customerDetails: {
          ...validConnectionPayload.customerDetails,
          phoneNumber: "1234567890", // Doesn't start with 6-9
        },
      };

      const res = await request(app)
        .post("/api/v1/gas/connections")
        .send(payload)
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it("should reject invalid pincode (400)", async () => {
      const payload = {
        ...validConnectionPayload,
        customerDetails: {
          ...validConnectionPayload.customerDetails,
          address: {
            ...validConnectionPayload.customerDetails.address,
            pincode: "64100", // 5 digits instead of 6
          },
        },
      };

      const res = await request(app)
        .post("/api/v1/gas/connections")
        .send(payload)
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it("should reject invalid cylinder capacity (400)", async () => {
      const payload = {
        ...validConnectionPayload,
        connectionDetails: {
          ...validConnectionPayload.connectionDetails,
          cylinderCapacity: 10, // Not in enum [5, 14.2, 19, 47.5]
        },
      };

      const res = await request(app)
        .post("/api/v1/gas/connections")
        .send(payload)
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it("should reject missing gasAgency (400)", async () => {
      const { gasAgency, ...payload } = validConnectionPayload;

      const res = await request(app)
        .post("/api/v1/gas/connections")
        .send(payload)
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  // ──────────────────────────────────────────────────────────────
  //  GET /api/v1/gas/connections — List User Connections
  // ──────────────────────────────────────────────────────────────
  describe("GET /api/v1/gas/connections", () => {
    it("should return all connections for the user (200)", async () => {
      const mockQuery = {
        sort: jest.fn().mockResolvedValue([mockConnection]),
      };
      GasConnection.find.mockReturnValue(mockQuery);

      const res = await request(app).get("/api/v1/gas/connections").expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.count).toBe(1);
      expect(GasConnection.find).toHaveBeenCalledWith({
        userId: mockUser.id,
        isActive: true,
      });
    });

    it("should return empty array when user has no connections (200)", async () => {
      const mockQuery = { sort: jest.fn().mockResolvedValue([]) };
      GasConnection.find.mockReturnValue(mockQuery);

      const res = await request(app).get("/api/v1/gas/connections").expect(200);

      expect(res.body.data).toEqual([]);
      expect(res.body.count).toBe(0);
    });
  });

  // ──────────────────────────────────────────────────────────────
  //  GET /api/v1/gas/connections/:id — Get by ID
  // ──────────────────────────────────────────────────────────────
  describe("GET /api/v1/gas/connections/:id", () => {
    it("should return a connection by ID (200)", async () => {
      GasConnection.findOne.mockResolvedValue(mockConnection);

      const res = await request(app)
        .get(`/api/v1/gas/connections/${connectionId}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(connectionId);
    });

    it("should return 404 when connection not found", async () => {
      GasConnection.findOne.mockResolvedValue(null);

      const res = await request(app)
        .get(`/api/v1/gas/connections/${new mongoose.Types.ObjectId()}`)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/not found/i);
    });
  });

  // ──────────────────────────────────────────────────────────────
  //  GET /api/v1/gas/connections/consumer/:consumerNumber
  // ──────────────────────────────────────────────────────────────
  describe("GET /api/v1/gas/connections/consumer/:consumerNumber", () => {
    it("should return a connection by consumer number (200)", async () => {
      GasConnection.findOne.mockResolvedValue(mockConnection);

      const res = await request(app)
        .get(
          `/api/v1/gas/connections/consumer/${mockConnection.consumerNumber}`,
        )
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it("should return 404 for non-existent consumer number", async () => {
      GasConnection.findOne.mockResolvedValue(null);

      const res = await request(app)
        .get("/api/v1/gas/connections/consumer/INVALID000")
        .expect(404);

      expect(res.body.error).toMatch(/not found/i);
    });

    it("should return 403 when accessing another user's connection", async () => {
      const otherUserConnection = {
        ...mockConnection,
        userId: new mongoose.Types.ObjectId(),
      };
      GasConnection.findOne.mockResolvedValue(otherUserConnection);

      const res = await request(app)
        .get("/api/v1/gas/connections/consumer/GA00112345678")
        .expect(403);

      expect(res.body.error).toMatch(/access denied/i);
    });

    it("should allow admin to access any connection (200)", async () => {
      mockCurrentUser = mockAdmin;
      const otherUserConnection = {
        ...mockConnection,
        userId: new mongoose.Types.ObjectId(),
      };
      GasConnection.findOne.mockResolvedValue(otherUserConnection);

      const res = await request(app)
        .get("/api/v1/gas/connections/consumer/GA00112345678")
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────────────────
  //  PATCH /api/v1/gas/connections/:id — Update Connection
  // ──────────────────────────────────────────────────────────────
  describe("PATCH /api/v1/gas/connections/:id", () => {
    it("should update connection details (200)", async () => {
      GasConnection.findOne.mockResolvedValue(mockConnection);
      GasConnection.findByIdAndUpdate.mockResolvedValue({
        ...mockConnection,
        customerDetails: {
          ...mockConnection.customerDetails,
          phoneNumber: "9876543211",
        },
      });

      const res = await request(app)
        .patch(`/api/v1/gas/connections/${connectionId}`)
        .send({
          customerDetails: {
            phoneNumber: "9876543211",
            email: "gurunath.new@example.com",
          },
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/updated successfully/i);
    });

    it("should return 404 when updating non-existent connection", async () => {
      GasConnection.findOne.mockResolvedValue(null);

      const res = await request(app)
        .patch(`/api/v1/gas/connections/${new mongoose.Types.ObjectId()}`)
        .send({ status: "ACTIVE" })
        .expect(404);

      expect(res.body.error).toMatch(/not found/i);
    });

    it("should reject invalid status value (400)", async () => {
      const res = await request(app)
        .patch(`/api/v1/gas/connections/${connectionId}`)
        .send({ status: "INVALID_STATUS" })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it("should reject invalid phone number in update (400)", async () => {
      const res = await request(app)
        .patch(`/api/v1/gas/connections/${connectionId}`)
        .send({
          customerDetails: { phoneNumber: "12345" },
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  // ──────────────────────────────────────────────────────────────
  //  POST /api/v1/gas/connections/:id/transfer — Transfer
  // ──────────────────────────────────────────────────────────────
  describe("POST /api/v1/gas/connections/:id/transfer", () => {
    it("should submit transfer request (200)", async () => {
      const saveMock = jest.fn().mockResolvedValue(true);
      GasConnection.findOne.mockResolvedValue({
        ...mockConnection,
        save: saveMock,
      });

      const res = await request(app)
        .post(`/api/v1/gas/connections/${connectionId}/transfer`)
        .send({
          newOwnerDetails: {
            name: "Priya Shanmugam",
            phoneNumber: "9123456789",
            email: "priya@example.com",
            aadhaarNumber: "987654321098",
          },
          reason: "Transfer to family member",
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/transfer/i);
      expect(saveMock).toHaveBeenCalled();
    });

    it("should reject transfer without Aadhaar number (400)", async () => {
      const res = await request(app)
        .post(`/api/v1/gas/connections/${connectionId}/transfer`)
        .send({
          newOwnerDetails: { name: "Priya" },
        })
        .expect(400);

      expect(res.body.error).toMatch(/aadhaar/i);
    });

    it("should reject transfer without newOwnerDetails (400)", async () => {
      const res = await request(app)
        .post(`/api/v1/gas/connections/${connectionId}/transfer`)
        .send({ reason: "Moving away" })
        .expect(400);

      expect(res.body.error).toMatch(/new owner details/i);
    });

    it("should return 404 for non-existent connection transfer", async () => {
      GasConnection.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post(
          `/api/v1/gas/connections/${new mongoose.Types.ObjectId()}/transfer`,
        )
        .send({
          newOwnerDetails: {
            name: "Priya",
            aadhaarNumber: "987654321098",
          },
        })
        .expect(404);

      expect(res.body.error).toMatch(/not found/i);
    });
  });

  // ──────────────────────────────────────────────────────────────
  //  DELETE /api/v1/gas/connections/:id — Deactivate
  // ──────────────────────────────────────────────────────────────
  describe("DELETE /api/v1/gas/connections/:id", () => {
    it("should deactivate a connection (200)", async () => {
      const saveMock = jest.fn().mockResolvedValue(true);
      GasConnection.findOne.mockResolvedValue({
        ...mockConnection,
        save: saveMock,
      });

      const res = await request(app)
        .delete(`/api/v1/gas/connections/${connectionId}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/deactivated/i);
      expect(saveMock).toHaveBeenCalled();
    });

    it("should return 404 when deactivating non-existent connection", async () => {
      GasConnection.findOne.mockResolvedValue(null);

      const res = await request(app)
        .delete(`/api/v1/gas/connections/${new mongoose.Types.ObjectId()}`)
        .expect(404);

      expect(res.body.error).toMatch(/not found/i);
    });
  });
});
