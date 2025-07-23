import { CommonException, ExceptionFactory } from "../src/exceptions";
import { ResponseCodes } from "../src/types";

describe("CommonException", () => {
  describe("constructor", () => {
    it("should create exception with error code and default message", () => {
      const exception = new CommonException(ResponseCodes.INVALID_PARAMETERS);

      expect(exception).toBeInstanceOf(Error);
      expect(exception).toBeInstanceOf(CommonException);
      expect(exception.name).toBe("CommonException");
      expect(exception.message).toBe(ResponseCodes.INVALID_PARAMETERS.message);
      expect(exception.errorCode).toBe(ResponseCodes.INVALID_PARAMETERS);
    });

    it("should create exception with custom message", () => {
      const customMessage = "Custom error message";
      const exception = new CommonException(
        ResponseCodes.SERVER_ERROR,
        customMessage
      );

      expect(exception.message).toBe(customMessage);
      expect(exception.errorCode).toBe(ResponseCodes.SERVER_ERROR);
    });

    it("should maintain proper stack trace", () => {
      const exception = new CommonException(ResponseCodes.FAILED);

      expect(exception.stack).toBeDefined();
      expect(typeof exception.stack).toBe("string");
    });
  });

  describe("getCode", () => {
    it("should return the error code number", () => {
      const exception = new CommonException(ResponseCodes.NO_PERMISSION);

      expect(exception.getCode()).toBe(403);
    });
  });

  describe("getDescription", () => {
    it("should return the error description", () => {
      const exception = new CommonException(ResponseCodes.INVALID_TOKEN);

      expect(exception.getDescription()).toBe("Invalid Token");
    });
  });

  describe("toJSON", () => {
    it("should return JSON representation with default message", () => {
      const exception = new CommonException(ResponseCodes.DATA_DUPLICATION);
      const json = exception.toJSON();

      expect(json).toEqual({
        error: "Data exists",
        code: 505,
      });
    });

    it("should return JSON representation with custom message", () => {
      const customMessage = "Custom duplicate data error";
      const exception = new CommonException(
        ResponseCodes.DATA_DUPLICATION,
        customMessage
      );
      const json = exception.toJSON();

      expect(json).toEqual({
        error: "Data exists", // toJSON uses errorCode.message, not the custom message
        code: 505,
      });
    });
  });

  describe("error inheritance", () => {
    it("should be catchable as Error", () => {
      const exception = new CommonException(ResponseCodes.SERVER_ERROR);

      expect(() => {
        throw exception;
      }).toThrow(Error);
    });

    it("should be catchable as CommonException", () => {
      const exception = new CommonException(ResponseCodes.VERIFICATION_FAILED);

      try {
        throw exception;
      } catch (error) {
        expect(error).toBeInstanceOf(CommonException);
        expect((error as CommonException).getCode()).toBe(506);
      }
    });
  });
});

describe("ExceptionFactory", () => {
  describe("invalidParameters", () => {
    it("should create CommonException with INVALID_PARAMETERS code", () => {
      const exception = ExceptionFactory.invalidParameters();

      expect(exception).toBeInstanceOf(CommonException);
      expect(exception.getCode()).toBe(501);
      expect(exception.message).toBe("Invalid Parameters");
    });

    it("should create exception with custom message", () => {
      const customMessage = "Missing required field";
      const exception = ExceptionFactory.invalidParameters(customMessage);

      expect(exception.message).toBe(customMessage);
      expect(exception.getCode()).toBe(501);
    });
  });

  describe("serverError", () => {
    it("should create CommonException with SERVER_ERROR code", () => {
      const exception = ExceptionFactory.serverError();

      expect(exception.getCode()).toBe(500);
      expect(exception.message).toBe("Internal Server Error");
    });

    it("should create exception with custom message", () => {
      const customMessage = "Database connection failed";
      const exception = ExceptionFactory.serverError(customMessage);

      expect(exception.message).toBe(customMessage);
      expect(exception.getCode()).toBe(500);
    });
  });

  describe("noPermission", () => {
    it("should create CommonException with NO_PERMISSION code", () => {
      const exception = ExceptionFactory.noPermission();

      expect(exception.getCode()).toBe(403);
      expect(exception.message).toBe("No Permission");
    });

    it("should create exception with custom message", () => {
      const customMessage = "Access denied for this resource";
      const exception = ExceptionFactory.noPermission(customMessage);

      expect(exception.message).toBe(customMessage);
    });
  });

  describe("invalidToken", () => {
    it("should create CommonException with INVALID_TOKEN code", () => {
      const exception = ExceptionFactory.invalidToken();

      expect(exception.getCode()).toBe(502);
      expect(exception.message).toBe("Invalid Token");
    });

    it("should create exception with custom message", () => {
      const customMessage = "JWT token is malformed";
      const exception = ExceptionFactory.invalidToken(customMessage);

      expect(exception.message).toBe(customMessage);
    });
  });

  describe("tokenExpired", () => {
    it("should create CommonException with TOKEN_EXPIRED code", () => {
      const exception = ExceptionFactory.tokenExpired();

      expect(exception.getCode()).toBe(502);
      expect(exception.message).toBe("The token has expired");
    });

    it("should create exception with custom message", () => {
      const customMessage = "Session expired, please login again";
      const exception = ExceptionFactory.tokenExpired(customMessage);

      expect(exception.message).toBe(customMessage);
    });
  });

  describe("failed", () => {
    it("should create CommonException with FAILED code", () => {
      const exception = ExceptionFactory.failed();

      expect(exception.getCode()).toBe(503);
      expect(exception.message).toBe("Failed");
    });

    it("should create exception with custom message", () => {
      const customMessage = "Operation failed due to network error";
      const exception = ExceptionFactory.failed(customMessage);

      expect(exception.message).toBe(customMessage);
    });
  });

  describe("dataDuplication", () => {
    it("should create CommonException with DATA_DUPLICATION code", () => {
      const exception = ExceptionFactory.dataDuplication();

      expect(exception.getCode()).toBe(505);
      expect(exception.message).toBe("Data exists");
    });

    it("should create exception with custom message", () => {
      const customMessage = "User with this email already exists";
      const exception = ExceptionFactory.dataDuplication(customMessage);

      expect(exception.message).toBe(customMessage);
    });
  });

  describe("verificationFailed", () => {
    it("should create CommonException with VERIFICATION_FAILED code", () => {
      const exception = ExceptionFactory.verificationFailed();

      expect(exception.getCode()).toBe(506);
      expect(exception.message).toBe("Wrong account or password");
    });

    it("should create exception with custom message", () => {
      const customMessage = "Invalid credentials provided";
      const exception = ExceptionFactory.verificationFailed(customMessage);

      expect(exception.message).toBe(customMessage);
    });
  });

  describe("requestTooFrequent", () => {
    it("should create CommonException with REQUEST_TOO_FREQUENT code", () => {
      const exception = ExceptionFactory.requestTooFrequent();

      expect(exception.getCode()).toBe(509);
      expect(exception.message).toBe("Requests are too frequent");
    });

    it("should create exception with custom message", () => {
      const customMessage = "Rate limit exceeded, try again in 60 seconds";
      const exception = ExceptionFactory.requestTooFrequent(customMessage);

      expect(exception.message).toBe(customMessage);
    });
  });

  describe("privateKeyExists", () => {
    it("should create CommonException with PRIVATE_KEY_EXIST code", () => {
      const exception = ExceptionFactory.privateKeyExists();

      expect(exception.getCode()).toBe(502);
      expect(exception.message).toBe("exist");
    });

    it("should create exception with custom message", () => {
      const customMessage = "Private key already registered";
      const exception = ExceptionFactory.privateKeyExists(customMessage);

      expect(exception.message).toBe(customMessage);
    });
  });

  describe("privateKeyNotExists", () => {
    it("should create CommonException with PRIVATE_KEY_NOT_EXIST code", () => {
      const exception = ExceptionFactory.privateKeyNotExists();

      expect(exception.getCode()).toBe(503);
      expect(exception.message).toBe("key not exist");
    });

    it("should create exception with custom message", () => {
      const customMessage = "No private key found for this user";
      const exception = ExceptionFactory.privateKeyNotExists(customMessage);

      expect(exception.message).toBe(customMessage);
    });
  });
});

describe("Exception Integration Tests", () => {
  it("should work with try-catch blocks", () => {
    expect(() => {
      try {
        throw ExceptionFactory.invalidParameters("Missing user ID");
      } catch (error) {
        if (error instanceof CommonException) {
          expect(error.getCode()).toBe(501);
          expect(error.message).toBe("Missing user ID");
          throw error; // Re-throw for the outer expect
        }
      }
    }).toThrow(CommonException);
  });

  it("should serialize properly for API responses", () => {
    const exception = ExceptionFactory.noPermission("Access denied");
    const response = {
      success: false,
      ...exception.toJSON(),
    };

    expect(response).toEqual({
      success: false,
      error: "No Permission",
      code: 403,
    });
  });

  it("should maintain error chain", () => {
    const originalError = new Error("Original database error");
    const wrappedException = ExceptionFactory.serverError(
      "Database operation failed"
    );

    // Simulate error chaining
    wrappedException.cause = originalError;

    expect(wrappedException.message).toBe("Database operation failed");
    expect(wrappedException.cause).toBe(originalError);
  });

  it("should handle all response codes correctly", () => {
    const testCases = [
      { factory: ExceptionFactory.invalidParameters, expectedCode: 501 },
      { factory: ExceptionFactory.serverError, expectedCode: 500 },
      { factory: ExceptionFactory.noPermission, expectedCode: 403 },
      { factory: ExceptionFactory.invalidToken, expectedCode: 502 },
      { factory: ExceptionFactory.tokenExpired, expectedCode: 502 },
      { factory: ExceptionFactory.failed, expectedCode: 503 },
      { factory: ExceptionFactory.dataDuplication, expectedCode: 505 },
      { factory: ExceptionFactory.verificationFailed, expectedCode: 506 },
      { factory: ExceptionFactory.requestTooFrequent, expectedCode: 509 },
      { factory: ExceptionFactory.privateKeyExists, expectedCode: 502 },
      { factory: ExceptionFactory.privateKeyNotExists, expectedCode: 503 },
    ];

    testCases.forEach(({ factory, expectedCode }) => {
      const exception = factory();
      expect(exception.getCode()).toBe(expectedCode);
      expect(exception).toBeInstanceOf(CommonException);
    });
  });
});
