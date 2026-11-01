import { GoogleGenAI } from '@google/genai';
import type { EventInput } from '../schemas/eventInputSchema';
import type { EventPlan } from '../schemas/eventPlanSchema';
import { eventPlanSchema, normalizeBudgetBreakdown } from '../schemas/eventPlanSchema';
import { getServerEnv } from '../utils/env';
import { buildPlanUserPrompt, getPlanSystemInstruction } from '../prompts/planPrompt';
import { buildChatUserPrompt, getChatSystemInstruction } from '../prompts/chatPrompt';
import { generateFallbackPlan } from './fallbackPlanner';

export interface ILlmService {
  generatePlan(input: EventInput): Promise<{ plan: EventPlan; fallbackUsed: boolean; fallbackReason?: string }>;
  streamChat(
    message: string,
    currentPlan: EventPlan,
    history?: Array<{ role: string; content: string }>
  ): AsyncGenerator<string, void, unknown>;
}

export class GeminiLlmService implements ILlmService {
  private client: GoogleGenAI | null = null;
  private apiKey: string;
  private model: string;
  private timeoutMs: number;

  constructor(apiKey?: string, model?: string, timeoutMs?: number) {
    const env = getServerEnv();
    this.apiKey = apiKey ?? env.GEMINI_API_KEY;
    this.model = model ?? env.GEMINI_MODEL;
    this.timeoutMs = timeoutMs ?? env.LLM_TIMEOUT_MS;

    if (this.apiKey) {
      this.client = new GoogleGenAI({ apiKey: this.apiKey });
    }
  }

  /**
   * Generates a structured event plan using Gemini native structured outputs.
   * If the primary model experiences high demand (503) or rate limits, it automatically
   * tries the stable fallback model (gemini-2.5-flash).
   * If all models fail, it seamlessly falls back to the deterministic planner.
   */
  public async generatePlan(
    input: EventInput
  ): Promise<{ plan: EventPlan; fallbackUsed: boolean; fallbackReason?: string }> {
    if (!this.client || !this.apiKey) {
      return {
        plan: generateFallbackPlan(input),
        fallbackUsed: true,
        fallbackReason: 'No Gemini API key configured. Showing a deterministic rule-based plan.'
      };
    }

    // Try primary requested model, then fall back to reliable gemini-2.5-flash
    const candidateModels = Array.from(new Set([this.model, 'gemini-2.5-flash']));
    let lastError: Error | null = null;

    for (const modelToTry of candidateModels) {
      try {
        console.log(`[GeminiLlmService] Attempting plan generation with: ${modelToTry}`);
        const plan = await this.callWithRetry(() => this.executePlanGeneration(input, modelToTry));
        console.log(`[GeminiLlmService] Generation successful with model: ${modelToTry}`);
        return {
          plan,
          fallbackUsed: false
        };
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.warn(`[GeminiLlmService] Model ${modelToTry} unavailable (${lastError.message}). Attempting failover...`);
      }
    }

    const errorMsg = lastError?.message || 'Unknown error';
    console.warn(`[GeminiLlmService] All AI models exhausted (${errorMsg}). Switching to rule-based planner.`);

    const isRateLimited = errorMsg.includes('429') || errorMsg.includes('quota');
    const fallbackReason = isRateLimited
      ? 'AI is busy (rate limit reached), showing an authentic rule-based plan.'
      : 'AI service temporarily unavailable, showing an authentic rule-based plan.';

    return {
      plan: generateFallbackPlan(input),
      fallbackUsed: true,
      fallbackReason
    };
  }

  private async executePlanGeneration(input: EventInput, modelName: string): Promise<EventPlan> {
    if (!this.client) throw new Error('Gemini client not initialized');

    const systemInstruction = getPlanSystemInstruction();
    const prompt = buildPlanUserPrompt(input);

    const callPromise = this.client.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseJsonSchema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            summary: { type: 'string' },
            totalBudget: { type: 'number' },
            currency: { type: 'string', enum: ['INR', 'USD', 'EUR', 'GBP'] },
            budgetBreakdown: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  category: { type: 'string' },
                  percentage: { type: 'number' },
                  allocatedAmount: { type: 'number' },
                  rationale: { type: 'string' }
                },
                required: ['id', 'category', 'percentage', 'allocatedAmount', 'rationale']
              }
            },
            timeline: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  tMinusWeeks: { type: 'number' },
                  phaseTitle: { type: 'string' },
                  tasks: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        title: { type: 'string' },
                        owner: { type: 'string' },
                        priority: { type: 'string', enum: ['high', 'medium', 'low'] }
                      },
                      required: ['id', 'title', 'owner', 'priority']
                    }
                  }
                },
                required: ['id', 'tMinusWeeks', 'phaseTitle', 'tasks']
              }
            },
            vendorChecklist: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  category: { type: 'string' },
                  vendorType: { type: 'string' },
                  estimatedCostMin: { type: 'number' },
                  estimatedCostMax: { type: 'number' },
                  questionsToAsk: { type: 'array', items: { type: 'string' } }
                },
                required: ['id', 'category', 'vendorType', 'estimatedCostMin', 'estimatedCostMax', 'questionsToAsk']
              }
            },
            personalizedIdeas: {
              type: 'object',
              properties: {
                themes: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: { name: { type: 'string' }, description: { type: 'string' } },
                    required: ['name', 'description']
                  }
                },
                activities: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: { name: { type: 'string' }, description: { type: 'string' }, timelineStage: { type: 'string' } },
                    required: ['name', 'description', 'timelineStage']
                  }
                },
                menuRecommendations: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: { course: { type: 'string' }, items: { type: 'array', items: { type: 'string' } }, dietaryNotes: { type: 'string' } },
                    required: ['course', 'items']
                  }
                },
                invitationWording: { type: 'string' },
                returnGifts: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: { item: { type: 'string' }, description: { type: 'string' }, estimatedUnitCost: { type: 'number' } },
                    required: ['item', 'description', 'estimatedUnitCost']
                  }
                }
              },
              required: ['themes', 'activities', 'menuRecommendations', 'invitationWording', 'returnGifts']
            }
          },
          required: [
            'title',
            'summary',
            'totalBudget',
            'currency',
            'budgetBreakdown',
            'timeline',
            'vendorChecklist',
            'personalizedIdeas'
          ]
        },
        maxOutputTokens: 4096,
        temperature: 0.25
      }
    });

    const response = await this.withTimeout(callPromise, this.timeoutMs);
    const rawText = response.text || '';

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(rawText);
    } catch {
      throw new Error('Model produced non-JSON output');
    }

    const enriched = {
      id: `plan_ai_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      generatedAt: new Date().toISOString(),
      isAIGenerated: true,
      ...(parsedJson as Record<string, unknown>),
      totalBudget: input.totalBudget,
      currency: input.currency
    };

    const validated = eventPlanSchema.safeParse(enriched);
    if (!validated.success) {
      console.warn('[GeminiLlmService] Schema validation failed. Attempting repair prompt...');
      return await this.repairPlanWithLlm(rawText, input, modelName);
    }

    validated.data.budgetBreakdown = normalizeBudgetBreakdown(
      validated.data.budgetBreakdown,
      input.totalBudget
    );

    return validated.data;
  }

  private async repairPlanWithLlm(malformedJson: string, input: EventInput, modelName: string): Promise<EventPlan> {
    if (!this.client) throw new Error('Client unavailable for repair');

    const repairPrompt = `The previous JSON response did not strictly pass schema validation. Correct it to match the expected schema precisely, ensuring total budget is ${input.totalBudget} ${input.currency}.
Malformed JSON:
${malformedJson.slice(0, 3000)}`;

    const repairCall = this.client.models.generateContent({
      model: modelName,
      contents: repairPrompt,
      config: {
        responseMimeType: 'application/json',
        maxOutputTokens: 4096,
        temperature: 0.1
      }
    });

    const response = await this.withTimeout(repairCall, this.timeoutMs);
    const fixedJson = JSON.parse(response.text || '{}');
    const enriched = {
      id: `plan_ai_rep_${Date.now()}`,
      generatedAt: new Date().toISOString(),
      isAIGenerated: true,
      ...fixedJson,
      totalBudget: input.totalBudget,
      currency: input.currency
    };

    const finalValidation = eventPlanSchema.parse(enriched);
    finalValidation.budgetBreakdown = normalizeBudgetBreakdown(
      finalValidation.budgetBreakdown,
      input.totalBudget
    );
    return finalValidation;
  }

  public async *streamChat(
    message: string,
    currentPlan: EventPlan,
    history: Array<{ role: string; content: string }> = []
  ): AsyncGenerator<string, void, unknown> {
    if (!this.client || !this.apiKey) {
      yield 'I am currently operating in offline mode because no API key is configured. You can still modify budget numbers, complete checklist items, and export your plan!';
      return;
    }

    const candidateModels = Array.from(new Set([this.model, 'gemini-2.5-flash']));
    const systemInstruction = getChatSystemInstruction();
    const prompt = buildChatUserPrompt(message, currentPlan);

    const contents = [
      ...history.map((h) => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }]
      })),
      { role: 'user', parts: [{ text: prompt }] }
    ];

    for (const modelToTry of candidateModels) {
      try {
        const stream = await this.client.models.generateContentStream({
          model: modelToTry,
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
            maxOutputTokens: 2048
          }
        });

        for await (const chunk of stream) {
          if (chunk.text) {
            yield chunk.text;
          }
        }
        return;
      } catch (err: unknown) {
        console.warn(`[GeminiLlmService] Chat stream failed on ${modelToTry}, trying failover...`, err);
      }
    }

    yield ' The AI assistant is currently experiencing high demand. Please try again shortly, or adjust your categories in the budget tracker directly.';
  }

  private async callWithRetry<T>(fn: () => Promise<T>, maxRetries = 1, delayMs = 1500): Promise<T> {
    let attempt = 0;
    while (attempt <= maxRetries) {
      try {
        return await fn();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        const isRetryable =
          msg.includes('429') ||
          msg.includes('500') ||
          msg.includes('503') ||
          msg.includes('quota') ||
          msg.includes('rate');

        if (attempt < maxRetries && isRetryable) {
          attempt++;
          await new Promise((res) => setTimeout(res, delayMs * Math.pow(2, attempt - 1)));
        } else {
          throw err;
        }
      }
    }
    throw new Error('Max retries exceeded');
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`LLM call timed out after ${timeoutMs}ms`)), timeoutMs)
      )
    ]);
  }
}

let globalLlmService: ILlmService | null = null;

export function getLlmService(): ILlmService {
  if (!globalLlmService) {
    globalLlmService = new GeminiLlmService();
  }
  return globalLlmService;
}

export function setLlmService(service: ILlmService): void {
  globalLlmService = service;
}
