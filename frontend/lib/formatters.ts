import type { CurrencyCode } from '@/backend/utils/constants';

/**
 * Formats a numeric currency value according to the specified currency locale
 */
export function formatCurrency(amount: number, currency: CurrencyCode = 'INR'): string {
  const localeMap: Record<CurrencyCode, string> = {
    INR: 'en-IN',
    USD: 'en-US',
    EUR: 'de-DE',
    GBP: 'en-GB'
  };

  try {
    return new Intl.NumberFormat(localeMap[currency] || 'en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

/**
 * Formats a calendar date string (YYYY-MM-DD) into human-readable format
 */
export function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  } catch {
    return dateStr;
  }
}

/**
 * Formats a percentage value (e.g. 15.5%)
 */
export function formatPercentage(val: number): string {
  return `${Number(val.toFixed(1))}%`;
}

