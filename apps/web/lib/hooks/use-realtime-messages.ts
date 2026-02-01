'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@repmax/shared/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  status: 'sent' | 'delivered' | 'read';
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  participant_ids: string[];
  last_message_id?: string;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
}

interface UseRealtimeMessagesOptions {
  conversationId?: string;
  userId?: string;
}

interface UseRealtimeMessagesReturn {
  messages: Message[];
  isLoading: boolean;
  error: Error | null;
  sendMessage: (content: string, recipientId: string) => Promise<Message | null>;
  markAsRead: (messageIds: string[]) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useRealtimeMessages(
  options: UseRealtimeMessagesOptions = {}
): UseRealtimeMessagesReturn {
  const { conversationId, userId } = options;
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;

    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      setMessages(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch messages'));
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, supabase]);

  // Subscribe to realtime messages
  useEffect(() => {
    if (!conversationId) return;

    let channel: RealtimeChannel;

    const setupRealtimeSubscription = () => {
      channel = supabase
        .channel(`messages:${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            const newMessage = payload.new as Message;
            setMessages((prev) => [...prev, newMessage]);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            const updatedMessage = payload.new as Message;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === updatedMessage.id ? updatedMessage : m
              )
            );
          }
        )
        .subscribe();
    };

    fetchMessages();
    setupRealtimeSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [conversationId, fetchMessages, supabase]);

  const sendMessage = useCallback(
    async (content: string, recipientId: string): Promise<Message | null> => {
      if (!conversationId || !userId) return null;

      try {
        const { data, error: sendError } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            sender_id: userId,
            recipient_id: recipientId,
            content,
            status: 'sent',
          })
          .select()
          .single();

        if (sendError) throw sendError;
        return data;
      } catch (err) {
        console.error('Failed to send message:', err);
        throw err;
      }
    },
    [conversationId, userId, supabase]
  );

  const markAsRead = useCallback(
    async (messageIds: string[]) => {
      if (messageIds.length === 0) return;

      try {
        const { error: updateError } = await supabase
          .from('messages')
          .update({ status: 'read' })
          .in('id', messageIds);

        if (updateError) throw updateError;

        // Optimistic update
        setMessages((prev) =>
          prev.map((m) =>
            messageIds.includes(m.id) ? { ...m, status: 'read' as const } : m
          )
        );
      } catch (err) {
        console.error('Failed to mark messages as read:', err);
        throw err;
      }
    },
    [supabase]
  );

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    markAsRead,
    refresh: fetchMessages,
  };
}

/**
 * Hook for listening to all conversations for a user (inbox updates)
 */
interface UseConversationsOptions {
  userId?: string;
}

interface UseConversationsReturn {
  conversations: Conversation[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useConversations(
  options: UseConversationsOptions = {}
): UseConversationsReturn {
  const { userId } = options;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  const fetchConversations = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);

      // Fetch conversations where user is a participant
      const { data, error: fetchError } = await supabase
        .from('conversations')
        .select('*, messages!inner(status)')
        .contains('participant_ids', [userId])
        .order('last_message_at', { ascending: false });

      if (fetchError) throw fetchError;

      setConversations(data || []);

      // Calculate unread count
      const { count, error: countError } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .neq('status', 'read');

      if (!countError) {
        setUnreadCount(count || 0);
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch conversations'));
    } finally {
      setIsLoading(false);
    }
  }, [userId, supabase]);

  // Subscribe to conversation updates
  useEffect(() => {
    if (!userId) return;

    let channel: RealtimeChannel;

    const setupRealtimeSubscription = () => {
      channel = supabase
        .channel(`conversations:${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `recipient_id=eq.${userId}`,
          },
          () => {
            // Refresh conversations when messages change
            fetchConversations();
          }
        )
        .subscribe();
    };

    fetchConversations();
    setupRealtimeSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [userId, fetchConversations, supabase]);

  return {
    conversations,
    unreadCount,
    isLoading,
    error,
    refresh: fetchConversations,
  };
}

export default useRealtimeMessages;
