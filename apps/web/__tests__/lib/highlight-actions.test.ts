import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  configureMockSupabase,
  mockAuthenticated,
  mockUnauthenticated,
  resetMocks,
} from '../helpers/route-test-utils';
import { mockSupabaseClient } from '../setup';
import { jaylenWashington } from '../fixtures/users';

// Mock next/cache (server actions use revalidatePath)
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

import {
  getMyHighlights,
  createHighlight,
  updateHighlight,
  deleteHighlight,
  getHighlight,
  incrementHighlightViews,
} from '@/lib/actions/highlight-actions';

// ===========================================================================
// highlight-actions tests
// ===========================================================================
describe('highlight-actions', () => {
  beforeEach(() => {
    resetMocks();
    // Add rpc mock for incrementHighlightViews
    (mockSupabaseClient as any).rpc = vi.fn(() =>
      Promise.resolve({ error: null })
    );
  });

  // ─── getMyHighlights ──────────────────────────────────────
  describe('getMyHighlights', () => {
    it('returns empty array when unauthenticated', async () => {
      mockUnauthenticated();
      const result = await getMyHighlights();
      expect(result).toEqual([]);
    });

    it('returns empty array when no profile exists', async () => {
      mockAuthenticated(jaylenWashington);
      configureMockSupabase({
        profiles: { data: null, error: null },
      });

      const result = await getMyHighlights();
      expect(result).toEqual([]);
    });

    it('returns empty array when no athlete exists', async () => {
      mockAuthenticated(jaylenWashington);
      configureMockSupabase({
        profiles: { data: { id: 'prof-1' }, error: null },
        athletes: { data: null, error: null },
      });

      const result = await getMyHighlights();
      expect(result).toEqual([]);
    });

    it('returns highlights on success', async () => {
      mockAuthenticated(jaylenWashington);
      const mockHighlights = [
        { id: 'hl-1', title: 'Game Day Reel', video_url: 'https://example.com/v1' },
        { id: 'hl-2', title: 'Training Session', video_url: 'https://example.com/v2' },
      ];
      configureMockSupabase({
        profiles: { data: { id: 'prof-1' }, error: null },
        athletes: { data: { id: 'ath-1' }, error: null },
        highlights: { data: mockHighlights, error: null },
      });

      const result = await getMyHighlights();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('hl-1');
    });
  });

  // ─── createHighlight ──────────────────────────────────────
  describe('createHighlight', () => {
    it('returns error when unauthenticated', async () => {
      mockUnauthenticated();
      const result = await createHighlight({
        title: 'Test',
        video_url: 'https://example.com/v',
      });
      expect(result).toEqual({ error: 'Not authenticated' });
    });

    it('returns data on success', async () => {
      mockAuthenticated(jaylenWashington);
      const created = {
        id: 'hl-new',
        title: 'New Highlight',
        video_url: 'https://example.com/v',
        athlete_id: 'ath-1',
      };
      configureMockSupabase({
        profiles: { data: { id: 'prof-1' }, error: null },
        athletes: { data: { id: 'ath-1' }, error: null },
        highlights: { data: [created], error: null },
      });

      const result = await createHighlight({
        title: 'New Highlight',
        video_url: 'https://example.com/v',
      });
      expect(result.data).toBeDefined();
      expect(result.data.id).toBe('hl-new');
    });
  });

  // ─── updateHighlight ──────────────────────────────────────
  describe('updateHighlight', () => {
    it('returns error when unauthenticated', async () => {
      mockUnauthenticated();
      const result = await updateHighlight('hl-1', { title: 'Updated' });
      expect(result).toEqual({ error: 'Not authenticated' });
    });

    it('returns Forbidden when user does not own highlight', async () => {
      mockAuthenticated(jaylenWashington);
      configureMockSupabase({
        highlights: {
          data: [{
            id: 'hl-1',
            athlete: { profile: { user_id: 'different-user-id' } },
          }],
          error: null,
        },
      });

      const result = await updateHighlight('hl-1', { title: 'Updated' });
      expect(result).toEqual({ error: 'Forbidden' });
    });

    it('returns success when user owns highlight', async () => {
      mockAuthenticated(jaylenWashington);
      configureMockSupabase({
        highlights: {
          data: [{
            id: 'hl-1',
            athlete: { profile: { user_id: jaylenWashington.id } },
          }],
          error: null,
        },
      });

      const result = await updateHighlight('hl-1', { title: 'Updated' });
      expect(result).toEqual({ success: true });
    });
  });

  // ─── deleteHighlight ──────────────────────────────────────
  describe('deleteHighlight', () => {
    it('returns error when unauthenticated', async () => {
      mockUnauthenticated();
      const result = await deleteHighlight('hl-1');
      expect(result).toEqual({ error: 'Not authenticated' });
    });

    it('returns Forbidden when user does not own highlight', async () => {
      mockAuthenticated(jaylenWashington);
      configureMockSupabase({
        highlights: {
          data: [{
            id: 'hl-1',
            athlete: { profile: { user_id: 'different-user-id' } },
          }],
          error: null,
        },
      });

      const result = await deleteHighlight('hl-1');
      expect(result).toEqual({ error: 'Forbidden' });
    });

    it('returns success when user owns highlight', async () => {
      mockAuthenticated(jaylenWashington);
      configureMockSupabase({
        highlights: {
          data: [{
            id: 'hl-1',
            athlete: { profile: { user_id: jaylenWashington.id } },
          }],
          error: null,
        },
      });

      const result = await deleteHighlight('hl-1');
      expect(result).toEqual({ success: true });
    });
  });

  // ─── getHighlight ─────────────────────────────────────────
  describe('getHighlight', () => {
    it('returns null when highlight not found', async () => {
      configureMockSupabase({
        highlights: { data: null, error: { message: 'Not found' } },
      });

      const result = await getHighlight('hl-nonexistent');
      expect(result).toBeNull();
    });

    it('returns highlight with athlete data', async () => {
      configureMockSupabase({
        highlights: {
          data: [{
            id: 'hl-1',
            title: 'Game Day Reel',
            video_url: 'https://example.com/v',
            athletes: {
              id: 'ath-1',
              high_school: 'Riverside Poly HS',
              class_year: 2026,
              primary_position: 'QB',
              height_inches: 74,
              weight_lbs: 195,
              profiles: { full_name: 'Jaylen Washington' },
            },
          }],
          error: null,
        },
      });

      const result = await getHighlight('hl-1');
      expect(result).toBeDefined();
      expect(result!.id).toBe('hl-1');
      expect(result!.athlete).toBeDefined();
      expect(result!.athlete!.name).toBe('Jaylen Washington');
      expect(result!.athlete!.position).toBe('QB');
    });
  });

  // ─── incrementHighlightViews ──────────────────────────────
  describe('incrementHighlightViews', () => {
    it('calls rpc to increment views', async () => {
      await incrementHighlightViews('hl-1');

      expect((mockSupabaseClient as any).rpc).toHaveBeenCalledWith(
        'increment_highlight_views',
        { highlight_id: 'hl-1' }
      );
    });

    it('falls back to manual increment when rpc fails', async () => {
      (mockSupabaseClient as any).rpc = vi.fn(() =>
        Promise.resolve({ error: { message: 'function not found' } })
      );
      configureMockSupabase({
        highlights: { data: [{ view_count: 5 }], error: null },
      });

      await incrementHighlightViews('hl-1');

      expect((mockSupabaseClient as any).rpc).toHaveBeenCalled();
      // Falls back to select + update on highlights table
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('highlights');
    });
  });
});
