import { Request, Response, NextFunction } from "express";

// Simple rate limiting middleware
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimiter = (
  windowMs: number = 15 * 60 * 1000, // 15 minutes
  maxRequests: number = 100
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const clientId = req.ip || "unknown";
    const now = Date.now();

    const clientData = requestCounts.get(clientId);

    if (!clientData || now > clientData.resetTime) {
      requestCounts.set(clientId, {
        count: 1,
        resetTime: now + windowMs,
      });
      next();
      return;
    }

    if (clientData.count >= maxRequests) {
      res.status(429).json({
        error: "Too many requests",
        message: "Rate limit exceeded. Please try again later.",
      });
      return;
    }

    clientData.count++;
    next();
  };
};

export const securityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  next();
};
