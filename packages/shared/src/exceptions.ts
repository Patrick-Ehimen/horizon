import { ReCode, ResponseCodes } from "./types";

/**
 * Custom exception class for API errors
 */
export class CommonException extends Error {
  public readonly errorCode: ReCode;

  /**
   * @notice Constructs a new CommonException instance with the specified error code and optional message.
   * @dev If no message is provided, the error code's message is used. The stack trace is maintained for debugging.
   * @param errorCode The error code object containing details about the exception.
   * @param message Optional custom error message to override the error code's default message.
   */
  constructor(errorCode: ReCode, message?: string) {
    super(message || errorCode.message);
    this.errorCode = errorCode;
    this.name = "CommonException";

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CommonException);
    }
  }

  /**
   * Get the error code
   */
  getCode(): number {
    return this.errorCode.code;
  }

  /**
   * Get the error description
   */
  getDescription(): string {
    return this.errorCode.message;
  }

  /**
   * Convert to JSON for API responses
   */
  toJSON() {
    return {
      error: this.errorCode.message,
      code: this.errorCode.code,
    };
  }
}

/**
 * @title ExceptionFactory
 * @notice Provides static factory methods to create instances of CommonException with predefined response codes.
 * @dev Each method returns a CommonException corresponding to a specific error scenario.
 */
export class ExceptionFactory {
  /**
   * @notice Creates an exception for invalid parameters.
   * @param message Optional error message.
   * @returns CommonException instance with INVALID_PARAMETERS code.
   */
  static invalidParameters(message?: string): CommonException {
    return new CommonException(ResponseCodes.INVALID_PARAMETERS, message);
  }

  /**
   * @notice Creates an exception for server errors.
   * @param message Optional error message.
   * @returns CommonException instance with SERVER_ERROR code.
   */
  static serverError(message?: string): CommonException {
    return new CommonException(ResponseCodes.SERVER_ERROR, message);
  }

  /**
   * @notice Creates an exception for no permission errors.
   * @param message Optional error message.
   * @returns CommonException instance with NO_PERMISSION code.
   */
  static noPermission(message?: string): CommonException {
    return new CommonException(ResponseCodes.NO_PERMISSION, message);
  }

  /**
   * @notice Creates an exception for invalid token errors.
   * @param message Optional error message.
   * @returns CommonException instance with INVALID_TOKEN code.
   */
  static invalidToken(message?: string): CommonException {
    return new CommonException(ResponseCodes.INVALID_TOKEN, message);
  }

  /**
   * @notice Creates an exception for expired token errors.
   * @param message Optional error message.
   * @returns CommonException instance with TOKEN_EXPIRED code.
   */
  static tokenExpired(message?: string): CommonException {
    return new CommonException(ResponseCodes.TOKEN_EXPIRED, message);
  }

  /**
   * @notice Creates an exception for generic failure.
   * @param message Optional error message.
   * @returns CommonException instance with FAILED code.
   */
  static failed(message?: string): CommonException {
    return new CommonException(ResponseCodes.FAILED, message);
  }

  /**
   * @notice Creates an exception for data duplication errors.
   * @param message Optional error message.
   * @returns CommonException instance with DATA_DUPLICATION code.
   */
  static dataDuplication(message?: string): CommonException {
    return new CommonException(ResponseCodes.DATA_DUPLICATION, message);
  }

  /**
   * @notice Creates an exception for verification failure.
   * @param message Optional error message.
   * @returns CommonException instance with VERIFICATION_FAILED code.
   */
  static verificationFailed(message?: string): CommonException {
    return new CommonException(ResponseCodes.VERIFICATION_FAILED, message);
  }

  /**
   * @notice Creates an exception for requests that are too frequent.
   * @param message Optional error message.
   * @returns CommonException instance with REQUEST_TOO_FREQUENT code.
   */
  static requestTooFrequent(message?: string): CommonException {
    return new CommonException(ResponseCodes.REQUEST_TOO_FREQUENT, message);
  }

  /**
   * @notice Creates an exception when a private key does not exist.
   * @param message Optional error message.
   * @returns CommonException instance with PRIVATE_KEY_NOT_EXIST code.
   */
  static privateKeyExists(message?: string): CommonException {
    return new CommonException(ResponseCodes.PRIVATE_KEY_EXIST, message);
  }

  /**
   * @notice Creates a CommonException indicating that the private key does not exist.
   * @dev Returns a CommonException with the PRIVATE_KEY_NOT_EXIST response code.
   * @param message Optional custom error message to provide additional context.
   * @returns {CommonException} Exception representing the absence of a private key.
   */
  static privateKeyNotExists(message?: string): CommonException {
    return new CommonException(ResponseCodes.PRIVATE_KEY_NOT_EXIST, message);
  }
}
