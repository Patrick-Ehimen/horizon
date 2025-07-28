import { Request, Response, NextFunction } from "express";
import { ExceptionFactory } from "@repo/shared";

export const validateProjectId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { id } = req.params;
  const projectId = parseInt(id, 10);

  if (isNaN(projectId) || projectId < 1) {
    throw ExceptionFactory.invalidParameters("Invalid project ID");
  }

  next();
};

export const validatePagination = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { pageIndex = "0", pageSize = "10" } = req.query;

  const parsedPageIndex = parseInt(pageIndex as string, 10);
  const parsedPageSize = parseInt(pageSize as string, 10);

  if (isNaN(parsedPageIndex) || parsedPageIndex < 0) {
    throw ExceptionFactory.invalidParameters("Invalid pageIndex");
  }

  if (isNaN(parsedPageSize) || parsedPageSize < 1 || parsedPageSize > 100) {
    throw ExceptionFactory.invalidParameters("Invalid pageSize (1-100)");
  }

  req.query.pageIndex = parsedPageIndex.toString();
  req.query.pageSize = parsedPageSize.toString();
  next();
};

export const validateEthereumAddress = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { userAddress, contractAddress } = req.body;

  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;

  if (!userAddress || !ethAddressRegex.test(userAddress)) {
    throw ExceptionFactory.invalidParameters("Invalid user address");
  }

  if (!contractAddress || !ethAddressRegex.test(contractAddress)) {
    throw ExceptionFactory.invalidParameters("Invalid contract address");
  }

  next();
};
