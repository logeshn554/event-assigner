/**
 * Application Constants
 */

export const APP_NAME = 'Event Planning Assistant';
export const APP_VERSION = '1.0.0';

export const SUPPORTED_EVENT_TYPES = ['wedding', 'birthday', 'community'] as const;
export type EventType = (typeof SUPPORTED_EVENT_TYPES)[number];

export const SUPPORTED_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'] as const;
export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£'
};

export const BUDGET_CONSTRAINTS = {
  MIN_BUDGET: 1000,
  MAX_BUDGET: 100000000,
  MIN_GUESTS: 1,
  MAX_GUESTS: 50000
} as const;

export const RATE_LIMIT_CONFIG = {
  PLAN_WINDOW_MS: 60 * 1000, // 1 minute
  PLAN_MAX_REQUESTS: 10,
  CHAT_WINDOW_MS: 60 * 1000, // 1 minute
  CHAT_MAX_REQUESTS: 20
} as const;

export const CACHE_CONFIG = {
  MAX_ITEMS: 100,
  TTL_MS: 1000 * 60 * 30 // 30 minutes
} as const;

export const PLAN_STORAGE_KEY = 'event_assistant_saved_plans_v1';
export const CURRENT_PLAN_STORAGE_KEY = 'event_assistant_current_plan_v1';
