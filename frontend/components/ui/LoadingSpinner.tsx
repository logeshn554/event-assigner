import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export function LoadingSpinner({
  size = 'md',
  label = 'Loading, please wait...',
  className = ''
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3'
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`inline-flex items-center justify-center space-x-2 ${className}`}
    >
      <div
        className={`${sizeClasses[size]} border-brand-200 border-t-brand-600 rounded-full animate-spin`}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

