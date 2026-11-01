'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { EventPlan } from '@/backend/schemas/eventPlanSchema';
import { useChatStream } from '@/frontend/hooks/useChatStream';
import { Send, Sparkles, StopCircle, RefreshCw } from 'lucide-react';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface ChatRefinementProps {
  plan: EventPlan;
}

const PRESET_PROMPTS = [
  'How can I reduce catering costs by 15%?',
  'Add traditional Mehendi & Sangeet coordination details',
  'What are top eco-friendly return gift alternatives?',
  'Suggest wet-weather contingency tips for our venue'
];

export function ChatRefinement({ plan }: ChatRefinementProps) {
  const [inputText, setInputText] = useState('');
  const { messages, isStreaming, sendMessage, abortStream, clearMessages } = useChatStream(plan);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isStreaming) return;
    const text = inputText;
    setInputText('');
    await sendMessage(text);
  };

  const handlePresetClick = (preset: string) => {
    if (isStreaming) return;
    sendMessage(preset);
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm print:hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/60 flex items-center justify-center text-brand-600 dark:text-brand-400">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              AI Plan Assistant & Refinement
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Stream live adjustments, cost-cutting ideas, and ceremony variations.
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={clearMessages}
            disabled={isStreaming}
            className="p-1.5 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-lg"
            aria-label="Clear chat conversation"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Preset prompt pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {PRESET_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isStreaming}
            onClick={() => handlePresetClick(prompt)}
            className="text-xs px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Message history */}
      <div
        className="space-y-3 max-h-80 overflow-y-auto p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/80 dark:border-gray-800 mb-4"
        aria-live="polite"
        role="log"
      >
        {messages.length === 0 ? (
          <div className="text-center py-6 text-xs text-gray-500 dark:text-gray-400">
            Ask questions like &ldquo;Cut my photography cost by 20%&rdquo; or click a suggested prompt above.
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                {msg.role === 'user' ? 'You' : 'PlanCraft Assistant'}
              </span>
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm whitespace-pre-wrap leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-brand-600 text-white rounded-br-xs'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-xs shadow-xs'
                }`}
              >
                {msg.content || (
                  <span className="inline-flex items-center space-x-2 text-gray-400">
                    <LoadingSpinner size="sm" />
                    <span>Thinking...</span>
                  </span>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input box */}
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <label htmlFor="chat-refinement-input" className="sr-only">
          Ask AI assistant to refine your event plan
        </label>
        <input
          type="text"
          id="chat-refinement-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="e.g. Can we reallocate 50,000 from decor into catering?"
          disabled={isStreaming}
          maxLength={1000}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
        />

        {isStreaming ? (
          <button
            type="button"
            onClick={abortStream}
            className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
            aria-label="Stop AI generation"
          >
            <StopCircle className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!inputText.trim() || isStreaming}
            className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-label="Send refinement request"
          >
            <Send className="w-5 h-5" />
          </button>
        )}
      </form>
    </div>
  );
}

