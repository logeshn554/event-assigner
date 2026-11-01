'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Robust React hook for safe localStorage persistence with quota handling and schema validation.
 * Never crashes the application if localStorage quota is exceeded or storage is disabled.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  validator?: (data: unknown) => data is T
): [T, (val: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Read stored value on client mount
  useEffect(() => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        if (!validator || validator(parsed)) {
          setStoredValue(parsed);
        } else {
          console.warn(`[useLocalStorage] Validation failed for key "${key}", falling back to initial value.`);
        }
      }
    } catch (error) {
      console.warn(`[useLocalStorage] Error accessing localStorage for key "${key}":`, error);
    }
  }, [key, validator]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((current) => {
        const nextValue = value instanceof Function ? value(current) : value;

        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(key, JSON.stringify(nextValue));
          }
        } catch (storageError: unknown) {
          console.warn(
            `[useLocalStorage] Storage write failed (QuotaExceededError or restricted). Maintaining in-memory state:`,
            storageError
          );

          // Attempt recovery: prune other large items or clear legacy keys
          try {
            if (typeof window !== 'undefined' && window.localStorage) {
              window.localStorage.removeItem('event_assistant_saved_plans_v1');
              window.localStorage.setItem(key, JSON.stringify(nextValue));
            }
          } catch {
            // Silently maintain in-memory state without crashing UI
          }
        }

        return nextValue;
      });
    },
    [key]
  );

  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`[useLocalStorage] Error removing key "${key}" from localStorage:`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
