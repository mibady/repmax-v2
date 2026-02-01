'use client';

interface Note {
  id: string;
  prospect: string;
  content: string;
  timestamp: string;
  isPinned: boolean;
  isTeamNote?: boolean;
}

const mockNotes: Note[] = [
  {
    id: '1',
    prospect: 'Jaylen Washington',
    content: 'Spoke to HS coach. Grades improved significantly in the last semester. Recommend moving him up the board.',
    timestamp: 'Oct 24 • 14:30',
    isPinned: true,
  },
  {
    id: '2',
    prospect: 'Marcus Johnson',
    content: 'Need to schedule a follow-up visit for next week. Family seemed hesitant about the distance.',
    timestamp: 'Oct 23 • 09:15',
    isPinned: false,
  },
  {
    id: '3',
    prospect: 'Team General',
    content: 'Defensive line rotation strategy meeting notes. Coach Miller wants more snaps for the rookies.',
    timestamp: 'Oct 22 • 16:45',
    isPinned: false,
    isTeamNote: true,
  },
];

export default function NotesWidget() {
  return (
    <div className="w-full max-w-[280px] bg-[#1F1F22] rounded-xl flex flex-col overflow-hidden shadow-lg border border-[#333]">
      {/* Header Section */}
      <div className="p-4 border-b border-[#2A2A2E] flex items-center justify-between">
        <h2 className="text-white text-sm font-bold flex items-center gap-2">
          <span className="text-base">📝</span> Notes
        </h2>
        <a href="#" className="text-[#D4AF37] text-xs font-semibold hover:text-white transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-sm font-bold">add</span>
          New Note
        </a>
      </div>

      {/* Notes List */}
      <div className="flex flex-col gap-3 p-4 max-h-[600px] overflow-y-auto">
        {mockNotes.map((note) => (
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
        <a href="#" className="flex items-center justify-center w-full py-2 rounded text-[#D4AF37] text-xs font-bold hover:bg-[#2A2A2E] transition-colors">
          View all 12 notes <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
        </a>
      </div>
    </div>
  );
}
