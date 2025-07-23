import { cryptoUtil, AddressUtils, BigNumberUtils } from "../src/crypto";

describe("cryptoUtil", () => {
  const testPrivateKey =
    "0x1234567890123456789012345678901234567890123456789012345678901234";
  const testPrivateKeyWithoutPrefix =
    "1234567890123456789012345678901234567890123456789012345678901234";
  const testMessage = "Hello, World!";

  let cryptoInstance: cryptoUtil;

  beforeEach(() => {
    cryptoInstance = new cryptoUtil(testPrivateKey);
  });

  describe("constructor", () => {
    it("should create instance with private key with 0x prefix", () => {
      const instance = new cryptoUtil(testPrivateKey);
      expect(instance).toBeInstanceOf(cryptoUtil);
      expect(instance.getAddress()).toBeTruthy();
    });

    it("should create instance with private key without 0x prefix", () => {
      const instance = new cryptoUtil(testPrivateKeyWithoutPrefix);
      expect(instance).toBeInstanceOf(cryptoUtil);
      expect(instance.getAddress()).toBeTruthy();
    });

    it("should throw error for invalid private key", () => {
      expect(() => new cryptoUtil("invalid-key")).toThrow();
    });
  });

  describe("sign", () => {
    it("should sign a message successfully", async () => {
      const signature = await cryptoInstance.sign(testMessage);

      expect(signature).toBeTruthy();
      expect(typeof signature).toBe("string");
      expect(signature.startsWith("0x")).toBe(true);
    });

    it("should produce consistent signatures for the same message", async () => {
      const signature1 = await cryptoInstance.sign(testMessage);
      const signature2 = await cryptoInstance.sign(testMessage);

      expect(signature1).toBe(signature2);
    });

    it("should produce different signatures for different messages", async () => {
      const signature1 = await cryptoInstance.sign("message1");
      const signature2 = await cryptoInstance.sign("message2");

      expect(signature1).not.toBe(signature2);
    });

    it("should handle empty string message", async () => {
      const signature = await cryptoInstance.sign("");
      expect(signature).toBeTruthy();
    });
  });

  describe("getAddress", () => {
    it("should return valid Ethereum address", () => {
      const address = cryptoInstance.getAddress();

      expect(address).toBeTruthy();
      expect(typeof address).toBe("string");
      expect(address.startsWith("0x")).toBe(true);
      expect(address.length).toBe(42);
    });

    it("should return consistent address for same private key", () => {
      const instance1 = new cryptoUtil(testPrivateKey);
      const instance2 = new cryptoUtil(testPrivateKey);

      expect(instance1.getAddress()).toBe(instance2.getAddress());
    });
  });

  describe("verifySignature", () => {
    it("should verify valid signature", async () => {
      const signature = await cryptoInstance.sign(testMessage);
      const address = cryptoInstance.getAddress();

      const isValid = await cryptoUtil.verifySignature(
        testMessage,
        signature,
        address
      );
      expect(isValid).toBe(true);
    });

    it("should reject invalid signature", async () => {
      const signature = await cryptoInstance.sign(testMessage);
      const address = cryptoInstance.getAddress();

      const isValid = await cryptoUtil.verifySignature(
        "different message",
        signature,
        address
      );
      expect(isValid).toBe(false);
    });

    it("should reject signature with wrong address", async () => {
      const signature = await cryptoInstance.sign(testMessage);
      const wrongAddress = "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87";

      const isValid = await cryptoUtil.verifySignature(
        testMessage,
        signature,
        wrongAddress
      );
      expect(isValid).toBe(false);
    });

    it("should handle invalid signature format gracefully", async () => {
      const address = cryptoInstance.getAddress();

      const isValid = await cryptoUtil.verifySignature(
        testMessage,
        "invalid-signature",
        address
      );
      expect(isValid).toBe(false);
    });

    it("should handle invalid address format gracefully", async () => {
      const signature = await cryptoInstance.sign(testMessage);

      const isValid = await cryptoUtil.verifySignature(
        testMessage,
        signature,
        "invalid-address"
      );
      expect(isValid).toBe(false);
    });

    it("should be case insensitive for addresses", async () => {
      const signature = await cryptoInstance.sign(testMessage);
      const address = cryptoInstance.getAddress();

      const isValidLower = await cryptoUtil.verifySignature(
        testMessage,
        signature,
        address.toLowerCase()
      );
      const isValidUpper = await cryptoUtil.verifySignature(
        testMessage,
        signature,
        address.toUpperCase()
      );

      expect(isValidLower).toBe(true);
      expect(isValidUpper).toBe(true);
    });
  });
});

describe("AddressUtils", () => {
  const validAddress = "0x742d35cC6634c0532925A3b8d4C9DB96590C6c87";
  const validAddressLowerCase = "0x742d35cc6634c0532925a3b8d4c9db96590c6c87";
  const invalidAddress = "0xinvalid";

  describe("cleanAddress", () => {
    it("should return checksummed address for valid address", () => {
      const cleaned = AddressUtils.cleanAddress(validAddressLowerCase);

      expect(cleaned).toBe(validAddress);
      expect(cleaned).not.toBe(validAddressLowerCase);
    });

    it("should handle already checksummed address", () => {
      const cleaned = AddressUtils.cleanAddress(validAddress);
      expect(cleaned).toBe(validAddress);
    });

    it("should throw error for invalid address", () => {
      expect(() => AddressUtils.cleanAddress(invalidAddress)).toThrow();
    });

    it("should throw error for empty string", () => {
      expect(() => AddressUtils.cleanAddress("")).toThrow();
    });
  });

  describe("isValidAddress", () => {
    it("should return true for valid address", () => {
      expect(AddressUtils.isValidAddress(validAddress)).toBe(true);
      expect(AddressUtils.isValidAddress(validAddressLowerCase)).toBe(true);
    });

    it("should return false for invalid address", () => {
      expect(AddressUtils.isValidAddress(invalidAddress)).toBe(false);
      expect(AddressUtils.isValidAddress("")).toBe(false);
      expect(AddressUtils.isValidAddress("not-an-address")).toBe(false);
    });

    it("should return false for null or undefined", () => {
      expect(AddressUtils.isValidAddress(null as any)).toBe(false);
      expect(AddressUtils.isValidAddress(undefined as any)).toBe(false);
    });

    it("should handle address without 0x prefix", () => {
      const addressWithoutPrefix = validAddress.slice(2);
      expect(AddressUtils.isValidAddress(addressWithoutPrefix)).toBe(true);
    });
  });
});

describe("BigNumberUtils", () => {
  describe("parseBigInt", () => {
    it("should parse valid number string", () => {
      const result = BigNumberUtils.parseBigInt("123456789");
      expect(result).toBe(BigInt("123456789"));
      expect(typeof result).toBe("bigint");
    });

    it("should parse zero", () => {
      const result = BigNumberUtils.parseBigInt("0");
      expect(result).toBe(BigInt(0));
    });

    it("should parse large numbers", () => {
      const largeNumber = "123456789012345678901234567890";
      const result = BigNumberUtils.parseBigInt(largeNumber);
      expect(result).toBe(BigInt(largeNumber));
    });

    it("should throw error for invalid string", () => {
      expect(() => BigNumberUtils.parseBigInt("invalid")).toThrow(
        "Invalid amount"
      );
      expect(() => BigNumberUtils.parseBigInt("12.34")).toThrow(
        "Invalid amount"
      );
      expect(() => BigNumberUtils.parseBigInt("abc123")).toThrow(
        "Invalid amount"
      );
    });

    it("should handle empty string as zero", () => {
      const result = BigNumberUtils.parseBigInt("");
      expect(result).toBe(BigInt(0));
    });

    it("should handle negative numbers", () => {
      const result = BigNumberUtils.parseBigInt("-123");
      expect(result).toBe(BigInt(-123));
    });
  });

  describe("bytesToHex", () => {
    it("should convert bytes to hex string", () => {
      const bytes = new Uint8Array([0x01, 0x02, 0x03, 0xff]);
      const result = BigNumberUtils.bytesToHex(bytes);

      expect(result).toBe("0x010203ff");
      expect(result.startsWith("0x")).toBe(true);
    });

    it("should handle empty byte array", () => {
      const bytes = new Uint8Array([]);
      const result = BigNumberUtils.bytesToHex(bytes);

      expect(result).toBe("0x");
    });

    it("should handle single byte", () => {
      const bytes = new Uint8Array([0xab]);
      const result = BigNumberUtils.bytesToHex(bytes);

      expect(result).toBe("0xab");
    });

    it("should handle all zero bytes", () => {
      const bytes = new Uint8Array([0x00, 0x00, 0x00]);
      const result = BigNumberUtils.bytesToHex(bytes);

      expect(result).toBe("0x000000");
    });
  });
});
