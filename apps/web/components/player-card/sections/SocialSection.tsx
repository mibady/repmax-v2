'use client';

import type { PlayerCardData } from '../types';

export function SocialSection({ data }: { data: PlayerCardData }) {
  const hasSocial = data.twitter || data.instagram || data.tiktok;
  if (!hasSocial) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary text-[20px]">share</span>
        <h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase">Social</h2>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {data.twitter && (
          <a
            href={data.twitter.startsWith('http') ? data.twitter : `https://twitter.com/${data.twitter.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-white/10 hover:border-blue-400/30 transition-colors text-center group"
          >
            <span className="text-lg">𝕏</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold group-hover:text-blue-400 transition-colors">Twitter</span>
          </a>
        )}
        {data.instagram && (
          <a
            href={data.instagram.startsWith('http') ? data.instagram : `https://instagram.com/${data.instagram.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-white/10 hover:border-pink-400/30 transition-colors text-center group"
          >
            <span className="material-symbols-outlined text-[20px]">photo_camera</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold group-hover:text-pink-400 transition-colors">Instagram</span>
          </a>
        )}
        {data.tiktok && (
          <a
            href={data.tiktok.startsWith('http') ? data.tiktok : `https://tiktok.com/@${data.tiktok.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-white/10 hover:border-cyan-400/30 transition-colors text-center group"
          >
            <span className="material-symbols-outlined text-[20px]">music_note</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold group-hover:text-cyan-400 transition-colors">TikTok</span>
          </a>
        )}
      </div>
    </section>
  );
}
