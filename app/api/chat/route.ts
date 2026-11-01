import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { enforceRequestSecurity } from '@/backend/middleware/securityMiddleware';
import { chatRequestSchema } from '@/backend/schemas/chatSchema';
import { getLlmService } from '@/backend/services/llm';
import { ValidationError, formatErrorResponse } from '@/backend/utils/errors';
import { RATE_LIMIT_CONFIG } from '@/backend/utils/constants';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest): Promise<Response> {
  const securityViolation = await enforceRequestSecurity(req, {
    allowedMethods: ['POST'],
    rateLimitKeyPrefix: 'chat_stream',
    rateLimitLimit: RATE_LIMIT_CONFIG.CHAT_MAX_REQUESTS,
    rateLimitWindowMs: RATE_LIMIT_CONFIG.CHAT_WINDOW_MS
  });

  if (securityViolation) {
    return securityViolation;
  }

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      throw new ValidationError('Malformed JSON payload');
    }

    const validationResult = chatRequestSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationError('Invalid chat request parameters', validationResult.error.format());
    }

    const { message, currentPlan, history } = validationResult.data;
    const llmService = getLlmService();

    // Setup ReadableStream for Server-Sent Events (SSE)
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const generator = llmService.streamChat(message, currentPlan, history);
          for await (const chunk of generator) {
            const sseData = `data: ${JSON.stringify({ chunk })}\n\n`;
            controller.enqueue(encoder.encode(sseData));
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : 'Streaming failure';
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: errMsg })}\n\n`)
          );
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no'
      }
    });
  } catch (error: unknown) {
    const { response, status } = formatErrorResponse(error);
    return NextResponse.json(response, { status });
  }
}
