'use client';

import Link from 'next/link';

export default function CardActions({ athleteId, repMaxId, athleteName }: {
  athleteId: string;
  repMaxId: string | null;
  athleteName: string;
}) {
  const cardUrl = `https://repmax.io/card/${repMaxId || athleteId}`;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `${athleteName} — RepMax Player Card`,
        url: cardUrl,
      });
    } else {
      await navigator.clipboard.writeText(cardUrl);
      alert('Card link copied to clipboard');
    }
  };

  return (
    <div className="p-6 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/5 flex flex-col gap-4">
      <Link
        href={`/login?returnTo=/card/${athleteId}`}
        className="w-full h-12 bg-primary hover:bg-yellow-500 text-black font-bold rounded-full flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-lg shadow-primary/20"
      >
        <span className="material-symbols-outlined text-[20px]">add</span>
        Add to Pipeline
      </Link>
      <Link
        href={`/login?returnTo=/card/${athleteId}`}
        className="w-full h-12 bg-transparent border border-primary text-primary hover:bg-primary/10 font-bold rounded-full flex items-center justify-center gap-2 transition-all active:scale-95"
      >
        <span className="material-symbols-outlined text-[20px]">mail</span>
        Contact Coach
      </Link>
      <button
        onClick={handleShare}
        className="w-full h-12 bg-transparent border border-white/20 text-white/60 hover:text-white hover:border-white/40 font-medium rounded-full flex items-center justify-center gap-2 transition-all active:scale-95"
      >
        <span className="material-symbols-outlined text-[20px]">share</span>
        Share Card
      </button>
      <div className="w-full flex justify-center items-center gap-1.5 opacity-40 mt-2">
        <span className="material-symbols-outlined text-[12px]">bolt</span>
        <p className="text-[10px] font-medium tracking-widest uppercase">
          Powered by REPMAX
        </p>
      </div>
    </div>
  );
}
