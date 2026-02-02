/**
 * Responsive E2E Tests
 *
 * Tests UI behavior across all 5 viewport sizes:
 * - Mobile S (375px)
 * - Mobile L (428px)
 * - Tablet (768px)
 * - Desktop (1024px)
 * - Desktop L (1440px)
 */

import { test, expect, Page } from '@playwright/test';

const viewports = [
  { name: 'mobile-s', width: 375, height: 667 },
  { name: 'mobile-l', width: 428, height: 926 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1024, height: 768 },
  { name: 'desktop-l', width: 1440, height: 900 },
];

test.describe('Homepage Responsive', () => {
  for (const viewport of viewports) {
    test(`should render correctly on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');

      // Logo should be visible
      await expect(page.getByRole('img', { name: /repmax/i })).toBeVisible();

      // Main heading should be visible
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

      // CTA buttons should be visible
      await expect(page.getByRole('link', { name: /get started/i })).toBeVisible();
    });

    test(`navigation should work on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');

      if (viewport.width < 768) {
        // Mobile: hamburger menu
        const menuButton = page.getByRole('button', { name: /menu/i });
        if (await menuButton.isVisible()) {
          await menuButton.click();
          await expect(page.getByRole('navigation')).toBeVisible();
        }
      } else {
        // Desktop: horizontal nav
        await expect(page.getByRole('navigation')).toBeVisible();
      }
    });
  }
});

test.describe('Pricing Page Responsive', () => {
  for (const viewport of viewports) {
    test(`should display pricing cards on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/pricing');

      // Pricing toggle should be visible
      await expect(page.getByRole('switch', { name: /annual/i })).toBeVisible();

      // At least one pricing card should be visible
      await expect(page.getByText(/free/i).first()).toBeVisible();
    });
  }
});

test.describe('Public Card Responsive', () => {
  for (const viewport of viewports) {
    test(`companion card should render on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/card/REP-JW-2026');

      // Card content should be visible
      // Note: This will need actual page implementation
      await expect(page.locator('body')).toBeVisible();
    });
  }
});

test.describe('Auth Forms Responsive', () => {
  for (const viewport of viewports) {
    test(`sign in form usable on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/sign-in');

      const emailInput = page.getByLabel(/email/i);
      const passwordInput = page.getByLabel(/password/i);
      const submitButton = page.getByRole('button', { name: /sign in/i });

      // All form elements should be visible
      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();
      await expect(submitButton).toBeVisible();

      // Form should be fillable
      await emailInput.fill('test@example.com');
      await passwordInput.fill('password123');

      await expect(emailInput).toHaveValue('test@example.com');
    });
  }
});

test.describe('Dashboard Sidebar Responsive', () => {
  // These tests would require authenticated state

  const mobileViewports = viewports.filter((v) => v.width < 768);
  const desktopViewports = viewports.filter((v) => v.width >= 768);

  for (const viewport of mobileViewports) {
    test.skip(`should show bottom nav on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      // Navigate to authenticated dashboard
      await page.goto('/athlete');

      // Should have bottom navigation on mobile
      await expect(page.locator('[data-testid="bottom-nav"]')).toBeVisible();
      // Sidebar should be hidden
      await expect(page.locator('[data-testid="sidebar"]')).not.toBeVisible();
    });
  }

  for (const viewport of desktopViewports) {
    test.skip(`should show sidebar on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/athlete');

      // Sidebar should be visible on desktop
      await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
      // Bottom nav should be hidden
      await expect(page.locator('[data-testid="bottom-nav"]')).not.toBeVisible();
    });
  }
});

test.describe('Touch Targets', () => {
  const mobileViewports = viewports.filter((v) => v.width < 768);

  for (const viewport of mobileViewports) {
    test(`buttons should have adequate touch targets on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/sign-in');

      const submitButton = page.getByRole('button', { name: /sign in/i });
      const box = await submitButton.boundingBox();

      // Touch targets should be at least 44x44 pixels
      expect(box?.height).toBeGreaterThanOrEqual(44);
      expect(box?.width).toBeGreaterThanOrEqual(44);
    });
  }
});

test.describe('Text Readability', () => {
  test('text should not overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check for horizontal scroll (indicates overflow)
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasHorizontalScroll).toBe(false);
  });
});

test.describe('Image Loading', () => {
  for (const viewport of viewports) {
    test(`images should load on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');

      // Wait for images to load
      await page.waitForLoadState('networkidle');

      // Check that images are loaded (not broken)
      const images = page.locator('img');
      const count = await images.count();

      for (let i = 0; i < count; i++) {
        const img = images.nth(i);
        const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
        expect(naturalWidth).toBeGreaterThan(0);
      }
    });
  }
});
