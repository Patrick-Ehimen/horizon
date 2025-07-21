import { ethers, getAddress, Wallet } from "ethers";
import { createHash } from "crypto";

/**
 * Utility class for cryptographic operations using Ethereum wallet
 */
export class cryptoUtil {
  private wallet: ethers.Wallet;
  /**
   * Creates a new cryptoUtil instance with the provided private key
   * @param privateKey - The private key for the wallet (with or without '0x' prefix)
   */
  constructor(privateKey: string) {
    const cleanPrivateKey = privateKey.startsWith("0x")
      ? privateKey
      : `0x${privateKey}`;

    this.wallet = new ethers.Wallet(cleanPrivateKey);
  }
  /**
   * Signs a message using the wallet's private key
   * @param message - The message to be signed
   * @returns A promise that resolves to the signature as a string
   * @throws Error if the signing process fails
   */
  async sign(message: string): Promise<string> {
    try {
      const hash = createHash("sha256").update(message).digest();

      const signature = await this.wallet.signMessage(hash);
      return signature;
    } catch (error) {
      throw new Error(`Failed to sign message: ${error}`);
    }
  }

  /**
   * Returns the Ethereum address associated with the wallet
   * @returns The wallet's Ethereum address as a string
   */
  getAddress(): string {
    return this.wallet.address;
  }

  /**
   * Verifies if a signature was created by the owner of the specified address
   * @param message - The original message that was signed
   * @param signature - The signature to verify
   * @param address - The Ethereum address to check against
   * @returns A promise that resolves to true if the signature is valid, false otherwise
   */
  static async verifySignature(
    message: string,
    signature: string,
    address: string
  ): Promise<boolean> {
    try {
      const hash = createHash("sha256").update(message).digest();
      const recoveredAddress = ethers.verifyMessage(hash, signature);

      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      return false;
    }
  }
}

/**
 * Utility class for Ethereum address handling
 */
export class AddressUtils {
  /**
   * Normalizes an Ethereum address to its checksummed format
   * @param address - The Ethereum address to clean/normalize
   * @returns The checksummed Ethereum address
   */
  static cleanAddress(address: string): string {
    return ethers.getAddress(address);
  }

  /**
   * Validates if a string is a valid Ethereum address
   * @param address - The string to validate as an Ethereum address
   * @returns True if the address is valid, false otherwise
   * @throws Error if the provided address is invalid
   */
  static isValidAddress(address: string): boolean {
    try {
      ethers.getAddress(address);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Utility functions for big number operations
 */
export class BigNumberUtils {
  /**
   * Parse a string to BigNumber
   * @param value - The string value
   * @returns bigint - The parsed big number
   */
  static parseBigInt(value: string): bigint {
    try {
      // Handle empty string case - BigInt("") returns 0n but we might want to be explicit
      if (value.trim() === "") {
        return BigInt(0);
      }
      return BigInt(value);
    } catch {
      throw new Error("Invalid amount");
    }
  }

  /**
   * Convert bytes to hex string
   * @param bytes - The bytes to convert
   * @returns string - The hex string
   */
  static bytesToHex(bytes: Uint8Array): string {
    return ethers.hexlify(bytes);
  }
}
