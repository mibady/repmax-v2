import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  configureMockSupabase,
  mockAuthenticated,
  mockUnauthenticated,
  resetMocks,
} from '../helpers/route-test-utils';
import { coachDavis, jaylenWashington } from '../fixtures/users';

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

import { redirect } from 'next/navigation';
import {
  addToShortlist,
  removeFromShortlist,
  updateShortlistPriority,
  getShortlist,
} from '@/lib/actions/shortlist-actions';

// ===========================================================================
// shortlist-actions tests
// ===========================================================================
describe('shortlist-actions', () => {
  beforeEach(() => {
    resetMocks();
    vi.mocked(redirect).mockClear();
  });

  // ─── addToShortlist ───────────────────────────────────────
  describe('addToShortlist', () => {
    it('redirects to login when unauthenticated', async () => {
      mockUnauthenticated();

      // Mock redirect doesn't throw like real Next.js redirect, so the function
      // continues and may error — we just verify redirect was called
      try {
        await addToShortlist('ath-001');
      } catch {
        // Expected — mock redirect doesn't halt execution
      }

      expect(redirect).toHaveBeenCalledWith('/login');
    });

    it('returns error when user is not a coach', async () => {
      mockAuthenticated(coachDavis);
      configureMockSupabase({
        profiles: { data: { id: 'prof-1' }, error: null },
        coaches: { data: null, error: null },
      });

      const result = await addToShortlist('ath-001');
      expect(result).toEqual({ error: 'Only coaches can add to shortlists' });
    });

    it('returns error on duplicate entry', async () => {
      mockAuthenticated(coachDavis);
      configureMockSupabase({
        profiles: { data: { id: 'prof-1' }, error: null },
        coaches: { data: { id: 'coach-1' }, error: null },
        shortlists: { data: null, error: { message: 'duplicate key', code: '23505' } },
      });

      const result = await addToShortlist('ath-001');
      expect(result).toEqual({ error: 'Athlete already in shortlist' });
    });

    it('returns success on valid add', async () => {
      mockAuthenticated(coachDavis);
      configureMockSupabase({
        profiles: { data: { id: 'prof-1' }, error: null },
        coaches: { data: { id: 'coach-1' }, error: null },
        shortlists: { data: [], error: null },
      });

      const result = await addToShortlist('ath-001', 'Great prospect');
      expect(result).toEqual({ success: true });
    });
  });

  // ─── removeFromShortlist ──────────────────────────────────
  describe('removeFromShortlist', () => {
    it('redirects to login when unauthenticated', async () => {
      mockUnauthenticated();

      try {
        await removeFromShortlist('ath-001');
      } catch {
        // Expected
      }

      expect(redirect).toHaveBeenCalledWith('/login');
    });

    it('returns error when user is not a coach', async () => {
      mockAuthenticated(coachDavis);
      configureMockSupabase({
        profiles: { data: { id: 'prof-1' }, error: null },
        coaches: { data: null, error: null },
      });

      const result = await removeFromShortlist('ath-001');
      expect(result).toEqual({ error: 'Only coaches can remove from shortlists' });
    });

    it('returns success on valid removal', async () => {
      mockAuthenticated(coachDavis);
      configureMockSupabase({
        profiles: { data: { id: 'prof-1' }, error: null },
        coaches: { data: { id: 'coach-1' }, error: null },
        shortlists: { data: [], error: null },
      });

      const result = await removeFromShortlist('ath-001');
      expect(result).toEqual({ success: true });
    });
  });

  // ─── updateShortlistPriority ──────────────────────────────
  describe('updateShortlistPriority', () => {
    it('redirects to login when unauthenticated', async () => {
      mockUnauthenticated();

      try {
        await updateShortlistPriority('ath-001', 'high');
      } catch {
        // Expected
      }

      expect(redirect).toHaveBeenCalledWith('/login');
    });

    it('returns error when user is not a coach', async () => {
      mockAuthenticated(coachDavis);
      configureMockSupabase({
        profiles: { data: { id: 'prof-1' }, error: null },
        coaches: { data: null, error: null },
      });

      const result = await updateShortlistPriority('ath-001', 'high');
      expect(result).toEqual({ error: 'Only coaches can update shortlists' });
    });

    it('returns success on valid update', async () => {
      mockAuthenticated(coachDavis);
      configureMockSupabase({
        profiles: { data: { id: 'prof-1' }, error: null },
        coaches: { data: { id: 'coach-1' }, error: null },
        shortlists: { data: [], error: null },
      });

      const result = await updateShortlistPriority('ath-001', 'top');
      expect(result).toEqual({ success: true });
    });
  });

  // ─── getShortlist ─────────────────────────────────────────
  describe('getShortlist', () => {
    it('returns empty array when unauthenticated', async () => {
      mockUnauthenticated();
      const result = await getShortlist();
      expect(result).toEqual([]);
    });

    it('returns empty array when user is not a coach', async () => {
      mockAuthenticated(coachDavis);
      configureMockSupabase({
        profiles: { data: { id: 'prof-1' }, error: null },
        coaches: { data: null, error: null },
      });

      const result = await getShortlist();
      expect(result).toEqual([]);
    });

    it('returns shortlist data on success', async () => {
      mockAuthenticated(coachDavis);
      const mockData = [
        {
          id: 'sl-1',
          coach_id: 'coach-1',
          athlete_id: 'ath-001',
          priority: 'high',
          athlete: {
            id: 'ath-001',
            primary_position: 'QB',
            profile: { full_name: 'Jaylen Washington', avatar_url: null },
          },
        },
      ];
      configureMockSupabase({
        profiles: { data: { id: 'prof-1' }, error: null },
        coaches: { data: { id: 'coach-1' }, error: null },
        shortlists: { data: mockData, error: null },
      });

      const result = await getShortlist();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('sl-1');
    });
  });
});
