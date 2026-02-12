// Jest test setup for gas-service
// Mocks the database connection so tests don't need a real MongoDB instance

jest.mock("../src/config/database", () => ({
  dbConnect: jest.fn().mockResolvedValue(true),
}));

// Set test environment variables
process.env.NODE_ENV = "test";
process.env.PORT = "3099";
process.env.JWT_SECRET = "test-jwt-secret-key";
process.env.AUTH_SERVICE_URL = "http://localhost:3001";
process.env.MONGO_URI = "mongodb://localhost:27017/suvidha_gas_test";
