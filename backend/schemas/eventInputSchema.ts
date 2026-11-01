import { z } from 'zod';
import {
  BUDGET_CONSTRAINTS,
  SUPPORTED_CURRENCIES,
  SUPPORTED_EVENT_TYPES
} from '../utils/constants';

export const eventInputSchema = z
  .object({
    eventType: z.enum(SUPPORTED_EVENT_TYPES, {
      errorMap: () => ({ message: 'Event type must be wedding, birthday, or community' })
    }),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Must be a valid calendar date'
      }),
    city: z
      .string()
      .trim()
      .min(2, 'City name must have at least 2 characters')
      .max(100, 'City name cannot exceed 100 characters'),
    guestCount: z
      .number({ invalid_type_error: 'Guest count must be a number' })
      .int('Guest count must be an integer')
      .min(BUDGET_CONSTRAINTS.MIN_GUESTS, `Guest count must be at least ${BUDGET_CONSTRAINTS.MIN_GUESTS}`)
      .max(BUDGET_CONSTRAINTS.MAX_GUESTS, `Guest count cannot exceed ${BUDGET_CONSTRAINTS.MAX_GUESTS}`),
    totalBudget: z
      .number({ invalid_type_error: 'Total budget must be a number' })
      .positive('Budget must be greater than zero')
      .min(BUDGET_CONSTRAINTS.MIN_BUDGET, `Budget must be at least ${BUDGET_CONSTRAINTS.MIN_BUDGET}`)
      .max(BUDGET_CONSTRAINTS.MAX_BUDGET, `Budget cannot exceed ${BUDGET_CONSTRAINTS.MAX_BUDGET}`),
    currency: z.enum(SUPPORTED_CURRENCIES, {
      errorMap: () => ({ message: 'Unsupported currency selected' })
    }),
    themeStyle: z.string().trim().max(200, 'Theme/style cannot exceed 200 characters').default(''),
    preferences: z.string().trim().max(500, 'Preferences cannot exceed 500 characters').default(''),
    culturalOrDietaryNotes: z
      .string()
      .trim()
      .max(500, 'Cultural or dietary notes cannot exceed 500 characters')
      .default('')
  })
  .strict();

export type EventInput = z.infer<typeof eventInputSchema>;
