'use client';

import React, { useState } from 'react';
import type { EventPlan } from '@/backend/schemas/eventPlanSchema';
import { formatDate, formatCurrency } from '@/frontend/lib/formatters';
import { BudgetTracker } from './BudgetTracker';
import { TimelineView } from './TimelineView';
import { VendorChecklist } from './VendorChecklist';
import { IdeasView } from './IdeasView';
import { ExportActions } from './ExportActions';
import { ChatRefinement } from '../chat/ChatRefinement';
import { Calendar, Users, DollarSign, MapPin, Sparkles, AlertTriangle, Layers, Clock, CheckSquare, Lightbulb } from 'lucide-react';

interface PlanDisplayProps {
  plan: EventPlan;
  fallbackReason?: string;
  onUpdateSpend: (categoryId: string, actualSpent: number) => void;
  onToggleBooked: (vendorId: string) => void;
  onToggleTask: (milestoneId: string, taskId: string) => void;
  onReset: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

type TabType = 'budget' | 'timeline' | 'vendors' | 'ideas';

export function PlanDisplay({
  plan,
  fallbackReason,
  onUpdateSpend,
  onToggleBooked,
  onToggleTask,
  onReset,
  onShowToast
}: PlanDisplayProps) {
  const [activeTab, setActiveTab] = useState<TabType>('budget');

  const tabs: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
    { id: 'budget', label: 'Budget & Spend', icon: <Layers className="w-4 h-4 mr-1.5" /> },
    { id: 'timeline', label: 'Milestones & Tasks', icon: <Clock className="w-4 h-4 mr-1.5" /> },
    { id: 'vendors', label: 'Vendor Checklist', icon: <CheckSquare className="w-4 h-4 mr-1.5" /> },
    { id: 'ideas', label: 'Personalized Ideas', icon: <Lightbulb className="w-4 h-4 mr-1.5" /> }
  ];

  return (
    <div className="space-y-6">
      {/* Fallback Notice if rule-based generator was engaged */}
      {!plan.isAIGenerated && (
        <div
          role="status"
          aria-live="polite"
          className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start space-x-3"
        >
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div className="text-xs sm:text-sm">
            <p className="font-bold">Offline / Rule-Based Plan Active</p>
            <p className="mt-0.5 text-amber-800 dark:text-amber-300">
              {fallbackReason || 'Showing an authentic, mathematically balanced plan calibrated to your budget and guest count.'}
            </p>
          </div>
        </div>
      )}

      {/* Plan Header Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                {plan.isAIGenerated ? (
                  <>
                    <Sparkles className="w-3 h-3 mr-1" aria-hidden="true" />
                    AI Optimized Plan
                  </>
                ) : (
                  'Standard Curated Plan'
                )}
              </span>
              <span className="text-xs text-gray-400">
                Generated {formatDate(plan.generatedAt)}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-2 tracking-tight">
              {plan.title}
            </h2>

            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed max-w-3xl">
              {plan.summary}
            </p>
          </div>

          <div className="flex-shrink-0">
            <ExportActions plan={plan} onReset={onReset} onShowToast={onShowToast} />
          </div>
        </div>
      </div>

      {/* Accessible Tabs Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-800 print:hidden">
        <nav
          role="tablist"
          aria-label="Event Plan Sections"
          className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-1"
        >
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={isSelected}
                aria-controls={`tabpanel-${tab.id}`}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center whitespace-nowrap px-4 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/30'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Panels */}
      <div
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="focus:outline-none"
      >
        {activeTab === 'budget' && (
          <BudgetTracker
            categories={plan.budgetBreakdown}
            totalBudget={plan.totalBudget}
            currency={plan.currency}
            onUpdateSpend={onUpdateSpend}
          />
        )}

        {activeTab === 'timeline' && (
          <TimelineView timeline={plan.timeline} onToggleTask={onToggleTask} />
        )}

        {activeTab === 'vendors' && (
          <VendorChecklist
            checklist={plan.vendorChecklist}
            currency={plan.currency}
            onToggleBooked={onToggleBooked}
            onShowToast={onShowToast}
          />
        )}

        {activeTab === 'ideas' && (
          <IdeasView
            ideas={plan.personalizedIdeas}
            currency={plan.currency}
            onShowToast={onShowToast}
          />
        )}
      </div>

      {/* Conversational Refinement Drawer / Box */}
      <ChatRefinement plan={plan} />
    </div>
  );
}

