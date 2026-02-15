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
  sendMessage,
  markMessageAsRead,
  getMessages,
} from '@/lib/actions/message-actions';

// ===========================================================================
// message-actions tests
// ===========================================================================
describe('message-actions', () => {
  beforeEach(() => {
    resetMocks();
    vi.mocked(redirect).mockClear();
  });

  // ─── sendMessage ──────────────────────────────────────────
  describe('sendMessage', () => {
    it('redirects when unauthenticated', async () => {
      mockUnauthenticated();

      try {
        await sendMessage('recipient-1', 'Hello');
      } catch {
        // Mock redirect doesn't throw
      }

      expect(redirect).toHaveBeenCalledWith('/login');
    });

    it('returns error when profile not found', async () => {
      mockAuthenticated(jaylenWashington);
      configureMockSupabase({
        profiles: { data: null, error: null },
      });

      const result = await sendMessage('recipient-1', 'Hello');
      expect(result).toEqual({ error: 'Profile not found' });
    });

    it('returns success on valid send', async () => {
      mockAuthenticated(jaylenWashington);
      configureMockSupabase({
        profiles: { data: { id: 'prof-1' }, error: null },
        messages: { data: [], error: null },
      });

      const result = await sendMessage('recipient-1', 'Hello', 'Greetings');
      expect(result).toEqual({ success: true });
    });

    it('returns error on db failure', async () => {
      mockAuthenticated(jaylenWashington);
      configureMockSupabase({
        profiles: { data: { id: 'prof-1' }, error: null },
        messages: { data: null, error: { message: 'Insert failed' } },
      });

      const result = await sendMessage('recipient-1', 'Hello');
      expect(result).toEqual({ error: 'Insert failed' });
    });
  });

  // ─── markMessageAsRead ────────────────────────────────────
  describe('markMessageAsRead', () => {
    it('redirects when unauthenticated', async () => {
      mockUnauthenticated();

      try {
        await markMessageAsRead('msg-1');
      } catch {
        // Expected
      }

      expect(redirect).toHaveBeenCalledWith('/login');
    });

    it('returns error when profile not found', async () => {
      mockAuthenticated(jaylenWashington);
      configureMockSupabase({
        profiles: { data: null, error: null },
      });

      const result = await markMessageAsRead('msg-1');
      expect(result).toEqual({ error: 'Profile not found' });
    });

    it('returns success on valid mark', async () => {
      mockAuthenticated(jaylenWashington);
      configureMockSupabase({
        profiles: { data: { id: 'prof-1' }, error: null },
        messages: { data: [], error: null },
      });

      const result = await markMessageAsRead('msg-1');
      expect(result).toEqual({ success: true });
    });
  });

  // ─── getMessages ──────────────────────────────────────────
  describe('getMessages', () => {
    it('returns empty when unauthenticated', async () => {
      mockUnauthenticated();
      const result = await getMessages();
      expect(result).toEqual({ messages: [], unreadCount: 0 });
    });

    it('returns empty when profile not found', async () => {
      mockAuthenticated(jaylenWashington);
      configureMockSupabase({
        profiles: { data: null, error: null },
      });

      const result = await getMessages();
      expect(result).toEqual({ messages: [], unreadCount: 0 });
    });

    it('returns messages with unread count', async () => {
      mockAuthenticated(jaylenWashington);
      const mockMessages = [
        {
          id: 'm-1',
          sender_id: 'other',
          recipient_id: 'prof-1',
          body: 'Hello',
          read: false,
          sender: { id: 'other', full_name: 'Coach', avatar_url: null },
          recipient: { id: 'prof-1', full_name: 'Jaylen', avatar_url: null },
        },
        {
          id: 'm-2',
          sender_id: 'prof-1',
          recipient_id: 'other',
          body: 'Reply',
          read: true,
          sender: { id: 'prof-1', full_name: 'Jaylen', avatar_url: null },
          recipient: { id: 'other', full_name: 'Coach', avatar_url: null },
        },
      ];
      configureMockSupabase({
        profiles: { data: { id: 'prof-1' }, error: null },
        messages: { data: mockMessages, error: null },
      });

      const result = await getMessages();
      expect(result.messages).toHaveLength(2);
      expect(result.unreadCount).toBe(1); // only m-1 is unread and user is recipient
    });
  });
});
