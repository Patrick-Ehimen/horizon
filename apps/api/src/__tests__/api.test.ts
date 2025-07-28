import request from "supertest";
import { DataSource } from "typeorm";
import app from "../index.js";
import { databaseConfig } from "../config/index.js";

// Mock the database connection for tests
jest.mock("typeorm", () => ({
  ...jest.requireActual("typeorm"),
  DataSource: jest.fn().mockImplementation(() => ({
    initialize: jest.fn().mockResolvedValue(undefined),
    isInitialized: true,
    destroy: jest.fn().mockResolvedValue(undefined),
  })),
}));

// Mock the repositories and services
jest.mock("../repositories/ProjectRepository.js");
jest.mock("../services/ProjectService.js");
jest.mock("../services/UserService.js");

describe("API Integration Tests", () => {
  beforeAll(async () => {
    // Wait for server initialization
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  describe("Health Endpoints", () => {
    it("should return health status", async () => {
      const response = await request(app).get("/health").expect(200);

      expect(response.body).toHaveProperty("status", "OK");
      expect(response.body).toHaveProperty("timestamp");
      expect(response.body).toHaveProperty("uptime");
      expect(response.body).toHaveProperty("environment");
    });
  });

  describe("API Status", () => {
    it("should return API status", async () => {
      const response = await request(app).get("/api/v1/status").expect(200);

      expect(response.body).toHaveProperty("message", "Horizon API is running");
      expect(response.body).toHaveProperty("version", "1.0.0");
      expect(response.body).toHaveProperty("timestamp");
    });
  });

  describe("404 Handler", () => {
    it("should return 404 for unknown routes", async () => {
      const response = await request(app).get("/unknown-route").expect(404);

      expect(response.body).toHaveProperty("error", "Not Found");
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("/unknown-route");
    });
  });

  describe("CORS Headers", () => {
    it("should include CORS headers", async () => {
      const response = await request(app).get("/health").expect(200);

      expect(response.headers).toHaveProperty("access-control-allow-origin");
    });

    it("should handle OPTIONS requests", async () => {
      await request(app).options("/api/v1/status").expect(200);
    });
  });

  describe("Security Headers", () => {
    it("should include security headers", async () => {
      const response = await request(app).get("/health").expect(200);

      expect(response.headers).toHaveProperty(
        "x-content-type-options",
        "nosniff"
      );
      expect(response.headers).toHaveProperty("x-frame-options", "DENY");
      expect(response.headers).toHaveProperty(
        "x-xss-protection",
        "1; mode=block"
      );
    });
  });
});
