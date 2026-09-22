import { describe, it, expect } from 'vitest';
import { formatBytes, truncateAddress, formatDate, formatDateTime } from '../src/utils/formatters';

describe('VoidCloud Formatters Utility Unit Tests', () => {
  describe('formatBytes', () => {
    it('returns "0 Bytes" for zero bytes', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
    });

    it('formats bytes correctly', () => {
      expect(formatBytes(500)).toBe('500 Bytes');
    });

    it('formats kilobytes correctly', () => {
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(2048)).toBe('2 KB');
    });

    it('formats megabytes correctly', () => {
      expect(formatBytes(1024 * 1024)).toBe('1 MB');
      expect(formatBytes(5.5 * 1024 * 1024)).toBe('5.5 MB');
    });

    it('formats gigabytes correctly', () => {
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
      expect(formatBytes(40 * 1024 * 1024 * 1024)).toBe('40 GB');
    });
  });

  describe('truncateAddress', () => {
    it('returns empty string for empty input', () => {
      expect(truncateAddress('')).toBe('');
    });

    it('returns full address if length is smaller than or equal to start + end', () => {
      expect(truncateAddress('0x12345678')).toBe('0x12345678');
    });

    it('truncates long addresses with ellipsis', () => {
      const addr = 'mn_addr_preprod1v3emfl60hcpmezm53ef83um9cp54wltve56d0yqqvu8h9v7g8lws53thqn';
      const truncated = truncateAddress(addr, 6, 4);
      expect(truncated).toBe('mn_add...thqn');
      expect(truncated.length).toBeLessThan(addr.length);
    });
  });

  describe('formatDate & formatDateTime', () => {
    it('handles invalid date input gracefully', () => {
      expect(formatDate('invalid-date-string')).toBe('Invalid Date');
      expect(formatDateTime('invalid-date-string')).toBe('Invalid Date');
    });

    it('formats valid ISO date strings', () => {
      const formatted = formatDate('2026-09-19T10:00:00.000Z');
      expect(formatted).toContain('2026');
      expect(formatted).toContain('Sep');
    });
  });
});
