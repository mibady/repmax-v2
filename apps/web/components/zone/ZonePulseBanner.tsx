"use client";

import { useState } from "react";
import type { ZoneCode } from "@repmax/shared/zone";

interface ZoneData {
  zone_code: ZoneCode;
  zone_name: string;
  total_recruits: number;
  blue_chip_count: number;
  upcoming_events_30d: number;
  metro_areas: string[];
  description: string;
}

interface TopProspect {
  full_name: string;
  position: string;
  star_rating: number;
  high_school: string;
  commitment_status: string;
}

interface ZonePulseBannerProps {
  zone: ZoneData;
  topProspects?: TopProspect[];
  leadingTeam?: {
    name: string;
    commits: number;
    zoneShare: number;
  };
  onViewFullIntel?: () => void;
}

const zoneColors: Record<ZoneCode, { primary: string; gradient: string }> = {
  SOUTHEAST: {
    primary: "bg-red-500",
    gradient: "from-red-500/20 to-transparent",
  },
  SOUTHWEST: {
    primary: "bg-orange-500",
    gradient: "from-orange-500/20 to-transparent",
  },
  WEST: {
    primary: "bg-blue-500",
    gradient: "from-blue-500/20 to-transparent",
  },
  MIDWEST: {
    primary: "bg-green-500",
    gradient: "from-green-500/20 to-transparent",
  },
  NORTHEAST: {
    primary: "bg-purple-500",
    gradient: "from-purple-500/20 to-transparent",
  },
  PLAINS: {
    primary: "bg-yellow-500",
    gradient: "from-yellow-500/20 to-transparent",
  },
};

function StarRating({ stars }: { stars: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          className={`material-symbols-rounded text-sm ${
            i < stars ? "text-primary" : "text-white/20"
          }`}
        >
          star
        </span>
      ))}
    </div>
  );
}

export function ZonePulseBanner({
  zone,
  topProspects = [],
  leadingTeam,
  onViewFullIntel,
}: ZonePulseBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const colors = zoneColors[zone.zone_code];

  return (
    <div className={`rounded-xl bg-gradient-to-r ${colors.gradient} bg-surface-dark border border-white/10 overflow-hidden`}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${colors.primary} animate-pulse`} />
          <div>
            <h3 className="text-lg font-bold text-white">{zone.zone_name} Zone</h3>
            <p className="text-sm text-text-grey">{zone.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{zone.total_recruits}</p>
            <p className="text-xs text-text-grey">Athletes</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{zone.upcoming_events_30d}</p>
            <p className="text-xs text-text-grey">Events</p>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <span className="material-symbols-rounded text-white">
              {isExpanded ? "expand_less" : "expand_more"}
            </span>
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-white/10">
          {/* Metro Areas */}
          <div className="p-4 border-b border-white/5">
            <p className="text-xs text-text-grey uppercase tracking-wider mb-2">Key Metros</p>
            <div className="flex flex-wrap gap-2">
              {zone.metro_areas.slice(0, 5).map((metro) => (
                <span
                  key={metro}
                  className="px-3 py-1 rounded-full bg-white/5 text-sm text-white"
                >
                  {metro}
                </span>
              ))}
            </div>
          </div>

          {/* Top Uncommitted Prospects */}
          {topProspects.length > 0 && (
            <div className="p-4 border-b border-white/5">
              <p className="text-xs text-text-grey uppercase tracking-wider mb-3">
                Top Uncommitted Prospects
              </p>
              <div className="space-y-2">
                {topProspects.slice(0, 3).map((prospect, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-dark flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {prospect.full_name.split(" ").map((n) => n[0]).join("")}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{prospect.full_name}</p>
                        <p className="text-xs text-text-grey">
                          {prospect.position} • {prospect.high_school}
                        </p>
                      </div>
                    </div>
                    <StarRating stars={prospect.star_rating} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Leading Team */}
          {leadingTeam && (
            <div className="p-4 border-b border-white/5">
              <p className="text-xs text-text-grey uppercase tracking-wider mb-3">
                Recruitment Leader
              </p>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${colors.primary} flex items-center justify-center`}>
                    <span className="material-symbols-rounded text-white">school</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{leadingTeam.name}</p>
                    <p className="text-xs text-text-grey">
                      {leadingTeam.commits} Commits • {leadingTeam.zoneShare}% Zone Share
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="p-4">
            <button
              onClick={onViewFullIntel}
              className="w-full py-3 rounded-lg bg-primary hover:bg-primary-hover text-black font-bold transition-colors"
            >
              View Full Zone Intelligence
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
