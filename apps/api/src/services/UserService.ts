import { cryptoUtil, AddressUtils, BigNumberUtils } from "@repo/shared";

export class UserService {
  private cryptoUtils: cryptoUtil;

  constructor(privateKey: string) {
    this.cryptoUtils = new cryptoUtil(privateKey);
  }

  /**
   * Sign a registration message
   * @param userAddress - User's Ethereum address
   * @param contractAddress - Contract address
   * @returns Promise<string> - The signature
   */
  async signRegistration(
    userAddress: string,
    contractAddress: string
  ): Promise<string> {
    // Clean addresses
    const cleanUserAddr = AddressUtils.cleanAddress(userAddress);
    const cleanContractAddr = AddressUtils.cleanAddress(contractAddress);

    // Create message (matching Go implementation)
    const message = (cleanUserAddr + cleanContractAddr).toLowerCase();

    // Sign the message
    return await this.cryptoUtils.sign(message);
  }

  /**
   * Sign a participation message
   * @param userAddress - User's Ethereum address
   * @param amount - Amount to participate with
   * @param contractAddress - Contract address
   * @returns Promise<string> - The signature
   */
  async signParticipation(
    userAddress: string,
    amount: string,
    contractAddress: string
  ): Promise<string> {
    // Parse and validate amount
    const amountBigInt = BigNumberUtils.parseBigInt(amount);

    // Clean addresses
    const cleanUserAddress = AddressUtils.cleanAddress(userAddress);
    const cleanContractAddress = AddressUtils.cleanAddress(contractAddress);

    // Create message (matching Go implementation)
    const messageString = `${cleanUserAddress}${amountBigInt.toString()}${cleanContractAddress}`;
    const messageBytes = new TextEncoder().encode(messageString);
    const hexString = BigNumberUtils.bytesToHex(messageBytes);

    // Sign the hex string
    return await this.cryptoUtils.sign(hexString);
  }

  /**
   * Get the service's public address
   * @returns string - The public address
   */
  getAddress(): string {
    return this.cryptoUtils.getAddress();
  }

  /**
   * Verify a signature
   * @param message - Original message
   * @param signature - Signature to verify
   * @param address - Expected signer address
   * @returns Promise<boolean> - True if valid
   */
  async verifySignature(
    message: string,
    signature: string,
    address: string
  ): Promise<boolean> {
    return await cryptoUtil.verifySignature(message, signature, address);
  }
}
