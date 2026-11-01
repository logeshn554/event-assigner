import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, it, expect } from 'vitest';
import { ChatRefinement } from '@/frontend/components/chat/ChatRefinement';
import { generateFallbackPlan } from '@/backend/services/fallbackPlanner';

describe('ChatRefinement Component', () => {
  const mockPlan = generateFallbackPlan({
    eventType: 'wedding',
    eventDate: '2027-01-01',
    city: 'Delhi',
    guestCount: 200,
    totalBudget: 1000000,
    currency: 'INR'
  });

  it('renders chat interface with quick suggestion chips and input field', () => {
    render(<ChatRefinement plan={mockPlan} />);

    expect(screen.getByText('AI Plan Assistant & Refinement')).toBeInTheDocument();
    expect(screen.getByText(/How can I reduce catering costs by 15%\?/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Can we reallocate/i)
    ).toBeInTheDocument();
  });

  it('passes axe accessibility audit with 0 violations', async () => {
    const { container } = render(<ChatRefinement plan={mockPlan} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
