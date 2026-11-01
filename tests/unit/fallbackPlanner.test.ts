import { describe, it, expect } from 'vitest';
import { generateFallbackPlan } from '@/backend/services/fallbackPlanner';
import type { EventInput } from '@/backend/schemas/eventInputSchema';

describe('generateFallbackPlan', () => {
  it('generates a valid, complete wedding plan with zero budget discrepancy', () => {
    const input: EventInput = {
      eventType: 'wedding',
      date: '2027-06-20',
      city: 'Jaipur',
      guestCount: 300,
      totalBudget: 2500000,
      currency: 'INR',
      themeStyle: 'Heritage Palace',
      preferences: 'Outdoor Sangeet lawn',
      culturalOrDietaryNotes: 'Traditional Marwari cuisine'
    };

    const plan = generateFallbackPlan(input);

    expect(plan.isAIGenerated).toBe(false);
    expect(plan.totalBudget).toBe(2500000);
    expect(plan.currency).toBe('INR');

    // Mathematical balance check
    const sumAllocated = plan.budgetBreakdown.reduce((sum, c) => sum + c.allocatedAmount, 0);
    expect(sumAllocated).toBe(input.totalBudget);

    expect(plan.timeline.length).toBeGreaterThan(0);
    expect(plan.vendorChecklist.length).toBeGreaterThan(0);
    expect(plan.personalizedIdeas.menuRecommendations.length).toBeGreaterThan(0);
    expect(plan.personalizedIdeas.invitationWording).toBeTruthy();
  });

  it('generates an authentic birthday plan with appropriate categories', () => {
    const input: EventInput = {
      eventType: 'birthday',
      date: '2027-02-14',
      city: 'Bengaluru',
      guestCount: 50,
      totalBudget: 150000,
      currency: 'INR',
      themeStyle: 'Superheroes',
      preferences: 'Interactive magic show',
      culturalOrDietaryNotes: 'Nut-free cake'
    };

    const plan = generateFallbackPlan(input);
    const sumAllocated = plan.budgetBreakdown.reduce((sum, c) => sum + c.allocatedAmount, 0);
    expect(sumAllocated).toBe(150000);

    const categories = plan.budgetBreakdown.map((c) => c.category);
    expect(categories.some((c) => c.includes('Cake'))).toBe(true);
  });

  it('generates an authentic community festival plan', () => {
    const input: EventInput = {
      eventType: 'community',
      date: '2027-08-15',
      city: 'Delhi',
      guestCount: 1000,
      totalBudget: 500000,
      currency: 'INR',
      themeStyle: 'Independence Carnival',
      preferences: 'Stage performances & flag hoisting',
      culturalOrDietaryNotes: 'Street food stalls'
    };

    const plan = generateFallbackPlan(input);
    const sumAllocated = plan.budgetBreakdown.reduce((sum, c) => sum + c.allocatedAmount, 0);
    expect(sumAllocated).toBe(500000);

    const categories = plan.budgetBreakdown.map((c) => c.category);
    expect(categories.some((c) => c.includes('Permits') || c.includes('Staging'))).toBe(true);
  });
});

