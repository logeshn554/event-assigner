import { z } from 'zod';
import { eventPlanSchema } from './eventPlanSchema';

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'model']),
  content: z.string().trim().min(1).max(2000)
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

export const chatRequestSchema = z
  .object({
    message: z.string().trim().min(1, 'Message cannot be empty').max(1000, 'Message cannot exceed 1000 characters'),
    currentPlan: eventPlanSchema,
    history: z.array(chatMessageSchema).max(20).default([])
  })
  .strict();

export type ChatRequest = z.infer<typeof chatRequestSchema>;
