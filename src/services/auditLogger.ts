import { AuditLogItem, AuditActionType } from '../types';

const AUDIT_LOG_STORAGE_PREFIX = 'voidcloud_audit_logs_';

export function getStoredAuditLogs(address = 'default'): AuditLogItem[] {
  try {
    const raw = localStorage.getItem(`${AUDIT_LOG_STORAGE_PREFIX}${address}`);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse audit logs from storage:', err);
    return [];
  }
}

export function saveStoredAuditLogs(address = 'default', logs: AuditLogItem[]): void {
  try {
    // Keep the most recent 150 events to prevent unbounded localStorage growth
    const trimmed = logs.slice(0, 150);
    localStorage.setItem(`${AUDIT_LOG_STORAGE_PREFIX}${address}`, JSON.stringify(trimmed));
  } catch (err) {
    console.error('Failed to save audit logs to storage:', err);
  }
}

export function createAuditLog(
  action: AuditActionType,
  details: string,
  options?: {
    targetName?: string;
    proofHash?: string;
    txHash?: string;
    severity?: 'info' | 'success' | 'warning' | 'security';
  }
): AuditLogItem {
  return {
    id: 'audit_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    timestamp: new Date().toISOString(),
    action,
    details,
    targetName: options?.targetName,
    proofHash: options?.proofHash,
    txHash: options?.txHash,
    severity: options?.severity || 'info',
  };
}

export function filterAuditLogsByDateRange(
  logs: AuditLogItem[],
  startDate?: Date,
  endDate?: Date
): AuditLogItem[] {
  return logs.filter(log => {
    const time = new Date(log.timestamp).getTime();
    if (startDate && time < startDate.getTime()) return false;
    if (endDate && time > endDate.getTime()) return false;
    return true;
  });
}

export function sanitizeAuditLogsForExport(logs: AuditLogItem[]): string {
  const sanitized = logs.map(l => ({
    id: l.id,
    timestamp: l.timestamp,
    action: l.action,
    details: l.details,
    severity: l.severity,
    proofHash: l.proofHash || null,
    txHash: l.txHash || null
  }));
  return JSON.stringify(sanitized, null, 2);
}
