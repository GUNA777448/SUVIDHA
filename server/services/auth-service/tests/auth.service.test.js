// Mock dependencies before requiring the service
jest.mock("../src/models/User");
jest.mock("../src/models/OTP");
jest.mock("../src/services/profile.service");

const User = require("../src/models/User");
const OTP = require("../src/models/OTP");
const profileService = require("../src/services/profile.service");

// Set env vars before requiring service
process.env.JWT_SECRET = "test-jwt-secret";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
process.env.OTP_EXPIRY_MINUTES = "10";
process.env.NODE_ENV = "test";

const AuthService = require("../src/services/auth.service");

describe("AuthService", () => {
  let authService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe("requestOTP", () => {
    test("should throw error if identifier is missing", async () => {
      await expect(authService.requestOTP(null, "M")).rejects.toThrow(
        "Identifier and login type are required",
      );
    });

    test("should throw error if loginType is missing", async () => {
      await expect(authService.requestOTP("9876543210", null)).rejects.toThrow(
        "Identifier and login type are required",
      );
    });

    test("should throw error for invalid loginType", async () => {
      await expect(authService.requestOTP("9876543210", "X")).rejects.toThrow(
        "Invalid login type",
      );
    });

    test("should throw error for invalid mobile number format", async () => {
      await expect(authService.requestOTP("12345", "M")).rejects.toThrow(
        "Mobile number must be 10 digits",
      );
    });

    test("should throw error for invalid aadhar number format", async () => {
      await expect(authService.requestOTP("12345", "A")).rejects.toThrow(
        "Aadhar number must be 12 digits",
      );
    });

    test("should generate OTP for valid mobile number", async () => {
      OTP.deleteMany.mockResolvedValue({});
      OTP.create.mockResolvedValue({ otp: "123456" });

      // Mock findUserByIdentifier
      authService.findUserByIdentifier = jest.fn().mockResolvedValue(null);

      const result = await authService.requestOTP("9876543210", "M");

      expect(result).toBeDefined();
      expect(result.message).toBeDefined();
      expect(result.expiresIn).toBe(10);
      expect(OTP.deleteMany).toHaveBeenCalledWith({
        identifier: "9876543210",
        loginType: "M",
      });
      expect(OTP.create).toHaveBeenCalled();
    });
  });

  describe("verifyOTP", () => {
    test("should throw error for invalid/expired OTP", async () => {
      OTP.findOne.mockResolvedValue(null);

      await expect(
        authService.verifyOTP("9876543210", "M", "123456"),
      ).rejects.toThrow("Invalid or expired OTP");
    });

    test("should throw error if OTP is locked", async () => {
      OTP.findOne.mockResolvedValue({
        otp: "123456",
        locked: true,
        expiresAt: new Date(Date.now() + 600000),
        attempts: 5,
        maxAttempts: 5,
      });

      await expect(
        authService.verifyOTP("9876543210", "M", "123456"),
      ).rejects.toThrow("OTP locked");
    });

    test("should throw error if OTP is expired", async () => {
      const mockOtp = {
        _id: "otp123",
        otp: "123456",
        locked: false,
        expiresAt: new Date(Date.now() - 1000), // expired
        attempts: 0,
        maxAttempts: 5,
        save: jest.fn(),
      };
      OTP.findOne.mockResolvedValue(mockOtp);
      OTP.deleteOne.mockResolvedValue({});

      await expect(
        authService.verifyOTP("9876543210", "M", "123456"),
      ).rejects.toThrow("OTP has expired");
    });

    test("should throw error for wrong OTP and decrement attempts", async () => {
      const mockOtp = {
        _id: "otp123",
        otp: "654321",
        locked: false,
        expiresAt: new Date(Date.now() + 600000),
        attempts: 0,
        maxAttempts: 5,
        save: jest.fn(),
      };
      OTP.findOne.mockResolvedValue(mockOtp);

      await expect(
        authService.verifyOTP("9876543210", "M", "123456"),
      ).rejects.toThrow("Invalid OTP");

      expect(mockOtp.attempts).toBe(1);
      expect(mockOtp.save).toHaveBeenCalled();
    });
  });
});
