'use client';

import type { PlayerCardData } from '../types';

export function DocumentsSection({ data }: { data: PlayerCardData }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary text-[20px]">description</span>
        <h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase">Documents</h2>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {data.documents.transcripts.length > 0 ? (
          <a
            href={data.documents.transcripts[0].fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-white/10 transition-colors cursor-pointer text-center"
          >
            <span className="material-symbols-outlined text-primary text-[28px]">description</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Transcript</span>
          </a>
        ) : (
          <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-2 opacity-40 text-center">
            <span className="material-symbols-outlined text-gray-500 text-[28px]">description</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Transcript</span>
          </div>
        )}
        {data.documents.recommendations.length > 0 ? (
          <a
            href={data.documents.recommendations[0].fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-white/10 transition-colors cursor-pointer text-center"
          >
            <span className="material-symbols-outlined text-primary text-[28px]">mail</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Letter of Rec</span>
          </a>
        ) : (
          <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-2 opacity-40 text-center">
            <span className="material-symbols-outlined text-gray-500 text-[28px]">mail</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Letter of Rec</span>
          </div>
        )}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-2 opacity-40 text-center">
          <span className="material-symbols-outlined text-gray-500 text-[28px]">folder</span>
          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Other Docs</span>
        </div>
      </div>
    </section>
  );
}
