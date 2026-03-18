'use client';

import { type QuickReferenceItem } from '@/lib/data/ncaa-compliance';

interface QuickReferenceGridProps {
  neverDo: QuickReferenceItem[];
  alwaysDo: QuickReferenceItem[];
}

export function QuickReferenceGrid({ neverDo, alwaysDo }: QuickReferenceGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Never Do */}
      <div className="bg-[#1F1F22] rounded-xl border border-red-500/20 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="size-8 rounded-lg bg-red-500/15 flex items-center justify-center">
            <span className="material-symbols-outlined text-red-400 text-[18px]">block</span>
          </div>
          <h3 className="text-red-400 font-bold text-sm uppercase tracking-wide">Never Do</h3>
        </div>
        <ul className="space-y-3">
          {neverDo.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
              <span className="material-symbols-outlined text-red-400/60 text-[14px] mt-0.5 shrink-0">close</span>
              {item.text}
            </li>
          ))}
        </ul>
      </div>

      {/* Always Do */}
      <div className="bg-[#1F1F22] rounded-xl border border-green-500/20 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="size-8 rounded-lg bg-green-500/15 flex items-center justify-center">
            <span className="material-symbols-outlined text-green-400 text-[18px]">check_circle</span>
          </div>
          <h3 className="text-green-400 font-bold text-sm uppercase tracking-wide">Always Do</h3>
        </div>
        <ul className="space-y-3">
          {alwaysDo.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
              <span className="material-symbols-outlined text-green-400/60 text-[14px] mt-0.5 shrink-0">check</span>
              {item.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
