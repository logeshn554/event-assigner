import { describe, it, expect } from 'vitest';
import { LruTtlCache, generatePlanCacheKey } from '@/backend/services/cache';
import type { EventInput } from '@/backend/schemas/eventInputSchema';

describe('LruTtlCache & Cache Key Generation', () => {
  it('stores and retrieves cached entries before TTL expires', async () => {
    const cache = new LruTtlCache<string>(5, 1000);
    await cache.set('k1', 'val1');

    const retrieved = await cache.get('k1');
    expect(retrieved).toBe('val1');
  });

  it('evicts the oldest item when capacity limit is reached', async () => {
    const cache = new LruTtlCache<string>(2, 10000);
    await cache.set('a', '1');
    await cache.set('b', '2');
    await cache.set('c', '3'); // should evict 'a'

    expect(await cache.get('a')).toBeNull();
    expect(await cache.get('b')).toBe('2');
    expect(await cache.get('c')).toBe('3');
  });

  it('produces identical cache keys for normalized variations of user input', () => {
    const input1: EventInput = {
      eventType: 'wedding',
      date: '2027-05-10',
      city: '  Mumbai  ',
      guestCount: 200,
      totalBudget: 1000000,
      currency: 'INR',
      themeStyle: 'ROYAL',
      preferences: 'test',
      culturalOrDietaryNotes: 'veg'
    };

    const input2: EventInput = {
      eventType: 'wedding',
      date: '2027-05-10',
      city: 'mumbai',
      guestCount: 200,
      totalBudget: 1000000,
      currency: 'INR',
      themeStyle: 'royal',
      preferences: 'test',
      culturalOrDietaryNotes: 'veg'
    };

    expect(generatePlanCacheKey(input1)).toBe(generatePlanCacheKey(input2));
  });
});

