'use client';

import { useState } from 'react';
import type { PlayerCardData } from '../types';

export function ShareSection({ data }: { data: PlayerCardData }) {
  const [copied, setCopied] = useState(false);

  const cardUrl = data.repmaxId
    ? `https://repmax.io/card/${data.repmaxId}`
    : `https://repmax.io/card/${data.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(cardUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary text-[20px]">share</span>
        <h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase">Share Card</h2>
      </div>
      <div className="flex gap-3">
        <button
          onClick={handleCopyLink}
          className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/5 rounded-2xl py-3 text-sm font-semibold text-gray-300 hover:text-primary hover:border-primary/30 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">{copied ? 'check' : 'link'}</span>
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
        <button
          onClick={() => window.print()}
          className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/5 rounded-2xl py-3 text-sm font-semibold text-gray-300 hover:text-primary hover:border-primary/30 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">print</span>
          Print / PDF
        </button>
      </div>
    </section>
  );
}
