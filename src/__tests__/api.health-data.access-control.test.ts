import {describe, it, expect, vi, beforeEach} from 'vitest';

const created: any = {};
const queried: any = {};
vi.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    healthData: {
      create: vi.fn(async ({data}: any) => {
        created.data = data;
        return { id: 'hd1', ...data };
      }),
      findMany: vi.fn(async ({ where }: any = {}) => {
        queried.where = where;
        const authorId = where?.authorId;
        return [
          { id: 'hd1', authorId, type: 'FILE', data: { test: 'x' } }
        ];
      }),
      findFirst: vi.fn(async () => {
        return null;
      }),
    }
  }
}));

vi.mock('@/auth', () => ({
  __esModule: true,
  auth: vi.fn(),
}));
import {auth as mockAuth} from '@/auth';

import {POST, GET} from '@/app/api/health-data/route';

describe('health-data POST access control', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses session.user.id as authorId even if body tries to spoof it', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-123' } });

    const payload = {
      type: 'FILE',
      data: { test: 'x', authorId: 'attacker' }
    };
    const req = new Request('http://localhost/api/health-data', {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify(payload)
    });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    expect(created.data.authorId).toBe('user-123');
  });

  it('returns 401 when no session', async () => {
    mockAuth.mockResolvedValue(null);

    const req = new Request('http://localhost/api/health-data', {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({ type: 'FILE', data: { test: 'x' } })
    });
    const res = await POST(req as any);
    expect(res.status).toBe(401);
  });
});

describe('health-data GET access control', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queried.where = undefined;
  });

  it('allows authenticated user to GET their own health data', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-123' } });

    const req = new Request('http://localhost/api/health-data?authorId=user-123', {
      method: 'GET',
    });

    const res = await GET(req as any);
    expect(res.status).toBe(200);
    expect(queried.where?.authorId).toBe('user-123');
  });

  it('returns 403 when trying to GET another user health data', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-123' } });

    const req = new Request('http://localhost/api/health-data?authorId=other-999', {
      method: 'GET',
    });

    const res = await GET(req as any);
    expect(res.status).toBe(403);
  });

  it('ignores authorId query param and scopes to session user', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-123' } });

    const req = new Request('http://localhost/api/health-data?authorId=other-999', {
      method: 'GET',
    });

    const res = await GET(req as any);
    expect(res.status).toBe(200);
    expect(queried.where?.authorId).toBe('user-123');
  });
});