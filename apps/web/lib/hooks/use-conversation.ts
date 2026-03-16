"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@repmax/shared/supabase";

export interface ThreadMessage {
  id: string;
  senderId: "me" | "other";
  senderName: string;
  content: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
  createdAt: string;
}

export interface ContactInfo {
  id: string;
  name: string;
  avatar: string | null;
  role: "athlete" | "coach" | "recruiter" | "admin";
  organization?: string;
  title?: string;
  division?: string;
}

export interface CurrentUser {
  id: string;
  name: string;
  avatar: string | null;
}

interface UseConversationReturn {
  messages: ThreadMessage[];
  contact: ContactInfo | null;
  currentUser: CurrentUser | null;
  isLoading: boolean;
  error: Error | null;
  sendMessage: (body: string) => Promise<ThreadMessage | null>;
  refetch: () => Promise<void>;
}

export function useConversation(contactId: string | null): UseConversationReturn {
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchConversation = useCallback(async () => {
    if (!contactId) {
      setMessages([]);
      setContact(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/messages/${contactId}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch conversation");
      }

      const data = await res.json();
      setMessages(data.messages || []);
      setContact(data.contact || null);
      setCurrentUser(data.currentUser || null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [contactId]);

  useEffect(() => {
    fetchConversation();
  }, [fetchConversation]);

  // Realtime subscription — refetch on new messages from this contact
  const skipNextRefetch = useRef(false);
  useEffect(() => {
    if (!contactId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`thread:${contactId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          // Skip refetch if we just sent a message (already optimistically added)
          if (skipNextRefetch.current) {
            skipNextRefetch.current = false;
            return;
          }
          // Only refetch if this message involves our contact
          const row = payload.new as { sender_id?: string; recipient_id?: string };
          if (row.sender_id === contactId || row.recipient_id === contactId) {
            fetchConversation();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [contactId, fetchConversation]);

  const sendMessage = useCallback(
    async (body: string): Promise<ThreadMessage | null> => {
      if (!contactId || !body.trim()) return null;

      try {
        skipNextRefetch.current = true;
        const res = await fetch(`/api/messages/${contactId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to send message");
        }

        const newMessage = await res.json();

        // Optimistically add the message
        setMessages((prev) => [...prev, newMessage]);

        // Update status to delivered after a brief delay
        setTimeout(() => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === newMessage.id ? { ...m, status: "delivered" as const } : m
            )
          );
        }, 500);

        return newMessage;
      } catch (err) {
        console.error("Failed to send message:", err);
        throw err;
      }
    },
    [contactId]
  );

  return {
    messages,
    contact,
    currentUser,
    isLoading,
    error,
    sendMessage,
    refetch: fetchConversation,
  };
}
