import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('fs/promises', () => ({
  __esModule: true,
  default: {
    readFile: vi.fn(async (filePath: string) => {
      if (filePath.includes('document-2024-01-15.pdf') ||
          filePath.includes('blood-test-results.pdf') ||
          filePath.includes('health_record_123.pdf')) {
        return Buffer.from('Mock file content');
      }
      throw Object.assign(new Error('ENOENT'), { code: 'ENOENT' });
    }),
  },
}));

import { GET } from '@/app/api/static/uploads/[filename]/route';

describe('static uploads - path traversal protection (aligned with current route)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects traversal patterns (expects plain text "Invalid filename")', async () => {
    const attacks = [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\config\\sam',
      '....//....//etc/passwd',
      '..%2F..%2F..%2Fetc%2Fpasswd',
      '..%252F..%252Fetc%252Fpasswd',
      '/etc/passwd',
      'C:\\Windows\\System32\\config\\sam',
      'legitimate.pdf\x00../../etc/passwd',
    ];
    for (const fname of attacks) {
      const req = new Request(`http://localhost/api/static/uploads/${encodeURIComponent(fname)}`);
      const res = await GET(req as any, { params: Promise.resolve({ filename: fname }) });
      expect(res.status).toBe(400);
      const text = await res.text();
      expect(text.toLowerCase()).toContain('invalid');
    }
  });

  it('serves allowed filenames (pdf pattern) when file exists', async () => {
    const allowed = [
      'document-2024-01-15.pdf',
      'blood-test-results.pdf',
      'health_record_123.pdf',
    ];
    for (const fname of allowed) {
      const req = new Request(`http://localhost/api/static/uploads/${fname}`);
      const res = await GET(req as any, { params: Promise.resolve({ filename: fname }) });
      expect(res.status).toBe(200);
      const buf = await res.arrayBuffer();
      expect(buf.byteLength).toBeGreaterThan(0);
    }
  });

  it('throws (ENOENT) for allowed pattern but missing file', async () => {
    const missing = 'not_found_file.pdf';
    const req = new Request(`http://localhost/api/static/uploads/${missing}`);
    await expect(
      GET(req as any, { params: Promise.resolve({ filename: missing }) })
    ).rejects.toThrow();
  });
});
