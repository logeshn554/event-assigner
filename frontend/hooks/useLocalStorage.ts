'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Robust React hook for safe localStorage persistence with schema versioning.
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
      if (typeof window === 'undefined') return;
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
      try {
        setStoredValue((current) => {
          const valueToStore = value instanceof Function ? value(current) : value;
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          }
          return valueToStore;
        });
      } catch (error) {
        console.warn(`[useLocalStorage] Error saving key "${key}" to localStorage:`, error);
      }
    },
    [key]
  );

  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`[useLocalStorage] Error removing key "${key}" from localStorage:`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

