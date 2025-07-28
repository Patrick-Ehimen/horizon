import { ProjectService } from "../../services/ProjectService.js";
import { ProjectRepository } from "../../repositories/ProjectRepository.js";
import { Project } from "../../entities/Project.js";
import { PaginationUtils } from "@c2n-launchpad/shared";

// Mock the ProjectRepository
const mockProjectRepository = {
  findById: jest.fn(),
  findWithPagination: jest.fn(),
  update: jest.fn(),
  create: jest.fn(),
} as jest.Mocked<ProjectRepository>;

// Mock PaginationUtils
jest.mock("@c2n-launchpad/shared", () => ({
  PaginationUtils: {
    calculateOffset: jest.fn(),
    createPage: jest.fn(),
  },
}));

describe("ProjectService", () => {
  let projectService: ProjectService;

  beforeEach(() => {
    projectService = new ProjectService(mockProjectRepository);
    jest.clearAllMocks();
  });

  describe("getById", () => {
    it("should return project by ID", async () => {
      const mockProject = { id: 1, name: "Test Project" } as Project;
      mockProjectRepository.findById.mockResolvedValue(mockProject);

      const result = await projectService.getById(1);

      expect(result).toBe(mockProject);
      expect(mockProjectRepository.findById).toHaveBeenCalledWith(1);
    });

    it("should return null when project not found", async () => {
      mockProjectRepository.findById.mockResolvedValue(null);

      const result = await projectService.getById(999);

      expect(result).toBeNull();
      expect(mockProjectRepository.findById).toHaveBeenCalledWith(999);
    });
  });

  describe("list", () => {
    it("should return paginated projects", async () => {
      const mockProjects = [
        { id: 1, name: "Project 1" },
        { id: 2, name: "Project 2" },
      ] as Project[];
      const mockTotal = 2;
      const pagination = { pageIndex: 0, pageSize: 10 };
      const mockPage = {
        data: mockProjects,
        total: mockTotal,
        pageIndex: 0,
        pageSize: 10,
      };

      mockProjectRepository.findWithPagination.mockResolvedValue([
        mockProjects,
        mockTotal,
      ]);
      (PaginationUtils.calculateOffset as jest.Mock).mockReturnValue(0);
      (PaginationUtils.createPage as jest.Mock).mockReturnValue(mockPage);

      const result = await projectService.list(pagination);

      expect(result).toBe(mockPage);
      expect(PaginationUtils.calculateOffset).toHaveBeenCalledWith(0, 10);
      expect(mockProjectRepository.findWithPagination).toHaveBeenCalledWith(
        0,
        10
      );
      expect(PaginationUtils.createPage).toHaveBeenCalledWith(
        pagination,
        mockTotal,
        mockProjects
      );
    });

    it("should handle empty results", async () => {
      const pagination = { pageIndex: 0, pageSize: 10 };
      const mockPage = {
        data: [],
        total: 0,
        pageIndex: 0,
        pageSize: 10,
      };

      mockProjectRepository.findWithPagination.mockResolvedValue([[], 0]);
      (PaginationUtils.calculateOffset as jest.Mock).mockReturnValue(0);
      (PaginationUtils.createPage as jest.Mock).mockReturnValue(mockPage);

      const result = await projectService.list(pagination);

      expect(result).toBe(mockPage);
    });
  });

  describe("update", () => {
    it("should update project successfully", async () => {
      const projectData = { id: 1, name: "Updated Project" };
      const updatedProject = { ...projectData } as Project;

      mockProjectRepository.update.mockResolvedValue(updatedProject);

      const result = await projectService.update(projectData);

      expect(result).toBe(updatedProject);
      expect(mockProjectRepository.update).toHaveBeenCalledWith(1, projectData);
    });

    it("should throw error when ID is missing", async () => {
      const projectData = { name: "Updated Project" };

      await expect(projectService.update(projectData)).rejects.toThrow(
        "Project ID is required for update"
      );

      expect(mockProjectRepository.update).not.toHaveBeenCalled();
    });

    it("should return null when project not found", async () => {
      const projectData = { id: 999, name: "Updated Project" };

      mockProjectRepository.update.mockResolvedValue(null);

      const result = await projectService.update(projectData);

      expect(result).toBeNull();
      expect(mockProjectRepository.update).toHaveBeenCalledWith(
        999,
        projectData
      );
    });
  });

  describe("create", () => {
    it("should create project successfully", async () => {
      const projectData = { name: "New Project" };
      const createdProject = { id: 1, ...projectData } as Project;

      mockProjectRepository.create.mockResolvedValue(createdProject);

      const result = await projectService.create(projectData);

      expect(result).toBe(createdProject);
      expect(mockProjectRepository.create).toHaveBeenCalledWith(projectData);
    });

    it("should handle creation with partial data", async () => {
      const projectData = {
        name: "New Project",
        description: "Test description",
      };
      const createdProject = { id: 1, ...projectData } as Project;

      mockProjectRepository.create.mockResolvedValue(createdProject);

      const result = await projectService.create(projectData);

      expect(result).toBe(createdProject);
      expect(mockProjectRepository.create).toHaveBeenCalledWith(projectData);
    });
  });
});
