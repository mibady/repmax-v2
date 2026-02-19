'use client';

interface Note {
  id: string;
  prospect: string;
  content: string;
  timestamp: string;
  isPinned: boolean;
  isTeamNote?: boolean;
}

interface NotesWidgetProps {
  notes?: Note[];
}

export default function NotesWidget({ notes = [] }: NotesWidgetProps) {
  return (
    <div className="w-full max-w-[280px] bg-[#1F1F22] rounded-xl flex flex-col overflow-hidden shadow-lg border border-[#333]">
      {/* Header Section */}
      <div className="p-4 border-b border-[#2A2A2E] flex items-center justify-between">
        <h2 className="text-white text-sm font-bold flex items-center gap-2">
          <span className="text-base">📝</span> Notes
        </h2>
        <span className="text-[#D4AF37] text-xs font-semibold flex items-center gap-1">
          <span className="material-symbols-outlined text-sm font-bold">add</span>
          New Note
        </span>
      </div>

      {/* Notes List */}
      <div className="flex flex-col gap-3 p-4 max-h-[600px] overflow-y-auto">
        {notes.length === 0 && (
          <div className="p-4 text-center">
            <p className="text-gray-500 text-xs">No notes yet</p>
          </div>
        )}
        {notes.map((note) => (
          <div
            key={note.id}
            className={`bg-[#1A1A1A] p-3 rounded-lg hover:bg-[#252525] transition-colors group cursor-pointer border-l-2 ${
              note.isPinned ? 'border-[#D4AF37]' : 'border-transparent hover:border-[#333]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold truncate ${note.isPinned ? 'text-[#D4AF37]' : 'text-white/70'}`}>
                {note.prospect}
              </span>
              {note.isPinned && (
                <span className="material-symbols-outlined text-[#D4AF37] text-sm" title="Pinned Note">push_pin</span>
              )}
              {note.isTeamNote && (
                <span className="material-symbols-outlined text-[#444] text-sm group-hover:text-[#666]">group</span>
              )}
            </div>
            <p className="text-white/90 text-xs leading-relaxed line-clamp-3 mb-3">
              {note.content}
            </p>
            <div className="flex items-center justify-between border-t border-[#333] pt-2">
              <span className="text-[#666] text-[10px] font-mono">{note.timestamp}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Section */}
      <div className="p-3 border-t border-[#2A2A2E] bg-[#1F1F22]">
        {notes.length > 0 && (
          <span className="flex items-center justify-center w-full py-2 rounded text-[#D4AF37] text-xs font-bold">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'} <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
          </span>
        )}
      </div>
    </div>
  );
}
