import {describe, it, expect, vi, beforeEach} from 'vitest';

vi.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    healthData: {
      findUniqueOrThrow: vi.fn(),
    },
  },
}));

vi.mock('@/auth', () => ({
  __esModule: true,
  auth: vi.fn(),
}));

import prisma from '@/lib/prisma';
import {GET} from '@/app/api/health-data/[id]/route';
import {auth} from '@/auth';

const mockFind = vi.mocked(prisma.healthData.findUniqueOrThrow);
const mockAuth = vi.mocked(auth);

describe('health-data GET cross-tenant isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 403 when requesting a resource owned by another user', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'user-a' },
    } as any);

    mockFind.mockResolvedValue({
      id: 'hd-b',
      authorId: 'user-b',
      type: 'FILE',
      data: {},
      metadata: null,
      status: 'COMPLETED',
      fileType: null,
      filePath: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const req = new Request('http://localhost/api/health-data/hd-b', { method: 'GET' });
    const res = await (GET as any)(req, { params: Promise.resolve({ id: 'hd-b' }) });

    expect(res.status).toBe(403);
  });

  it('returns 200 for owner', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'user-a' },
    } as any);

    mockFind.mockResolvedValue({
      id: 'hd-a',
      authorId: 'user-a',
      type: 'FILE',
      data: {},
      metadata: null,
      status: 'COMPLETED',
      fileType: null,
      filePath: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const req = new Request('http://localhost/api/health-data/hd-a', { method: 'GET' });
    const res = await (GET as any)(req, { params: Promise.resolve({ id: 'hd-a' }) });

    expect(res.status).toBe(200);
  });
});
