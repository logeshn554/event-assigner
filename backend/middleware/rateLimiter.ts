/**
 * Sliding Window In-Memory Rate Limiter with Swappable Store Interface
 */

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

export interface IRateLimitStore {
  incrementAndCheck(key: string, limit: number, windowMs: number): Promise<RateLimitResult>;
  reset(key?: string): Promise<void>;
}

export class MemoryRateLimitStore implements IRateLimitStore {
  // Map of key -> array of timestamps (epoch ms)
  private hits: Map<string, number[]> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Periodic garbage collection every 5 minutes
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
      if (this.cleanupInterval.unref) {
        this.cleanupInterval.unref();
      }
    }
  }

  public async incrementAndCheck(
    key: string,
    limit: number,
    windowMs: number
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - windowMs;

    const timestamps = this.hits.get(key) || [];
    // Keep only timestamps within the sliding window
    const validTimestamps = timestamps.filter((ts) => ts > windowStart);

    if (validTimestamps.length >= limit) {
      const oldestInWindow = validTimestamps[0];
      const resetSeconds = Math.max(1, Math.ceil((oldestInWindow + windowMs - now) / 1000));
      return {
        allowed: false,
        limit,
        remaining: 0,
        resetSeconds
      };
    }

    validTimestamps.push(now);
    this.hits.set(key, validTimestamps);

    const remaining = Math.max(0, limit - validTimestamps.length);
    const resetSeconds = Math.ceil(windowMs / 1000);

    return {
      allowed: true,
      limit,
      remaining,
      resetSeconds
    };
  }

  public async reset(key?: string): Promise<void> {
    if (key) {
      this.hits.delete(key);
    } else {
      this.hits.clear();
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, timestamps] of this.hits.entries()) {
      // Clear if all timestamps are older than 10 minutes
      const hasRecent = timestamps.some((ts) => now - ts < 10 * 60 * 1000);
      if (!hasRecent) {
        this.hits.delete(key);
      }
    }
  }

  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Global singleton instance for in-memory rate limiting across requests
const globalRateLimitStore = new MemoryRateLimitStore();

export function getRateLimitStore(): IRateLimitStore {
  return globalRateLimitStore;
}

/**
 * Extracts client IP from incoming Next.js Request headers
 */
export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}
