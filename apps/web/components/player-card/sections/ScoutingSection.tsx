'use client';

import type { PlayerCardData } from '../types';

export function ScoutingSection({ data }: { data: PlayerCardData }) {
  if (!data.coachNotes && !data.playerSummary) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary text-[20px]">sports</span>
        <h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase">Scouting Report Notes</h2>
      </div>

      {data.playerSummary && (
        <div className="bg-white/5 border border-white/5 rounded-2xl p-5 mb-3">
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{data.playerSummary}</p>
        </div>
      )}

      {data.coachNotes && (
        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary/60 text-[16px]">format_quote</span>
            <span className="text-[10px] uppercase tracking-widest text-primary/60 font-bold">Coach Notes</span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line italic">{data.coachNotes}</p>
          {data.coachName && (
            <p className="text-xs text-gray-500 mt-3">— {data.coachName}</p>
          )}
        </div>
      )}
    </section>
  );
}
