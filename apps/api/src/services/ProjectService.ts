import { ProjectRepository } from "../repositories/ProjectRepository";
import { Project } from "../entities/Project";
import { PaginationUtils, PageParam, Page } from "@repo/shared";

export class ProjectService {
  private projectRepo: ProjectRepository;

  constructor(projectRepo: ProjectRepository) {
    this.projectRepo = projectRepo;
  }

  /**
   * Get project by ID
   */
  async getById(id: number): Promise<Project | null> {
    return await this.projectRepo.findById(id);
  }

  /**
   * List projects with pagination
   */
  async list(pagination: PageParam): Promise<Page<Project>> {
    const [projects, total] = await this.projectRepo.findWithPagination(
      PaginationUtils.calculateOffset(
        pagination.pageIndex,
        pagination.pageSize
      ),
      pagination.pageSize
    );
    return PaginationUtils.createPage(pagination, total, projects);
  }

  /**
   * Update an existing project
   */
  async update(projectData: Partial<Project>): Promise<Project | null> {
    if (!projectData.id) {
      throw new Error("Project ID is required for update");
    }
    return await this.projectRepo.update(projectData.id, projectData);
  }

  /**
   * Create a new project
   */
  async create(projectData: Partial<Project>): Promise<Project> {
    return await this.projectRepo.create(projectData);
  }
}
