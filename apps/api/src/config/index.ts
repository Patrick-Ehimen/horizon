import { config } from "dotenv";
import { AppConfig } from "@repo/shared";

// Load environment variables
config();

/**
 * Application configuration
 */
export const appConfig: AppConfig = {
  database: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || "5432",
    name: process.env.DB_NAME || "horizon",
    username: process.env.DB_USERNAME || "user",
    password: process.env.DB_PASSWORD || "123456",
    sslmode: process.env.DB_SSLMODE || "disable",
  },
  ownerPrivateKey: process.env.OWNER_PRIVATE_KEY || "private_key",
  port: parseInt(process.env.PORT || "8080", 10),
};

/**
 * Validate required configuration
 */
export function validateConfig(): void {
  const required = ["OWNER_PRIVATE_KEY"];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}

/**
 * Database connection configuration for TypeORM
 */
export const databaseConfig = {
  type: "postgres" as const,
  host: appConfig.database.host,
  port: parseInt(appConfig.database.port, 10),
  username: appConfig.database.username,
  password: appConfig.database.password,
  database: appConfig.database.name,
  ssl: appConfig.database.sslmode !== "disable",
  synchronize: process.env.NODE_ENV !== "production", // Only in development
  logging: process.env.NODE_ENV === "development",
  entities: ["src/entities/**/*.ts"],
  migrations: ["src/migrations/**/*.ts"],
  subscribers: ["src/subscribers/**/*.ts"],
};
