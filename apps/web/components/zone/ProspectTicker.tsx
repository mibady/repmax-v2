"use client";

import { useRef, useState } from "react";

interface Prospect {
  id: string;
  full_name: string;
  position: string;
  star_rating: number;
  high_school?: string;
  commitment_status: string;
  committed_team?: string | null;
}

interface ProspectTickerProps {
  prospects: Prospect[];
  speed?: "slow" | "normal" | "fast";
  onProspectClick?: (prospect: Prospect) => void;
}

function StarRating({ stars }: { stars: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          className={`text-xs ${
            i < stars ? "text-primary" : "text-white/20"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export function ProspectTicker({
  prospects,
  speed = "normal",
  onProspectClick,
}: ProspectTickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const speedMap = {
    slow: "40s",
    normal: "25s",
    fast: "15s",
  };

  // Duplicate prospects for seamless loop
  const displayProspects = [...prospects, ...prospects];

  return (
    <div className="rounded-xl bg-surface-dark border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-rounded text-primary">trending_up</span>
          <h3 className="text-sm font-bold text-white">Prospect Ticker</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-text-grey">Live Updates</span>
        </div>
      </div>

      {/* Ticker */}
      <div
        ref={containerRef}
        className="overflow-hidden py-3"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className="flex gap-4 whitespace-nowrap"
          style={{
            animation: `ticker ${speedMap[speed]} linear infinite`,
            animationPlayState: isPaused ? "paused" : "running",
          }}
        >
          {displayProspects.map((prospect, idx) => (
            <button
              key={`${prospect.id}-${idx}`}
              onClick={() => onProspectClick?.(prospect)}
              className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex-shrink-0"
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-surface-dark flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {prospect.full_name.split(" ").map((n) => n[0]).join("")}
                </span>
              </div>

              {/* Info */}
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">
                    {prospect.full_name}
                  </span>
                  <span className="text-xs text-text-grey">
                    {prospect.position}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <StarRating stars={prospect.star_rating} />
                  {prospect.commitment_status === "committed" && prospect.committed_team ? (
                    <span className="text-xs text-green-400">
                      → {prospect.committed_team}
                    </span>
                  ) : (
                    <span className="text-xs text-primary">Uncommitted</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Inline styles for animation */}
      <style jsx>{`
        @keyframes ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
