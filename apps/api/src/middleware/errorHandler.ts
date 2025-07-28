import { Request, Response, NextFunction } from "express";

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error("Error:", error);

  // Handle known error types
  if (error.name === "CommonException") {
    const commonException = error as any;
    res.status(commonException.getCode()).json({
      error: commonException.getDescription(),
    });
    return;
  }

  // Handle validation errors
  if (error.name === "ValidationError") {
    res.status(400).json({
      error: "Validation failed",
      details: error.message,
    });
    return;
  }

  // Handle database errors
  if (error.name === "QueryFailedError") {
    res.status(500).json({
      error: "Database operation failed",
    });
    return;
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    error: error.message || "Internal server error",
  });
};
