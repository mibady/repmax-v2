'use client';

import Image from 'next/image';
import type { PlayerCardData } from '../types';

const DEFAULT_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCz5tdm2iqfJ4HWNltYdzZxqDD6zvFqQFxnt8XAnlYNU5PepMx3HTwvhTH-esYE5zA4sgEvuLBo7PxEdcvYiBbXA7_loyZ49uw3KPhiG5s0H5PLQFYekJM4E6nKivPokKcEDg4l0cDCyg2eEJgsZz5FpYskvM5EYz5PCbDeWUyiB3r5lrztrr53ZUGsJ_FoaDdS7b0wv4EQuoJAgbTNAo_2LBmejJ7qGoSIDGQnEPDBLujfO4I48IZ12Yfa4lE-S6jUgG40lXh2rnQ';

export function HeroSection({ data }: { data: PlayerCardData }) {
  const avatarUrl = data.avatarUrl || DEFAULT_AVATAR;

  return (
    <div className="relative">
      {/* Hero Image */}
      <div className="relative w-full aspect-[4/3] bg-gradient-to-b from-[#1a1a1a] to-card-dark overflow-hidden">
        <Image
          src={avatarUrl}
          alt={`Portrait of athlete ${data.name}`}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card-dark via-card-dark/40 to-transparent" />

        {/* Zone Badge */}
        {data.zone && (
          <div className="absolute top-4 right-4 bg-purple-900/80 border border-purple-500/50 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 z-10">
            <span className="material-symbols-outlined text-purple-200 text-[14px]">location_on</span>
            <span className="text-[10px] font-bold tracking-wider text-purple-100 uppercase">{data.zone} Zone</span>
          </div>
        )}

        {/* Verified Badge */}
        {data.verified && (
          <div className="absolute bottom-4 right-4 z-10 bg-green-900/80 border border-green-500/50 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-green-400 text-[16px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}>verified</span>
            <span className="text-[10px] font-bold tracking-wider text-green-300 uppercase">Verified</span>
          </div>
        )}

        {/* Jersey Number */}
        {data.jerseyNumber && (
          <div className="absolute bottom-4 left-4 z-10">
            <span className="text-6xl font-black text-white/10 font-mono leading-none">#{data.jerseyNumber}</span>
          </div>
        )}
      </div>

      {/* Identity */}
      <div className="px-6 pt-5 flex flex-col items-center text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white">{data.name}</h1>
        <p className="text-gray-400 text-sm font-medium mt-1">
          {[data.school, data.city, data.state].filter(Boolean).join(', ')}
        </p>

        {/* Position Pills */}
        <div className="mt-4 flex gap-3">
          {data.primaryPosition && (
            <div className="flex h-7 items-center justify-center px-4 rounded-full bg-primary/20 border border-primary/30">
              <span className="text-primary text-xs font-bold tracking-wider">{data.primaryPosition}</span>
            </div>
          )}
          {data.secondaryPosition && (
            <div className="flex h-7 items-center justify-center px-4 rounded-full bg-neutral-800 border border-white/10">
              <span className="text-gray-300 text-xs font-bold tracking-wider">{data.secondaryPosition}</span>
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="mt-5 w-full flex items-center justify-between border-y border-white/5 py-3 px-2">
          <div className="flex flex-col items-start gap-1">
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Class Of</span>
            <span className="text-sm font-bold text-white">{data.classYear || 'N/A'}</span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Rating</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`material-symbols-outlined text-[16px] ${star <= data.starRating ? 'text-primary' : 'text-gray-700'}`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >star</span>
              ))}
            </div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">NCAA ID</span>
            <span className="text-sm font-bold text-white font-mono">{data.ncaaId || 'N/A'}</span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Offers</span>
            <span className="text-sm font-bold text-primary">{data.offersCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
