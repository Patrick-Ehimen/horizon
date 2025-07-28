import { Request, Response } from "express";
import { ProjectService } from "../services/ProjectService";
import { ExceptionFactory, PaginationUtils } from "@repo/shared";

export class ProductController {
  private projectService: ProjectService;

  constructor(projectService: ProjectService) {
    this.projectService = projectService;
  }

  /**
   * Get base info for a specific product/project
   */
  baseInfo = async (req: Request, res: Response): Promise<void> => {
    try {
      const productIdStr = req.query.productId as string;

      if (!productIdStr) {
        throw ExceptionFactory.invalidParameters("productId is required");
      }

      const productId = parseInt(productIdStr, 10);

      if (isNaN(productId) || productId < 1) {
        throw ExceptionFactory.invalidParameters("Invalid productId");
      }

      const product = await this.projectService.getById(productId);

      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      res.status(200).json({ data: product });
    } catch (error) {
      console.error("Error in baseInfo endpoint:", error);

      if (error instanceof Error && error.name === "CommonException") {
        const commonException = error as any;
        res.status(commonException.getCode()).json({
          error: commonException.getDescription(),
        });
      } else {
        res.status(500).json({
          error: "Failed to get product",
        });
      }
    }
  };

  /**
   * List all products/projects with pagination
   */
  list = async (req: Request, res: Response): Promise<void> => {
    try {
      // Get pagination parameters from query
      const pageIndexStr = req.query.pageIndex as string;
      const pageSizeStr = req.query.pageSize as string;

      let pagination = PaginationUtils.createDefaultPageParam();

      if (pageIndexStr) {
        const pageIndex = parseInt(pageIndexStr, 10);
        if (!isNaN(pageIndex) && pageIndex > 0) {
          pagination.pageIndex = pageIndex;
        }
      }

      if (pageSizeStr) {
        const pageSize = parseInt(pageSizeStr, 10);
        if (!isNaN(pageSize) && pageSize > 0 && pageSize <= 100) {
          pagination.pageSize = pageSize;
        }
      }

      const result = await this.projectService.list(pagination);

      res.status(200).json({ data: result });
    } catch (error) {
      console.error("Error in list endpoint:", error);

      res.status(500).json({
        error: "Failed to list products",
      });
    }
  };
}
