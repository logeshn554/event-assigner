import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, it, expect, vi } from 'vitest';
import { EventSetupForm } from '@/frontend/components/form/EventSetupForm';
import { BudgetTracker } from '@/frontend/components/plan/BudgetTracker';
import { Header } from '@/frontend/components/layout/Header';
import { Footer } from '@/frontend/components/layout/Footer';
import type { BudgetCategory } from '@/backend/schemas/eventPlanSchema';

describe('Accessibility Audit (WCAG 2.1 AA with jest-axe)', () => {
  it('EventSetupForm has no axe accessibility violations', async () => {
    const { container } = render(<EventSetupForm onSubmit={vi.fn()} isLoading={false} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('BudgetTracker has no axe accessibility violations', async () => {
    const categories: BudgetCategory[] = [
      {
        id: '1',
        category: 'Venue & Catering',
        percentage: 60,
        allocatedAmount: 600000,
        actualSpent: 550000,
        rationale: 'Banquet and culinary hospitality'
      },
      {
        id: '2',
        category: 'Decor & Florals',
        percentage: 40,
        allocatedAmount: 400000,
        actualSpent: 400000,
        rationale: 'Theme staging and lighting'
      }
    ];

    const { container } = render(
      <BudgetTracker
        categories={categories}
        totalBudget={1000000}
        currency="INR"
        onUpdateSpend={vi.fn()}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Header and Footer have no axe accessibility violations', async () => {
    const { container: headerContainer } = render(<Header />);
    expect(await axe(headerContainer)).toHaveNoViolations();

    const { container: footerContainer } = render(<Footer />);
    expect(await axe(footerContainer)).toHaveNoViolations();
  });
});
