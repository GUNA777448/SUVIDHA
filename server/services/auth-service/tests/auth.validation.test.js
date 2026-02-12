const Joi = require("joi");

// Re-implement the validation logic for testing
// (mirrors auth.validation.js schemas)
const requestOTPSchema = Joi.object({
  identifier: Joi.string().required().trim(),
  loginType: Joi.string().valid("M", "A", "C").required(),
});

const verifyOTPSchema = Joi.object({
  identifier: Joi.string().required().trim(),
  loginType: Joi.string().valid("M", "A", "C").required(),
  otp: Joi.string()
    .required()
    .length(6)
    .pattern(/^[0-9]+$/),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

describe("Auth Validation Schemas", () => {
  describe("requestOTPSchema", () => {
    test("should accept valid mobile login request", () => {
      const { error } = requestOTPSchema.validate({
        identifier: "9876543210",
        loginType: "M",
      });
      expect(error).toBeUndefined();
    });

    test("should accept valid aadhar login request", () => {
      const { error } = requestOTPSchema.validate({
        identifier: "123456789012",
        loginType: "A",
      });
      expect(error).toBeUndefined();
    });

    test("should accept valid consumer ID login request", () => {
      const { error } = requestOTPSchema.validate({
        identifier: "CON001",
        loginType: "C",
      });
      expect(error).toBeUndefined();
    });

    test("should reject missing identifier", () => {
      const { error } = requestOTPSchema.validate({
        loginType: "M",
      });
      expect(error).toBeDefined();
    });

    test("should reject missing loginType", () => {
      const { error } = requestOTPSchema.validate({
        identifier: "9876543210",
      });
      expect(error).toBeDefined();
    });

    test("should reject invalid loginType", () => {
      const { error } = requestOTPSchema.validate({
        identifier: "9876543210",
        loginType: "X",
      });
      expect(error).toBeDefined();
    });

    test("should reject empty identifier", () => {
      const { error } = requestOTPSchema.validate({
        identifier: "",
        loginType: "M",
      });
      expect(error).toBeDefined();
    });
  });

  describe("verifyOTPSchema", () => {
    test("should accept valid OTP verification", () => {
      const { error } = verifyOTPSchema.validate({
        identifier: "9876543210",
        loginType: "M",
        otp: "123456",
      });
      expect(error).toBeUndefined();
    });

    test("should reject OTP shorter than 6 digits", () => {
      const { error } = verifyOTPSchema.validate({
        identifier: "9876543210",
        loginType: "M",
        otp: "12345",
      });
      expect(error).toBeDefined();
    });

    test("should reject OTP longer than 6 digits", () => {
      const { error } = verifyOTPSchema.validate({
        identifier: "9876543210",
        loginType: "M",
        otp: "1234567",
      });
      expect(error).toBeDefined();
    });

    test("should reject non-numeric OTP", () => {
      const { error } = verifyOTPSchema.validate({
        identifier: "9876543210",
        loginType: "M",
        otp: "abcdef",
      });
      expect(error).toBeDefined();
    });

    test("should reject missing OTP", () => {
      const { error } = verifyOTPSchema.validate({
        identifier: "9876543210",
        loginType: "M",
      });
      expect(error).toBeDefined();
    });
  });

  describe("refreshTokenSchema", () => {
    test("should accept valid refresh token", () => {
      const { error } = refreshTokenSchema.validate({
        refreshToken: "some-long-refresh-token-string",
      });
      expect(error).toBeUndefined();
    });

    test("should reject missing refresh token", () => {
      const { error } = refreshTokenSchema.validate({});
      expect(error).toBeDefined();
    });

    test("should reject empty refresh token", () => {
      const { error } = refreshTokenSchema.validate({
        refreshToken: "",
      });
      expect(error).toBeDefined();
    });
  });
});
