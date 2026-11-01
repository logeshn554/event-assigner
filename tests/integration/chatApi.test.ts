import { describe, it, expect, beforeEach } from 'vitest';
import { POST } from '@/app/api/chat/route';
import { NextRequest } from 'next/server';
import { getRateLimitStore } from '@/backend/middleware/rateLimiter';
import { generateFallbackPlan } from '@/backend/services/fallbackPlanner';

describe('Integration: POST /api/chat', () => {
  beforeEach(async () => {
    await getRateLimitStore().reset();
  });

  const samplePlan = generateFallbackPlan({
    eventType: 'wedding',
    date: '2027-06-15',
    city: 'Hyderabad',
    guestCount: 200,
    totalBudget: 1500000,
    currency: 'INR',
    themeStyle: 'Nizami',
    preferences: 'Biryani tasting',
    culturalOrDietaryNotes: 'Halal'
  });

  it('initiates an SSE stream for valid refinement query', async () => {
    const payload = {
      message: 'Can we reduce decor by 10% and shift it to photography?',
      currentPlan: samplePlan,
      history: []
    };

    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '192.168.2.1'
      },
      body: JSON.stringify(payload)
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/event-stream');
  });

  it('rejects invalid payload with 400 status', async () => {
    const invalidPayload = {
      message: '', // empty message
      currentPlan: null
    };

    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '192.168.2.2'
      },
      body: JSON.stringify(invalidPayload)
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });
});

