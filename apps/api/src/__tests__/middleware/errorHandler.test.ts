import { Request, Response, NextFunction } from "express";
import { errorHandler } from "../../middleware/errorHandler.js";

describe("Error Handler Middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });

    mockReq = {};
    mockRes = {
      status: mockStatus,
      json: mockJson,
    };
    mockNext = jest.fn();

    // Mock console.error to avoid noise in tests
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should handle CommonException errors", () => {
    const error = new Error("Test error") as any;
    error.name = "CommonException";
    error.getCode = jest.fn().mockReturnValue(400);
    error.getDescription = jest.fn().mockReturnValue("Bad request");

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      error: "Bad request",
    });
  });

  it("should handle ValidationError", () => {
    const error = new Error("Validation failed");
    error.name = "ValidationError";

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      error: "Validation failed",
      details: "Validation failed",
    });
  });

  it("should handle QueryFailedError", () => {
    const error = new Error("Database error");
    error.name = "QueryFailedError";

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      error: "Database operation failed",
    });
  });

  it("should handle generic errors with custom status code", () => {
    const error = new Error("Custom error") as any;
    error.statusCode = 403;

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(403);
    expect(mockJson).toHaveBeenCalledWith({
      error: "Custom error",
    });
  });

  it("should handle generic errors with default status code", () => {
    const error = new Error("Generic error");

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      error: "Generic error",
    });
  });

  it("should handle errors without message", () => {
    const error = new Error();

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      error: "Internal server error",
    });
  });

  it("should log errors to console", () => {
    const error = new Error("Test error");
    const consoleSpy = jest.spyOn(console, "error");

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(consoleSpy).toHaveBeenCalledWith("Error:", error);
  });
});
