import request from "supertest";
import express from "express";
import { createProjectRoutes } from "../../routes/projects.js";
import { ProjectService } from "../../services/ProjectService.js";
import { errorHandler } from "../../middleware/errorHandler.js";

// Mock the ProjectService
const mockProjectService = {
  list: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
} as jest.Mocked<ProjectService>;

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/projects", createProjectRoutes(mockProjectService));
  app.use(errorHandler);
  return app;
};

describe("Project Routes", () => {
  let app: express.Application;

  beforeEach(() => {
    app = createTestApp();
    jest.clearAllMocks();
  });

  describe("GET /projects", () => {
    it("should return paginated projects", async () => {
      const mockResult = {
        data: [{ id: 1, name: "Test Project" }],
        total: 1,
        pageIndex: 0,
        pageSize: 10,
      };

      mockProjectService.list.mockResolvedValue(mockResult);

      const response = await request(app)
        .get("/projects?pageIndex=0&pageSize=10")
        .expect(200);

      expect(response.body).toEqual(mockResult);
      expect(mockProjectService.list).toHaveBeenCalledWith({
        pageIndex: 0,
        pageSize: 10,
      });
    });

    it("should use default pagination values", async () => {
      const mockResult = {
        data: [],
        total: 0,
        pageIndex: 0,
        pageSize: 10,
      };

      mockProjectService.list.mockResolvedValue(mockResult);

      await request(app).get("/projects").expect(200);

      expect(mockProjectService.list).toHaveBeenCalledWith({
        pageIndex: 0,
        pageSize: 10,
      });
    });

    it("should validate pagination parameters", async () => {
      await request(app).get("/projects?pageIndex=-1&pageSize=0").expect(400);
    });
  });

  describe("GET /projects/:id", () => {
    it("should return project by ID", async () => {
      const mockProject = { id: 1, name: "Test Project" };
      mockProjectService.getById.mockResolvedValue(mockProject);

      const response = await request(app).get("/projects/1").expect(200);

      expect(response.body).toEqual(mockProject);
      expect(mockProjectService.getById).toHaveBeenCalledWith(1);
    });

    it("should return 404 for non-existent project", async () => {
      mockProjectService.getById.mockResolvedValue(null);

      const response = await request(app).get("/projects/999").expect(404);

      expect(response.body).toHaveProperty("error", "Project not found");
    });

    it("should validate project ID", async () => {
      await request(app).get("/projects/invalid").expect(400);
    });
  });

  describe("POST /projects", () => {
    it("should create a new project", async () => {
      const projectData = { name: "New Project" };
      const createdProject = { id: 1, ...projectData };

      mockProjectService.create.mockResolvedValue(createdProject);

      const response = await request(app)
        .post("/projects")
        .send(projectData)
        .expect(201);

      expect(response.body).toHaveProperty(
        "message",
        "Project created successfully"
      );
      expect(response.body).toHaveProperty("data", createdProject);
      expect(mockProjectService.create).toHaveBeenCalledWith(projectData);
    });

    it("should handle creation errors", async () => {
      const projectData = { name: "New Project" };
      mockProjectService.create.mockRejectedValue(new Error("Creation failed"));

      await request(app).post("/projects").send(projectData).expect(500);
    });
  });

  describe("PUT /projects/:id", () => {
    it("should update an existing project", async () => {
      const projectData = { id: 1, name: "Updated Project" };
      const updatedProject = { ...projectData };

      mockProjectService.update.mockResolvedValue(updatedProject);

      const response = await request(app)
        .put("/projects/1")
        .send(projectData)
        .expect(200);

      expect(response.body).toHaveProperty(
        "message",
        "Project updated successfully"
      );
      expect(response.body).toHaveProperty("data", updatedProject);
    });

    it("should return 404 for non-existent project", async () => {
      const projectData = { id: 999, name: "Updated Project" };
      mockProjectService.update.mockResolvedValue(null);

      const response = await request(app)
        .put("/projects/999")
        .send(projectData)
        .expect(404);

      expect(response.body).toHaveProperty("error", "Project not found");
    });

    it("should validate project ID in URL", async () => {
      await request(app)
        .put("/projects/invalid")
        .send({ name: "Test" })
        .expect(400);
    });
  });
});
