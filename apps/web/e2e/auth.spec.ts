/**
 * Authentication E2E Tests
 *
 * Tests login/signup flows across all 5 responsive viewports.
 */

import { test, expect } from '@playwright/test';

test.describe('Sign In Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sign-in');
  });

  test('should display sign in form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should show validation messages
    await expect(page.getByText(/email is required/i)).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.getByLabel(/email/i).fill('invalid@test.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should show error message
    await expect(page.getByText(/invalid credentials/i)).toBeVisible({ timeout: 5000 });
  });

  test('should have link to sign up', async ({ page }) => {
    const signUpLink = page.getByRole('link', { name: /sign up/i });
    await expect(signUpLink).toBeVisible();
    await signUpLink.click();
    await expect(page).toHaveURL(/sign-up/);
  });

  test('should have link to forgot password', async ({ page }) => {
    await expect(page.getByRole('link', { name: /forgot password/i })).toBeVisible();
  });
});

test.describe('Sign Up Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sign-up');
  });

  test('should display sign up form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /sign up/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
    await expect(page.getByLabel(/confirm password/i)).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByLabel(/^password$/i).fill('ValidPass123!');
    await page.getByLabel(/confirm password/i).fill('ValidPass123!');
    await page.getByRole('button', { name: /sign up/i }).click();

    await expect(page.getByText(/valid email/i)).toBeVisible();
  });

  test('should validate password strength', async ({ page }) => {
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/^password$/i).fill('weak');
    await page.getByLabel(/confirm password/i).fill('weak');
    await page.getByRole('button', { name: /sign up/i }).click();

    // Should show password strength error
    await expect(page.getByText(/password must be at least 8 characters/i)).toBeVisible();
  });

  test('should validate password confirmation', async ({ page }) => {
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/^password$/i).fill('ValidPass123!');
    await page.getByLabel(/confirm password/i).fill('DifferentPass123!');
    await page.getByRole('button', { name: /sign up/i }).click();

    await expect(page.getByText(/passwords do not match/i)).toBeVisible();
  });

  test('should require terms acceptance', async ({ page }) => {
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/^password$/i).fill('ValidPass123!');
    await page.getByLabel(/confirm password/i).fill('ValidPass123!');
    await page.getByRole('button', { name: /sign up/i }).click();

    await expect(page.getByText(/accept the terms/i)).toBeVisible();
  });

  test('should have link to sign in', async ({ page }) => {
    const signInLink = page.getByRole('link', { name: /sign in/i });
    await expect(signInLink).toBeVisible();
    await signInLink.click();
    await expect(page).toHaveURL(/sign-in/);
  });
});

test.describe('Authenticated Navigation', () => {
  // These tests would require setting up authenticated state

  test.skip('should redirect to dashboard after sign in', async ({ page }) => {
    await page.goto('/sign-in');
    await page.getByLabel(/email/i).fill('jaylen.washington@test.repmax.io');
    await page.getByLabel(/password/i).fill('TestPassword123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL(/athlete/);
  });

  test.skip('should show role-specific sidebar after login', async ({ page }) => {
    // After login as athlete
    await expect(page.getByRole('navigation')).toContainText('Dashboard');
    await expect(page.getByRole('navigation')).toContainText('Card');
    await expect(page.getByRole('navigation')).toContainText('Analytics');
  });

  test.skip('should allow sign out', async ({ page }) => {
    // With authenticated session
    await page.getByRole('button', { name: /sign out/i }).click();
    await expect(page).toHaveURL(/sign-in/);
  });
});

test.describe('Protected Routes', () => {
  test('should redirect unauthenticated users to sign in', async ({ page }) => {
    await page.goto('/athlete');
    await expect(page).toHaveURL(/sign-in/);
  });

  test('should allow access to public card without auth', async ({ page }) => {
    await page.goto('/card/REP-JW-2026');
    // Should not redirect to sign-in
    await expect(page).not.toHaveURL(/sign-in/);
  });

  test('should allow access to pricing page without auth', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page).toHaveURL(/pricing/);
  });
});

test.describe('Responsive Auth Forms', () => {
  test('sign in form should be usable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/sign-in');

    // Form should be visible and accessible
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();

    // Button should be full width on mobile
    const button = page.getByRole('button', { name: /sign in/i });
    await expect(button).toBeVisible();
  });

  test('sign up form should be usable on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/sign-up');

    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
    await expect(page.getByLabel(/confirm password/i)).toBeVisible();
  });
});
