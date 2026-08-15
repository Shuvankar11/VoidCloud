import { describe, it, expect, beforeEach } from 'vitest';
import crypto from 'node:crypto';

/**
 * VoidCloud Compact State Machine Simulator & ZK Verifier
 * Mimics the exact ledger constraints defined in contracts/voidcloud.compact
 */
class VoidCloudContractSimulator {
  public totalRegisteredUsers: bigint = 0n;
  public totalShieldedStorageAllocated: bigint = 0n; // in GB
  public bonusNullifiers: Set<string> = new Set();

  /**
   * Helper to derive the persistent hash nullifier matching Compact persistent_hash
   */
  public static deriveNullifier(userSecret: Uint8Array): string {
    const salt = Buffer.from('voidcloud:testnet:faucet_nullifier');
    const hash = crypto.createHash('sha256').update(Buffer.concat([Buffer.from(userSecret), salt])).digest('hex');
    return '0x' + hash;
  }

  /**
   * Helper to derive file commitment hash
   */
  public static deriveFileCommitment(fileSecret: Uint8Array): string {
    const salt = Buffer.from('voidcloud:file:commitment');
    const hash = crypto.createHash('sha256').update(Buffer.concat([Buffer.from(fileSecret), salt])).digest('hex');
    return '0x' + hash;
  }

  /**
   * Circuit: initializeUserStorage()
   */
  public initializeUserStorage(witness: { userSecret: Uint8Array }): { success: boolean; quotaGB: number } {
    if (!witness.userSecret || witness.userSecret.length !== 32) {
      throw new Error('Invalid zero-knowledge secret entropy: Must be exactly 32 bytes');
    }

    // Check non-zero
    const isZero = witness.userSecret.every(b => b === 0);
    if (isZero) {
      throw new Error('Invalid zero-knowledge secret entropy: Secret cannot be zero bytes');
    }

    this.totalRegisteredUsers += 1n;
    this.totalShieldedStorageAllocated += 20n;

    return { success: true, quotaGB: 20 };
  }

  /**
   * Circuit: claimTestnetBonus(nullifier)
   */
  public claimTestnetBonus(
    nullifier: string,
    witness: { userSecret: Uint8Array }
  ): { success: boolean; bonusGB: number } {
    const expectedNullifier = VoidCloudContractSimulator.deriveNullifier(witness.userSecret);
    if (nullifier !== expectedNullifier) {
      throw new Error('Nullifier does not match private witness secret');
    }

    if (this.bonusNullifiers.has(nullifier)) {
      throw new Error('Testnet bonus already claimed for this nullifier');
    }

    this.bonusNullifiers.add(nullifier);
    this.totalShieldedStorageAllocated += 20n;

    return { success: true, bonusGB: 20 };
  }

  /**
   * Circuit: verifyStorageQuotaCommitment
   */
  public verifyStorageQuotaCommitment(
    userNullifier: string,
    fileCommitment: string,
    isBonusClaimed: boolean,
    witness: { fileCommitmentSecret: Uint8Array }
  ): boolean {
    const expectedCommitment = VoidCloudContractSimulator.deriveFileCommitment(witness.fileCommitmentSecret);
    if (fileCommitment !== expectedCommitment) {
      throw new Error('Invalid file commitment proof');
    }

    if (isBonusClaimed) {
      if (!this.bonusNullifiers.has(userNullifier)) {
        throw new Error('Bonus tier verification failed: Nullifier not registered on-chain');
      }
    }

    return true;
  }
}

describe('VoidCloud Midnight Compact Contract Suite', () => {
  let contract: VoidCloudContractSimulator;

  beforeEach(() => {
    contract = new VoidCloudContractSimulator();
  });

  describe('1. Initial Ledger State', () => {
    it('should initialize ledger state with zero users, zero storage, and empty nullifier set', () => {
      expect(contract.totalRegisteredUsers).toBe(0n);
      expect(contract.totalShieldedStorageAllocated).toBe(0n);
      expect(contract.bonusNullifiers.size).toBe(0);
    });
  });

  describe('2. initializeUserStorage Circuit', () => {
    it('should successfully register a user and allocate baseline 20 GB shielded storage', () => {
      const userSecret = crypto.randomBytes(32);
      const res = contract.initializeUserStorage({ userSecret: new Uint8Array(userSecret) });

      expect(res.success).toBe(true);
      expect(res.quotaGB).toBe(20);
      expect(contract.totalRegisteredUsers).toBe(1n);
      expect(contract.totalShieldedStorageAllocated).toBe(20n);
    });

    it('should reject registration if user secret witness is malformed or invalid length', () => {
      const invalidSecret = new Uint8Array(16); // Only 16 bytes instead of 32
      expect(() => {
        contract.initializeUserStorage({ userSecret: invalidSecret });
      }).toThrowError(/Invalid zero-knowledge secret entropy/);
    });

    it('should reject registration if user secret witness is all zeroes', () => {
      const zeroSecret = new Uint8Array(32); // All zeros
      expect(() => {
        contract.initializeUserStorage({ userSecret: zeroSecret });
      }).toThrowError(/Secret cannot be zero bytes/);
    });
  });

  describe('3. claimTestnetBonus Circuit & ZK Nullifier Protection', () => {
    it('should successfully claim 20 GB bonus with a valid derived nullifier', () => {
      const userSecret = new Uint8Array(crypto.randomBytes(32));
      contract.initializeUserStorage({ userSecret });

      const nullifier = VoidCloudContractSimulator.deriveNullifier(userSecret);
      const res = contract.claimTestnetBonus(nullifier, { userSecret });

      expect(res.success).toBe(true);
      expect(res.bonusGB).toBe(20);
      expect(contract.bonusNullifiers.has(nullifier)).toBe(true);
      expect(contract.totalShieldedStorageAllocated).toBe(40n); // 20 initial + 20 bonus
    });

    it('should reject bonus claim if nullifier does not match the private witness secret', () => {
      const userSecretA = new Uint8Array(crypto.randomBytes(32));
      const userSecretB = new Uint8Array(crypto.randomBytes(32));

      contract.initializeUserStorage({ userSecret: userSecretA });

      // Nullifier derived from User B's secret, presented with User A's secret
      const invalidNullifier = VoidCloudContractSimulator.deriveNullifier(userSecretB);

      expect(() => {
        contract.claimTestnetBonus(invalidNullifier, { userSecret: userSecretA });
      }).toThrowError(/Nullifier does not match private witness secret/);
    });

    it('CRITICAL: should reject duplicate bonus claims with the same nullifier (Double-Claim Attack Prevention)', () => {
      const userSecret = new Uint8Array(crypto.randomBytes(32));
      contract.initializeUserStorage({ userSecret });

      const nullifier = VoidCloudContractSimulator.deriveNullifier(userSecret);

      // First claim: Success
      contract.claimTestnetBonus(nullifier, { userSecret });
      expect(contract.totalShieldedStorageAllocated).toBe(40n);

      // Second claim attempt with identical nullifier: MUST REJECT
      expect(() => {
        contract.claimTestnetBonus(nullifier, { userSecret });
      }).toThrowError(/Testnet bonus already claimed for this nullifier/);

      // Storage should NOT increase on rejected duplicate attempt
      expect(contract.totalShieldedStorageAllocated).toBe(40n);
      expect(contract.bonusNullifiers.size).toBe(1);
    });
  });

  describe('4. Multi-User Concurrency & Shielded Isolation', () => {
    it('should accurately track multiple users and allocate independent quotas', () => {
      const user1Secret = new Uint8Array(crypto.randomBytes(32));
      const user2Secret = new Uint8Array(crypto.randomBytes(32));
      const user3Secret = new Uint8Array(crypto.randomBytes(32));

      // Register all 3 users
      contract.initializeUserStorage({ userSecret: user1Secret });
      contract.initializeUserStorage({ userSecret: user2Secret });
      contract.initializeUserStorage({ userSecret: user3Secret });

      expect(contract.totalRegisteredUsers).toBe(3n);
      expect(contract.totalShieldedStorageAllocated).toBe(60n); // 3 * 20 GB

      // User 1 & User 3 claim bonuses
      const nullifier1 = VoidCloudContractSimulator.deriveNullifier(user1Secret);
      const nullifier3 = VoidCloudContractSimulator.deriveNullifier(user3Secret);

      contract.claimTestnetBonus(nullifier1, { userSecret: user1Secret });
      contract.claimTestnetBonus(nullifier3, { userSecret: user3Secret });

      expect(contract.bonusNullifiers.size).toBe(2);
      expect(contract.totalShieldedStorageAllocated).toBe(100n); // 60 + 20 + 20 = 100 GB
    });
  });

  describe('5. Zero-Knowledge File Commitment & Quota Verification', () => {
    it('should verify file encryption commitment when bonus is active', () => {
      const userSecret = new Uint8Array(crypto.randomBytes(32));
      const fileSecret = new Uint8Array(crypto.randomBytes(32));

      contract.initializeUserStorage({ userSecret });
      const nullifier = VoidCloudContractSimulator.deriveNullifier(userSecret);
      contract.claimTestnetBonus(nullifier, { userSecret });

      const fileCommitment = VoidCloudContractSimulator.deriveFileCommitment(fileSecret);

      const isValid = contract.verifyStorageQuotaCommitment(
        nullifier,
        fileCommitment,
        true,
        { fileCommitmentSecret: fileSecret }
      );

      expect(isValid).toBe(true);
    });

    it('should fail quota verification if claiming bonus tier without on-chain nullifier', () => {
      const userSecret = new Uint8Array(crypto.randomBytes(32));
      const fileSecret = new Uint8Array(crypto.randomBytes(32));

      contract.initializeUserStorage({ userSecret });
      const unverifiedNullifier = VoidCloudContractSimulator.deriveNullifier(userSecret);
      const fileCommitment = VoidCloudContractSimulator.deriveFileCommitment(fileSecret);

      // Attempt bonus-tier quota verification WITHOUT calling claimTestnetBonus first
      expect(() => {
        contract.verifyStorageQuotaCommitment(
          unverifiedNullifier,
          fileCommitment,
          true,
          { fileCommitmentSecret: fileSecret }
        );
      }).toThrowError(/Bonus tier verification failed/);
    });
  });
});
