import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockSupabaseClient } from '../setup';
import {
  mockAuthenticated,
  mockUnauthenticated,
  resetMocks,
  configureMockSupabase,
} from '../helpers/route-test-utils';
import { jaylenWashington, coachDavis } from '../fixtures/users';
import { redirect } from 'next/navigation';

import {
  resetPassword,
  signInWithGoogle,
  signInWithApple,
  updateUserRole,
} from '@/lib/actions/auth-actions';

// ===========================================================================
// Auth actions — extended tests (covers functions not in auth-flow.test.ts)
// ===========================================================================
describe('auth-actions (extended)', () => {
  beforeEach(() => {
    resetMocks();
    vi.mocked(redirect).mockClear();

    // Add auth methods not in the default mock
    (mockSupabaseClient.auth as any).signInWithOAuth = vi.fn();
    (mockSupabaseClient.auth as any).resetPasswordForEmail = vi.fn();
    (mockSupabaseClient.auth as any).updateUser = vi.fn();
  });

  // ─── resetPassword ───────────────────────────────────────
  describe('resetPassword', () => {
    it('returns success when email is valid', async () => {
      (mockSupabaseClient.auth as any).resetPasswordForEmail.mockResolvedValue({
        error: null,
      });

      const result = await resetPassword('user@example.com');
      expect(result.success).toBe(true);
    });

    it('returns error on failure', async () => {
      (mockSupabaseClient.auth as any).resetPasswordForEmail.mockResolvedValue({
        error: { message: 'Rate limit exceeded' },
      });

      const result = await resetPassword('user@example.com');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Rate limit exceeded');
    });
  });

  // ─── signInWithGoogle ─────────────────────────────────────
  describe('signInWithGoogle', () => {
    it('redirects to OAuth URL on success', async () => {
      (mockSupabaseClient.auth as any).signInWithOAuth.mockResolvedValue({
        data: { url: 'https://accounts.google.com/oauth' },
        error: null,
      });

      // redirect mock doesn't throw, so function continues after redirect
      try {
        await signInWithGoogle();
      } catch {
        // Expected
      }

      expect(redirect).toHaveBeenCalledWith('https://accounts.google.com/oauth');
    });

    it('returns error on failure', async () => {
      (mockSupabaseClient.auth as any).signInWithOAuth.mockResolvedValue({
        data: {},
        error: { message: 'OAuth provider not configured' },
      });

      const result = await signInWithGoogle();
      expect(result.success).toBe(false);
      expect(result.error).toBe('OAuth provider not configured');
    });
  });

  // ─── signInWithApple ──────────────────────────────────────
  describe('signInWithApple', () => {
    it('redirects to OAuth URL on success', async () => {
      (mockSupabaseClient.auth as any).signInWithOAuth.mockResolvedValue({
        data: { url: 'https://appleid.apple.com/auth' },
        error: null,
      });

      try {
        await signInWithApple();
      } catch {
        // Expected
      }

      expect(redirect).toHaveBeenCalledWith('https://appleid.apple.com/auth');
    });
  });

  // ─── updateUserRole ───────────────────────────────────────
  describe('updateUserRole', () => {
    it('returns error when not logged in', async () => {
      mockUnauthenticated();
      // getUser returns { data: { user: null }, error: null }
      // The function checks for userError || !user
      const result = await updateUserRole('athlete');
      expect(result.success).toBe(false);
      expect(result.error).toContain('logged in');
    });

    it('creates new profile and redirects athlete to onboarding', async () => {
      mockAuthenticated(jaylenWashington);
      configureMockSupabase({
        profiles: { data: null, error: null }, // no existing profile
      });
      (mockSupabaseClient.auth as any).updateUser.mockResolvedValue({ error: null });

      try {
        await updateUserRole('athlete');
      } catch {
        // Expected — mock redirect
      }

      expect(redirect).toHaveBeenCalledWith('/onboarding/chat');
    });

    it('updates existing profile and redirects coach to dashboard', async () => {
      mockAuthenticated(coachDavis);
      configureMockSupabase({
        profiles: { data: { id: 'existing-prof' }, error: null },
      });
      (mockSupabaseClient.auth as any).updateUser.mockResolvedValue({ error: null });

      try {
        await updateUserRole('coach');
      } catch {
        // Expected — mock redirect
      }

      expect(redirect).toHaveBeenCalledWith('/dashboard');
    });
  });
});
