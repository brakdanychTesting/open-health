import {describe, it, expect, vi} from 'vitest';

function makeKey() {
  return Buffer.alloc(32, 7).toString('base64'); // 32 bytes -> base64
}

describe('encryption', () => {
  it('encrypts and decrypts with the correct key', async () => {
    vi.stubEnv('ENCRYPTION_KEY', makeKey());
    const mod = await import('@/lib/encryption');
    const plaintext = 'very-sensitive-health-data';
    const cipher = mod.encrypt(plaintext);
    expect(typeof cipher).toBe('string');
    const back = mod.decrypt(cipher);
    expect(back).toBe(plaintext);
  });

  it('fails to decrypt with the wrong key', async () => {
    vi.stubEnv('ENCRYPTION_KEY', makeKey());
    const mod = await import('@/lib/encryption');
    const ciphertext = mod.encrypt('secret');

    vi.stubEnv('ENCRYPTION_KEY', Buffer.alloc(32, 9).toString('base64'));
    await expect(() => mod.decrypt(ciphertext)).toThrow();
  });
});