import {describe, it, expect, vi} from 'vitest';

vi.mock('@/auth', () => ({ auth: (fn: (req: unknown) => unknown) => fn }));

import middleware from '@/middleware';

type MockReq = { nextUrl: URL; auth?: unknown };
type MiddlewareFn = (req: MockReq) => Response | null;

const mw = middleware as unknown as MiddlewareFn;
const mkReq = (path: string, auth?: unknown): MockReq => ({
  nextUrl: new URL(`http://localhost${path}`),
  auth,
});

describe('auth middleware', () => {
  it('allows /login', () => {
    const res = mw(mkReq('/login'));
    expect(res).toBeNull();
  });

  it('redirects unauthenticated protected path', () => {
    const res = mw(mkReq('/dashboard'));
    expect(res?.status).toBe(302);
    expect(res?.headers.get('location')).toBe('http://localhost/login');
  });

  it('passes authenticated', () => {
    const res = mw(mkReq('/dashboard', {}));
    expect(res).toBeNull();
  });
});