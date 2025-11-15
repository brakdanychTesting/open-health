import {describe, it, expect, vi} from 'vitest';

vi.mock('file-type', () => ({ fileTypeFromBuffer: async () => null }));
vi.mock('fs', () => ({ writeFileSync: vi.fn() }), { virtual: true });

globalThis.fetch = vi.fn(async () => ({
  arrayBuffer: async () => new ArrayBuffer(4)
})) as any;

import {parseHealthData} from '@/lib/health-data/parser/pdf';

describe('PDF parsing privacy - invalid file', () => {
  it('rejects unsupported or malformed file types', async () => {
    await expect(parseHealthData({ file: 'http://localhost/uploads/malware.bin' } as any))
      .rejects.toThrow(/Invalid file type/i);
  });
});