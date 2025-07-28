import { Request, Response } from "express";
import { UpdateController } from "../../controllers/UpdateController.js";
import { ProjectService } from "../../services/ProjectService.js";
import { ExceptionFactory } from "@repo/shared";

// Mock the ProjectService
const mockProjectService = {
  update: jest.fn(),
} as jest.Mocked<ProjectService>;

// Mock ExceptionFactory
jest.mock("@repo/shared", () => ({
  ExceptionFactory: {
    invalidParameters: jest.fn((message: string) => {
      const error = new Error(message);
      error.name = "CommonException";
      (error as any).getCode = () => 400;
      (error as any).getDescription = () => message;
      return error;
    }),
  },
}));

describe("UpdateController", () => {
  let controller: UpdateController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    controller = new UpdateController(mockProjectService);

    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });

    mockReq = {
      body: {},
    };
    mockRes = {
      status: mockStatus,
      json: mockJson,
    };

    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("update", () => {
    it("should update project successfully", async () => {
      const projectData = { id: 1, name: "Updated Project" };
      const updatedProject = { ...projectData, updatedAt: new Date() };

      mockReq.body = projectData;
      mockProjectService.update.mockResolvedValue(updatedProject);

      await controller.update(mockReq as Request, mockRes as Response);

      expect(mockProjectService.update).toHaveBeenCalledWith(projectData);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: "Project updated successfully",
        data: updatedProject,
      });
    });

    it("should return 404 when project not found", async () => {
      const projectData = { id: 1, name: "Updated Project" };

      mockReq.body = projectData;
      mockProjectService.update.mockResolvedValue(null);

      await controller.update(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        error: "Project not found",
      });
    });

    it("should throw error when project ID is missing", async () => {
      mockReq.body = { name: "Updated Project" }; // No ID

      await expect(
        controller.update(mockReq as Request, mockRes as Response)
      ).rejects.toThrow();

      expect(ExceptionFactory.invalidParameters).toHaveBeenCalledWith(
        "Project ID is required for update"
      );
    });

    it("should throw error when project ID is invalid", async () => {
      mockReq.body = { id: "invalid", name: "Updated Project" };

      await expect(
        controller.update(mockReq as Request, mockRes as Response)
      ).rejects.toThrow();

      expect(ExceptionFactory.invalidParameters).toHaveBeenCalledWith(
        "Invalid project ID"
      );
    });

    it("should throw error when project ID is negative", async () => {
      mockReq.body = { id: -1, name: "Updated Project" };

      await expect(
        controller.update(mockReq as Request, mockRes as Response)
      ).rejects.toThrow();

      expect(ExceptionFactory.invalidParameters).toHaveBeenCalledWith(
        "Invalid project ID"
      );
    });

    it("should handle CommonException errors", async () => {
      const projectData = { id: 1, name: "Updated Project" };
      const error = new Error("Invalid parameters");
      error.name = "CommonException";
      (error as any).getCode = () => 400;
      (error as any).getDescription = () => "Invalid parameters";

      mockReq.body = projectData;
      mockProjectService.update.mockRejectedValue(error);

      await controller.update(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: "Invalid parameters",
      });
    });

    it("should handle generic errors", async () => {
      const projectData = { id: 1, name: "Updated Project" };
      const error = new Error("Database connection failed");

      mockReq.body = projectData;
      mockProjectService.update.mockRejectedValue(error);

      await controller.update(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: "Failed to update project",
      });
    });

    it("should log errors", async () => {
      const projectData = { id: 1, name: "Updated Project" };
      const error = new Error("Test error");
      const consoleSpy = jest.spyOn(console, "error");

      mockReq.body = projectData;
      mockProjectService.update.mockRejectedValue(error);

      await controller.update(mockReq as Request, mockRes as Response);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error in update endpoint:",
        error
      );
    });
  });
});
