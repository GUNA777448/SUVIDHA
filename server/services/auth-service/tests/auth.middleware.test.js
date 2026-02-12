const jwt = require("jsonwebtoken");
const {
  verifyToken,
  requireRole,
} = require("../src/middlewares/auth.middleware");

// Mock environment
process.env.JWT_SECRET = "test-jwt-secret";

// Helper to create mock req/res/next
const mockReqResNext = (overrides = {}) => {
  const req = {
    headers: {},
    ...overrides,
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
};

describe("Auth Middleware - verifyToken", () => {
  test("should return 401 if no authorization header", async () => {
    const { req, res, next } = mockReqResNext();

    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining("No token"),
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("should return 401 if token format is invalid", async () => {
    const { req, res, next } = mockReqResNext({
      headers: { authorization: "InvalidFormat token123" },
    });

    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("Invalid token format"),
      }),
    );
  });

  test("should return 401 if token is empty after Bearer", async () => {
    const { req, res, next } = mockReqResNext({
      headers: { authorization: "Bearer " },
    });

    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("should return 401 if token is expired", async () => {
    const expiredToken = jwt.sign(
      { id: "user123", role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "-1s" },
    );

    const { req, res, next } = mockReqResNext({
      headers: { authorization: `Bearer ${expiredToken}` },
    });

    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("expired"),
      }),
    );
  });

  test("should return 401 if token has invalid signature", async () => {
    const badToken = jwt.sign({ id: "user123" }, "wrong-secret");

    const { req, res, next } = mockReqResNext({
      headers: { authorization: `Bearer ${badToken}` },
    });

    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("Invalid token"),
      }),
    );
  });

  test("should call next() and attach user for valid token", async () => {
    const payload = {
      id: "user123",
      mobileNumber: "9876543210",
      aadharNumber: "123456789012",
      consumerId: "CON001",
      role: "user",
    };
    const validToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const { req, res, next } = mockReqResNext({
      headers: { authorization: `Bearer ${validToken}` },
    });

    await verifyToken(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe("user123");
    expect(req.user.role).toBe("user");
    expect(req.user.consumerId).toBe("CON001");
  });
});

describe("Auth Middleware - requireRole", () => {
  test("should return 401 if no user is attached", () => {
    const { req, res, next } = mockReqResNext();
    const middleware = requireRole("admin");

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("should return 403 if user role does not match", () => {
    const { req, res, next } = mockReqResNext();
    req.user = { id: "user123", role: "user" };
    const middleware = requireRole("admin");

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("Access denied"),
      }),
    );
  });

  test("should call next() if user role matches", () => {
    const { req, res, next } = mockReqResNext();
    req.user = { id: "admin1", role: "admin" };
    const middleware = requireRole("admin");

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test("should accept multiple roles", () => {
    const { req, res, next } = mockReqResNext();
    req.user = { id: "op1", role: "operator" };
    const middleware = requireRole("admin", "operator");

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
