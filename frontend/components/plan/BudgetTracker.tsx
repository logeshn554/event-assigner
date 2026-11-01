'use client';

import React, { useState } from 'react';
import type { BudgetCategory } from '@/backend/schemas/eventPlanSchema';
import type { CurrencyCode } from '@/backend/utils/constants';
import { formatCurrency, formatPercentage } from '@/frontend/lib/formatters';
import { BudgetChart } from './BudgetChart';
import { AlertCircle, CheckCircle, TrendingDown, TrendingUp } from 'lucide-react';

interface BudgetTrackerProps {
  categories: BudgetCategory[];
  totalBudget: number;
  currency: CurrencyCode;
  onUpdateSpend: (categoryId: string, actualSpent: number) => void;
}

export function BudgetTracker({
  categories,
  totalBudget,
  currency,
  onUpdateSpend
}: BudgetTrackerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');

  const totalActual = categories.reduce((sum, c) => sum + (c.actualSpent || 0), 0);
  const variance = totalBudget - totalActual;
  const isOverBudget = variance < 0;

  const handleStartEdit = (cat: BudgetCategory) => {
    setEditingId(cat.id);
    setTempValue(cat.actualSpent ? cat.actualSpent.toString() : '');
  };

  const handleSaveEdit = (catId: string) => {
    const val = parseFloat(tempValue);
    onUpdateSpend(catId, isNaN(val) ? 0 : val);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Total Allocated Budget
          </p>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
            {formatCurrency(totalBudget, currency)}
          </p>
          <p className="text-xs text-gray-500 mt-1">100% Target Sum</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Total Actual Spend
          </p>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
            {formatCurrency(totalActual, currency)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {totalBudget > 0 ? formatPercentage((totalActual / totalBudget) * 100) : '0%'} of allocated
          </p>
        </div>

        <div className={`p-5 rounded-2xl border ${isOverBudget ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800' : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'}`}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Remaining Balance
            </p>
            {isOverBudget ? (
              <span className="flex items-center text-xs font-bold text-rose-700 dark:text-rose-400">
                <AlertCircle className="w-4 h-4 mr-1" aria-hidden="true" />
                Over Budget
              </span>
            ) : (
              <span className="flex items-center text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <CheckCircle className="w-4 h-4 mr-1" aria-hidden="true" />
                On Track
              </span>
            )}
          </div>
          <p className={`text-2xl font-extrabold mt-1 ${isOverBudget ? 'text-rose-700 dark:text-rose-300' : 'text-emerald-700 dark:text-emerald-300'}`}>
            {formatCurrency(Math.abs(variance), currency)}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {isOverBudget ? 'Deficit from planned budget' : 'Surplus available for contingency'}
          </p>
        </div>
      </div>

      {/* SVG Proportional Chart */}
      <BudgetChart categories={categories} totalBudget={totalBudget} currency={currency} />

      {/* Accessible Interactive Data Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Category Breakdown & Spend Tracker
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Click or select any actual spend cell to record vendor payments.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <caption className="sr-only">Budget categories with allocated, actual, variance and rationale</caption>
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                <th scope="col" className="py-3.5 px-4">Category</th>
                <th scope="col" className="py-3.5 px-4 text-right">Share</th>
                <th scope="col" className="py-3.5 px-4 text-right">Allocated</th>
                <th scope="col" className="py-3.5 px-4 text-right">Actual Spent</th>
                <th scope="col" className="py-3.5 px-4 text-right">Variance</th>
                <th scope="col" className="py-3.5 px-4">Status & Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {categories.map((cat) => {
                const catVariance = cat.allocatedAmount - (cat.actualSpent || 0);
                const isCatOver = catVariance < 0;
                const isEditing = editingId === cat.id;

                return (
                  <tr
                    key={cat.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    <th scope="row" className="py-3.5 px-4 font-semibold text-gray-900 dark:text-white">
                      {cat.category}
                    </th>
                    <td className="py-3.5 px-4 text-right text-gray-600 dark:text-gray-400">
                      {cat.percentage}%
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-gray-900 dark:text-white">
                      {formatCurrency(cat.allocatedAmount, currency)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end space-x-1">
                          <label htmlFor={`input-spend-${cat.id}`} className="sr-only">
                            Actual spend for {cat.category}
                          </label>
                          <input
                            type="number"
                            id={`input-spend-${cat.id}`}
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(cat.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            autoFocus
                            className="w-24 px-2 py-1 text-right text-xs rounded border border-brand-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(cat.id)}
                            className="px-2 py-1 text-xs bg-brand-600 text-white rounded hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleStartEdit(cat)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
                          aria-label={`Edit actual spend for ${cat.category}, currently ${formatCurrency(cat.actualSpent || 0, currency)}`}
                        >
                          {cat.actualSpent ? formatCurrency(cat.actualSpent, currency) : '₹0 (Set)'}
                        </button>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`inline-flex items-center font-bold text-xs ${isCatOver ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}
                      >
                        {isCatOver ? (
                          <>
                            <TrendingUp className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                            +{formatCurrency(Math.abs(catVariance), currency)}
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                            -{formatCurrency(catVariance, currency)}
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-500 dark:text-gray-400 max-w-xs">
                      {cat.rationale}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

