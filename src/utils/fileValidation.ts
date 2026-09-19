/**
 * VoidCloud File Validation and Security Guardrails
 */

export const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB per single file

export const DISALLOWED_EXTENSIONS = new Set([
  'exe', 'bat', 'cmd', 'com', 'vbs', 'vbe', 'js', 'jse', 'wsf', 'wsh', 'scr', 'pif'
]);

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateUploadFile(file: { name: string; size: number }): ValidationResult {
  if (!file || !file.name) {
    return { valid: false, error: 'Invalid file reference.' };
  }

  if (file.size <= 0) {
    return { valid: false, error: 'Empty files (0 bytes) cannot be uploaded to vault.' };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: `File exceeds the maximum upload threshold of 500 MB.` };
  }

  const parts = file.name.split('.');
  if (parts.length > 1) {
    const ext = parts.pop()?.toLowerCase() || '';
    if (DISALLOWED_EXTENSIONS.has(ext)) {
      return { valid: false, error: `Security restriction: executable files (.${ext}) are not allowed.` };
    }
  }

  return { valid: true };
}

export function sanitizeFileName(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, '_').trim();
}
