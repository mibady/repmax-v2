"use client";

import { useCallback, useEffect, useState } from "react";

export interface AdminMessage {
  id: string;
  subject: string;
  body: string;
  audience: string;
  channel: string;
  status: string;
  sent_by: string | null;
  sent_at: string | null;
  scheduled_for: string | null;
  recipients_count: number;
  open_rate: number | null;
  click_rate: number | null;
  created_at: string;
}

export interface AdminTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export function useAdminComms() {
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [templates, setTemplates] = useState<AdminTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [msgsRes, tmplRes] = await Promise.all([
        fetch("/api/admin/communications"),
        fetch("/api/admin/templates"),
      ]);

      if (!msgsRes.ok) throw new Error("Failed to fetch communications");
      if (!tmplRes.ok) throw new Error("Failed to fetch templates");

      const [msgsData, tmplData] = await Promise.all([
        msgsRes.json(),
        tmplRes.json(),
      ]);

      setMessages(msgsData);
      setTemplates(tmplData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const sendMessage = useCallback(
    async (msg: {
      subject: string;
      body: string;
      audience: string;
      channel: string;
      status: string;
    }) => {
      const res = await fetch("/api/admin/communications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msg),
      });
      if (!res.ok) throw new Error("Failed to send message");
      const data = await res.json();
      await fetchData();
      return data;
    },
    [fetchData]
  );

  const createTemplate = useCallback(
    async (tmpl: { name: string; subject: string; body: string }) => {
      const res = await fetch("/api/admin/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tmpl),
      });
      if (!res.ok) throw new Error("Failed to create template");
      const data = await res.json();
      await fetchData();
      return data;
    },
    [fetchData]
  );

  return {
    messages,
    templates,
    isLoading,
    error,
    refresh: fetchData,
    sendMessage,
    createTemplate,
  };
}
