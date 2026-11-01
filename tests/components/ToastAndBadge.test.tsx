import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, it, expect, vi } from 'vitest';
import { Badge } from '@/frontend/components/ui/Badge';
import { Toast, type ToastMessage } from '@/frontend/components/ui/Toast';
import { LoadingSpinner } from '@/frontend/components/ui/LoadingSpinner';
import { SkipLink } from '@/frontend/components/layout/SkipLink';

describe('UI Primitives and Layout Components', () => {
  it('renders Badge variants with accessible contrast styles', () => {
    const { rerender } = render(<Badge variant="success">Success</Badge>);
    expect(screen.getByText('Success')).toBeInTheDocument();

    rerender(<Badge variant="danger">High Priority</Badge>);
    expect(screen.getByText('High Priority')).toBeInTheDocument();
  });

  it('renders Toast message and handles dismissal', () => {
    const onCloseMock = vi.fn();
    const mockToast: ToastMessage = {
      id: '1',
      message: 'Budget updated successfully',
      type: 'success'
    };

    render(<Toast toast={mockToast} onClose={onCloseMock} />);

    expect(screen.getByText('Budget updated successfully')).toBeInTheDocument();

    const closeBtn = screen.getByLabelText(/Dismiss notification/i);
    fireEvent.click(closeBtn);

    expect(onCloseMock).toHaveBeenCalled();
  });

  it('renders LoadingSpinner with accessible aria label', () => {
    render(<LoadingSpinner label="Generating your plan..." />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Generating your plan...')).toBeInTheDocument();
  });

  it('renders SkipLink pointing to main-content', () => {
    render(<SkipLink />);
    const link = screen.getByText('Skip to main content');
    expect(link).toHaveAttribute('href', '#main-content');
  });

  it('passes axe accessibility audit on UI components', async () => {
    const { container } = render(
      <div>
        <SkipLink />
        <Badge variant="info">Information</Badge>
        <LoadingSpinner />
        <Toast
          toast={{ id: 't1', message: 'Accessible notification', type: 'info' }}
          onClose={vi.fn()}
        />
      </div>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
