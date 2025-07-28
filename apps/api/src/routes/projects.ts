import { Router } from "express";
import { ProjectService } from "../services/ProjectService.js";
import { UpdateController } from "../controllers/UpdateController.js";
import {
  validateProjectId,
  validatePagination,
} from "../middleware/validation.js";

export const createProjectRoutes = (projectService: ProjectService): Router => {
  const router = Router();
  const updateController = new UpdateController(projectService);

  // Get all projects with pagination
  router.get("/", validatePagination, async (req, res, next) => {
    try {
      const pageIndex = parseInt(req.query.pageIndex as string, 10);
      const pageSize = parseInt(req.query.pageSize as string, 10);

      const result = await projectService.list({ pageIndex, pageSize });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  // Get project by ID
  router.get("/:id", validateProjectId, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const project = await projectService.getById(id);

      if (!project) {
        res.status(404).json({ error: "Project not found" });
        return;
      }

      res.status(200).json(project);
    } catch (error) {
      next(error);
    }
  });

  // Create new project
  router.post("/", async (req, res, next) => {
    try {
      const project = await projectService.create(req.body);
      res.status(201).json({
        message: "Project created successfully",
        data: project,
      });
    } catch (error) {
      next(error);
    }
  });

  // Update project
  router.put("/:id", validateProjectId, updateController.update);

  return router;
};
