import { Request, Response } from "express";
import { ProjectService } from "../services/ProjectService";
import { ExceptionFactory } from "@repo/shared";

export class UpdateController {
  private projectService: ProjectService;

  constructor(projectService: ProjectService) {
    this.projectService = projectService;
  }

  /**
   * Update a project
   */
  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const projectData = req.body;

      // Validate that project ID is provided
      if (!projectData.id) {
        throw ExceptionFactory.invalidParameters(
          "Project ID is required for update"
        );
      }

      // Validate project ID
      if (typeof projectData.id !== "number" || projectData.id < 1) {
        throw ExceptionFactory.invalidParameters("Invalid project ID");
      }

      // Update the project
      const updatedProject = await this.projectService.update(projectData);

      if (!updatedProject) {
        res.status(404).json({ error: "Project not found" });
        return;
      }

      res.status(200).json({
        message: "Project updated successfully",
        data: updatedProject,
      });
    } catch (error) {
      console.error("Error in update endpoint:", error);

      if (error instanceof Error && error.name === "CommonException") {
        const commonException = error as any;
        res.status(commonException.getCode()).json({
          error: commonException.getDescription(),
        });
      } else {
        res.status(500).json({
          error: "Failed to update project",
        });
      }
    }
  };
}
