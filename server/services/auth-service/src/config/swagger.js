const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SUVIDHA Auth Service API",
      version: "1.0.0",
      description:
        "Authentication service for the SUVIDHA Government Services Kiosk Platform. Provides OTP-based login, JWT token management, and profile CRUD.",
      contact: {
        name: "SUVIDHA Team",
      },
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
          },
        },
        OTPRequest: {
          type: "object",
          required: ["identifier", "loginType"],
          properties: {
            identifier: {
              type: "string",
              description:
                "Mobile number (10 digits), Aadhar number (12 digits), or Consumer ID",
              example: "9876543210",
            },
            loginType: {
              type: "string",
              enum: ["M", "A", "C"],
              description: "M = Mobile, A = Aadhar, C = Consumer ID",
              example: "M",
            },
          },
        },
        OTPVerify: {
          type: "object",
          required: ["identifier", "loginType", "otp"],
          properties: {
            identifier: { type: "string", example: "9876543210" },
            loginType: { type: "string", enum: ["M", "A", "C"], example: "M" },
            otp: {
              type: "string",
              minLength: 6,
              maxLength: 6,
              example: "123456",
            },
          },
        },
        RefreshTokenRequest: {
          type: "object",
          required: ["refreshToken"],
          properties: {
            refreshToken: { type: "string" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "object",
              properties: {
                user: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    mobileNumber: { type: "string" },
                    aadharNumber: { type: "string" },
                    consumerId: { type: "string" },
                    role: {
                      type: "string",
                      enum: ["user", "admin", "operator"],
                    },
                  },
                },
                accessToken: { type: "string" },
                refreshToken: { type: "string" },
              },
            },
          },
        },
        Profile: {
          type: "object",
          properties: {
            fullName: { type: "string" },
            email: { type: "string", format: "email" },
            dateOfBirth: { type: "string", format: "date" },
            gender: { type: "string", enum: ["Male", "Female", "Other"] },
            alternatePhone: { type: "string" },
            occupation: { type: "string" },
            address: {
              type: "object",
              properties: {
                line1: { type: "string" },
                line2: { type: "string" },
                city: { type: "string" },
                district: { type: "string" },
                state: { type: "string" },
                pincode: { type: "string", pattern: "^[0-9]{6}$" },
                country: { type: "string" },
              },
            },
            emergencyContact: {
              type: "object",
              properties: {
                name: { type: "string" },
                phone: { type: "string" },
                relationship: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
