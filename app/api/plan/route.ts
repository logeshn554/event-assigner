import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { enforceRequestSecurity } from '@/backend/middleware/securityMiddleware';
import { eventInputSchema } from '@/backend/schemas/eventInputSchema';
import { getLlmService } from '@/backend/services/llm';
import { generatePlanCacheKey, planCache } from '@/backend/services/cache';
import { ValidationError, formatErrorResponse } from '@/backend/utils/errors';
import { RATE_LIMIT_CONFIG } from '@/backend/utils/constants';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. Security & Rate-limiting gatekeeper
  const securityViolation = await enforceRequestSecurity(req, {
    allowedMethods: ['POST'],
    rateLimitKeyPrefix: 'plan_gen',
    rateLimitLimit: RATE_LIMIT_CONFIG.PLAN_MAX_REQUESTS,
    rateLimitWindowMs: RATE_LIMIT_CONFIG.PLAN_WINDOW_MS
  });

  if (securityViolation) {
    return securityViolation;
  }

  try {
    // 2. Parse & Validate input
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      throw new ValidationError('Malformed JSON payload');
    }

    const validationResult = eventInputSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationError('Invalid event input parameters', validationResult.error.format());
    }

    const input = validationResult.data;

    // 3. Check Cache
    const cacheKey = generatePlanCacheKey(input);
    const cachedPlan = await planCache.get(cacheKey);
    if (cachedPlan) {
      return NextResponse.json({
        success: true,
        plan: cachedPlan,
        cached: true,
        fallbackUsed: !cachedPlan.isAIGenerated
      });
    }

    // 4. Generate Plan (Gemini or Deterministic Fallback)
    const llmService = getLlmService();
    const { plan, fallbackUsed, fallbackReason } = await llmService.generatePlan(input);

    // 5. Store in Cache
    await planCache.set(cacheKey, plan);

    return NextResponse.json({
      success: true,
      plan,
      cached: false,
      fallbackUsed,
      fallbackReason
    });
  } catch (error: unknown) {
    const { response, status } = formatErrorResponse(error);
    return NextResponse.json(response, { status });
  }
}
