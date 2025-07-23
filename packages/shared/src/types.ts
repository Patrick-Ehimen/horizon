/**
 * Project model interface based on the Go Project struct
 */
export interface Project {
  id: number;
  saleStart: Date;
  saleEnd: Date;
  registrationTimeEnds: Date;
  registrationTimeStarts: Date;
  createTime: Date;
  updateTime: Date;
  tge: Date;
  unlockTime: Date;
  vestingPortionsUnlockTime: number[]; // JSON array parsed
  vestingPercentPerPortion: number[]; // JSON array parsed
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Request types
 */
export interface RegistrationRequest {
  userAddress: string;
  contractAddress: string;
}

/**
 * Request for participating in a project
 */
export interface ParticipationRequest {
  userAddress: string;
  amount: string;
  contractAddress: string;
}

/**
 * Pagination parameters
 */
export interface PageParam {
  pageIndex: number;
  pageSize: number;
}

/**
 * Paginated response wrapper
 */
export interface Page<T> {
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  dataCount: number;
  data: T[];
}

/**
 * Response code interface
 */
export interface ReCode {
  code: number;
  message: string;
}

/**
 * Standard response codes used throughout the application
 */
export const ResponseCodes = {
  SUCCESS: { code: 200, message: "Success" },
  NO_PERMISSION: { code: 403, message: "No Permission" },
  SERVER_ERROR: { code: 500, message: "Internal Server Error" },
  INVALID_PARAMETERS: { code: 501, message: "Invalid Parameters" },
  INVALID_TOKEN: { code: 502, message: "Invalid Token" },
  TOKEN_EXPIRED: { code: 502, message: "The token has expired" },
  FAILED: { code: 503, message: "Failed" },
  DATA_DUPLICATION: { code: 505, message: "Data exists" },
  VERIFICATION_FAILED: { code: 506, message: "Wrong account or password" },
  REQUEST_TOO_FREQUENT: { code: 509, message: "Requests are too frequent" },
  PRIVATE_KEY_EXIST: { code: 502, message: "exist" },
  PRIVATE_KEY_NOT_EXIST: { code: 503, message: "key not exist" },
} as const;

/**
 * Database configuration interface
 */
export interface DatabaseConfig {
  /** Database server hostname */
  host: string;
  /** Database server port */
  port: string;
  /** Database name */
  name: string;
  /** Database username */
  username: string;
  /** Database password */
  password: string;
  /** SSL mode for database connection */
  sslmode: string;
}

/**
 * Application configuration interface
 */
export interface AppConfig {
  /** Database configuration */
  database: DatabaseConfig;
  /** Owner's private key */
  ownerPrivateKey: string;
  /** Application port */
  port?: number;
}
