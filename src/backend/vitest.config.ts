import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      // allow imports like `src/...` to resolve correctly during tests
      src: resolve(__dirname, 'src'),
    }
  },
    coverage: {
    provider: 'v8',
    reporter: ['text', 'lcov'],
    all: true,
    include: ['src/**/*.ts'],
    exclude: ['**/*.spec.ts', 'test/**', 'node_modules/**'],
    extension: ['.ts'],
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.spec.ts', 'src/**/*.spec.ts'],
  },
} as unknown as any);
