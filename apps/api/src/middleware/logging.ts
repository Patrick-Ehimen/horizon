import { Request, Response, NextFunction } from "express";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();
  const { method, url, ip } = req;

  res.on("finish", () => {
    const duration = Date.now() - start;
    const { statusCode } = res;

    console.log(
      `${new Date().toISOString()} - ${method} ${url} - ${statusCode} - ${duration}ms - ${ip}`
    );
  });

  next();
};
