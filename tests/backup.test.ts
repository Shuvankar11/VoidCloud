import { describe, it, expect } from 'vitest';
import {
  computeChecksum,
  createVaultBackupArchive,
  validateAndParseBackup,
} from '../src/services/vaultBackup';
import { ShieldedFile, VaultFolder, AuditLogItem, UserSession } from '../src/types';

describe('VoidCloud Vault Backup & Disaster Recovery Unit Tests', () => {
  const dummySession: UserSession = {
    userSecret: '0x1234567890abcdef',
    shieldedAddress: '0xmidnight1preprod998877665544332211',
    quotaGB: 40,
    registered: true,
    bonusClaimed: true,
  };

  const dummyFiles: ShieldedFile[] = [
    {
      id: 'f-1',
      name: 'preprod-contract.compact',
      sizeBytes: 1024 * 12,
      uploadedAt: 1726480000000,
      commitment: '0xcommit1',
      status: 'shielded',
      isStarred: true,
      tags: ['Midnight', 'SmartContract'],
    },
    {
      id: 'f-2',
      name: 'financial-report.pdf',
      sizeBytes: 1024 * 350,
      uploadedAt: 1726485000000,
      commitment: '0xcommit2',
      status: 'shielded',
      isStarred: false,
      folderId: 'folder-finance',
      tags: ['Financial'],
    },
  ];

  const dummyFolders: VaultFolder[] = [
    {
      id: 'folder-finance',
      name: 'Finance & Compliance',
      color: 'emerald',
      createdAt: 1726470000000,
    },
  ];

  const dummyAuditLogs: AuditLogItem[] = [
    {
      id: 'audit-1',
      timestamp: '2026-09-16T12:00:00.000Z',
      action: 'init_vault',
      details: 'Vault initialized with 20GB zero-knowledge quota',
      severity: 'info',
    },
  ];

  it('computes deterministic SHA-256 checksum for string content', async () => {
    const text = 'VoidCloud ZK Storage on Midnight Network';
    const hash1 = await computeChecksum(text);
    const hash2 = await computeChecksum(text);

    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(/^[0-9a-f]{64}$/);
  });

  it('creates complete vault backup archive with stripped rawBlobs and calculated checksum', async () => {
    const archive = await createVaultBackupArchive(
      dummySession,
      dummyFiles,
      dummyFolders,
      dummyAuditLogs
    );

    expect(archive).toBeDefined();
    expect(archive.version).toBe('1.2.0');
    expect(archive.shieldedAddress).toBe(dummySession.shieldedAddress);
    expect(archive.totalFiles).toBe(2);
    expect(archive.totalFolders).toBe(1);
    expect(archive.files.length).toBe(2);
    expect(archive.folders.length).toBe(1);
    expect(archive.auditLogs.length).toBe(1);
    expect(archive.checksum).toMatch(/^[0-9a-f]{64}$/);

    // Verify rawBlob is omitted for serializability
    archive.files.forEach((f) => {
      expect((f as any).rawBlob).toBeUndefined();
    });
  });

  it('successfully validates and parses valid backup archive JSON', async () => {
    const archive = await createVaultBackupArchive(
      dummySession,
      dummyFiles,
      dummyFolders,
      dummyAuditLogs
    );

    const jsonStr = JSON.stringify(archive);
    const result = await validateAndParseBackup(jsonStr);

    expect(result.valid).toBe(true);
    expect(result.archive).toBeDefined();
    expect(result.archive?.version).toBe('1.2.0');
    expect(result.archive?.files.length).toBe(2);
    expect(result.archive?.folders[0].name).toBe('Finance & Compliance');
  });

  it('rejects corrupted or malformed JSON backup files', async () => {
    const malformedJson = '{"version": "1.2.0", "shieldedAddress":';
    const result = await validateAndParseBackup(malformedJson);

    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.archive).toBeUndefined();
  });

  it('rejects JSON missing required VoidCloud schema fields', async () => {
    const invalidSchema = JSON.stringify({
      version: '1.2.0',
      // missing shieldedAddress and files
      randomKey: 'randomValue',
    });

    const result = await validateAndParseBackup(invalidSchema);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid VoidCloud backup structure');
  });
});
