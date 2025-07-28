import { Request, Response, NextFunction } from "express";
import { rateLimiter, securityHeaders } from "../../middleware/security.js";

describe("Security Middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockSetHeader: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockSetHeader = jest.fn();

    mockReq = {
      ip: "127.0.0.1",
    };
    mockRes = {
      status: mockStatus,
      json: mockJson,
      setHeader: mockSetHeader,
    };
    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  describe("rateLimiter", () => {
    it("should allow requests within limit", () => {
      const limiter = rateLimiter(60000, 5); // 5 requests per minute

      limiter(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockStatus).not.toHaveBeenCalled();
    });

    it("should block requests exceeding limit", () => {
      const limiter = rateLimiter(60000, 2); // 2 requests per minute

      // First two requests should pass
      limiter(mockReq as Request, mockRes as Response, mockNext);
      limiter(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(2);

      // Third request should be blocked
      limiter(mockReq as Request, mockRes as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(429);
      expect(mockJson).toHaveBeenCalledWith({
        error: "Too many requests",
        message: "Rate limit exceeded. Please try again later.",
      });
      expect(mockNext).toHaveBeenCalledTimes(2); // Should not be called for third request
    });

    it("should reset counter after time window", () => {
      const limiter = rateLimiter(100, 1); // 1 request per 100ms

      // First request should pass
      limiter(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);

      // Second request should be blocked
      limiter(mockReq as Request, mockRes as Response, mockNext);
      expect(mockStatus).toHaveBeenCalledWith(429);

      // Wait for time window to pass and try again
      setTimeout(() => {
        limiter(mockReq as Request, mockRes as Response, mockNext);
        expect(mockNext).toHaveBeenCalledTimes(2);
      }, 150);
    });

    it("should handle different IP addresses separately", () => {
      const limiter = rateLimiter(60000, 1); // 1 request per minute

      // First IP
      mockReq.ip = "127.0.0.1";
      limiter(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);

      // Second IP should not be affected
      mockReq.ip = "192.168.1.1";
      limiter(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(2);

      // First IP second request should be blocked
      mockReq.ip = "127.0.0.1";
      limiter(mockReq as Request, mockRes as Response, mockNext);
      expect(mockStatus).toHaveBeenCalledWith(429);
    });

    it("should handle missing IP address", () => {
      const limiter = rateLimiter(60000, 5);
      mockReq.ip = undefined;

      limiter(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should use default values", () => {
      const limiter = rateLimiter(); // Default: 15 minutes, 100 requests

      for (let i = 0; i < 100; i++) {
        limiter(mockReq as Request, mockRes as Response, mockNext);
      }

      expect(mockNext).toHaveBeenCalledTimes(100);

      // 101st request should be blocked
      limiter(mockReq as Request, mockRes as Response, mockNext);
      expect(mockStatus).toHaveBeenCalledWith(429);
    });
  });

  describe("securityHeaders", () => {
    it("should set all security headers", () => {
      securityHeaders(mockReq as Request, mockRes as Response, mockNext);

      expect(mockSetHeader).toHaveBeenCalledWith(
        "X-Content-Type-Options",
        "nosniff"
      );
      expect(mockSetHeader).toHaveBeenCalledWith("X-Frame-Options", "DENY");
      expect(mockSetHeader).toHaveBeenCalledWith(
        "X-XSS-Protection",
        "1; mode=block"
      );
      expect(mockSetHeader).toHaveBeenCalledWith(
        "Referrer-Policy",
        "strict-origin-when-cross-origin"
      );
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should call next middleware", () => {
      securityHeaders(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });
});
