import { Router } from "express";
import { UserService } from "../services/UserService.js";
import { validateEthereumAddress } from "../middleware/validation.js";

export const createUserRoutes = (userService: UserService): Router => {
  const router = Router();

  // Sign registration message
  router.post(
    "/sign-registration",
    validateEthereumAddress,
    async (req, res, next) => {
      try {
        const { userAddress, contractAddress } = req.body;

        const signature = await userService.signRegistration(
          userAddress,
          contractAddress
        );

        res.status(200).json({
          signature,
          signerAddress: userService.getAddress(),
        });
      } catch (error) {
        next(error);
      }
    }
  );

  // Sign participation message
  router.post(
    "/sign-participation",
    validateEthereumAddress,
    async (req, res, next) => {
      try {
        const { userAddress, amount, contractAddress } = req.body;

        if (!amount || isNaN(parseFloat(amount))) {
          res.status(400).json({ error: "Invalid amount" });
          return;
        }

        const signature = await userService.signParticipation(
          userAddress,
          amount,
          contractAddress
        );

        res.status(200).json({
          signature,
          signerAddress: userService.getAddress(),
        });
      } catch (error) {
        next(error);
      }
    }
  );

  // Verify signature
  router.post("/verify-signature", async (req, res, next) => {
    try {
      const { message, signature, address } = req.body;

      if (!message || !signature || !address) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      const isValid = await userService.verifySignature(
        message,
        signature,
        address
      );

      res.status(200).json({ valid: isValid });
    } catch (error) {
      next(error);
    }
  });

  // Get service address
  router.get("/address", (req, res) => {
    res.status(200).json({
      address: userService.getAddress(),
    });
  });

  return router;
};
