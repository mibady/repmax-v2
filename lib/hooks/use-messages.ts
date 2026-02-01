"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";
import type { Tables } from "@/types/database";

type Message = Tables<"messages"> & {
  sender: Pick<Tables<"profiles">, "id" | "full_name" | "avatar_url"> | null;
  recipient: Pick<Tables<"profiles">, "id" | "full_name" | "avatar_url"> | null;
};

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/messages");
      if (!res.ok) throw new Error("Failed to fetch messages");

      const data = await res.json();
      setMessages(data.messages || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

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
    isLoading,
    error,
    sendMessage,
    markAsRead,
    refetch: fetchMessages,
  };
}
