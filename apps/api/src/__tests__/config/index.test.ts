import {
  validateConfig,
  appConfig,
  databaseConfig,
} from "../../config/index.js";

describe("Configuration", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("validateConfig", () => {
    it("should pass when all required variables are present", () => {
      process.env.OWNER_PRIVATE_KEY = "test_private_key";

      expect(() => validateConfig()).not.toThrow();
    });

    it("should throw error when OWNER_PRIVATE_KEY is missing", () => {
      delete process.env.OWNER_PRIVATE_KEY;

      expect(() => validateConfig()).toThrow(
        "Missing required environment variables: OWNER_PRIVATE_KEY"
      );
    });

    it("should throw error when OWNER_PRIVATE_KEY is empty", () => {
      process.env.OWNER_PRIVATE_KEY = "";

      expect(() => validateConfig()).toThrow(
        "Missing required environment variables: OWNER_PRIVATE_KEY"
      );
    });
  });

  describe("appConfig", () => {
    it("should use environment variables when available", () => {
      process.env.DB_HOST = "custom_host";
      process.env.DB_PORT = "5433";
      process.env.DB_NAME = "custom_db";
      process.env.DB_USERNAME = "custom_user";
      process.env.DB_PASSWORD = "custom_pass";
      process.env.DB_SSLMODE = "require";
      process.env.OWNER_PRIVATE_KEY = "custom_key";
      process.env.PORT = "4000";

      // Re-import to get fresh config with new env vars
      jest.resetModules();
      const { appConfig: freshConfig } = require("../../config/index.js");

      expect(freshConfig.database.host).toBe("custom_host");
      expect(freshConfig.database.port).toBe("5433");
      expect(freshConfig.database.name).toBe("custom_db");
      expect(freshConfig.database.username).toBe("custom_user");
      expect(freshConfig.database.password).toBe("custom_pass");
      expect(freshConfig.database.sslmode).toBe("require");
      expect(freshConfig.ownerPrivateKey).toBe("custom_key");
      expect(freshConfig.port).toBe(4000);
    });

    it("should use default values when environment variables are missing", () => {
      delete process.env.DB_HOST;
      delete process.env.DB_PORT;
      delete process.env.DB_NAME;
      delete process.env.DB_USERNAME;
      delete process.env.DB_PASSWORD;
      delete process.env.DB_SSLMODE;
      delete process.env.OWNER_PRIVATE_KEY;
      delete process.env.PORT;

      jest.resetModules();
      const { appConfig: freshConfig } = require("../../config/index.js");

      expect(freshConfig.database.host).toBe("localhost");
      expect(freshConfig.database.port).toBe("5432");
      expect(freshConfig.database.name).toBe("horizon");
      expect(freshConfig.database.username).toBe("user");
      expect(freshConfig.database.password).toBe("123456");
      expect(freshConfig.database.sslmode).toBe("disable");
      expect(freshConfig.ownerPrivateKey).toBe("private_key");
      expect(freshConfig.port).toBe(8080);
    });
  });

  describe("databaseConfig", () => {
    it("should have correct TypeORM configuration", () => {
      expect(databaseConfig.type).toBe("postgres");
      expect(databaseConfig.entities).toEqual(["src/entities/**/*.ts"]);
      expect(databaseConfig.migrations).toEqual(["src/migrations/**/*.ts"]);
      expect(databaseConfig.subscribers).toEqual(["src/subscribers/**/*.ts"]);
    });

    it("should enable synchronize in development", () => {
      process.env.NODE_ENV = "development";

      jest.resetModules();
      const { databaseConfig: freshConfig } = require("../../config/index.js");

      expect(freshConfig.synchronize).toBe(true);
      expect(freshConfig.logging).toBe(true);
    });

    it("should disable synchronize in production", () => {
      process.env.NODE_ENV = "production";

      jest.resetModules();
      const { databaseConfig: freshConfig } = require("../../config/index.js");

      expect(freshConfig.synchronize).toBe(false);
      expect(freshConfig.logging).toBe(false);
    });

    it("should handle SSL configuration", () => {
      process.env.DB_SSLMODE = "require";

      jest.resetModules();
      const { databaseConfig: freshConfig } = require("../../config/index.js");

      expect(freshConfig.ssl).toBe(true);
    });

    it("should disable SSL when sslmode is disable", () => {
      process.env.DB_SSLMODE = "disable";

      jest.resetModules();
      const { databaseConfig: freshConfig } = require("../../config/index.js");

      expect(freshConfig.ssl).toBe(false);
    });
  });
});
