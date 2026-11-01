import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryRateLimitStore } from '@/backend/middleware/rateLimiter';

describe('MemoryRateLimitStore', () => {
  let store: MemoryRateLimitStore;

  beforeEach(() => {
    store = new MemoryRateLimitStore();
  });

  afterEach(() => {
    store.destroy();
  });

  it('allows requests within the configured threshold', async () => {
    const key = 'test-ip-1';
    const limit = 3;
    const windowMs = 5000;

    const r1 = await store.incrementAndCheck(key, limit, windowMs);
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = await store.incrementAndCheck(key, limit, windowMs);
    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBe(1);

    const r3 = await store.incrementAndCheck(key, limit, windowMs);
    expect(r3.allowed).toBe(true);
    expect(r3.remaining).toBe(0);

    // 4th request exceeds limit
    const r4 = await store.incrementAndCheck(key, limit, windowMs);
    expect(r4.allowed).toBe(false);
    expect(r4.remaining).toBe(0);
    expect(r4.resetSeconds).toBeGreaterThan(0);
  });

  it('clears hits when reset is called', async () => {
    const key = 'test-ip-2';
    await store.incrementAndCheck(key, 1, 5000);
    const blocked = await store.incrementAndCheck(key, 1, 5000);
    expect(blocked.allowed).toBe(false);

    await store.reset(key);
    const allowedAfterReset = await store.incrementAndCheck(key, 1, 5000);
    expect(allowedAfterReset.allowed).toBe(true);
  });
});
