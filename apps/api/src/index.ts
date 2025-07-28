import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import "reflect-metadata";
import { DataSource } from "typeorm";

// Import configuration and validation
import { validateConfig, databaseConfig } from "./config/index.js";

// Import services and repositories
import { ProjectRepository } from "./repositories/ProjectRepository.js";
import { ProjectService } from "./services/ProjectService.js";
import { UserService } from "./services/UserService.js";

// Import routes and middleware
import { createApiRoutes } from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/logging.js";
import { rateLimiter, securityHeaders } from "./middleware/security.js";

// Load environment variables
dotenv.config();

// Validate configuration
validateConfig();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database connection
const dataSource = new DataSource(databaseConfig);

// Initialize services
let projectService: ProjectService;
let userService: UserService;

async function initializeServices() {
  try {
    // Connect to database
    await dataSource.initialize();
    console.log("📊 Database connected successfully");

    // Initialize repositories and services
    const projectRepository = new ProjectRepository(dataSource);
    projectService = new ProjectService(projectRepository);
    userService = new UserService(process.env.OWNER_PRIVATE_KEY!);

    console.log("✅ Services initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize services:", error);
    process.exit(1);
  }
}

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan("combined")); // Logging
app.use(requestLogger); // Custom request logging
app.use(securityHeaders); // Additional security headers
app.use(rateLimiter()); // Rate limiting
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Initialize and start server
async function startServer() {
  try {
    // Initialize services first
    await initializeServices();

    // Apply routes
    app.use(createApiRoutes(projectService, userService));

    // Error handling middleware (must be last)
    app.use(errorHandler);

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API status: http://localhost:${PORT}/api/v1/status`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`👤 Service address: ${userService.getAddress()}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("🛑 SIGTERM received, shutting down gracefully");
  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("🛑 SIGINT received, shutting down gracefully");
  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }
  process.exit(0);
});

// Start the application
startServer();

export default app;
