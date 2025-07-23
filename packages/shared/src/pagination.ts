import { Page, PageParam } from "./types";

/**
 * Pagination utility class
 */
export class PaginationUtils {
  /**
   * Create a new Page instance with pagination data
   * @param pageParam - Pagination parameters
   * @param dataCount - Total count of data items
   * @param data - The data array for current page
   * @returns Page<T> - The paginated result
   */
  static createPage<T>(
    pageParam: PageParam,
    dataCount: number,
    data: T[]
  ): Page<T> {
    const pageCount = Math.ceil(dataCount / pageParam.pageSize);

    return {
      pageIndex: pageParam.pageIndex,
      pageSize: pageParam.pageSize,
      pageCount,
      dataCount,
      data,
    };
  }

  /**
   * Validate pagination parameters
   * @param pageParam - Pagination parameters to validate
   * @returns boolean - True if valid
   */
  static isValidPageParam(pageParam: PageParam): boolean {
    return (
      pageParam.pageIndex > 0 &&
      pageParam.pageSize > 0 &&
      pageParam.pageSize <= 100 // Max page size limit
    );
  }

  /**
   * Calculate offset for database queries
   * @param pageIndex - Current page index (1-based)
   * @param pageSize - Number of items per page
   * @returns number - The offset value
   */
  static calculateOffset(pageIndex: number, pageSize: number): number {
    return (pageIndex - 1) * pageSize;
  }

  /**
   * Create default pagination parameters
   * @returns PageParam - Default pagination parameters
   */
  static createDefaultPageParam(): PageParam {
    return {
      pageIndex: 1,
      pageSize: 20,
    };
  }
}
