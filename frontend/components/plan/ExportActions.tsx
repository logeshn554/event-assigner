'use client';

import React from 'react';
import type { EventPlan } from '@/backend/schemas/eventPlanSchema';
import { triggerPrintPlan, downloadJsonFile } from '@/frontend/lib/print';
import { Printer, Download, RotateCcw, Share2 } from 'lucide-react';

interface ExportActionsProps {
  plan: EventPlan;
  onReset: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function ExportActions({ plan, onReset, onShowToast }: ExportActionsProps) {
  const handlePrint = () => {
    onShowToast('Preparing printable document layout...', 'info');
    setTimeout(() => {
      triggerPrintPlan();
    }, 200);
  };

  const handleDownloadJson = () => {
    const filename = `${plan.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_plan.json`;
    downloadJsonFile(filename, plan);
    onShowToast(`Exported plan to ${filename}`, 'success');
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm print:hidden">
      <div className="flex items-center space-x-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Actions & Export:
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 dark:hover:bg-brand-900/80 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <Printer className="w-4 h-4" aria-hidden="true" />
          <span>Print / Save as PDF</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadJson}
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
          <span>Download JSON</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-900/80 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          <span>New Plan</span>
        </button>
      </div>
    </div>
  );
}

