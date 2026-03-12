'use client';

import { useState } from 'react';

interface CoachNote {
  id: string;
  content: string;
  category: 'General' | 'Urgent' | 'Call Log' | 'Strategy';
  athleteName?: string | null;
  isPinned: boolean;
  createdAt: string;
}

interface RosterAthleteSummary {
  id: string;
  name: string;
}

interface CoachNotesSidebarProps {
  notes: CoachNote[];
  rosterAthletes: RosterAthleteSummary[];
  onAddNote: (note: {
    content: string;
    category: string;
    athleteId?: string;
  }) => void;
  onTogglePin: (noteId: string) => void;
}

const categories = ['General', 'Urgent', 'Call Log', 'Strategy'] as const;

const categoryColors: Record<string, string> = {
  General: 'text-slate-400 bg-slate-400/10',
  Urgent: 'text-red-400 bg-red-400/10',
  'Call Log': 'text-blue-400 bg-blue-400/10',
  Strategy: 'text-purple-400 bg-purple-400/10',
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default function CoachNotesSidebar({
  notes,
  rosterAthletes,
  onAddNote,
  onTogglePin,
}: CoachNotesSidebarProps) {
  const [content, setContent] = useState('');
  const [selectedAthlete, setSelectedAthlete] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('General');

  const pinnedNotes = notes.filter((n) => n.isPinned);
  const recentNotes = notes.filter((n) => !n.isPinned).slice(0, 5);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    onAddNote({
      content: content.trim(),
      category: selectedCategory,
      athleteId: selectedAthlete || undefined,
    });

    setContent('');
    setSelectedAthlete('');
    setSelectedCategory('General');
  }

  return (
    <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-400 text-lg">
            edit_note
          </span>
          <h3 className="text-white font-semibold text-sm">Coach Notes</h3>
          <span className="bg-white/10 text-slate-400 text-[10px] font-medium px-1.5 py-0.5 rounded-full">
            {notes.length}
          </span>
        </div>
      </div>

      {/* Quick Add Form */}
      <form onSubmit={handleSubmit} className="mb-3 space-y-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a note..."
          rows={2}
          className="w-full bg-[#2A2A2E] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
        />
        <div className="flex gap-2">
          <select
            value={selectedAthlete}
            onChange={(e) => setSelectedAthlete(e.target.value)}
            className="flex-1 bg-[#2A2A2E] border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-white focus:outline-none focus:ring-1 focus:ring-primary/50 appearance-none cursor-pointer"
          >
            <option value="">All Athletes</option>
            {rosterAthletes.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex-1 bg-[#2A2A2E] border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-white focus:outline-none focus:ring-1 focus:ring-primary/50 appearance-none cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={!content.trim()}
          className="w-full bg-primary/20 text-primary text-xs font-medium py-1.5 rounded-lg hover:bg-primary/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Save Note
        </button>
      </form>

      {/* Pinned Notes */}
      {pinnedNotes.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">
            Pinned
          </p>
          <div className="space-y-1.5">
            {pinnedNotes.map((note) => (
              <div
                key={note.id}
                className="flex items-start gap-2 p-2 rounded-lg bg-yellow-500/5 border border-yellow-500/10"
              >
                <button
                  onClick={() => onTogglePin(note.id)}
                  className="mt-0.5 flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-yellow-500 text-sm">
                    push_pin
                  </span>
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white line-clamp-2">
                    {note.content}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full ${categoryColors[note.category]}`}
                    >
                      {note.category}
                    </span>
                    {note.athleteName && (
                      <span className="text-[9px] text-slate-500">
                        {note.athleteName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Notes */}
      {recentNotes.length > 0 && (
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">
            Recent
          </p>
          <div className="space-y-1.5">
            {recentNotes.map((note) => (
              <div
                key={note.id}
                className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <button
                  onClick={() => onTogglePin(note.id)}
                  className="mt-0.5 flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-slate-500 hover:text-yellow-500 text-sm transition-colors">
                    push_pin
                  </span>
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white line-clamp-2">
                    {note.content}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full ${categoryColors[note.category]}`}
                    >
                      {note.category}
                    </span>
                    {note.athleteName && (
                      <span className="text-[9px] text-slate-500">
                        {note.athleteName}
                      </span>
                    )}
                    <span className="text-[9px] text-slate-600">
                      {formatDate(note.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View All */}
      {notes.length > 5 && (
        <button className="block w-full text-center text-xs text-primary hover:text-primary/80 mt-3 transition-colors">
          View All Notes
        </button>
      )}
    </div>
  );
}
