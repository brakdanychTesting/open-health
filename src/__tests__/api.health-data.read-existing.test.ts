import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    healthData: {
      findUniqueOrThrow: vi.fn(),
    },
  },
}));

import prisma from '@/lib/prisma';
import { GET } from '@/app/api/health-data/[id]/route';

const mockFind = vi.mocked(prisma.healthData.findUniqueOrThrow);

describe('health-data GET (current implementation: no auth/isolation)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns record when found', async () => {
    mockFind.mockResolvedValue({
      id: 'record-1',
      authorId: 'user-X',
      type: 'FILE',
      data: {},
      metadata: null,
      status: 'COMPLETED',
      fileType: null,
      filePath: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const req = new Request('http://localhost/api/health-data/record-1');
    const res = await GET(req as any, { params: Promise.resolve({ id: 'record-1' }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.healthData.id).toBe('record-1');
  });

  it('propagates error (missing record) from findUniqueOrThrow', async () => {
    mockFind.mockRejectedValue(new Error('Not found'));
    const req = new Request('http://localhost/api/health-data/missing');
    await expect(
      GET(req as any, { params: Promise.resolve({ id: 'missing' }) })
    ).rejects.toThrow('Not found');
  });
});