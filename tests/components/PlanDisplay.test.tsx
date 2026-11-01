import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, it, expect, vi } from 'vitest';
import { PlanDisplay } from '@/frontend/components/plan/PlanDisplay';
import { generateFallbackPlan } from '@/backend/services/fallbackPlanner';

describe('PlanDisplay Component', () => {
  const mockPlan = generateFallbackPlan({
    eventType: 'community',
    eventDate: '2026-12-15',
    city: 'Bangalore',
    guestCount: 300,
    totalBudget: 500000,
    currency: 'INR'
  });

  const defaultProps = {
    plan: mockPlan,
    onUpdateSpend: vi.fn(),
    onToggleBooked: vi.fn(),
    onToggleTask: vi.fn(),
    onReset: vi.fn(),
    onShowToast: vi.fn()
  };

  it('renders plan title, summary metrics, and tab navigation', () => {
    render(<PlanDisplay {...defaultProps} />);

    expect(screen.getByText(mockPlan.title)).toBeInTheDocument();
    expect(screen.getByText(/300 Guests/i)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Budget & Spend/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Milestones & Tasks/i })).toBeInTheDocument();
  });

  it('switches tabs smoothly when clicked', () => {
    render(<PlanDisplay {...defaultProps} />);

    const timelineTab = screen.getByRole('tab', { name: /Milestones & Tasks/i });
    fireEvent.click(timelineTab);

    expect(screen.getByText(/Milestone Timeline & Action Plan/i)).toBeInTheDocument();

    const checklistTab = screen.getByRole('tab', { name: /Vendor Checklist/i });
    fireEvent.click(checklistTab);

    expect(screen.getByText(/Vendor Sourcing & Interview Checklist/i)).toBeInTheDocument();
  });

  it('displays fallback rule-based banner when fallbackReason is provided', () => {
    render(
      <PlanDisplay
        {...defaultProps}
        fallbackReason="AI service temporarily unavailable, showing an authentic rule-based plan."
      />
    );

    expect(screen.getByText(/Offline \/ Rule-Based Plan Active/i)).toBeInTheDocument();
    expect(
      screen.getByText(/AI service temporarily unavailable/i)
    ).toBeInTheDocument();
  });

  it('passes axe accessibility audit with 0 violations', async () => {
    const { container } = render(<PlanDisplay {...defaultProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
