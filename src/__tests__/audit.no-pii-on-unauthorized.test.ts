import {describe, it, expect, vi} from 'vitest';

vi.mock('@/auth', () => ({ auth: async () => null }));

import {POST} from '@/app/api/health-data/route';

describe('audit logging - no PII on unauthorized', () => {
  it('does not log request body when unauthorized', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const sensitive = { num: '123-45-6789', diagnosis: 'HIV' };
    const req = new Request('http://localhost/api/health-data', {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify(sensitive)
    });

    const res = await POST(req as any);
    expect(res.status).toBe(401);
    expect(logSpy).not.toHaveBeenCalled();
    expect(
      errSpy.mock.calls.some(call => JSON.stringify(call).includes('123-45-6789'))
    ).toBe(false);

    logSpy.mockRestore();
    errSpy.mockRestore();
  });
});