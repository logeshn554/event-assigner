'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" aria-hidden="true" />,
    info: <Info className="w-5 h-5 text-brand-600 dark:text-brand-400" aria-hidden="true" />
  };

  const bgStyles = {
    success: 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100',
    error: 'bg-rose-50 dark:bg-rose-950 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100',
    info: 'bg-brand-50 dark:bg-brand-950 border-brand-200 dark:border-brand-800 text-brand-900 dark:text-brand-100'
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-5 right-5 z-50 max-w-sm w-full transition-all duration-300"
    >
      <div className={`p-4 rounded-xl border shadow-lg flex items-center justify-between ${bgStyles[toast.type]}`}>
        <div className="flex items-center space-x-3">
          {icons[toast.type]}
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-current"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

