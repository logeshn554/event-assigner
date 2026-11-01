import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, it, expect, vi } from 'vitest';
import { ExportActions } from '@/frontend/components/plan/ExportActions';
import { generateFallbackPlan } from '@/backend/services/fallbackPlanner';

describe('ExportActions Component', () => {
  const mockPlan = generateFallbackPlan({
    eventType: 'birthday',
    eventDate: '2026-11-20',
    city: 'Mumbai',
    guestCount: 50,
    totalBudget: 200000,
    currency: 'INR'
  });

  it('renders print, download, and reset action buttons', () => {
    render(<ExportActions plan={mockPlan} onReset={vi.fn()} onShowToast={vi.fn()} />);

    expect(screen.getByText('Print / Save as PDF')).toBeInTheDocument();
    expect(screen.getByText('Download JSON')).toBeInTheDocument();
    expect(screen.getByText('New Plan')).toBeInTheDocument();
  });

  it('triggers print and download JSON callbacks and notifications', () => {
    const onShowToastMock = vi.fn();
    render(<ExportActions plan={mockPlan} onReset={vi.fn()} onShowToast={onShowToastMock} />);

    const printBtn = screen.getByLabelText(/Print or save event plan as PDF/i);
    fireEvent.click(printBtn);
    expect(onShowToastMock).toHaveBeenCalledWith('Preparing printable document layout...', 'info');

    const downloadBtn = screen.getByLabelText(/Download event plan as JSON file/i);
    fireEvent.click(downloadBtn);
    expect(onShowToastMock).toHaveBeenCalledWith(expect.stringContaining('Exported plan to'), 'success');
  });

  it('calls onReset when clicking new plan button', () => {
    const onResetMock = vi.fn();
    render(<ExportActions plan={mockPlan} onReset={onResetMock} onShowToast={vi.fn()} />);

    const resetBtn = screen.getByLabelText(/Reset and create a new event plan/i);
    fireEvent.click(resetBtn);

    expect(onResetMock).toHaveBeenCalled();
  });

  it('passes axe accessibility audit with 0 violations', async () => {
    const { container } = render(
      <ExportActions plan={mockPlan} onReset={vi.fn()} onShowToast={vi.fn()} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
