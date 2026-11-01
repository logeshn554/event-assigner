import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['backend/**/*.ts', 'frontend/**/*.{ts,tsx}', 'app/api/**/*.ts'],
      exclude: ['**/*.d.ts', '**/node_modules/**', 'tests/**'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80
      }
    }
  },
  resolve: {
    alias: {
      '@/frontend': path.resolve(__dirname, './frontend'),
      '@/backend': path.resolve(__dirname, './backend'),
      '@': path.resolve(__dirname, './')
    }
  }
});

