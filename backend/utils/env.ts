import { z } from 'zod';

const envSchema = z.object({
  GEMINI_API_KEY: z.string().optional().default(''),
  GEMINI_MODEL: z.string().min(1).default('gemini-3.8-flash'),
  LLM_TIMEOUT_MS: z.coerce.number().int().positive().default(25000),
  RATE_LIMIT_PLAN_RPM: z.coerce.number().int().positive().default(10),
  RATE_LIMIT_CHAT_RPM: z.coerce.number().int().positive().default(20),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development')
});

export type ServerEnv = z.infer<typeof envSchema>;

let parsedEnv: ServerEnv | null = null;

/**
 * Validates and returns server environment variables.
 * Cached after first evaluation.
 */
export function getServerEnv(): ServerEnv {
  if (parsedEnv) {
    return parsedEnv;
  }

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Environment validation failed:', result.error.format());
    throw new Error('Invalid environment variables configuration');
  }

  parsedEnv = result.data;
  return parsedEnv;
}

/**
 * Resets cached env for testing purposes
 */
export function resetServerEnv(): void {
  parsedEnv = null;
}

