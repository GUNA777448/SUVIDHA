const request = require("supertest");

// ── Mock DB ────────────────────────────────────────────────────────
jest.mock("../src/config/database", () => ({
  dbConnect: jest.fn(),
}));

// ── Mock auth middleware ──────────────────────────────────────────
jest.mock("../src/middlewares/auth.middleware", () => ({
  authenticateToken: (req, res, next) => next(),
  optionalAuth: (req, res, next) => next(),
}));

// ── Mock all models (prevent real DB calls) ──────────────────────
jest.mock("../src/models/GasConnection");
jest.mock("../src/models/GasBill");
jest.mock("../src/models/CylinderBooking");
jest.mock("../src/models/Complaint");

const app = require("../src/index");

// ══════════════════════════════════════════════════════════════════
//  ROOT / HEALTH ENDPOINTS
// ══════════════════════════════════════════════════════════════════
describe("Root & Health Endpoints", () => {
  describe("GET /", () => {
    it("should return welcome message (200)", async () => {
      const res = await request(app).get("/").expect(200);

      expect(res.body.message).toMatch(/gas/i);
      expect(res.body.version).toBeDefined();
      expect(res.body.endpoints).toBeDefined();
    });
  });

  describe("GET /health", () => {
    it("should return health status (200)", async () => {
      const res = await request(app).get("/health").expect(200);

      expect(res.body.status).toMatch(/ok|healthy/i);
      expect(res.body.service).toMatch(/gas/i);
      expect(res.body.timestamp).toBeDefined();
    });
  });
});
