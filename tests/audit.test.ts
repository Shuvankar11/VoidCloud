import { describe, it, expect, beforeEach } from 'vitest';
import {
  createAuditLog,
  getStoredAuditLogs,
  saveStoredAuditLogs,
  filterAuditLogsByDateRange,
  sanitizeAuditLogsForExport,
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
      'FILE_ENCRYPT_UPLOAD',
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
    expect(log.action).toBe('FILE_ENCRYPT_UPLOAD');
    expect(log.severity).toBe('success');
    expect(log.targetName).toBe('confidential-deck.pdf');
    expect(log.proofHash).toBe('0x1234567890abcdef1234567890abcdef');
    expect(log.txHash).toBe('0x9876543210fedcba');
    expect(Date.parse(log.timestamp)).toBeGreaterThan(0);
  });

  it('correctly persists and retrieves audit logs from storage per address', () => {
    const item1 = createAuditLog('ZK_PROOF_GENERATED', 'Vault initialized with 20GB zero-knowledge quota', {
      severity: 'info',
    });
    const item2 = createAuditLog('ZK_FAUCET_CLAIMED', 'Claimed +20GB ZK Preprod Bonus faucet allocation', {
      severity: 'success',
    });

    saveStoredAuditLogs('user-alice', [item2, item1]);

    const retrieved = getStoredAuditLogs('user-alice');
    expect(retrieved.length).toBe(2);
    expect(retrieved[0].action).toBe('ZK_FAUCET_CLAIMED');
    expect(retrieved[1].action).toBe('ZK_PROOF_GENERATED');

    // Separate address should be empty
    const bobLogs = getStoredAuditLogs('user-bob');
    expect(bobLogs.length).toBe(0);
  });

  it('enforces maximum 150 items limit when saving logs to prevent overflow', () => {
    const manyLogs: AuditLogItem[] = Array.from({ length: 200 }, (_, i) =>
      createAuditLog('FILE_ENCRYPT_UPLOAD', `Uploaded file #${i}`)
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

  it('filters audit logs by date range accurately', () => {
    const log1 = createAuditLog('FILE_ENCRYPT_UPLOAD', 'First log');
    log1.timestamp = '2026-09-01T10:00:00.000Z';

    const log2 = createAuditLog('ZK_FAUCET_CLAIMED', 'Second log');
    log2.timestamp = '2026-09-15T10:00:00.000Z';

    const log3 = createAuditLog('FILE_TRASHED', 'Third log');
    log3.timestamp = '2026-09-20T10:00:00.000Z';

    const filtered = filterAuditLogsByDateRange(
      [log1, log2, log3],
      new Date('2026-09-10T00:00:00.000Z'),
      new Date('2026-09-18T00:00:00.000Z')
    );

    expect(filtered.length).toBe(1);
    expect(filtered[0].action).toBe('ZK_FAUCET_CLAIMED');
  });

  it('sanitizes audit logs for JSON export without throwing', () => {
    const log = createAuditLog('ZK_PROOF_GENERATED', 'Init', { proofHash: '0xabc' });
    const jsonStr = sanitizeAuditLogsForExport([log]);
    expect(jsonStr).toContain('"proofHash": "0xabc"');
    const parsed = JSON.parse(jsonStr);
    expect(parsed.length).toBe(1);
  });
});

