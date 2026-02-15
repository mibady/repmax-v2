import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  configureMockSupabase,
  mockAuthenticated,
  mockUnauthenticated,
  resetMocks,
} from '../helpers/route-test-utils';
import { jaylenWashington, coachDavis } from '../fixtures/users';
import { redirect } from 'next/navigation';

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

import {
  createAthleteProfile,
  updateAthleteProfile,
  getAthleteProfile,
} from '@/lib/actions/athlete-actions';

// ===========================================================================
// athlete-actions tests
// ===========================================================================
describe('athlete-actions', () => {
  beforeEach(() => {
    resetMocks();
    vi.mocked(redirect).mockClear();
  });

  // ─── createAthleteProfile ─────────────────────────────────
  describe('createAthleteProfile', () => {
    it('redirects when unauthenticated', async () => {
      mockUnauthenticated();

      const formData = new FormData();
      formData.set('high_school', 'Test HS');

      try {
        await createAthleteProfile(formData);
      } catch {
        // Expected
      }

      expect(redirect).toHaveBeenCalledWith('/login');
    });

    it('throws when profile not found', async () => {
      mockAuthenticated(jaylenWashington);
      configureMockSupabase({
        profiles: { data: null, error: null },
      });

      const formData = new FormData();
      formData.set('high_school', 'Test HS');

      await expect(createAthleteProfile(formData)).rejects.toThrow('Profile not found');
    });

    it('throws when athlete already exists', async () => {
      mockAuthenticated(jaylenWashington);
      configureMockSupabase({
        profiles: { data: { id: 'prof-1' }, error: null },
        athletes: { data: { id: 'ath-existing' }, error: null },
      });

      const formData = new FormData();
      formData.set('high_school', 'Test HS');

      await expect(createAthleteProfile(formData)).rejects.toThrow('already exists');
    });

    it('returns validation error for invalid data', async () => {
      mockAuthenticated(jaylenWashington);
      configureMockSupabase({
        profiles: { data: { id: 'prof-1' }, error: null },
        athletes: { data: null, error: null }, // no existing athlete
      });

      const formData = new FormData();
      // Missing required fields

      const result = await createAthleteProfile(formData);
      expect(result).toHaveProperty('error');
    });

    it('creates profile with valid data', async () => {
      mockAuthenticated(jaylenWashington);
      configureMockSupabase({
        profiles: { data: { id: 'prof-1' }, error: null },
        athletes: { data: null, error: null },
      });

      const formData = new FormData();
      formData.set('high_school', 'Riverside Poly HS');
      formData.set('city', 'Riverside');
      formData.set('state', 'CA');
      formData.set('class_year', '2026');
      formData.set('primary_position', 'QB');

      try {
        await createAthleteProfile(formData);
      } catch {
        // redirect at end
      }

      // If successful, redirect is called to /dashboard
      expect(redirect).toHaveBeenCalledWith('/dashboard');
    });
  });

  // ─── updateAthleteProfile ─────────────────────────────────
  describe('updateAthleteProfile', () => {
    it('redirects when unauthenticated', async () => {
      mockUnauthenticated();

      const formData = new FormData();
      formData.set('gpa', '3.9');

      try {
        await updateAthleteProfile('ath-1', formData);
      } catch {
        // Expected
      }

      expect(redirect).toHaveBeenCalledWith('/login');
    });

    it('throws when user does not own athlete', async () => {
      mockAuthenticated(jaylenWashington);
      configureMockSupabase({
        athletes: {
          data: [{ profile: { user_id: 'different-user' } }],
          error: null,
        },
      });

      const formData = new FormData();
      formData.set('gpa', '3.9');

      await expect(updateAthleteProfile('ath-1', formData)).rejects.toThrow('Forbidden');
    });

    it('returns success on valid update', async () => {
      mockAuthenticated(jaylenWashington);
      configureMockSupabase({
        athletes: {
          data: [{ profile: { user_id: jaylenWashington.id } }],
          error: null,
        },
      });

      const formData = new FormData();
      formData.set('gpa', '3.9');

      const result = await updateAthleteProfile('ath-1', formData);
      expect(result).toEqual({ success: true });
    });
  });

  // ─── getAthleteProfile ────────────────────────────────────
  describe('getAthleteProfile', () => {
    it('returns null when unauthenticated', async () => {
      mockUnauthenticated();
      const result = await getAthleteProfile();
      expect(result).toBeNull();
    });

    it('returns null when profile not found', async () => {
      mockAuthenticated(jaylenWashington);
      configureMockSupabase({
        profiles: { data: null, error: null },
      });

      const result = await getAthleteProfile();
      expect(result).toBeNull();
    });

    it('returns athlete data on success', async () => {
      mockAuthenticated(jaylenWashington);
      const mockAthlete = {
        id: 'ath-1',
        primary_position: 'QB',
        class_year: 2026,
        profile: { full_name: 'Jaylen Washington' },
      };
      configureMockSupabase({
        profiles: { data: { id: 'prof-1' }, error: null },
        athletes: { data: mockAthlete, error: null },
      });

      const result = await getAthleteProfile();
      expect(result).toBeDefined();
      expect(result.id).toBe('ath-1');
    });
  });
});
