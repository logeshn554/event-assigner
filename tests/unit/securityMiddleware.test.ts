import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { enforceRequestSecurity } from '@/backend/middleware/securityMiddleware';
import { getRateLimitStore } from '@/backend/middleware/rateLimiter';

describe('Security Middleware Unit Tests', () => {
  beforeEach(async () => {
    await getRateLimitStore().reset();
  });

  it('allows valid POST request with JSON content type', async () => {
    const req = new NextRequest('http://localhost:3000/api/plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '127.0.0.1'
      },
      body: JSON.stringify({ test: true })
    });

    const violation = await enforceRequestSecurity(req, {
      rateLimitKeyPrefix: 'test_sec',
      rateLimitLimit: 5,
      rateLimitWindowMs: 60000
    });

    expect(violation).toBeNull();
  });

  it('rejects disallowed HTTP methods with 405 Method Not Allowed', async () => {
    const req = new NextRequest('http://localhost:3000/api/plan', {
      method: 'GET'
    });

    const violation = await enforceRequestSecurity(req, {
      allowedMethods: ['POST'],
      rateLimitKeyPrefix: 'test_sec',
      rateLimitLimit: 5,
      rateLimitWindowMs: 60000
    });

    expect(violation).not.toBeNull();
    expect(violation?.status).toBe(405);
    const body = await violation?.json();
    expect(body.error.code).toBe('METHOD_NOT_ALLOWED');
  });

  it('rejects missing or non-JSON content-type with 400 Validation Error', async () => {
    const req = new NextRequest('http://localhost:3000/api/plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: 'plain text data'
    });

    const violation = await enforceRequestSecurity(req, {
      rateLimitKeyPrefix: 'test_sec',
      rateLimitLimit: 5,
      rateLimitWindowMs: 60000
    });

    expect(violation).not.toBeNull();
    expect(violation?.status).toBe(400);
    const body = await violation?.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects payload exceeding maximum body size with 413 Payload Too Large', async () => {
    const req = new NextRequest('http://localhost:3000/api/plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': '200000' // 200 KB
      },
      body: JSON.stringify({ big: 'data' })
    });

    const violation = await enforceRequestSecurity(req, {
      maxBodySizeBytes: 102400, // 100 KB
      rateLimitKeyPrefix: 'test_sec',
      rateLimitLimit: 5,
      rateLimitWindowMs: 60000
    });

    expect(violation).not.toBeNull();
    expect(violation?.status).toBe(413);
    const body = await violation?.json();
    expect(body.error.code).toBe('PAYLOAD_TOO_LARGE');
  });

  it('enforces rate limits per IP and returns 429 with Retry-After header', async () => {
    const createReq = () =>
      new NextRequest('http://localhost:3000/api/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '10.0.0.1'
        },
        body: JSON.stringify({ test: 1 })
      });

    const options = {
      rateLimitKeyPrefix: 'rate_test',
      rateLimitLimit: 2,
      rateLimitWindowMs: 60000
    };

    expect(await enforceRequestSecurity(createReq(), options)).toBeNull();
    expect(await enforceRequestSecurity(createReq(), options)).toBeNull();

    // Third request triggers 429
    const blocked = await enforceRequestSecurity(createReq(), options);
    expect(blocked).not.toBeNull();
    expect(blocked?.status).toBe(429);
    expect(blocked?.headers.get('Retry-After')).toBeTruthy();
  });
});

