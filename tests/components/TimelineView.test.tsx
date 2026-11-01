import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, it, expect, vi } from 'vitest';
import { TimelineView } from '@/frontend/components/plan/TimelineView';
import type { TimelineMilestone } from '@/backend/schemas/eventPlanSchema';

describe('TimelineView Component', () => {
  const mockTimeline: TimelineMilestone[] = [
    {
      id: 'm1',
      tMinusWeeks: 8,
      phaseTitle: 'Initial Planning & Bookings',
      tasks: [
        {
          id: 't1',
          title: 'Finalize venue and secure deposit',
          owner: 'Host',
          priority: 'high',
          completed: false
        },
        {
          id: 't2',
          title: 'Send out save-the-dates',
          owner: 'Couple',
          priority: 'medium',
          completed: true
        }
      ]
    }
  ];

  it('renders milestones, phase titles, and task owners', () => {
    render(<TimelineView timeline={mockTimeline} onToggleTask={vi.fn()} />);

    expect(screen.getByText('Milestone Timeline & Action Plan')).toBeInTheDocument();
    expect(screen.getByText('Initial Planning & Bookings')).toBeInTheDocument();
    expect(screen.getByText('Finalize venue and secure deposit')).toBeInTheDocument();
    expect(screen.getByText('Couple')).toBeInTheDocument();
  });

  it('triggers onToggleTask when checkbox is clicked', () => {
    const onToggleMock = vi.fn();
    render(<TimelineView timeline={mockTimeline} onToggleTask={onToggleMock} />);

    const checkbox = screen.getByLabelText(/Mark task completed: Finalize venue/i);
    fireEvent.click(checkbox);

    expect(onToggleMock).toHaveBeenCalledWith('m1', 't1');
  });

  it('passes axe accessibility audit with 0 violations', async () => {
    const { container } = render(<TimelineView timeline={mockTimeline} onToggleTask={vi.fn()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

