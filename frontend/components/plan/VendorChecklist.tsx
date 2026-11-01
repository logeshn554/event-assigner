'use client';

import React, { useState } from 'react';
import type { VendorChecklistItem } from '@/backend/schemas/eventPlanSchema';
import type { CurrencyCode } from '@/backend/utils/constants';
import { formatCurrency } from '@/frontend/lib/formatters';
import { Check, Copy, CheckCheck, HelpCircle } from 'lucide-react';

interface VendorChecklistProps {
  checklist: VendorChecklistItem[];
  currency: CurrencyCode;
  onToggleBooked: (vendorId: string) => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function VendorChecklist({
  checklist,
  currency,
  onToggleBooked,
  onShowToast
}: VendorChecklistProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyChecklist = () => {
    const text = checklist
      .map((item) => {
        const status = item.isBooked ? '[X] BOOKED' : '[ ] PENDING';
        const cost = `${formatCurrency(item.estimatedCostMin, currency)} - ${formatCurrency(item.estimatedCostMax, currency)}`;
        const questions = item.questionsToAsk.map((q) => `   - ${q}`).join('\n');
        return `${status} ${item.category} (${item.vendorType})\nEst. Cost: ${cost}\nVetting Questions:\n${questions}`;
      })
      .join('\n\n');

    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      onShowToast('Vendor checklist copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const bookedCount = checklist.filter((i) => i.isBooked).length;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Vendor Sourcing & Interview Checklist
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            {bookedCount} of {checklist.length} vendors secured. Essential interview questions and cost ranges.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopyChecklist}
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {copied ? (
            <>
              <CheckCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" aria-hidden="true" />
              <span>Copy Checklist</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {checklist.map((item) => (
          <div
            key={item.id}
            className={`p-5 rounded-2xl border transition-all ${item.isBooked ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800' : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800'}`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  {item.category}
                </span>
                <h4 className="text-base font-bold text-gray-900 dark:text-white">
                  {item.vendorType}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Est. Cost: <strong className="text-gray-800 dark:text-gray-200 font-semibold">{formatCurrency(item.estimatedCostMin, currency)} – {formatCurrency(item.estimatedCostMax, currency)}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => onToggleBooked(item.id)}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${item.isBooked ? 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500' : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 focus:ring-brand-500'}`}
                aria-pressed={item.isBooked}
              >
                <Check className={`w-3.5 h-3.5 ${item.isBooked ? 'text-white' : 'text-gray-400'}`} aria-hidden="true" />
                <span>{item.isBooked ? 'Booked' : 'Mark Booked'}</span>
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200/60 dark:border-gray-700/60">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <HelpCircle className="w-3.5 h-3.5 mr-1 text-brand-500" aria-hidden="true" />
                Key Questions to Ask:
              </p>
              <ul className="space-y-1.5 pl-4 list-disc text-xs text-gray-600 dark:text-gray-400">
                {item.questionsToAsk.map((q, idx) => (
                  <li key={idx}>{q}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
