import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EventSetupForm } from '@/frontend/components/form/EventSetupForm';

describe('Component: EventSetupForm', () => {
  it('renders all form input fields with visible accessible labels', () => {
    render(<EventSetupForm onSubmit={vi.fn()} isLoading={false} />);

    expect(screen.getByLabelText(/Event Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Target Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/City \/ Destination/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Guest Count/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Total Budget/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Currency/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Generate Complete Event Plan/i })).toBeInTheDocument();
  });

  it('displays validation error alerts when required inputs are cleared', async () => {
    const mockSubmit = vi.fn();
    render(<EventSetupForm onSubmit={mockSubmit} isLoading={false} />);

    const cityInput = screen.getByLabelText(/City \/ Destination/i);
    fireEvent.change(cityInput, { target: { value: '' } });

    const submitBtn = screen.getByRole('button', { name: /Generate Complete Event Plan/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/City name must have at least 2 characters/i)).toBeInTheDocument();
    });
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('submits valid data when form is filled and submitted', async () => {
    const mockSubmit = vi.fn().mockResolvedValue(undefined);
    render(<EventSetupForm onSubmit={mockSubmit} isLoading={false} />);

    const submitBtn = screen.getByRole('button', { name: /Generate Complete Event Plan/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledTimes(1);
    });
  });
});
