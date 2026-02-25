import { defineConfig, devices } from '@playwright/test';

/**
 * RepMax v2 Playwright Configuration
 *
 * Supports three modes:
 *   1. Local dev — starts `npm run dev` automatically via webServer
 *   2. Staging   — set PLAYWRIGHT_TEST_BASE_URL to the staging host (webServer skipped)
 *   3. E2B       — sandbox builds and serves the app (webServer skipped)
 *
 * Viewport projects for responsive testing:
 * - Mobile S (375px): iPhone SE, small Android
 * - Mobile L (428px): iPhone 14 Pro Max
 * - Tablet (768px): iPad Mini portrait
 * - Desktop (1024px): Small laptop/tablet landscape
 * - Desktop L (1440px): Standard desktop
 */

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';
const isRemote = baseURL.startsWith('https://');

export default defineConfig({
  testDir: './apps/web/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
  ],
  outputDir: 'test-results',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'mobile-s',
      use: {
        ...devices['iPhone SE'],
        viewport: { width: 375, height: 667 },
      },
    },
    {
      name: 'mobile-l',
      use: {
        ...devices['iPhone 14 Pro Max'],
        viewport: { width: 428, height: 926 },
      },
    },
    {
      name: 'tablet',
      use: {
        ...devices['iPad Mini'],
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1024, height: 768 },
      },
    },
    {
      name: 'desktop-l',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
  // Skip webServer when targeting a remote host (staging / E2B).
  ...(isRemote
    ? {}
    : {
        webServer: [
          {
            command: 'cd apps/web && npm run dev -- --hostname 127.0.0.1',
            url: 'http://127.0.0.1:3000',
            reuseExistingServer: !process.env.CI,
            timeout: 120 * 1000,
            env: {
              ...process.env,
              HOSTNAME: '127.0.0.1',
            },
          },
        ],
      }),
});
