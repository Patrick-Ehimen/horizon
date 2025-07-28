import { Request, Response } from "express";
import { UserService } from "../services/UserService";
import { ExceptionFactory, AddressUtils } from "@repo/shared";

export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  /**
   * Handle user registration endpoint
   */
  registered = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userAddress, contractAddress } = req.body;

      // Validate parameters
      if (!userAddress || !contractAddress) {
        throw ExceptionFactory.invalidParameters(
          "userAddress and contractAddress are required"
        );
      }

      // Validate addresses
      if (
        !AddressUtils.isValidAddress(userAddress) ||
        !AddressUtils.isValidAddress(contractAddress)
      ) {
        throw ExceptionFactory.invalidParameters(
          "Invalid Ethereum address format"
        );
      }

      // Sign the registration
      const signature = await this.userService.signRegistration(
        userAddress,
        contractAddress
      );

      res.status(200).json({ signature });
    } catch (error) {
      console.error("Error in registered endpoint:", error);

      if (error instanceof Error && error.name === "CommonException") {
        const commonException = error as any;
        res.status(commonException.getCode()).json({
          error: commonException.getDescription(),
        });
      } else {
        res.status(500).json({
          error: "Internal server error",
        });
      }
    }
  };

  /**
   * Handle user participation endpoint
   */
  participation = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userAddress, amount, contractAddress } = req.body;

      // Validate parameters
      if (!userAddress || !amount || !contractAddress) {
        throw ExceptionFactory.invalidParameters(
          "userAddress, amount, and contractAddress are required"
        );
      }

      // Validate addresses
      if (
        !AddressUtils.isValidAddress(userAddress) ||
        !AddressUtils.isValidAddress(contractAddress)
      ) {
        throw ExceptionFactory.invalidParameters(
          "Invalid Ethereum address format"
        );
      }

      // Validate amount format
      try {
        BigInt(amount);
      } catch {
        throw ExceptionFactory.invalidParameters("Invalid amount format");
      }

      // Sign the participation
      const signature = await this.userService.signParticipation(
        userAddress,
        amount,
        contractAddress
      );

      res.status(200).json({ signature });
    } catch (error) {
      console.error("Error in participation endpoint:", error);

      if (error instanceof Error && error.name === "CommonException") {
        const commonException = error as any;
        res.status(commonException.getCode()).json({
          error: commonException.getDescription(),
        });
      } else {
        res.status(500).json({
          error: "Internal server error",
        });
      }
    }
  };
}
