'use client';

import { useState, useRef, useCallback } from 'react';
import type { EventPlan } from '@/backend/schemas/eventPlanSchema';
import type { ChatMessage } from '@/backend/schemas/chatSchema';

export function useChatStream(currentPlan: EventPlan | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (userText: string) => {
      if (!userText.trim() || !currentPlan || isStreaming) return;

      const newUserMsg: ChatMessage = { role: 'user', content: userText.trim() };
      setMessages((prev) => [...prev, newUserMsg]);
      setIsStreaming(true);
      setError(null);

      // Create empty assistant placeholder message
      const assistantMsgIndex = messages.length + 1;
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userText.trim(),
            currentPlan,
            history: messages.slice(-6)
          }),
          signal: abortControllerRef.current.signal
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `Chat error: ${response.statusText}`);
        }

        if (!response.body) {
          throw new Error('No readable response body received');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunkText = decoder.decode(value, { stream: true });
          const lines = chunkText.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') {
                break;
              }
              try {
                const parsed = JSON.parse(data);
                if (parsed.chunk) {
                  assistantContent += parsed.chunk;
                  setMessages((prev) => {
                    const copy = [...prev];
                    if (copy[assistantMsgIndex]) {
                      copy[assistantMsgIndex] = {
                        role: 'assistant',
                        content: assistantContent
                      };
                    }
                    return copy;
                  });
                }
              } catch {
                // Ignore partial JSON chunks across buffers
              }
            }
          }
        }
      } catch (err: unknown) {
        if ((err as Error)?.name === 'AbortError') {
          console.log('[useChatStream] Request aborted');
        } else {
          const msg = err instanceof Error ? err.message : 'Failed to reach AI assistant';
          setError(msg);
          setMessages((prev) => {
            const copy = [...prev];
            if (copy[assistantMsgIndex]) {
              copy[assistantMsgIndex] = {
                role: 'assistant',
                content: '⚠️ ' + msg
              };
            }
            return copy;
          });
        }
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [currentPlan, isStreaming, messages]
  );

  const abortStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isStreaming,
    error,
    sendMessage,
    abortStream,
    clearMessages
  };
}
