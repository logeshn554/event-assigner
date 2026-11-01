import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';
import { expect } from 'vitest';

expect.extend(toHaveNoViolations);

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  })
});

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: () => {}
});

// Mock Element.prototype.scrollIntoView
Element.prototype.scrollIntoView = () => {};

// Mock URL.createObjectURL and URL.revokeObjectURL for jsdom
URL.createObjectURL = () => 'blob:mock-blob-url';
URL.revokeObjectURL = () => {};

// Mock window.print
if (typeof window !== 'undefined') {
  window.print = () => {};
}



