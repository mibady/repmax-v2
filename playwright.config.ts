import { defineConfig, devices } from '@playwright/test';

/**
 * RepMax v2 Playwright Configuration
 *
 * Configured for E2B cloud sandbox execution.
 * The sandbox builds and serves the app - no local webServer needed.
 *
 * Viewport projects for responsive testing:
 * - Mobile S (375px): iPhone SE, small Android
 * - Mobile L (428px): iPhone 14 Pro Max
 * - Tablet (768px): iPad Mini portrait
 * - Desktop (1024px): Small laptop/tablet landscape
 * - Desktop L (1440px): Standard desktop
 */
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
    // Base URL is set by the sandbox environment
    // E2B sandbox will build and serve on localhost:3000 inside the container
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
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
  // No webServer - E2B sandbox handles build and serve
});
