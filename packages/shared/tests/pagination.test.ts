import { PaginationUtils } from "../src/pagination";
import { PageParam, Page } from "../src/types";

describe("PaginationUtils", () => {
  describe("createPage", () => {
    it("should create page with correct pagination data", () => {
      const pageParam: PageParam = { pageIndex: 1, pageSize: 10 };
      const dataCount = 25;
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

      const result = PaginationUtils.createPage(pageParam, dataCount, data);

      expect(result).toEqual({
        pageIndex: 1,
        pageSize: 10,
        pageCount: 3, // Math.ceil(25/10) = 3
        dataCount: 25,
        data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      });
    });

    it("should handle exact division for page count", () => {
      const pageParam: PageParam = { pageIndex: 2, pageSize: 5 };
      const dataCount = 20;
      const data = ["a", "b", "c", "d", "e"];

      const result = PaginationUtils.createPage(pageParam, dataCount, data);

      expect(result.pageCount).toBe(4); // 20/5 = 4 exactly
      expect(result.pageIndex).toBe(2);
      expect(result.dataCount).toBe(20);
    });

    it("should handle single page scenario", () => {
      const pageParam: PageParam = { pageIndex: 1, pageSize: 50 };
      const dataCount = 10;
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

      const result = PaginationUtils.createPage(pageParam, dataCount, data);

      expect(result.pageCount).toBe(1);
      expect(result.pageIndex).toBe(1);
      expect(result.dataCount).toBe(10);
    });

    it("should handle empty data", () => {
      const pageParam: PageParam = { pageIndex: 1, pageSize: 10 };
      const dataCount = 0;
      const data: number[] = [];

      const result = PaginationUtils.createPage(pageParam, dataCount, data);

      expect(result).toEqual({
        pageIndex: 1,
        pageSize: 10,
        pageCount: 0,
        dataCount: 0,
        data: [],
      });
    });

    it("should handle large page size", () => {
      const pageParam: PageParam = { pageIndex: 1, pageSize: 1000 };
      const dataCount = 50;
      const data = Array.from({ length: 50 }, (_, i) => i + 1);

      const result = PaginationUtils.createPage(pageParam, dataCount, data);

      expect(result.pageCount).toBe(1);
      expect(result.data.length).toBe(50);
    });

    it("should work with different data types", () => {
      interface User {
        id: number;
        name: string;
      }

      const pageParam: PageParam = { pageIndex: 1, pageSize: 2 };
      const dataCount = 5;
      const data: User[] = [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
      ];

      const result: Page<User> = PaginationUtils.createPage(
        pageParam,
        dataCount,
        data
      );

      expect(result.pageCount).toBe(3); // Math.ceil(5/2) = 3
      expect(result.data).toEqual([
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
      ]);
    });

    it("should handle fractional page count correctly", () => {
      const pageParam: PageParam = { pageIndex: 1, pageSize: 7 };
      const dataCount = 23;
      const data = Array.from({ length: 7 }, (_, i) => i + 1);

      const result = PaginationUtils.createPage(pageParam, dataCount, data);

      expect(result.pageCount).toBe(4); // Math.ceil(23/7) = 4
    });
  });

  describe("isValidPageParam", () => {
    it("should return true for valid parameters", () => {
      const validParams: PageParam[] = [
        { pageIndex: 1, pageSize: 1 },
        { pageIndex: 1, pageSize: 20 },
        { pageIndex: 5, pageSize: 50 },
        { pageIndex: 100, pageSize: 100 },
      ];

      validParams.forEach((param) => {
        expect(PaginationUtils.isValidPageParam(param)).toBe(true);
      });
    });

    it("should return false for invalid page index", () => {
      const invalidParams: PageParam[] = [
        { pageIndex: 0, pageSize: 20 },
        { pageIndex: -1, pageSize: 20 },
        { pageIndex: -10, pageSize: 20 },
      ];

      invalidParams.forEach((param) => {
        expect(PaginationUtils.isValidPageParam(param)).toBe(false);
      });
    });

    it("should return false for invalid page size", () => {
      const invalidParams: PageParam[] = [
        { pageIndex: 1, pageSize: 0 },
        { pageIndex: 1, pageSize: -1 },
        { pageIndex: 1, pageSize: -20 },
      ];

      invalidParams.forEach((param) => {
        expect(PaginationUtils.isValidPageParam(param)).toBe(false);
      });
    });

    it("should return false for page size exceeding limit", () => {
      const invalidParams: PageParam[] = [
        { pageIndex: 1, pageSize: 101 },
        { pageIndex: 1, pageSize: 200 },
        { pageIndex: 1, pageSize: 1000 },
      ];

      invalidParams.forEach((param) => {
        expect(PaginationUtils.isValidPageParam(param)).toBe(false);
      });
    });

    it("should handle edge case at maximum page size", () => {
      const edgeCaseParam: PageParam = { pageIndex: 1, pageSize: 100 };
      expect(PaginationUtils.isValidPageParam(edgeCaseParam)).toBe(true);
    });

    it("should handle decimal values", () => {
      const decimalParams = [
        { pageIndex: 1.5, pageSize: 20 },
        { pageIndex: 1, pageSize: 20.5 },
      ] as PageParam[];

      decimalParams.forEach((param) => {
        // Should still work with decimal values (JavaScript allows this)
        const result = PaginationUtils.isValidPageParam(param);
        expect(typeof result).toBe("boolean");
      });
    });
  });

  describe("calculateOffset", () => {
    it("should calculate correct offset for first page", () => {
      const offset = PaginationUtils.calculateOffset(1, 10);
      expect(offset).toBe(0);
    });

    it("should calculate correct offset for subsequent pages", () => {
      expect(PaginationUtils.calculateOffset(2, 10)).toBe(10);
      expect(PaginationUtils.calculateOffset(3, 10)).toBe(20);
      expect(PaginationUtils.calculateOffset(5, 20)).toBe(80);
    });

    it("should handle different page sizes", () => {
      expect(PaginationUtils.calculateOffset(1, 1)).toBe(0);
      expect(PaginationUtils.calculateOffset(2, 1)).toBe(1);
      expect(PaginationUtils.calculateOffset(1, 100)).toBe(0);
      expect(PaginationUtils.calculateOffset(2, 100)).toBe(100);
    });

    it("should handle large page numbers", () => {
      expect(PaginationUtils.calculateOffset(1000, 50)).toBe(49950);
      expect(PaginationUtils.calculateOffset(100, 25)).toBe(2475);
    });

    it("should work with edge cases", () => {
      // Edge case: page 1 with any size should always be 0
      expect(PaginationUtils.calculateOffset(1, 1)).toBe(0);
      expect(PaginationUtils.calculateOffset(1, 1000)).toBe(0);
    });
  });

  describe("createDefaultPageParam", () => {
    it("should return default pagination parameters", () => {
      const defaultParam = PaginationUtils.createDefaultPageParam();

      expect(defaultParam).toEqual({
        pageIndex: 1,
        pageSize: 20,
      });
    });

    it("should return valid parameters", () => {
      const defaultParam = PaginationUtils.createDefaultPageParam();
      expect(PaginationUtils.isValidPageParam(defaultParam)).toBe(true);
    });

    it("should return new instance each time", () => {
      const param1 = PaginationUtils.createDefaultPageParam();
      const param2 = PaginationUtils.createDefaultPageParam();

      expect(param1).toEqual(param2);
      expect(param1).not.toBe(param2); // Different object instances
    });
  });

  describe("Integration Tests", () => {
    it("should work with complete pagination workflow", () => {
      // Create default params
      const pageParam = PaginationUtils.createDefaultPageParam();

      // Validate params
      expect(PaginationUtils.isValidPageParam(pageParam)).toBe(true);

      // Calculate offset for database query
      const offset = PaginationUtils.calculateOffset(
        pageParam.pageIndex,
        pageParam.pageSize
      );
      expect(offset).toBe(0);

      // Create page result
      const mockData = Array.from({ length: 20 }, (_, i) => `item-${i + 1}`);
      const totalCount = 100;
      const page = PaginationUtils.createPage(pageParam, totalCount, mockData);

      expect(page.pageIndex).toBe(1);
      expect(page.pageSize).toBe(20);
      expect(page.pageCount).toBe(5); // 100/20 = 5
      expect(page.dataCount).toBe(100);
      expect(page.data.length).toBe(20);
    });

    it("should handle last page with partial data", () => {
      const pageParam: PageParam = { pageIndex: 3, pageSize: 10 };
      const totalCount = 25;
      const lastPageData = Array.from(
        { length: 5 },
        (_, i) => `item-${i + 21}`
      ); // Items 21-25

      const page = PaginationUtils.createPage(
        pageParam,
        totalCount,
        lastPageData
      );

      expect(page.pageIndex).toBe(3);
      expect(page.pageCount).toBe(3); // Math.ceil(25/10) = 3
      expect(page.data.length).toBe(5); // Only 5 items on last page
      expect(page.dataCount).toBe(25);
    });

    it("should validate and reject invalid pagination requests", () => {
      const invalidParams: PageParam[] = [
        { pageIndex: 0, pageSize: 20 },
        { pageIndex: 1, pageSize: 0 },
        { pageIndex: 1, pageSize: 101 },
        { pageIndex: -1, pageSize: 10 },
      ];

      invalidParams.forEach((param) => {
        expect(PaginationUtils.isValidPageParam(param)).toBe(false);
      });
    });

    it("should handle database-style pagination", () => {
      // Simulate paginating through a dataset
      const totalRecords = 47;
      const pageSize = 10;

      for (
        let pageIndex = 1;
        pageIndex <= Math.ceil(totalRecords / pageSize);
        pageIndex++
      ) {
        const offset = PaginationUtils.calculateOffset(pageIndex, pageSize);
        const expectedOffset = (pageIndex - 1) * pageSize;

        expect(offset).toBe(expectedOffset);

        // Simulate getting data for this page
        const remainingRecords = totalRecords - offset;
        const pageDataSize = Math.min(pageSize, remainingRecords);
        const mockData = Array.from(
          { length: pageDataSize },
          (_, i) => offset + i + 1
        );

        const page = PaginationUtils.createPage(
          { pageIndex, pageSize },
          totalRecords,
          mockData
        );

        expect(page.pageIndex).toBe(pageIndex);
        expect(page.dataCount).toBe(totalRecords);
        expect(page.pageCount).toBe(5); // Math.ceil(47/10) = 5
        expect(page.data.length).toBe(pageDataSize);
      }
    });
  });
});
