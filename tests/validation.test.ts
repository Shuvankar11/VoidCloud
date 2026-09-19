import { describe, it, expect } from 'vitest';
import { validateUploadFile, sanitizeFileName, MAX_FILE_SIZE_BYTES } from '../src/utils/fileValidation';

describe('VoidCloud File Validation Utilities Unit Tests', () => {
  it('should allow valid files within size threshold', () => {
    const res = validateUploadFile({ name: 'document.pdf', size: 1024 * 1024 });
    expect(res.valid).toBe(true);
    expect(res.error).toBeUndefined();
  });

  it('should reject empty 0-byte files', () => {
    const res = validateUploadFile({ name: 'empty.txt', size: 0 });
    expect(res.valid).toBe(false);
    expect(res.error).toContain('Empty files');
  });

  it('should reject files exceeding 500 MB', () => {
    const res = validateUploadFile({ name: 'huge_iso.img', size: MAX_FILE_SIZE_BYTES + 100 });
    expect(res.valid).toBe(false);
    expect(res.error).toContain('exceeds the maximum upload threshold');
  });

  it('should reject dangerous executable extensions', () => {
    const exeRes = validateUploadFile({ name: 'payload.exe', size: 5000 });
    expect(exeRes.valid).toBe(false);
    expect(exeRes.error).toContain('executable files (.exe) are not allowed');

    const batRes = validateUploadFile({ name: 'script.bat', size: 500 });
    expect(batRes.valid).toBe(false);
    expect(batRes.error).toContain('executable files (.bat) are not allowed');
  });

  it('should sanitize illegal filesystem characters from file names', () => {
    const clean = sanitizeFileName('my*confidential/contract:v1.pdf');
    expect(clean).toBe('my_confidential_contract_v1.pdf');
  });
});
