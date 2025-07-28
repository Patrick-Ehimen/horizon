// Test setup file
import { config } from "dotenv";

// Load test environment variables
config({ path: ".env.test" });

// Set test environment
process.env.NODE_ENV = "test";
process.env.OWNER_PRIVATE_KEY = "test_private_key_for_testing";

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};

// Global test timeout
jest.setTimeout(10000);
