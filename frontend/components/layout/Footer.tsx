import React from 'react';
import { Shield } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 mt-16 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 dark:text-gray-400 gap-4">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-brand-600 dark:text-brand-400" aria-hidden="true" />
          <span>Strict Input Sanitization • Zero Client Secret Exposure • WCAG 2.1 AA Accessible</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>Powered by Google Gemini 2.5 Flash</span>
          <span>•</span>
          <span>Offline Fallback Ready</span>
        </div>
      </div>
    </footer>
  );
}
