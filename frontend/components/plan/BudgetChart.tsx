'use client';

import React from 'react';
import type { BudgetCategory } from '@/backend/schemas/eventPlanSchema';
import type { CurrencyCode } from '@/backend/utils/constants';
import { formatCurrency } from '@/frontend/lib/formatters';

interface BudgetChartProps {
  categories: BudgetCategory[];
  totalBudget: number;
  currency: CurrencyCode;
}

const PALETTE = [
  '#4361ee', // brand blue
  '#3a0ca3', // deep purple
  '#7209b7', // violet
  '#f72585', // magenta
  '#4cc9f0', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#6b7280'  // slate gray
];

export function BudgetChart({ categories, totalBudget, currency }: BudgetChartProps) {
  const totalActual = categories.reduce((sum, c) => sum + (c.actualSpent || 0), 0);
  const isOverBudget = totalActual > totalBudget;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
        Budget Allocation Overview
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
        Proportional target distribution across event categories.
      </p>

      {/* Accessible SVG Horizontal Stacked Bar */}
      <div className="space-y-4">
        <svg
          role="img"
          aria-label="Stacked bar chart illustrating budget distribution by category"
          viewBox="0 0 100 12"
          className="w-full h-8 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800"
          preserveAspectRatio="none"
        >
          <title>Budget Allocation by Category</title>
          <desc>
            {categories
              .map((c) => `${c.category}: ${c.percentage}% (${formatCurrency(c.allocatedAmount, currency)})`)
              .join(', ')}
          </desc>
          {categories.reduce<{ elements: React.ReactNode[]; currentOffset: number }>(
            (acc, cat, idx) => {
              const width = Math.max(0, cat.percentage);
              const color = PALETTE[idx % PALETTE.length];
              const rect = (
                <rect
                  key={cat.id}
                  x={acc.currentOffset}
                  y="0"
                  width={width}
                  height="12"
                  fill={color}
                />
              );
              return {
                elements: [...acc.elements, rect],
                currentOffset: acc.currentOffset + width
              };
            },
            { elements: [], currentOffset: 0 }
          ).elements}
        </svg>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          {categories.map((cat, idx) => {
            const color = PALETTE[idx % PALETTE.length];
            return (
              <div key={cat.id} className="flex items-start space-x-2 text-xs">
                <span
                  className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0"
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                />
                <div className="truncate">
                  <span className="font-semibold text-gray-800 dark:text-gray-200 block truncate">
                    {cat.category}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {cat.percentage}% • {formatCurrency(cat.allocatedAmount, currency)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
