import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getClientIp, getRateLimitStore } from './rateLimiter';
import { RateLimitError, ValidationError, formatErrorResponse } from '../utils/errors';

export interface SecurityCheckOptions {
  allowedMethods?: string[];
  maxBodySizeBytes?: number;
  rateLimitKeyPrefix: string;
  rateLimitLimit: number;
  rateLimitWindowMs: number;
}

const DEFAULT_OPTIONS: SecurityCheckOptions = {
  allowedMethods: ['POST'],
  maxBodySizeBytes: 100 * 1024, // 100 KB
  rateLimitKeyPrefix: 'rl',
  rateLimitLimit: 10,
  rateLimitWindowMs: 60 * 1000
};

/**
 * Validates request security constraints: method, content-type, payload size, and rate limits.
 * Returns null if checks pass, or a NextResponse on violation.
 */
export async function enforceRequestSecurity(
  req: NextRequest | Request,
  options: Partial<SecurityCheckOptions> = {}
): Promise<NextResponse | null> {
  const config = { ...DEFAULT_OPTIONS, ...options };

  // 1. Method allowlist check
  if (config.allowedMethods && !config.allowedMethods.includes(req.method)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: `Method ${req.method} is not allowed`
        }
      },
      {
        status: 405,
        headers: { Allow: config.allowedMethods.join(', ') }
      }
    );
  }

  // 2. Content-Type check for requests with body
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('application/json')) {
      const err = new ValidationError('Content-Type must be application/json');
      const { response, status } = formatErrorResponse(err);
      return NextResponse.json(response, { status });
    }

    // 3. Content-Length check
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > (config.maxBodySizeBytes || 102400)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PAYLOAD_TOO_LARGE',
            message: 'Request payload exceeds 100KB limit'
          }
        },
        { status: 413 }
      );
    }
  }

  // 4. Rate limiting per IP
  const clientIp = getClientIp(req);
  const rateLimitKey = `${config.rateLimitKeyPrefix}:${clientIp}`;
  const rateLimitStore = getRateLimitStore();

  const rlResult = await rateLimitStore.incrementAndCheck(
    rateLimitKey,
    config.rateLimitLimit,
    config.rateLimitWindowMs
  );

  if (!rlResult.allowed) {
    const rateLimitErr = new RateLimitError(
      `Rate limit exceeded. Please wait ${rlResult.resetSeconds} seconds before retrying.`,
      rlResult.resetSeconds
    );
    const { response, status } = formatErrorResponse(rateLimitErr);
    return NextResponse.json(response, {
      status,
      headers: {
        'Retry-After': rlResult.resetSeconds.toString(),
        'X-RateLimit-Limit': rlResult.limit.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': rlResult.resetSeconds.toString()
      }
    });
  }

  return null;
}
