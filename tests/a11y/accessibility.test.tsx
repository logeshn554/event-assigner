import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, it, expect, vi } from 'vitest';
import { EventSetupForm } from '@/frontend/components/form/EventSetupForm';
import { BudgetTracker } from '@/frontend/components/plan/BudgetTracker';
import { TimelineView } from '@/frontend/components/plan/TimelineView';
import { VendorChecklist } from '@/frontend/components/plan/VendorChecklist';
import { IdeasView } from '@/frontend/components/plan/IdeasView';
import { ExportActions } from '@/frontend/components/plan/ExportActions';
import { PlanDisplay } from '@/frontend/components/plan/PlanDisplay';
import { Header } from '@/frontend/components/layout/Header';
import { Footer } from '@/frontend/components/layout/Footer';
import { SkipLink } from '@/frontend/components/layout/SkipLink';
import { generateFallbackPlan } from '@/backend/services/fallbackPlanner';

describe('Exhaustive WCAG 2.1 AA Accessibility Audit (jest-axe)', () => {
  const samplePlan = generateFallbackPlan({
    eventType: 'wedding',
    eventDate: '2027-02-14',
    city: 'Jaipur',
    guestCount: 250,
    totalBudget: 2500000,
    currency: 'INR',
    themeStyle: 'Palace Royal'
  });

  it('EventSetupForm has no accessibility violations', async () => {
    const { container } = render(<EventSetupForm onSubmit={vi.fn()} isLoading={false} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('BudgetTracker has no accessibility violations', async () => {
    const { container } = render(
      <BudgetTracker
        categories={samplePlan.budgetBreakdown}
        totalBudget={2500000}
        currency="INR"
        onUpdateSpend={vi.fn()}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('TimelineView has no accessibility violations', async () => {
    const { container } = render(
      <TimelineView timeline={samplePlan.timeline} onToggleTask={vi.fn()} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('VendorChecklist has no accessibility violations', async () => {
    const { container } = render(
      <VendorChecklist
        checklist={samplePlan.vendorChecklist}
        currency="INR"
        onToggleBooked={vi.fn()}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('IdeasView has no accessibility violations', async () => {
    const { container } = render(
      <IdeasView ideas={samplePlan.personalizedIdeas} currency="INR" onShowToast={vi.fn()} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('ExportActions has no accessibility violations', async () => {
    const { container } = render(
      <ExportActions plan={samplePlan} onReset={vi.fn()} onShowToast={vi.fn()} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('PlanDisplay composite view has no accessibility violations', async () => {
    const { container } = render(
      <PlanDisplay
        plan={samplePlan}
        onUpdateSpend={vi.fn()}
        onToggleBooked={vi.fn()}
        onToggleTask={vi.fn()}
        onReset={vi.fn()}
        onShowToast={vi.fn()}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Layout landmarks (Header, Footer, SkipLink) have no accessibility violations', async () => {
    const { container: headerContainer } = render(<Header />);
    expect(await axe(headerContainer)).toHaveNoViolations();

    const { container: footerContainer } = render(<Footer />);
    expect(await axe(footerContainer)).toHaveNoViolations();

    const { container: skipLinkContainer } = render(<SkipLink />);
    expect(await axe(skipLinkContainer)).toHaveNoViolations();
  });
});
