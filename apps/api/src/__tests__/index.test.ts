import request from "supertest";
import app from "../index.js";

describe("API Server", () => {
  describe("GET /health", () => {
    it("should return health status", async () => {
      const response = await request(app).get("/health").expect(200);

      expect(response.body).toHaveProperty("status", "OK");
      expect(response.body).toHaveProperty("timestamp");
      expect(response.body).toHaveProperty("uptime");
      expect(response.body).toHaveProperty("environment");
    });
  });

  describe("GET /api/v1/status", () => {
    it("should return API status", async () => {
      const response = await request(app).get("/api/v1/status").expect(200);

      expect(response.body).toHaveProperty("message", "Horizon API is running");
      expect(response.body).toHaveProperty("version", "1.0.0");
      expect(response.body).toHaveProperty("timestamp");
    });
  });

  describe("404 handler", () => {
    it("should return 404 for unknown routes", async () => {
      const response = await request(app).get("/unknown-route").expect(404);

      expect(response.body).toHaveProperty("error", "Not Found");
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("/unknown-route");
    });
  });
});
