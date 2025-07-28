import { Router } from "express";
import { ProjectService } from "../services/ProjectService.js";
import { UserService } from "../services/UserService.js";
import { createProjectRoutes } from "./projects.js";
import { createUserRoutes } from "./users.js";
import healthRoutes from "./health.js";

export const createApiRoutes = (
  projectService: ProjectService,
  userService: UserService
): Router => {
  const router = Router();

  // Health check routes
  router.use(healthRoutes);

  // API v1 routes
  const v1Router = Router();

  // Status endpoint
  v1Router.get("/status", (req, res) => {
    res.status(200).json({
      message: "Horizon API is running",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    });
  });

  // Feature routes
  v1Router.use("/projects", createProjectRoutes(projectService));
  v1Router.use("/users", createUserRoutes(userService));

  router.use("/api/v1", v1Router);

  // 404 handler
  router.use("*", (req, res) => {
    res.status(404).json({
      error: "Not Found",
      message: `Route ${req.originalUrl} not found`,
    });
  });

  return router;
};
