import { Request, Response, NextFunction } from "express";
import {
  validateProjectId,
  validatePagination,
  validateEthereumAddress,
} from "../../middleware/validation.js";
import { ExceptionFactory } from "@repo/shared";

// Mock the ExceptionFactory
jest.mock("@repo/shared", () => ({
  ExceptionFactory: {
    invalidParameters: jest.fn((message: string) => {
      const error = new Error(message);
      error.name = "CommonException";
      return error;
    }),
  },
}));

describe("Validation Middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {};
    mockRes = {};
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe("validateProjectId", () => {
    it("should pass valid project ID", () => {
      mockReq.params = { id: "123" };

      validateProjectId(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(ExceptionFactory.invalidParameters).not.toHaveBeenCalled();
    });

    it("should reject invalid project ID", () => {
      mockReq.params = { id: "invalid" };

      expect(() => {
        validateProjectId(mockReq as Request, mockRes as Response, mockNext);
      }).toThrow();

      expect(ExceptionFactory.invalidParameters).toHaveBeenCalledWith(
        "Invalid project ID"
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should reject negative project ID", () => {
      mockReq.params = { id: "-1" };

      expect(() => {
        validateProjectId(mockReq as Request, mockRes as Response, mockNext);
      }).toThrow();

      expect(ExceptionFactory.invalidParameters).toHaveBeenCalledWith(
        "Invalid project ID"
      );
    });

    it("should reject zero project ID", () => {
      mockReq.params = { id: "0" };

      expect(() => {
        validateProjectId(mockReq as Request, mockRes as Response, mockNext);
      }).toThrow();

      expect(ExceptionFactory.invalidParameters).toHaveBeenCalledWith(
        "Invalid project ID"
      );
    });
  });

  describe("validatePagination", () => {
    it("should pass valid pagination parameters", () => {
      mockReq.query = { pageIndex: "0", pageSize: "10" };

      validatePagination(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockReq.query.pageIndex).toBe("0");
      expect(mockReq.query.pageSize).toBe("10");
    });

    it("should use default values when parameters are missing", () => {
      mockReq.query = {};

      validatePagination(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockReq.query.pageIndex).toBe("0");
      expect(mockReq.query.pageSize).toBe("10");
    });

    it("should reject negative pageIndex", () => {
      mockReq.query = { pageIndex: "-1", pageSize: "10" };

      expect(() => {
        validatePagination(mockReq as Request, mockRes as Response, mockNext);
      }).toThrow();

      expect(ExceptionFactory.invalidParameters).toHaveBeenCalledWith(
        "Invalid pageIndex"
      );
    });

    it("should reject invalid pageSize", () => {
      mockReq.query = { pageIndex: "0", pageSize: "0" };

      expect(() => {
        validatePagination(mockReq as Request, mockRes as Response, mockNext);
      }).toThrow();

      expect(ExceptionFactory.invalidParameters).toHaveBeenCalledWith(
        "Invalid pageSize (1-100)"
      );
    });

    it("should reject pageSize over 100", () => {
      mockReq.query = { pageIndex: "0", pageSize: "101" };

      expect(() => {
        validatePagination(mockReq as Request, mockRes as Response, mockNext);
      }).toThrow();

      expect(ExceptionFactory.invalidParameters).toHaveBeenCalledWith(
        "Invalid pageSize (1-100)"
      );
    });
  });

  describe("validateEthereumAddress", () => {
    const validAddress = "0x1234567890123456789012345678901234567890";
    const validContractAddress = "0x0987654321098765432109876543210987654321";

    it("should pass valid Ethereum addresses", () => {
      mockReq.body = {
        userAddress: validAddress,
        contractAddress: validContractAddress,
      };

      validateEthereumAddress(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
      expect(ExceptionFactory.invalidParameters).not.toHaveBeenCalled();
    });

    it("should reject invalid user address", () => {
      mockReq.body = {
        userAddress: "invalid_address",
        contractAddress: validContractAddress,
      };

      expect(() => {
        validateEthereumAddress(
          mockReq as Request,
          mockRes as Response,
          mockNext
        );
      }).toThrow();

      expect(ExceptionFactory.invalidParameters).toHaveBeenCalledWith(
        "Invalid user address"
      );
    });

    it("should reject invalid contract address", () => {
      mockReq.body = {
        userAddress: validAddress,
        contractAddress: "invalid_contract",
      };

      expect(() => {
        validateEthereumAddress(
          mockReq as Request,
          mockRes as Response,
          mockNext
        );
      }).toThrow();

      expect(ExceptionFactory.invalidParameters).toHaveBeenCalledWith(
        "Invalid contract address"
      );
    });

    it("should reject missing user address", () => {
      mockReq.body = {
        contractAddress: validContractAddress,
      };

      expect(() => {
        validateEthereumAddress(
          mockReq as Request,
          mockRes as Response,
          mockNext
        );
      }).toThrow();

      expect(ExceptionFactory.invalidParameters).toHaveBeenCalledWith(
        "Invalid user address"
      );
    });

    it("should reject addresses without 0x prefix", () => {
      mockReq.body = {
        userAddress: "1234567890123456789012345678901234567890",
        contractAddress: validContractAddress,
      };

      expect(() => {
        validateEthereumAddress(
          mockReq as Request,
          mockRes as Response,
          mockNext
        );
      }).toThrow();

      expect(ExceptionFactory.invalidParameters).toHaveBeenCalledWith(
        "Invalid user address"
      );
    });

    it("should reject addresses with wrong length", () => {
      mockReq.body = {
        userAddress: "0x123456789012345678901234567890123456789", // 39 chars instead of 40
        contractAddress: validContractAddress,
      };

      expect(() => {
        validateEthereumAddress(
          mockReq as Request,
          mockRes as Response,
          mockNext
        );
      }).toThrow();

      expect(ExceptionFactory.invalidParameters).toHaveBeenCalledWith(
        "Invalid user address"
      );
    });
  });
});
