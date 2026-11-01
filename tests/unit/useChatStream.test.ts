import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useChatStream } from '@/frontend/hooks/useChatStream';
import { generateFallbackPlan } from '@/backend/services/fallbackPlanner';

describe('useChatStream Hook', () => {
  const mockPlan = generateFallbackPlan({
    eventType: 'birthday',
    eventDate: '2026-11-20',
    city: 'Mumbai',
    guestCount: 50,
    totalBudget: 200000,
    currency: 'INR'
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('does nothing when text is empty or plan is null', async () => {
    const { result } = renderHook(() => useChatStream(null));

    await act(async () => {
      await result.current.sendMessage('');
    });

    expect(result.current.messages).toEqual([]);
    expect(result.current.isStreaming).toBe(false);
  });

  it('clears messages properly with clearMessages', async () => {
    const { result } = renderHook(() => useChatStream(mockPlan));

    act(() => {
      result.current.clearMessages();
    });

    expect(result.current.messages).toEqual([]);
  });

  it('handles abortStream safely when stream is active or inactive', () => {
    const { result } = renderHook(() => useChatStream(mockPlan));

    act(() => {
      result.current.abortStream();
    });

    expect(result.current.isStreaming).toBe(false);
  });

  it('handles simulated SSE streaming chunks from /api/chat', async () => {
    const sseResponseChunks = [
      'data: {"chunk":"Hello "}\n\n',
      'data: {"chunk":"from AI!"}\n\n',
      'data: [DONE]\n\n'
    ];

    const stream = new ReadableStream({
      start(controller) {
        for (const chunk of sseResponseChunks) {
          controller.enqueue(new TextEncoder().encode(chunk));
        }
        controller.close();
      }
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      body: stream
    } as unknown as Response);

    const { result } = renderHook(() => useChatStream(mockPlan));

    await act(async () => {
      await result.current.sendMessage('Hello assistant');
    });

    expect(result.current.messages.length).toBeGreaterThanOrEqual(2);
    expect(result.current.messages[0].content).toBe('Hello assistant');
    expect(result.current.messages[1].content).toBe('Hello from AI!');
  });

  it('handles network error during chat stream gracefully', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network disconnected'));

    const { result } = renderHook(() => useChatStream(mockPlan));

    await act(async () => {
      await result.current.sendMessage('Test error path');
    });

    expect(result.current.error).toBe('Network disconnected');
    expect(result.current.isStreaming).toBe(false);
  });
});
