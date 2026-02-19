"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useMcpProspectsByPosition, useMcpZones } from "@/lib/hooks";
import { getPlaceholderImage, ZONE_COLORS } from "@/lib/data/zone-data";
import type { Prospect, ZoneCode } from "@/lib/data/zone-data";

const POSITION_NAMES: Record<string, string> = {
  qb: "Quarterback",
  rb: "Running Back",
  wr: "Wide Receiver",
  te: "Tight End",
  ol: "Offensive Line",
  dl: "Defensive Line",
  lb: "Linebacker",
  cb: "Cornerback",
  s: "Safety",
  k: "Kicker",
  p: "Punter",
  ath: "Athlete",
  edge: "Edge Rusher",
};

function renderStars(count: number) {
  return (
    <div className="flex items-center gap-0.5 mt-1">
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          className={`material-symbols-outlined text-[18px] ${i < count ? "text-[#d4af35]" : "text-[#c3b998]/30"}`}
          style={{ fontVariationSettings: i < count ? "'FILL' 1" : "'FILL' 0" }}
        >
          star
        </span>
      ))}
    </div>
  );
}

function ProspectCard({ prospect }: { prospect: Prospect }) {
  const imageUrl = prospect.image_url || getPlaceholderImage(prospect.id);
  const zoneCode = prospect.zone_code as ZoneCode;
  const colors = ZONE_COLORS[zoneCode] || ZONE_COLORS.SOUTHWEST;

  return (
    <Link
      href={`/athlete/${prospect.id}`}
      className="group bg-[#111111] border border-[#333333] rounded-2xl p-6 flex items-center gap-4 hover:border-[#d4af35]/50 transition-all hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)] cursor-pointer relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-3">
        <span className="material-symbols-outlined text-[#d4af35]/20 group-hover:text-[#d4af35] transition-colors">bookmark</span>
      </div>
      <div
        className="w-20 h-20 shrink-0 bg-cover bg-center rounded-full border-2 border-[#d4af35]/20 group-hover:border-[#d4af35] transition-colors"
        style={{ backgroundImage: `url("${imageUrl}")` }}
      ></div>
      <div className="flex flex-col flex-1">
        <h3 className="text-white text-lg font-bold leading-tight group-hover:text-[#d4af35] transition-colors">
          {prospect.full_name}
        </h3>
        <p className="text-[#c3b998] text-sm font-normal">
          {prospect.high_school}
        </p>
        <div className="flex items-center gap-2 mt-1">
          {renderStars(prospect.star_rating)}
          <span className={`text-xs ${colors.text} ${colors.bg} px-2 py-0.5 rounded-full`}>
            {prospect.zone_code}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
          <span>Class of {prospect.class_year}</span>
          {prospect.commitment_status === "committed" && prospect.committed_team && (
            <>
              <span>•</span>
              <span className="text-green-400">{prospect.committed_team}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-[#111111] border border-[#333333] rounded-2xl p-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-700"></div>
            <div className="flex-1">
              <div className="h-5 w-32 bg-gray-700 rounded mb-2"></div>
              <div className="h-4 w-24 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PositionLandingPage() {
  const params = useParams();

  const position = (params.position as string)?.toUpperCase() || "QB";
  const positionName = POSITION_NAMES[position.toLowerCase()] || position;

  const [selectedZone, setSelectedZone] = useState<string>("All");
  const [minStars, setMinStars] = useState<number>(0);

  const { zones } = useMcpZones();
  const { prospects, isLoading, error, refetch } = useMcpProspectsByPosition(position, 50);

  // Filter prospects based on selected zone and stars
  const filteredProspects = prospects.filter((p) => {
    if (selectedZone !== "All" && p.zone_code !== selectedZone) return false;
    if (minStars > 0 && p.star_rating < minStars) return false;
    return true;
  });

  // Zone abbreviations for filter buttons
  const zoneAbbreviations: Record<string, string> = {
    MIDWEST: "MW",
    NORTHEAST: "NE",
    PLAINS: "PL",
    SOUTHEAST: "SE",
    SOUTHWEST: "SW",
    WEST: "W",
  };

  return (
    <div className="bg-[#050505] font-[family-name:var(--font-inter)] text-white min-h-screen flex flex-col overflow-x-hidden antialiased selection:bg-[#d4af35] selection:text-black">
      {/* Navigation */}
      <header className="w-full border-b border-[#333333] bg-[#050505]/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <span className="material-symbols-outlined text-[#d4af35] text-3xl">sports_football</span>
              <h1 className="text-white text-xl font-bold tracking-tight">RepMax</h1>
            </Link>
            {/* Desktop Nav */}
            <div className="flex items-center gap-4">
              <Link href="/login" className="hidden sm:flex h-10 px-6 items-center justify-center rounded-full bg-[#1A1A1A] text-white text-sm font-bold hover:bg-[#333333] transition-colors border border-transparent hover:border-[#d4af35]/30">
                Log In
              </Link>
              <Link href="/signup" className="h-10 px-6 flex items-center justify-center rounded-full bg-[#d4af35] text-[#050505] text-sm font-bold hover:bg-[#b5952b] transition-colors shadow-[0_0_15px_rgba(212,175,53,0.3)]">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center w-full">
        <div className="w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col gap-8">
          {/* Hero Section */}
          <div className="flex flex-col gap-2">
            <h2 className="text-white text-4xl sm:text-5xl font-black leading-tight tracking-[-0.033em]">
              {positionName} Prospects
            </h2>
            <div className="flex items-center gap-2 text-[#c3b998] text-base sm:text-lg font-normal">
              <span className="material-symbols-outlined text-[#d4af35] text-lg">analytics</span>
              <p>
                Total {position}s: {prospects.length} • Active Recruitment Zones: {zones.length}
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col gap-6 bg-[#111111] border border-[#333333] p-5 rounded-2xl shadow-lg">
            {/* Zone Filters */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold text-[#c3b998] uppercase tracking-wider">Recruitment Zones</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedZone("All")}
                  className={`h-9 px-5 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                    selectedZone === "All"
                      ? "bg-[#d4af35] text-[#050505] font-bold shadow-md"
                      : "bg-[#2A2A2A] text-white hover:bg-[#3A3A3A] border border-[#333333]"
                  }`}
                >
                  All
                </button>
                {zones.map((zone) => (
                  <button
                    key={zone.zone_code}
                    onClick={() => setSelectedZone(zone.zone_code)}
                    className={`h-9 px-5 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                      selectedZone === zone.zone_code
                        ? "bg-[#d4af35] text-[#050505] font-bold shadow-md"
                        : "bg-[#2A2A2A] text-white hover:bg-[#3A3A3A] border border-[#333333]"
                    }`}
                  >
                    {zoneAbbreviations[zone.zone_code] || zone.zone_code}
                  </button>
                ))}
              </div>
            </div>

            {/* Dropdown Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#333333] pt-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-[#c3b998] uppercase tracking-wider">Class</span>
                <div className="relative">
                  <select disabled className="w-full h-12 bg-[#2A2A2A] border border-[#333333] text-white text-sm rounded-xl px-4 appearance-none focus:outline-none focus:border-[#d4af35] focus:ring-1 focus:ring-[#d4af35] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                    <option>All Classes</option>
                    <option>2024</option>
                    <option>2025</option>
                    <option>2026</option>
                    <option>2027</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#c3b998] pointer-events-none text-xl">expand_more</span>
                </div>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-[#c3b998] uppercase tracking-wider">Rating</span>
                <div className="relative">
                  <select
                    value={minStars}
                    onChange={(e) => setMinStars(Number(e.target.value))}
                    className="w-full h-12 bg-[#2A2A2A] border border-[#333333] text-white text-sm rounded-xl px-4 appearance-none focus:outline-none focus:border-[#d4af35] focus:ring-1 focus:ring-[#d4af35] cursor-pointer"
                  >
                    <option value={0}>All Ratings</option>
                    <option value={5}>5 Stars</option>
                    <option value={4}>4 Stars & Up</option>
                    <option value={3}>3 Stars & Up</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#c3b998] pointer-events-none text-xl">expand_more</span>
                </div>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-[#c3b998] uppercase tracking-wider">Status</span>
                <div className="relative">
                  <select disabled className="w-full h-12 bg-[#2A2A2A] border border-[#333333] text-white text-sm rounded-xl px-4 appearance-none focus:outline-none focus:border-[#d4af35] focus:ring-1 focus:ring-[#d4af35] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                    <option>All Statuses</option>
                    <option>Uncommitted</option>
                    <option>Committed</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#c3b998] pointer-events-none text-xl">expand_more</span>
                </div>
              </label>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-sm">
              Showing <span className="text-white font-bold">{filteredProspects.length}</span> prospects
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Sort by:</span>
              <select className="bg-transparent border-none text-white text-sm font-medium focus:outline-none cursor-pointer">
                <option>Rating</option>
                <option>Name</option>
                <option>Class Year</option>
              </select>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-4xl text-red-500 mb-2">error</span>
              <p className="text-red-400">{error.message}</p>
              <button
                onClick={() => refetch()}
                className="mt-4 text-[#d4af35] hover:underline"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Athlete Grid */}
          {isLoading ? (
            <LoadingSkeleton />
          ) : filteredProspects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProspects.map((prospect) => (
                <ProspectCard key={prospect.id} prospect={prospect} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <span className="material-symbols-outlined text-4xl mb-2">person_off</span>
              <p>No prospects found matching your filters</p>
              <button
                onClick={() => {
                  setSelectedZone("All");
                  setMinStars(0);
                }}
                className="mt-4 text-[#d4af35] hover:underline"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Load More */}
          {filteredProspects.length > 0 && (
            <div className="flex justify-center mt-4">
              <button className="flex items-center gap-2 text-[#c3b998] hover:text-white transition-colors">
                <span className="text-sm font-medium">Load More Prospects</span>
                <span className="material-symbols-outlined text-lg">arrow_downward</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer / Bottom CTA */}
      <div className="sticky bottom-0 w-full bg-[#050505]/95 backdrop-blur-md border-t border-[#333333] py-6 z-40">
        <div className="max-w-[1200px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="w-full sm:w-auto min-w-[200px] h-12 px-6 flex items-center justify-center rounded-full bg-[#d4af35] text-[#050505] text-base font-bold hover:bg-[#b5952b] transition-colors shadow-[0_0_20px_rgba(212,175,53,0.4)]"
          >
            Create Your {position} Profile
          </Link>
          <Link
            href={`/athletes?position=${position}`}
            className="w-full sm:w-auto min-w-[200px] h-12 px-6 flex items-center justify-center rounded-full bg-transparent border border-white/20 text-white text-base font-bold hover:bg-white/10 transition-colors"
          >
            Search All {position}s
          </Link>
        </div>
      </div>
    </div>
  );
}
