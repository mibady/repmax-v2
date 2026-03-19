"use client";

import { useState } from "react";
import { useAdminComms } from "@/lib/hooks/use-admin-comms";
import type { AdminMessage, AdminTemplate } from "@/lib/hooks/use-admin-comms";

const AUDIENCES = [
  { value: "all", label: "All Users" },
  { value: "athlete", label: "Athletes" },
  { value: "parent", label: "Parents" },
  { value: "coach", label: "Coaches" },
  { value: "recruiter", label: "Recruiters" },
  { value: "club", label: "Clubs" },
];

const CHANNELS = [
  { value: "email", label: "Email" },
  { value: "in_app", label: "In-App" },
  { value: "both", label: "Both" },
];

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: "bg-slate-500/20 text-slate-300",
    sent: "bg-green-500/20 text-green-400",
    scheduled: "bg-blue-500/20 text-blue-400",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || colors.draft}`}
    >
      {status}
    </span>
  );
}

function ComposeTab({
  onSend,
  templates,
}: {
  onSend: (msg: {
    subject: string;
    body: string;
    audience: string;
    channel: string;
    status: string;
  }) => Promise<void>;
  templates: AdminTemplate[];
}) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("all");
  const [channel, setChannel] = useState("in_app");
  const [sending, setSending] = useState(false);

  const handleSend = async (status: string) => {
    if (!subject.trim() || !body.trim()) return;
    setSending(true);
    try {
      await onSend({ subject, body, audience, channel, status });
      setSubject("");
      setBody("");
      setAudience("all");
      setChannel("in_app");
    } finally {
      setSending(false);
    }
  };

  const applyTemplate = (tmpl: AdminTemplate) => {
    setSubject(tmpl.subject);
    setBody(tmpl.body);
  };

  return (
    <div className="space-y-6">
      {templates.length > 0 && (
        <div>
          <label className="text-xs font-medium text-slate-400 mb-2 block">
            Load Template
          </label>
          <div className="flex flex-wrap gap-2">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => applyTemplate(t)}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 hover:bg-white/10 transition-colors"
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="text-xs font-medium text-slate-400 mb-1.5 block">
          Subject
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Message subject..."
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-white/20"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-slate-400 mb-1.5 block">
          Body
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your message..."
          rows={8}
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-white/20 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1.5 block">
            Audience
          </label>
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20"
          >
            {AUDIENCES.map((a) => (
              <option key={a.value} value={a.value} className="bg-[#1F1F22]">
                {a.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1.5 block">
            Channel
          </label>
          <div className="flex gap-2">
            {CHANNELS.map((c) => (
              <button
                key={c.value}
                onClick={() => setChannel(c.value)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  channel === c.value
                    ? "bg-white/10 text-white border border-white/20"
                    : "bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={() => handleSend("sent")}
          disabled={sending || !subject.trim() || !body.trim()}
          className="px-6 py-2.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-base align-middle mr-1">
            send
          </span>
          {sending ? "Sending..." : "Send Now"}
        </button>
        <button
          onClick={() => handleSend("draft")}
          disabled={sending || !subject.trim() || !body.trim()}
          className="px-6 py-2.5 bg-white/5 text-slate-300 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          Save Draft
        </button>
      </div>
    </div>
  );
}

function HistoryTab({ messages }: { messages: AdminMessage[] }) {
  if (messages.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="material-symbols-outlined text-4xl text-slate-500 mb-3 block">
          history
        </span>
        <p className="text-slate-400">No messages sent yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/5">
            <th className="text-left py-3 px-4 text-xs font-medium text-slate-400">
              Subject
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-slate-400">
              Audience
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-slate-400">
              Channel
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-slate-400">
              Status
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-slate-400">
              Recipients
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-slate-400">
              Sent
            </th>
          </tr>
        </thead>
        <tbody>
          {messages.map((msg) => (
            <tr
              key={msg.id}
              className="border-b border-white/5 hover:bg-white/[0.02]"
            >
              <td className="py-3 px-4 text-sm text-white">{msg.subject}</td>
              <td className="py-3 px-4 text-sm text-slate-300 capitalize">
                {msg.audience}
              </td>
              <td className="py-3 px-4 text-sm text-slate-300">
                {msg.channel === "in_app" ? "In-App" : msg.channel === "both" ? "Both" : "Email"}
              </td>
              <td className="py-3 px-4">
                <StatusBadge status={msg.status} />
              </td>
              <td className="py-3 px-4 text-sm text-slate-300">
                {msg.recipients_count.toLocaleString()}
              </td>
              <td className="py-3 px-4 text-sm text-slate-400">
                {msg.sent_at
                  ? new Date(msg.sent_at).toLocaleDateString()
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TemplatesTab({
  templates,
  onCreate,
}: {
  templates: AdminTemplate[];
  onCreate: (t: { name: string; subject: string; body: string }) => Promise<void>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !subject.trim() || !body.trim()) return;
    setCreating(true);
    try {
      await onCreate({ name, subject, body });
      setName("");
      setSubject("");
      setBody("");
      setShowForm(false);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 hover:bg-white/10 transition-colors"
        >
          <span className="material-symbols-outlined text-base align-middle mr-1">
            add
          </span>
          Create Template
        </button>
      </div>

      {showForm && (
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Template name..."
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-white/20"
          />
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject line..."
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-white/20"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Template body..."
            rows={4}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-white/20 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={creating || !name.trim() || !subject.trim() || !body.trim()}
              className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90 disabled:opacity-50"
            >
              {creating ? "Saving..." : "Save Template"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-slate-400 hover:text-white text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {templates.length === 0 && !showForm ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-4xl text-slate-500 mb-3 block">
            draft
          </span>
          <p className="text-slate-400">No templates yet</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {templates.map((t) => (
            <div
              key={t.id}
              className="bg-[#1F1F22] border border-white/5 rounded-xl p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium text-white">{t.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Subject: {t.subject}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {t.body}
                  </p>
                </div>
                <span className="text-xs text-slate-500">
                  {new Date(t.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminCommunicationsPage() {
  const { messages, templates, isLoading, error, sendMessage, createTemplate } =
    useAdminComms();
  const [activeTab, setActiveTab] = useState<"compose" | "history" | "templates">(
    "compose"
  );

  const tabs = [
    { id: "compose" as const, label: "Compose", icon: "edit" },
    { id: "history" as const, label: "Send History", icon: "history" },
    { id: "templates" as const, label: "Templates", icon: "draft" },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Communications
            </h1>
            <p className="text-slate-400">Bulk messaging and templates</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="material-symbols-outlined text-base">
              campaign
            </span>
            {messages.length} messages sent
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white/5 rounded-lg p-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-4xl text-slate-500 mb-3 block animate-spin">
                progress_activity
              </span>
              <p className="text-slate-400">Loading...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-4xl text-red-400 mb-3 block">
                error
              </span>
              <p className="text-red-400">{error.message}</p>
            </div>
          ) : (
            <>
              {activeTab === "compose" && (
                <ComposeTab onSend={sendMessage} templates={templates} />
              )}
              {activeTab === "history" && <HistoryTab messages={messages} />}
              {activeTab === "templates" && (
                <TemplatesTab
                  templates={templates}
                  onCreate={createTemplate}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
