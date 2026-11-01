'use client';

import { useCallback } from 'react';
import type { EventPlan, BudgetCategory, VendorChecklistItem } from '@/backend/schemas/eventPlanSchema';
import { eventPlanSchema } from '@/backend/schemas/eventPlanSchema';
import { useLocalStorage } from './useLocalStorage';
import { CURRENT_PLAN_STORAGE_KEY } from '@/backend/utils/constants';

function isEventPlan(data: unknown): data is EventPlan {
  const result = eventPlanSchema.safeParse(data);
  return result.success;
}

export function useEventPlan() {
  const [currentPlan, setCurrentPlan, clearCurrentPlan] = useLocalStorage<EventPlan | null>(
    CURRENT_PLAN_STORAGE_KEY,
    null,
    isEventPlan
  );

  // Update actual spent for a specific budget category
  const updateCategorySpend = useCallback(
    (categoryId: string, actualSpent: number) => {
      setCurrentPlan((prev) => {
        if (!prev) return prev;
        const updatedBreakdown = prev.budgetBreakdown.map((cat: BudgetCategory) => {
          if (cat.id === categoryId) {
            return { ...cat, actualSpent: Math.max(0, actualSpent) };
          }
          return cat;
        });
        return { ...prev, budgetBreakdown: updatedBreakdown };
      });
    },
    [setCurrentPlan]
  );

  // Toggle vendor checklist item booked status
  const toggleVendorBooked = useCallback(
    (vendorId: string) => {
      setCurrentPlan((prev) => {
        if (!prev) return prev;
        const updatedChecklist = prev.vendorChecklist.map((item: VendorChecklistItem) => {
          if (item.id === vendorId) {
            return { ...item, isBooked: !item.isBooked };
          }
          return item;
        });
        return { ...prev, vendorChecklist: updatedChecklist };
      });
    },
    [setCurrentPlan]
  );

  // Toggle timeline task completed status
  const toggleTaskCompleted = useCallback(
    (milestoneId: string, taskId: string) => {
      setCurrentPlan((prev) => {
        if (!prev) return prev;
        const updatedTimeline = prev.timeline.map((m) => {
          if (m.id === milestoneId) {
            const updatedTasks = m.tasks.map((t) =>
              t.id === taskId ? { ...t, completed: !t.completed } : t
            );
            return { ...m, tasks: updatedTasks };
          }
          return m;
        });
        return { ...prev, timeline: updatedTimeline };
      });
    },
    [setCurrentPlan]
  );

  return {
    plan: currentPlan,
    setPlan: setCurrentPlan,
    clearPlan: clearCurrentPlan,
    updateCategorySpend,
    toggleVendorBooked,
    toggleTaskCompleted
  };
}
