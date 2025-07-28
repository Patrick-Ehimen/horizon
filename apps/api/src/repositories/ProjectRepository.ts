import { Repository, DataSource } from "typeorm";
import { Project } from "../entities/Project";

export class ProjectRepository {
  private repository: Repository<Project>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Project);
  }

  /**
   * Find a project by ID
   */
  async findById(id: number): Promise<Project | null> {
    return await this.repository.findOne({ where: { id } });
  }

  /**
   * Find all projects
   */
  async findAll(): Promise<Project[]> {
    return await this.repository.find({
      order: { createTime: "DESC" },
    });
  }

  /**
   * Create a new project
   */
  async create(projectData: Partial<Project>): Promise<Project> {
    const project = this.repository.create(projectData);
    return await this.repository.save(project);
  }

  /**
   * Update an existing project
   */
  async update(
    id: number,
    projectData: Partial<Project>
  ): Promise<Project | null> {
    await this.repository.update(id, projectData);
    return await this.findById(id);
  }

  /**
   * Update a project entity
   */
  async save(project: Project): Promise<Project> {
    return await this.repository.save(project);
  }

  /**
   * Delete a project
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Count total projects
   */
  async count(): Promise<number> {
    return await this.repository.count();
  }

  /**
   * Find projects with pagination
   */
  async findWithPagination(
    skip: number,
    take: number
  ): Promise<[Project[], number]> {
    return await this.repository.findAndCount({
      skip,
      take,
      order: { createTime: "DESC" },
    });
  }
}
