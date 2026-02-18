'use client';

import Link from 'next/link';

export default function CardActions({ athleteId }: { athleteId: string }) {
  return (
    <div className="p-6 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/5 flex flex-col gap-4">
      <Link
        href={`/login?returnTo=/card/${athleteId}`}
        className="w-full h-12 bg-primary hover:bg-yellow-500 text-black font-bold rounded-full flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-lg shadow-primary/20"
      >
        <span className="material-symbols-outlined text-[20px]">add</span>
        Add to Shortlist
      </Link>
      <Link
        href={`/login?returnTo=/card/${athleteId}`}
        className="w-full h-12 bg-transparent border border-primary text-primary hover:bg-primary/10 font-bold rounded-full flex items-center justify-center gap-2 transition-all active:scale-95"
      >
        <span className="material-symbols-outlined text-[20px]">mail</span>
        Contact Coach
      </Link>
      <div className="w-full flex justify-center items-center gap-1.5 opacity-40 mt-2">
        <span className="material-symbols-outlined text-[12px]">bolt</span>
        <p className="text-[10px] font-medium tracking-widest uppercase">
          Powered by REPMAX
        </p>
      </div>
    </div>
  );
}
