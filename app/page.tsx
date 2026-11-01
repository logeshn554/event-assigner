'use client';

import React, { useState } from 'react';
import type { EventInput } from '@/backend/schemas/eventInputSchema';
import { useEventPlan } from '@/frontend/hooks/useEventPlan';
import { EventSetupForm } from '@/frontend/components/form/EventSetupForm';
import { PlanDisplay } from '@/frontend/components/plan/PlanDisplay';
import { Toast, type ToastMessage } from '@/frontend/components/ui/Toast';

export default function HomePage() {
  const {
    plan,
    setPlan,
    clearPlan,
    updateCategorySpend,
    toggleVendorBooked,
    toggleTaskCompleted
  } = useEventPlan();

  const [isLoading, setIsLoading] = useState(false);
  const [fallbackReason, setFallbackReason] = useState<string | undefined>(undefined);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ id: `${Date.now()}`, type, message });
  };

  const handleGeneratePlan = async (input: EventInput) => {
    setIsLoading(true);
    setFallbackReason(undefined);

    try {
      const response = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.error?.message || 'Failed to generate event plan');
      }

      setPlan(data.plan);
      if (data.fallbackUsed) {
        setFallbackReason(data.fallbackReason);
        showToast('Generated rule-based plan (offline/fallback mode active)', 'info');
      } else {
        showToast('Personalized AI event plan successfully created!', 'success');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8 text-center sm:text-left print:hidden">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
          GenAI Event Planning Assistant
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2 max-w-3xl">
          Create structured budgets, chronological timelines, vetted vendor checklists, and bespoke cultural ideas for weddings, birthdays, and community festivals.
        </p>
      </div>

      {plan ? (
        <PlanDisplay
          plan={plan}
          fallbackReason={fallbackReason}
          onUpdateSpend={updateCategorySpend}
          onToggleBooked={toggleVendorBooked}
          onToggleTask={toggleTaskCompleted}
          onReset={clearPlan}
          onShowToast={showToast}
        />
      ) : (
        <EventSetupForm onSubmit={handleGeneratePlan} isLoading={isLoading} />
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

