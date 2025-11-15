import {describe, it, expect, vi} from 'vitest';

vi.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    healthData: {
      create: vi.fn(async ({ data }: any) => ({
        id: 'hd_test_1',
        type: data.type ?? 'FILE',
        data: data.data ?? {},
        metadata: null,
        status: data.status ?? 'COMPLETED',
        fileType: data.fileType ?? null,
        filePath: data.filePath ?? null,
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
        updatedAt: new Date('2025-01-01T00:00:00.000Z'),
      })),
      findFirst: vi.fn(),
      findMany: vi.fn()
    }
  }
}));

vi.mock('@/auth', () => ({
  auth: async () => ({ user: { id: 'u1' } })
}));

import {POST} from '@/app/api/health-data/route';

describe('health-data input validation', () => {
  it('throws when content-type is unsupported (formData() precondition)', async () => {
    const req = new Request('http://localhost/api/health-data', {
      method: 'POST',
      headers: { 'content-type': 'text/plain' },
      body: 'raw text'
    });
    await expect(POST(req as any)).rejects.toThrow(/Content-Type was not one of/i);
  });

  it('accepts JSON when content-type is application/json', async () => {
    const req = new Request('http://localhost/api/health-data', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'FILE', data: {} })
    });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe('hd_test_1');
  });
});