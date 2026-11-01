import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '@/app/api/plan/route';
import { NextRequest } from 'next/server';
import { getRateLimitStore } from '@/backend/middleware/rateLimiter';
import { planCache } from '@/backend/services/cache';
import { setLlmService } from '@/backend/services/llm';
import { generateFallbackPlan } from '@/backend/services/fallbackPlanner';
import type { EventInput } from '@/backend/schemas/eventInputSchema';

describe('Integration: POST /api/plan', () => {
  beforeEach(async () => {
    await getRateLimitStore().reset();
    await planCache.clear();
  });

  it('returns a generated plan for valid payload using fallback planner when LLM is in fallback mode', async () => {
    const input: EventInput = {
      eventType: 'wedding',
      date: '2027-05-20',
      city: 'Pune',
      guestCount: 200,
      totalBudget: 1000000,
      currency: 'INR',
      themeStyle: 'Traditional Maharashtrian',
      preferences: 'Outdoor lawn',
      culturalOrDietaryNotes: 'Traditional puran poli'
    };

    const req = new NextRequest('http://localhost:3000/api/plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '192.168.1.1'
      },
      body: JSON.stringify(input)
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.plan).toBeDefined();
    expect(data.plan.totalBudget).toBe(1000000);
    expect(data.plan.budgetBreakdown.length).toBeGreaterThan(0);
  });

  it('rejects invalid inputs with a structured 400 ValidationError', async () => {
    const invalidBody = {
      eventType: 'invalid_event',
      guestCount: -5
    };

    const req = new NextRequest('http://localhost:3000/api/plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '192.168.1.2'
      },
      body: JSON.stringify(invalidBody)
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
    expect(data.error.message).toBeTruthy();
  });

  it('rejects non-JSON content-type with 400 error', async () => {
    const req = new NextRequest('http://localhost:3000/api/plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'x-forwarded-for': '192.168.1.3'
      },
      body: 'plain text body'
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error.message).toContain('Content-Type must be application/json');
  });

  it('returns cached plan on second request with identical parameters', async () => {
    const input: EventInput = {
      eventType: 'birthday',
      date: '2027-01-10',
      city: 'Chennai',
      guestCount: 50,
      totalBudget: 100000,
      currency: 'INR',
      themeStyle: 'Arcade',
      preferences: 'Pizza party',
      culturalOrDietaryNotes: 'Vegetarian'
    };

    const makeReq = () =>
      new NextRequest('http://localhost:3000/api/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '192.168.1.4'
        },
        body: JSON.stringify(input)
      });

    // First call
    const res1 = await POST(makeReq());
    const data1 = await res1.json();
    expect(data1.cached).toBe(false);

    // Second call
    const res2 = await POST(makeReq());
    const data2 = await res2.json();
    expect(data2.cached).toBe(true);
  });
});

