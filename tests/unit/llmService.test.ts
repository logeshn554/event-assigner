import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeminiLlmService } from '@/backend/services/llm';
import type { EventInput } from '@/backend/schemas/eventInputSchema';

describe('GeminiLlmService Unit Tests', () => {
  const sampleInput: EventInput = {
    eventType: 'birthday',
    eventDate: '2026-12-10',
    city: 'Hyderabad',
    guestCount: 80,
    totalBudget: 300000,
    currency: 'INR',
    themeStyle: 'Retro Carnival'
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('activates fallback planner gracefully when no API key is provided', async () => {
    const service = new GeminiLlmService('');
    const result = await service.generatePlan(sampleInput);

    expect(result.fallbackUsed).toBe(true);
    expect(result.fallbackReason).toContain('No Gemini API key configured');
    expect(result.plan.title).toContain('Birthday');
    expect(result.plan.isAIGenerated).toBe(false);
  });

  it('yields offline advice during chat stream when no API key is configured', async () => {
    const service = new GeminiLlmService('');
    const fallbackPlan = (await service.generatePlan(sampleInput)).plan;

    const chunks: string[] = [];
    for await (const chunk of service.streamChat('Make it cheaper', fallbackPlan)) {
      chunks.push(chunk);
    }

    const fullResponse = chunks.join('');
    expect(fullResponse).toContain('offline mode');
  });

  it('handles simulated LLM network rejection by failing over to deterministic plan', async () => {
    const service = new GeminiLlmService('dummy-key');
    // Mock internal client to throw high-demand error
    (service as unknown as { client: unknown }).client = {
      models: {
        generateContent: vi.fn().mockRejectedValue(new Error('503 UNAVAILABLE: high demand'))
      }
    };

    const result = await service.generatePlan(sampleInput);

    expect(result.fallbackUsed).toBe(true);
    expect(result.fallbackReason).toContain('AI service temporarily unavailable');
    expect(result.plan.budgetBreakdown.length).toBeGreaterThan(0);
  });
});

