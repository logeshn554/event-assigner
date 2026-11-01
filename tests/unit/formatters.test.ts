import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatPercentage,
  formatDate
} from '@/frontend/lib/formatters';

describe('Formatters and Math Helpers', () => {
  it('formats currency correctly across INR, USD, EUR, and GBP', () => {
    expect(formatCurrency(150000, 'INR')).toContain('1,50,000');
    expect(formatCurrency(5000, 'USD')).toContain('5,000');
    expect(formatCurrency(2500, 'EUR')).toContain('2');
    expect(formatCurrency(3000, 'GBP')).toContain('3,000');
  });

  it('formats percentages cleanly', () => {
    expect(formatPercentage(45.678)).toBe('45.7%');
    expect(formatPercentage(50)).toBe('50%');
  });

  it('formats dates safely and handles invalid strings', () => {
    const formatted = formatDate('2026-12-31');
    expect(formatted).toContain('2026');
    expect(formatted).toContain('Dec');

    const invalid = formatDate('invalid-date-string');
    expect(invalid).toBe('invalid-date-string');
  });
});
