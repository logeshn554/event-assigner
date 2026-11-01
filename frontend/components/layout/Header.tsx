import React from 'react';
import { Calendar, Sparkles, ShieldCheck } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur sticky top-0 z-30 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm shadow-brand-500/30">
            <Calendar className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-gray-900 dark:text-white tracking-tight">
                PlanCraft AI
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                <Sparkles className="w-3 h-3 mr-1" aria-hidden="true" />
                Assistant
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Weddings • Birthdays • Community Events
            </p>
          </div>
        </div>

        <nav aria-label="Main Navigation" className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            <span>Secure & Private</span>
          </div>
          <a
            href="#faq-info"
            className="text-xs text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 rounded px-2 py-1"
          >
            Guidelines
          </a>
        </nav>
      </div>
    </header>
  );
}

