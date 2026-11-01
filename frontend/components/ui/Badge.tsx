import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  const variantStyles = {
    default: 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100',
    success: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700',
    warning: 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-700',
    danger: 'bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border border-rose-300 dark:border-rose-700',
    info: 'bg-brand-50 text-brand-800 dark:bg-brand-950 dark:text-brand-200 border border-brand-300 dark:border-brand-700'
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

