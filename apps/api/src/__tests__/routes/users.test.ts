import request from "supertest";
import express from "express";
import { createUserRoutes } from "../../routes/users.js";
import { UserService } from "../../services/UserService.js";
import { errorHandler } from "../../middleware/errorHandler.js";

// Mock the UserService
const mockUserService = {
  signRegistration: jest.fn(),
  signParticipation: jest.fn(),
  verifySignature: jest.fn(),
  getAddress: jest.fn(),
} as jest.Mocked<UserService>;

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/users", createUserRoutes(mockUserService));
  app.use(errorHandler);
  return app;
};

describe("User Routes", () => {
  let app: express.Application;

  beforeEach(() => {
    app = createTestApp();
    jest.clearAllMocks();
  });

  describe("POST /users/sign-registration", () => {
    const validRequest = {
      userAddress: "0x1234567890123456789012345678901234567890",
      contractAddress: "0x0987654321098765432109876543210987654321",
    };

    it("should sign registration message", async () => {
      const mockSignature = "0xsignature123";
      const mockAddress = "0xservice123";

      mockUserService.signRegistration.mockResolvedValue(mockSignature);
      mockUserService.getAddress.mockReturnValue(mockAddress);

      const response = await request(app)
        .post("/users/sign-registration")
        .send(validRequest)
        .expect(200);

      expect(response.body).toHaveProperty("signature", mockSignature);
      expect(response.body).toHaveProperty("signerAddress", mockAddress);
      expect(mockUserService.signRegistration).toHaveBeenCalledWith(
        validRequest.userAddress,
        validRequest.contractAddress
      );
    });

    it("should validate Ethereum addresses", async () => {
      const invalidRequest = {
        userAddress: "invalid_address",
        contractAddress: validRequest.contractAddress,
      };

      await request(app)
        .post("/users/sign-registration")
        .send(invalidRequest)
        .expect(400);
    });

    it("should require both addresses", async () => {
      await request(app)
        .post("/users/sign-registration")
        .send({ userAddress: validRequest.userAddress })
        .expect(400);
    });
  });

  describe("POST /users/sign-participation", () => {
    const validRequest = {
      userAddress: "0x1234567890123456789012345678901234567890",
      contractAddress: "0x0987654321098765432109876543210987654321",
      amount: "100.5",
    };

    it("should sign participation message", async () => {
      const mockSignature = "0xsignature456";
      const mockAddress = "0xservice123";

      mockUserService.signParticipation.mockResolvedValue(mockSignature);
      mockUserService.getAddress.mockReturnValue(mockAddress);

      const response = await request(app)
        .post("/users/sign-participation")
        .send(validRequest)
        .expect(200);

      expect(response.body).toHaveProperty("signature", mockSignature);
      expect(response.body).toHaveProperty("signerAddress", mockAddress);
      expect(mockUserService.signParticipation).toHaveBeenCalledWith(
        validRequest.userAddress,
        validRequest.amount,
        validRequest.contractAddress
      );
    });

    it("should validate amount", async () => {
      const invalidRequest = {
        ...validRequest,
        amount: "invalid_amount",
      };

      const response = await request(app)
        .post("/users/sign-participation")
        .send(invalidRequest)
        .expect(400);

      expect(response.body).toHaveProperty("error", "Invalid amount");
    });

    it("should require amount", async () => {
      const { amount, ...requestWithoutAmount } = validRequest;

      const response = await request(app)
        .post("/users/sign-participation")
        .send(requestWithoutAmount)
        .expect(400);

      expect(response.body).toHaveProperty("error", "Invalid amount");
    });
  });

  describe("POST /users/verify-signature", () => {
    const validRequest = {
      message: "test message",
      signature: "0xsignature789",
      address: "0x1234567890123456789012345678901234567890",
    };

    it("should verify signature", async () => {
      mockUserService.verifySignature.mockResolvedValue(true);

      const response = await request(app)
        .post("/users/verify-signature")
        .send(validRequest)
        .expect(200);

      expect(response.body).toHaveProperty("valid", true);
      expect(mockUserService.verifySignature).toHaveBeenCalledWith(
        validRequest.message,
        validRequest.signature,
        validRequest.address
      );
    });

    it("should return false for invalid signature", async () => {
      mockUserService.verifySignature.mockResolvedValue(false);

      const response = await request(app)
        .post("/users/verify-signature")
        .send(validRequest)
        .expect(200);

      expect(response.body).toHaveProperty("valid", false);
    });

    it("should require all fields", async () => {
      const { message, ...incompleteRequest } = validRequest;

      const response = await request(app)
        .post("/users/verify-signature")
        .send(incompleteRequest)
        .expect(400);

      expect(response.body).toHaveProperty("error", "Missing required fields");
    });
  });

  describe("GET /users/address", () => {
    it("should return service address", async () => {
      const mockAddress = "0xservice123";
      mockUserService.getAddress.mockReturnValue(mockAddress);

      const response = await request(app).get("/users/address").expect(200);

      expect(response.body).toHaveProperty("address", mockAddress);
      expect(mockUserService.getAddress).toHaveBeenCalled();
    });
  });
});
