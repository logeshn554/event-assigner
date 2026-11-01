import { describe, it, expect } from 'vitest';
import { normalizeBudgetBreakdown } from '@/backend/schemas/eventPlanSchema';
import type { BudgetCategory } from '@/backend/schemas/eventPlanSchema';

describe('normalizeBudgetBreakdown', () => {
  it('guarantees that the sum of allocated amounts equals the total budget exactly', () => {
    const rawCategories: BudgetCategory[] = [
      { id: '1', category: 'Venue', percentage: 45.3, allocatedAmount: 0, actualSpent: 0, rationale: 'Test' },
      { id: '2', category: 'Catering', percentage: 24.7, allocatedAmount: 0, actualSpent: 0, rationale: 'Test' },
      { id: '3', category: 'Decor', percentage: 15.0, allocatedAmount: 0, actualSpent: 0, rationale: 'Test' },
      { id: '4', category: 'Photo', percentage: 15.0, allocatedAmount: 0, actualSpent: 0, rationale: 'Test' }
    ];

    const totalBudget = 1500000;
    const normalized = normalizeBudgetBreakdown(rawCategories, totalBudget);

    const sumAllocated = normalized.reduce((acc, c) => acc + c.allocatedAmount, 0);
    expect(sumAllocated).toBe(totalBudget);
  });

  it('corrects for odd fractional budgets without losing currency units', () => {
    const rawCategories: BudgetCategory[] = [
      { id: '1', category: 'A', percentage: 33.33, allocatedAmount: 0, actualSpent: 0, rationale: 'R' },
      { id: '2', category: 'B', percentage: 33.33, allocatedAmount: 0, actualSpent: 0, rationale: 'R' },
      { id: '3', category: 'C', percentage: 33.34, allocatedAmount: 0, actualSpent: 0, rationale: 'R' }
    ];

    const oddBudget = 1000001; // odd number
    const normalized = normalizeBudgetBreakdown(rawCategories, oddBudget);

    const sum = normalized.reduce((acc, c) => acc + c.allocatedAmount, 0);
    expect(sum).toBe(oddBudget);
  });

  it('handles empty category lists or non-positive budgets safely', () => {
    expect(normalizeBudgetBreakdown([], 10000)).toEqual([]);
    const cats: BudgetCategory[] = [
      { id: '1', category: 'A', percentage: 100, allocatedAmount: 0, actualSpent: 0, rationale: 'R' }
    ];
    expect(normalizeBudgetBreakdown(cats, 0)).toEqual(cats);
  });
});

