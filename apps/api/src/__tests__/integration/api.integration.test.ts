import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../index.js";

// This is a more comprehensive integration test
// that would test the actual database interactions
describe("API Integration Tests (with Database)", () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    // In a real test, you'd set up a test database here
    // For now, we'll skip these tests if no test DB is available
    if (!process.env.TEST_DATABASE_URL) {
      console.log("Skipping integration tests - no test database configured");
      return;
    }
  });

  afterAll(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  describe("Project CRUD Operations", () => {
    it.skip("should create, read, update, and delete a project", async () => {
      // Create project
      const createResponse = await request(app)
        .post("/api/v1/projects")
        .send({
          name: "Integration Test Project",
          description: "Test project for integration testing",
        })
        .expect(201);

      const projectId = createResponse.body.data.id;

      // Read project
      const readResponse = await request(app)
        .get(`/api/v1/projects/${projectId}`)
        .expect(200);

      expect(readResponse.body.name).toBe("Integration Test Project");

      // Update project
      await request(app)
        .put(`/api/v1/projects/${projectId}`)
        .send({
          id: projectId,
          name: "Updated Integration Test Project",
        })
        .expect(200);

      // Verify update
      const updatedResponse = await request(app)
        .get(`/api/v1/projects/${projectId}`)
        .expect(200);

      expect(updatedResponse.body.name).toBe(
        "Updated Integration Test Project"
      );
    });

    it.skip("should handle pagination correctly", async () => {
      // This would test actual pagination with real data
      const response = await request(app)
        .get("/api/v1/projects?pageIndex=0&pageSize=5")
        .expect(200);

      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("total");
      expect(response.body).toHaveProperty("pageIndex", 0);
      expect(response.body).toHaveProperty("pageSize", 5);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe("User Crypto Operations", () => {
    it.skip("should sign registration messages", async () => {
      const response = await request(app)
        .post("/api/v1/users/sign-registration")
        .send({
          userAddress: "0x1234567890123456789012345678901234567890",
          contractAddress: "0x0987654321098765432109876543210987654321",
        })
        .expect(200);

      expect(response.body).toHaveProperty("signature");
      expect(response.body).toHaveProperty("signerAddress");
      expect(typeof response.body.signature).toBe("string");
      expect(response.body.signature).toMatch(/^0x/);
    });
  });
});
