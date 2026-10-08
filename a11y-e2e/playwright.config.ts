import { defineConfig, devices } from '@playwright/test';

// Runs inside the Playwright Docker image, sharing the app container's network (see run.sh),
// so the app is http://localhost:3000. Override with BASE_URL.
const baseURL = process.env.BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './tests',
  outputDir: './results/artifacts',
  timeout: 90_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  workers: process.env.WORKERS ? Number(process.env.WORKERS) : 4,
  retries: 0,
  reporter: [['list'], ['json', { outputFile: 'results/report.json' }]],
  use: {
    baseURL,
    locale: 'vi-VN',
    trace: 'off',
    screenshot: 'off',
  },
  projects: [
    // Logs in once as the local admin for the contributor pages.
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 768 } },
      testIgnore: [/touch\.spec\.ts/, /auth\.setup\.ts/],
      dependencies: ['setup'],
    },
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 7'] },
      testMatch: [/touch\.spec\.ts/, /pages\.spec\.ts/],
      dependencies: ['setup'],
    },
    {
      name: 'mobile-webkit',
      use: { ...devices['iPhone 14'] },
      testMatch: [/touch\.spec\.ts/],
    },
  ],
});
