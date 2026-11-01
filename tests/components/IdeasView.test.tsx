import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, it, expect, vi } from 'vitest';
import { IdeasView } from '@/frontend/components/plan/IdeasView';
import type { PersonalizedIdeas } from '@/backend/schemas/eventPlanSchema';

describe('IdeasView Component', () => {
  const mockIdeas: PersonalizedIdeas = {
    themes: [
      {
        name: 'Royal Heritage',
        description: 'Deep maroon and antique gold velvet drapery with brass accents.'
      }
    ],
    activities: [
      {
        name: 'Sangeet Dance Off',
        description: 'Choreographed friendly competition between families.',
        timelineStage: 'Evening Celebration'
      }
    ],
    menuRecommendations: [
      {
        course: 'Main Feast',
        items: ['Paneer Tikka Butter Masala', 'Dum Biryani', 'Assorted Naan'],
        dietaryNotes: 'Pure Vegetarian'
      }
    ],
    invitationWording: 'Join us as we celebrate love, laughter, and new beginnings.',
    returnGifts: [
      {
        item: 'Handcrafted Brass Diya',
        estimatedUnitCost: 450,
        description: 'Custom etched commemorative diya in a gift box.'
      }
    ]
  };

  it('renders themes, activities, menu highlights, and return gifts', () => {
    render(<IdeasView ideas={mockIdeas} currency="INR" onShowToast={vi.fn()} />);

    expect(screen.getByText('Royal Heritage')).toBeInTheDocument();
    expect(screen.getByText('Sangeet Dance Off')).toBeInTheDocument();
    expect(screen.getByText('Paneer Tikka Butter Masala')).toBeInTheDocument();
    expect(screen.getByText('Handcrafted Brass Diya')).toBeInTheDocument();
  });

  it('handles invitation text copying', () => {
    const onShowToastMock = vi.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined)
      }
    });

    render(<IdeasView ideas={mockIdeas} currency="INR" onShowToast={onShowToastMock} />);

    const copyBtn = screen.getByLabelText(/Copy invitation draft text/i);
    fireEvent.click(copyBtn);

    expect(onShowToastMock).toHaveBeenCalledWith('Invitation wording copied to clipboard!', 'success');
  });

  it('passes axe accessibility audit with 0 violations', async () => {
    const { container } = render(<IdeasView ideas={mockIdeas} currency="INR" onShowToast={vi.fn()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
