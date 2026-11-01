import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { VendorChecklist } from '@/frontend/components/plan/VendorChecklist';
import type { VendorChecklistItem } from '@/backend/schemas/eventPlanSchema';

describe('Component: VendorChecklist', () => {
  const sampleChecklist: VendorChecklistItem[] = [
    {
      id: 'v_venue',
      category: 'Venue',
      vendorType: 'Banquet Hall Partner',
      estimatedCostMin: 400000,
      estimatedCostMax: 500000,
      questionsToAsk: ['Is outside catering allowed?', 'What is the deposit policy?'],
      isBooked: false,
      notes: ''
    }
  ];

  it('renders vendor cards with cost ranges and questions', () => {
    render(
      <VendorChecklist
        checklist={sampleChecklist}
        currency="INR"
        onToggleBooked={vi.fn()}
        onShowToast={vi.fn()}
      />
    );

    expect(screen.getByText(/Banquet Hall Partner/i)).toBeInTheDocument();
    expect(screen.getByText(/Is outside catering allowed\?/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Mark Booked/i })).toBeInTheDocument();
  });

  it('calls onToggleBooked when the booked button is clicked', () => {
    const mockToggle = vi.fn();
    render(
      <VendorChecklist
        checklist={sampleChecklist}
        currency="INR"
        onToggleBooked={mockToggle}
        onShowToast={vi.fn()}
      />
    );

    const bookBtn = screen.getByRole('button', { name: /Mark Booked/i });
    fireEvent.click(bookBtn);
    expect(mockToggle).toHaveBeenCalledWith('v_venue');
  });
});
