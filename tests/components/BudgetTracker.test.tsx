import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BudgetTracker } from '@/frontend/components/plan/BudgetTracker';
import type { BudgetCategory } from '@/backend/schemas/eventPlanSchema';

describe('Component: BudgetTracker', () => {
  const sampleCategories: BudgetCategory[] = [
    {
      id: 'cat_venue',
      category: 'Venue & Catering',
      percentage: 50,
      allocatedAmount: 500000,
      actualSpent: 450000,
      rationale: 'Banquet and food'
    },
    {
      id: 'cat_decor',
      category: 'Decor',
      percentage: 50,
      allocatedAmount: 500000,
      actualSpent: 0,
      rationale: 'Stage floral setup'
    }
  ];

  it('renders budget summary KPIs, chart, and accessible data table', () => {
    render(
      <BudgetTracker
        categories={sampleCategories}
        totalBudget={1000000}
        currency="INR"
        onUpdateSpend={vi.fn()}
      />
    );

    expect(screen.getByText(/Total Allocated Budget/i)).toBeInTheDocument();
    expect(screen.getByText(/Remaining Balance/i)).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: /Venue & Catering/i })).toBeInTheDocument();
  });

  it('allows clicking an actual spend button to enter an updated value', () => {
    const mockUpdate = vi.fn();
    render(
      <BudgetTracker
        categories={sampleCategories}
        totalBudget={1000000}
        currency="INR"
        onUpdateSpend={mockUpdate}
      />
    );

    const editBtn = screen.getByLabelText(/Edit actual spend for Decor/i);
    fireEvent.click(editBtn);

    const input = screen.getByLabelText(/Actual spend for Decor/i);
    fireEvent.change(input, { target: { value: '480000' } });

    const saveBtn = screen.getByRole('button', { name: /Save/i });
    fireEvent.click(saveBtn);

    expect(mockUpdate).toHaveBeenCalledWith('cat_decor', 480000);
  });
});

