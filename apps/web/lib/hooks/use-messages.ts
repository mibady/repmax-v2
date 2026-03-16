"use client";

import { createClient } from "@repmax/shared/supabase";
import { useEffect, useState, useCallback } from "react";
import type { Tables } from "@/types/database";

type Message = Tables<"messages"> & {
  sender: Pick<Tables<"profiles">, "id" | "full_name" | "avatar_url"> | null;
  recipient: Pick<Tables<"profiles">, "id" | "full_name" | "avatar_url"> | null;
};

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileId, setProfileId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const [inboxRes, sentRes] = await Promise.all([
        fetch("/api/messages?folder=inbox"),
        fetch("/api/messages?folder=sent"),
      ]);
      if (!inboxRes.ok) throw new Error("Failed to fetch messages");

      const inboxData = await inboxRes.json();
      const sentData = sentRes.ok ? await sentRes.json() : { messages: [] };

      // Merge and deduplicate by id, sort by created_at desc
      const allMessages = [...(inboxData.messages || []), ...(sentData.messages || [])];
      const uniqueMap = new Map<string, Message>();
      allMessages.forEach((m: Message) => uniqueMap.set(m.id, m));
      const merged = Array.from(uniqueMap.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setMessages(merged);
      setUnreadCount(inboxData.unread_count || inboxData.unreadCount || 0);
      if (inboxData.profile_id) setProfileId(inboxData.profile_id);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Realtime subscription — refresh inbox when a new message arrives
  useEffect(() => {
    if (!profileId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`inbox:${profileId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `recipient_id=eq.${profileId}`,
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId, fetchMessages]);

  const sendMessage = useCallback(
    async (recipientId: string, body: string, subject?: string) => {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient_id: recipientId, body, subject }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send message");
      }

      await fetchMessages();
      return res.json();
    },
    [fetchMessages]
  );

  const markAsRead = useCallback(
    async (messageId: string) => {
      const supabase = createClient();
      await supabase.from("messages").update({ read: true }).eq("id", messageId);
      await fetchMessages();
    },
    [fetchMessages]
  );

  return {
    messages,
    unreadCount,
    profileId,
    isLoading,
    error,
    sendMessage,
    markAsRead,
    refetch: fetchMessages,
  };
}
