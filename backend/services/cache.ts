import type { EventInput } from '../schemas/eventInputSchema';
import type { EventPlan } from '../schemas/eventPlanSchema';
import { CACHE_CONFIG } from '../utils/constants';

export interface ICacheStore<T> {
  get(key: string): Promise<T | null>;
  set(key: string, value: T, ttlMs?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class LruTtlCache<T> implements ICacheStore<T> {
  private map: Map<string, CacheEntry<T>> = new Map();
  private maxItems: number;
  private defaultTtlMs: number;

  constructor(maxItems = CACHE_CONFIG.MAX_ITEMS, defaultTtlMs = CACHE_CONFIG.TTL_MS) {
    this.maxItems = maxItems;
    this.defaultTtlMs = defaultTtlMs;
  }

  public async get(key: string): Promise<T | null> {
    const entry = this.map.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.map.delete(key);
      return null;
    }

    // Refresh LRU order by re-inserting
    this.map.delete(key);
    this.map.set(key, entry);
    return entry.value;
  }

  public async set(key: string, value: T, ttlMs?: number): Promise<void> {
    const ttl = ttlMs ?? this.defaultTtlMs;
    const expiresAt = Date.now() + ttl;

    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size >= this.maxItems) {
      // Evict oldest item (first item in insertion order)
      const firstKey = this.map.keys().next().value;
      if (firstKey) {
        this.map.delete(firstKey);
      }
    }

    this.map.set(key, { value, expiresAt });
  }

  public async delete(key: string): Promise<void> {
    this.map.delete(key);
  }

  public async clear(): Promise<void> {
    this.map.clear();
  }

  public size(): number {
    return this.map.size;
  }
}

// Global cache for event plans
export const planCache = new LruTtlCache<EventPlan>();

/**
 * Computes deterministic normalized hash key for EventInput
 */
export function generatePlanCacheKey(input: EventInput): string {
  // Normalize fields: trim, lowercase non-case-sensitive attributes
  const normalized = {
    eventType: input.eventType.toLowerCase(),
    date: input.date,
    city: input.city.trim().toLowerCase(),
    guestCount: input.guestCount,
    totalBudget: input.totalBudget,
    currency: input.currency.toUpperCase(),
    themeStyle: (input.themeStyle || '').trim().toLowerCase(),
    preferences: (input.preferences || '').trim().toLowerCase(),
    culturalOrDietaryNotes: (input.culturalOrDietaryNotes || '').trim().toLowerCase()
  };

  // Simple, deterministic string representation
  return `plan:${JSON.stringify(normalized)}`;
}
