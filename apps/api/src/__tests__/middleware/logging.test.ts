import { Request, Response, NextFunction } from "express";
import { requestLogger } from "../../middleware/logging.js";

describe("Logging Middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let mockOn: jest.Mock;

  beforeEach(() => {
    mockOn = jest.fn();

    mockReq = {
      method: "GET",
      url: "/api/test",
      ip: "127.0.0.1",
    };
    mockRes = {
      on: mockOn,
      statusCode: 200,
    };
    mockNext = jest.fn();

    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(Date, "now").mockReturnValue(1000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should set up finish event listener", () => {
    requestLogger(mockReq as Request, mockRes as Response, mockNext);

    expect(mockOn).toHaveBeenCalledWith("finish", expect.any(Function));
    expect(mockNext).toHaveBeenCalledWith();
  });

  it("should log request details on finish", () => {
    const consoleSpy = jest.spyOn(console, "log");

    // Mock Date.now to return different values for start and end
    jest
      .spyOn(Date, "now")
      .mockReturnValueOnce(1000) // Start time
      .mockReturnValueOnce(1150); // End time (150ms later)

    requestLogger(mockReq as Request, mockRes as Response, mockNext);

    // Get the finish callback and call it
    const finishCallback = mockOn.mock.calls[0][1];
    finishCallback();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringMatching(/GET \/api\/test - 200 - 150ms - 127\.0\.0\.1/)
    );
  });

  it("should handle different HTTP methods and status codes", () => {
    const consoleSpy = jest.spyOn(console, "log");

    mockReq.method = "POST";
    mockReq.url = "/api/users";
    mockRes.statusCode = 201;

    jest.spyOn(Date, "now").mockReturnValueOnce(2000).mockReturnValueOnce(2050);

    requestLogger(mockReq as Request, mockRes as Response, mockNext);

    const finishCallback = mockOn.mock.calls[0][1];
    finishCallback();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringMatching(/POST \/api\/users - 201 - 50ms - 127\.0\.0\.1/)
    );
  });

  it("should handle missing IP address", () => {
    const consoleSpy = jest.spyOn(console, "log");

    mockReq.ip = undefined;

    jest.spyOn(Date, "now").mockReturnValueOnce(3000).mockReturnValueOnce(3100);

    requestLogger(mockReq as Request, mockRes as Response, mockNext);

    const finishCallback = mockOn.mock.calls[0][1];
    finishCallback();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringMatching(/GET \/api\/test - 200 - 100ms - undefined/)
    );
  });

  it("should include ISO timestamp", () => {
    const consoleSpy = jest.spyOn(console, "log");
    const mockDate = new Date("2023-01-01T12:00:00.000Z");

    jest
      .spyOn(Date.prototype, "toISOString")
      .mockReturnValue(mockDate.toISOString());
    jest.spyOn(Date, "now").mockReturnValueOnce(4000).mockReturnValueOnce(4200);

    requestLogger(mockReq as Request, mockRes as Response, mockNext);

    const finishCallback = mockOn.mock.calls[0][1];
    finishCallback();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("2023-01-01T12:00:00.000Z")
    );
  });
});
