import { describe, it, expect, beforeEach } from 'vitest';
import {
  createAuditLog,
  getStoredAuditLogs,
  saveStoredAuditLogs,
} from '../src/services/auditLogger';
import { AuditLogItem } from '../src/types';

describe('VoidCloud Cryptographic Audit Trail Unit Tests', () => {
  let memoryStorage: Record<string, string> = {};

  beforeEach(() => {
    memoryStorage = {};
    (globalThis as any).localStorage = {
      getItem: (key: string) => memoryStorage[key] || null,
      setItem: (key: string, value: string) => {
        memoryStorage[key] = value;
      },
      removeItem: (key: string) => {
        delete memoryStorage[key];
      },
      clear: () => {
        memoryStorage = {};
      },
    };
  });

  it('creates an audit log item with unique ID, timestamp, and metadata', () => {
    const log = createAuditLog(
      'file_upload',
      'Encrypted and committed file to Midnight Preprod',
      {
        targetName: 'confidential-deck.pdf',
        proofHash: '0x1234567890abcdef1234567890abcdef',
        txHash: '0x9876543210fedcba',
        severity: 'success',
      }
    );

    expect(log).toBeDefined();
    expect(log.id).toContain('audit_');
    expect(log.action).toBe('file_upload');
    expect(log.severity).toBe('success');
    expect(log.targetName).toBe('confidential-deck.pdf');
    expect(log.proofHash).toBe('0x1234567890abcdef1234567890abcdef');
    expect(log.txHash).toBe('0x9876543210fedcba');
    expect(Date.parse(log.timestamp)).toBeGreaterThan(0);
  });

  it('correctly persists and retrieves audit logs from storage per address', () => {
    const item1 = createAuditLog('init_vault', 'Vault initialized with 20GB zero-knowledge quota', {
      severity: 'info',
    });
    const item2 = createAuditLog('bonus_claim', 'Claimed +20GB ZK Preprod Bonus faucet allocation', {
      severity: 'success',
    });

    saveStoredAuditLogs('user-alice', [item2, item1]);

    const retrieved = getStoredAuditLogs('user-alice');
    expect(retrieved.length).toBe(2);
    expect(retrieved[0].action).toBe('bonus_claim');
    expect(retrieved[1].action).toBe('init_vault');

    // Separate address should be empty
    const bobLogs = getStoredAuditLogs('user-bob');
    expect(bobLogs.length).toBe(0);
  });

  it('enforces maximum 150 items limit when saving logs to prevent overflow', () => {
    const manyLogs: AuditLogItem[] = Array.from({ length: 200 }, (_, i) =>
      createAuditLog('file_upload', `Uploaded file #${i}`)
    );

    saveStoredAuditLogs('user-test', manyLogs);
    const stored = getStoredAuditLogs('user-test');
    expect(stored.length).toBe(150);
  });

  it('safely handles corrupted storage without throwing', () => {
    memoryStorage['voidcloud_audit_logs_corrupted'] = '{ invalid_json_syntax';
    const logs = getStoredAuditLogs('corrupted');
    expect(logs).toEqual([]);
  });
});
