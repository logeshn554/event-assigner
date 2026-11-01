import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useEventPlan } from '@/frontend/hooks/useEventPlan';
import { generateFallbackPlan } from '@/backend/services/fallbackPlanner';
import type { EventInput } from '@/backend/schemas/eventInputSchema';

describe('useEventPlan Hook', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  const sampleInput: EventInput = {
    eventType: 'wedding',
    eventDate: '2027-01-01',
    city: 'Chennai',
    guestCount: 200,
    totalBudget: 1500000,
    currency: 'INR',
    themeStyle: 'Traditional Royal',
    dietaryNotes: 'Vegetarian'
  };

  it('initializes with null plan', () => {
    const { result } = renderHook(() => useEventPlan());
    expect(result.current.plan).toBeNull();
  });

  it('sets and updates plan state', () => {
    const { result } = renderHook(() => useEventPlan());
    const mockPlan = generateFallbackPlan(sampleInput);

    act(() => {
      result.current.setPlan(mockPlan);
    });

    expect(result.current.plan?.id).toBe(mockPlan.id);
  });

  it('updates actual spent amount for a specific budget category', () => {
    const { result } = renderHook(() => useEventPlan());
    const mockPlan = generateFallbackPlan(sampleInput);

    act(() => {
      result.current.setPlan(mockPlan);
    });

    const categoryId = mockPlan.budgetBreakdown[0].id;
    act(() => {
      result.current.updateCategorySpend(categoryId, 450000);
    });

    expect(result.current.plan?.budgetBreakdown[0].actualSpent).toBe(450000);
  });

  it('toggles vendor checklist item booked status', () => {
    const { result } = renderHook(() => useEventPlan());
    const mockPlan = generateFallbackPlan(sampleInput);

    act(() => {
      result.current.setPlan(mockPlan);
    });

    const vendorId = mockPlan.vendorChecklist[0].id;
    const initialStatus = mockPlan.vendorChecklist[0].isBooked;

    act(() => {
      result.current.toggleVendorBooked(vendorId);
    });

    expect(result.current.plan?.vendorChecklist[0].isBooked).toBe(!initialStatus);
  });

  it('toggles milestone task completion', () => {
    const { result } = renderHook(() => useEventPlan());
    const mockPlan = generateFallbackPlan(sampleInput);

    act(() => {
      result.current.setPlan(mockPlan);
    });

    const milestoneId = mockPlan.timeline[0].id;
    const taskId = mockPlan.timeline[0].tasks[0].id;
    const initialStatus = mockPlan.timeline[0].tasks[0].completed;

    act(() => {
      result.current.toggleTaskCompleted(milestoneId, taskId);
    });

    expect(result.current.plan?.timeline[0].tasks[0].completed).toBe(!initialStatus);
  });

  it('clears active plan cleanly', () => {
    const { result } = renderHook(() => useEventPlan());
    const mockPlan = generateFallbackPlan(sampleInput);

    act(() => {
      result.current.setPlan(mockPlan);
    });
    expect(result.current.plan).not.toBeNull();

    act(() => {
      result.current.clearPlan();
    });
    expect(result.current.plan).toBeNull();
  });
});
