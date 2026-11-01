'use client';

import React, { useState } from 'react';
import type { PersonalizedIdeas } from '@/backend/schemas/eventPlanSchema';
import type { CurrencyCode } from '@/backend/utils/constants';
import { formatCurrency } from '@/frontend/lib/formatters';
import { Sparkles, Utensils, Gift, Mail, Activity, Copy, CheckCheck } from 'lucide-react';

interface IdeasViewProps {
  ideas: PersonalizedIdeas;
  currency: CurrencyCode;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function IdeasView({ ideas, currency, onShowToast }: IdeasViewProps) {
  const [copiedInvite, setCopiedInvite] = useState(false);

  const handleCopyInvite = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(ideas.invitationWording);
      setCopiedInvite(true);
      onShowToast('Invitation wording copied to clipboard!', 'success');
      setTimeout(() => setCopiedInvite(false), 2500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Themes and Styling */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center space-x-2.5 mb-4">
          <Sparkles className="w-5 h-5 text-brand-600 dark:text-brand-400" aria-hidden="true" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Themes & Aesthetic Concepts
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ideas.themes.map((theme, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-gradient-to-br from-brand-50/50 to-purple-50/30 dark:from-gray-800/60 dark:to-gray-800/30 border border-brand-100 dark:border-gray-700"
            >
              <h4 className="text-base font-bold text-gray-900 dark:text-white">
                {theme.name}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1.5 leading-relaxed">
                {theme.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Activities */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center space-x-2.5 mb-4">
          <Activity className="w-5 h-5 text-brand-600 dark:text-brand-400" aria-hidden="true" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Guest Engagement & Signature Moments
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ideas.activities.map((act, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800"
            >
              <span className="inline-block text-[11px] font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-1">
                {act.timelineStage}
              </span>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                {act.name}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {act.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Menu & Culinary Recommendations */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center space-x-2.5 mb-4">
          <Utensils className="w-5 h-5 text-brand-600 dark:text-brand-400" aria-hidden="true" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Curated Menu & Culinary Pairings
          </h3>
        </div>
        <div className="space-y-4">
          {ideas.menuRecommendations.map((menu, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  {menu.course}
                </h4>
                {menu.dietaryNotes && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {menu.dietaryNotes}
                  </span>
                )}
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-gray-700 dark:text-gray-300">
                {menu.items.map((item, i) => (
                  <li key={i} className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Return Gifts & Invitation Wording */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Invitation Wording */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Mail className="w-4 h-4 text-brand-600 dark:text-brand-400" aria-hidden="true" />
              <h4 className="text-base font-bold text-gray-900 dark:text-white">
                Formal Invitation Draft
              </h4>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 italic p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700 leading-relaxed">
              &ldquo;{ideas.invitationWording}&rdquo;
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopyInvite}
            aria-label="Copy invitation draft text to clipboard"
            className="mt-4 inline-flex items-center justify-center space-x-2 min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {copiedInvite ? (
              <>
                <CheckCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                <span>Copied Wording!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" aria-hidden="true" />
                <span>Copy Invitation Text</span>
              </>
            )}
          </button>
        </div>

        {/* Return Gifts / Favors */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-3">
            <Gift className="w-4 h-4 text-brand-600 dark:text-brand-400" aria-hidden="true" />
            <h4 className="text-base font-bold text-gray-900 dark:text-white">
              Return Favors & Guest Gifts
            </h4>
          </div>
          <div className="space-y-3">
            {ideas.returnGifts.map((gift, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-800"
              >
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-gray-900 dark:text-white">
                    {gift.item}
                  </h5>
                  <span className="text-xs font-semibold text-brand-700 dark:text-brand-300">
                    ~{formatCurrency(gift.estimatedUnitCost, currency)} / unit
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  {gift.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

