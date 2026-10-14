import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Unit tests only (pure functions, renderers to static markup). Browser checks live
// in ../a11y-e2e (Playwright against the Docker stack).
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./', import.meta.url)) } },
  esbuild: { jsx: 'automatic' },
  test: {
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    environment: 'node',
  },
});
