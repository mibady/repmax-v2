"use client";

import { useState } from "react";
import { useAdminNotes, type AdminNote } from "@/lib/hooks/use-admin-notes";

const TARGET_TABS = [
  { label: "All", value: "all" },
  { label: "Athlete Notes", value: "athlete" },
  { label: "Program Notes", value: "program" },
  { label: "Coach Notes", value: "coach" },
];

const NOTE_TYPE_COLORS: Record<string, string> = {
  internal: "bg-blue-500/20 text-blue-400",
  flag: "bg-red-500/20 text-red-400",
  update: "bg-green-500/20 text-green-400",
  task: "bg-purple-500/20 text-purple-400",
};

const PRIORITY_COLORS: Record<string, string> = {
  normal: "bg-slate-500/20 text-slate-400",
  high: "bg-yellow-500/20 text-yellow-400",
  urgent: "bg-red-500/20 text-red-400",
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function NoteCard({ note }: { note: AdminNote }) {
  return (
    <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {note.target_name && (
            <span className="text-sm font-medium text-white">
              {note.target_name}
            </span>
          )}
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${NOTE_TYPE_COLORS[note.note_type] || ""}`}
          >
            {note.note_type}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_COLORS[note.priority] || ""}`}
          >
            {note.priority}
          </span>
        </div>
        <span className="text-xs text-slate-500 whitespace-nowrap ml-2">
          {formatDate(note.created_at)}
        </span>
      </div>
      <p className="text-sm text-slate-300 whitespace-pre-wrap">{note.content}</p>
      <div className="flex items-center gap-3 mt-3">
        <span className="text-xs text-slate-500 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">category</span>
          {note.target_type}
        </span>
        <span className="text-xs text-slate-500 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">visibility</span>
          {note.visibility.replace(/_/g, " ")}
        </span>
      </div>
    </div>
  );
}

function AddNoteForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: {
    target_type: string;
    target_name: string;
    note_type: string;
    content: string;
    priority: string;
    visibility: string;
  }) => Promise<void>;
  onCancel: () => void;
}) {
  const [targetType, setTargetType] = useState("general");
  const [targetName, setTargetName] = useState("");
  const [noteType, setNoteType] = useState("internal");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState("normal");
  const [visibility, setVisibility] = useState("admin_only");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        target_type: targetType,
        target_name: targetName || undefined as unknown as string,
        note_type: noteType,
        content: content.trim(),
        priority,
        visibility,
      });
      setContent("");
      setTargetName("");
      onCancel();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#1F1F22] rounded-xl border border-white/5 p-4 mb-4"
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1 block">
            Target Type
          </label>
          <select
            value={targetType}
            onChange={(e) => setTargetType(e.target.value)}
            className="w-full bg-[#16161A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
          >
            <option value="general">General</option>
            <option value="athlete">Athlete</option>
            <option value="program">Program</option>
            <option value="coach">Coach</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1 block">
            Target Name
          </label>
          <input
            type="text"
            value={targetName}
            onChange={(e) => setTargetName(e.target.value)}
            placeholder="Optional"
            className="w-full bg-[#16161A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1 block">
            Note Type
          </label>
          <select
            value={noteType}
            onChange={(e) => setNoteType(e.target.value)}
            className="w-full bg-[#16161A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
          >
            <option value="internal">Internal</option>
            <option value="flag">Flag</option>
            <option value="update">Update</option>
            <option value="task">Task</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1 block">
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full bg-[#16161A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
          >
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1 block">
            Visibility
          </label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="w-full bg-[#16161A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
          >
            <option value="admin_only">Admin Only</option>
            <option value="admin_coach">Admin + Coach</option>
            <option value="admin_coach_parent">Admin + Coach + Parent</option>
          </select>
        </div>
      </div>
      <div className="mb-3">
        <label className="text-xs font-medium text-slate-400 mb-1 block">
          Content
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your note..."
          rows={3}
          className="w-full bg-[#16161A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 resize-none"
        />
      </div>
      <div className="flex items-center gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transition-colors"
        >
          {submitting ? "Saving..." : "Add Note"}
        </button>
      </div>
    </form>
  );
}

export default function AdminNotesPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [showForm, setShowForm] = useState(false);

  const filterType = activeTab === "all" ? undefined : activeTab;
  const { notes, isLoading, error, createNote } = useAdminNotes(filterType);

  const handleCreateNote = async (data: {
    target_type: string;
    target_name: string;
    note_type: string;
    content: string;
    priority: string;
    visibility: string;
  }) => {
    await createNote(data);
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Notes & Logs
            </h1>
            <p className="text-slate-400">Internal notes and activity log</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Add Note
          </button>
        </div>

        {/* Add Note Form */}
        {showForm && (
          <AddNoteForm
            onSubmit={handleCreateNote}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          {TARGET_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                activeTab === tab.value
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
            <p className="text-red-400 text-sm">{error.message}</p>
          </div>
        )}

        {isLoading ? (
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-500 mb-3 block animate-spin">
              progress_activity
            </span>
            <p className="text-slate-400">Loading notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-500 mb-3 block">
              sticky_note_2
            </span>
            <p className="text-slate-400">No notes yet</p>
            <p className="text-slate-500 text-sm mt-1">
              Click &quot;Add Note&quot; to create your first note
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
