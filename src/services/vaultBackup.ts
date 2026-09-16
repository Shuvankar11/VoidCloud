import { ShieldedFile, VaultFolder, AuditLogItem, VaultBackupArchive, UserSession } from '../types';

export async function computeChecksum(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function createVaultBackupArchive(
  session: UserSession,
  files: ShieldedFile[],
  folders: VaultFolder[],
  auditLogs: AuditLogItem[]
): Promise<VaultBackupArchive> {
  // Strip raw Blobs since they cannot be serialized in JSON directly
  const sanitizedFiles: Omit<ShieldedFile, 'rawBlob'>[] = files.map((f) => {
    const { rawBlob, ...rest } = f;
    return rest;
  });

  const baseArchive = {
    version: '1.2.0',
    exportedAt: new Date().toISOString(),
    shieldedAddress: session.shieldedAddress,
    totalFiles: sanitizedFiles.length,
    totalFolders: folders.length,
    files: sanitizedFiles,
    folders,
    auditLogs,
  };

  const serialized = JSON.stringify(baseArchive);
  const checksum = await computeChecksum(serialized);

  return {
    ...baseArchive,
    checksum,
  };
}

export function downloadBackupFile(archive: VaultBackupArchive): void {
  const jsonStr = JSON.stringify(archive, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `voidcloud-backup-${archive.shieldedAddress.slice(0, 12)}-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function validateAndParseBackup(
  jsonString: string
): Promise<{ valid: boolean; archive?: VaultBackupArchive; error?: string }> {
  try {
    const parsed = JSON.parse(jsonString) as VaultBackupArchive;

    if (!parsed.version || !parsed.shieldedAddress || !Array.isArray(parsed.files)) {
      return { valid: false, error: 'Invalid VoidCloud backup structure or missing fields.' };
    }

    // Verify Checksum if present
    if (parsed.checksum) {
      const { checksum, ...rest } = parsed;
      const calculated = await computeChecksum(JSON.stringify(rest));
      if (calculated !== checksum) {
        console.warn('Backup checksum mismatch - archive may have been modified.');
      }
    }

    return { valid: true, archive: parsed };
  } catch (err: any) {
    return { valid: false, error: err.message || 'Failed to parse JSON backup archive.' };
  }
}
