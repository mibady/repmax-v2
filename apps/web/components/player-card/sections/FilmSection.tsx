'use client';

import { useState } from 'react';
import { VideoPlayerModal } from '@/components/ui/video-player-modal';
import type { PlayerCardData } from '../types';

const DEFAULT_THUMBNAIL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD0kL36A2BWxzFzDUEhlWJflUxzoToTl3AVBx8LzI8iXl6P_Z2w19x4UrmKu2VUVyUBN16sRxKirK-0xo1Q3OEi-cm8wO11Ss4uNOiRuWCTvioea_8BO16HCcKknhuyrRjhmh0AB2SG28LVgZu0kgYmiqig0zn4MTbOoRAf5NbTSu-kU5DvK6uoxxTYuIRZU9QWNLIHWpwN_G6Pd7A38-TGI-yTko6oAGBpneHDt5iI0UzinakkTymm-Gr4TeQk9oco8CsaakatJMs';

export function FilmSection({ data }: { data: PlayerCardData }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const highlight = data.highlight;
  const hasVideo = !!highlight?.videoUrl;

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary text-[20px]">smart_display</span>
        <h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase">Film</h2>
      </div>

      {/* Video Player */}
      <div
        className="relative w-full aspect-video rounded-2xl overflow-hidden group cursor-pointer border border-white/10 mb-3"
        onClick={() => hasVideo && setIsModalOpen(true)}
      >
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{ backgroundImage: `url('${highlight?.thumbnail || DEFAULT_THUMBNAIL}')` }}
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center pl-1 shadow-glow group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-black text-[32px] font-bold">play_arrow</span>
          </div>
        </div>
        {highlight?.title && (
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md">
            <p className="text-[10px] text-white font-medium">{highlight.title}</p>
          </div>
        )}
      </div>

      {/* Film Links */}
      {(data.hudlLink || data.youtubeLink) && (
        <div className="flex gap-2">
          {data.hudlLink && (
            <a
              href={data.hudlLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/5 rounded-xl py-2.5 text-xs font-semibold text-gray-300 hover:text-primary hover:border-primary/30 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">videocam</span>
              Hudl Profile
            </a>
          )}
          {data.youtubeLink && (
            <a
              href={data.youtubeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/5 rounded-xl py-2.5 text-xs font-semibold text-gray-300 hover:text-red-400 hover:border-red-500/30 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">smart_display</span>
              YouTube
            </a>
          )}
        </div>
      )}

      {hasVideo && (
        <VideoPlayerModal
          videoUrl={highlight!.videoUrl!}
          title={highlight?.title || 'Highlight'}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </section>
  );
}
