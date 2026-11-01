import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useLocalStorage } from '@/frontend/hooks/useLocalStorage';

describe('useLocalStorage Hook', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('reads initial value when storage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test_key', 'initial_value'));
    expect(result.current[0]).toBe('initial_value');
  });

  it('stores and updates values in localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test_key', 100));

    act(() => {
      result.current[1](250);
    });

    expect(result.current[0]).toBe(250);
    expect(window.localStorage.getItem('test_key')).toBe('250');
  });

  it('validates schema and falls back to initial value when stored data is corrupt', () => {
    window.localStorage.setItem('validated_key', JSON.stringify({ count: 'invalid_number' }));

    const isCountValid = (data: unknown): data is { count: number } =>
      Boolean(data && typeof (data as { count: number }).count === 'number');

    const { result } = renderHook(() =>
      useLocalStorage('validated_key', { count: 0 }, isCountValid)
    );

    expect(result.current[0]).toEqual({ count: 0 });
  });

  it('handles QuotaExceededError safely without throwing', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      const err = new Error('Quota exceeded');
      err.name = 'QuotaExceededError';
      throw err;
    });

    const { result } = renderHook(() => useLocalStorage('quota_key', 'safe_default'));

    act(() => {
      result.current[1]('overflow_value');
    });

    // Should update in-memory state despite storage quota rejection
    expect(result.current[0]).toBe('overflow_value');
    setItemSpy.mockRestore();
  });

  it('removes item from localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('remove_key', 'stored'));

    act(() => {
      result.current[2]();
    });

    expect(window.localStorage.getItem('remove_key')).toBeNull();
    expect(result.current[0]).toBe('stored');
  });
});
