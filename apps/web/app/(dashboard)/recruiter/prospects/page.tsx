'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useShortlist, useRecruiterPipeline } from "@/lib/hooks";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AthleteProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

interface Athlete {
  id: string;
  primary_position: string;
  secondary_position: string | null;
  class_year: number;
  zone: string | null;
  state: string | null;
  star_rating: number | null;
  high_school: string | null;
  repmax_score: number | null;
  profile: AthleteProfile | AthleteProfile[] | null;
}

interface AthletesResponse {
  athletes: Athlete[];
  total: number;
  limit: number;
  offset: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveProfile(raw: Athlete["profile"]): AthleteProfile | null {
  if (!raw) return null;
  if (Array.isArray(raw)) return raw[0] ?? null;
  return raw;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAGE_SIZE = 60;

const POSITIONS = [
  "QB", "RB", "WR", "TE", "OL", "OT", "OG", "C",
  "DL", "DE", "DT", "LB", "CB", "S", "K", "P", "ATH",
];

const CLASS_YEARS = [2025, 2026, 2027, 2028, 2029];

const ZONES = [
  "West", "Southwest", "Midwest", "Southeast", "Northeast", "Plains",
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function RecruiterProspectsPage() {
  // Data
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [offset, setOffset] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState("all");
  const [classYearFilter, setClassYearFilter] = useState("all");
  const [zoneFilter, setZoneFilter] = useState("all");

  // Hooks
  const { add: addToShortlist, remove: removeFromShortlist, isInShortlist } = useShortlist();
  const { addToPipeline } = useRecruiterPipeline();
  const isFree = false; // Tier gate removed for demo

  // ------ Fetch athletes ---------------------------------------------------

  const fetchAthletes = useCallback(async (newOffset: number) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", String(PAGE_SIZE));
      params.set("offset", String(newOffset));
      if (positionFilter !== "all") params.set("position", positionFilter);
      if (classYearFilter !== "all") params.set("class_year", classYearFilter);
      if (zoneFilter !== "all") params.set("zone", zoneFilter);

      const res = await fetch(`/api/athletes?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data: AthletesResponse = await res.json();
      setAthletes(data.athletes ?? []);
      setTotal(data.total ?? 0);
      setOffset(newOffset);
    } catch {
      toast.error("Failed to load prospects");
    } finally {
      setIsLoading(false);
    }
  }, [positionFilter, classYearFilter, zoneFilter]);

  // Refetch when server-side filters change
  useEffect(() => {
    fetchAthletes(0);
  }, [fetchAthletes]);

  // ------ Client-side search filter ----------------------------------------

  const displayed = useMemo(() => {
    if (!search) return athletes;
    const q = search.toLowerCase();
    return athletes.filter((a) => {
      const profile = resolveProfile(a.profile);
      const name = (profile?.full_name ?? "").toLowerCase();
      const school = (a.high_school ?? "").toLowerCase();
      return name.includes(q) || school.includes(q);
    });
  }, [athletes, search]);

  // ------ Actions ----------------------------------------------------------

  const handleToggleBookmark = useCallback(
    async (athleteId: string) => {
      if (isInShortlist(athleteId)) {
        await removeFromShortlist(athleteId);
        toast.success("Removed from shortlist");
      } else {
        await addToShortlist(athleteId);
        toast.success("Added to shortlist");
      }
    },
    [isInShortlist, addToShortlist, removeFromShortlist],
  );

  const handleAddToPipeline = useCallback(
    async (athleteId: string) => {
      await addToPipeline(athleteId);
      toast.success("Added to pipeline");
    },
    [addToPipeline],
  );

  // ------ Pagination helpers -----------------------------------------------

  const hasMore = offset + PAGE_SIZE < total;
  const hasPrev = offset > 0;

  // ------ Clear filters ----------------------------------------------------

  const hasActiveFilters =
    positionFilter !== "all" ||
    classYearFilter !== "all" ||
    zoneFilter !== "all" ||
    search !== "";

  // ------ Render -----------------------------------------------------------

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Free-tier upgrade banner */}
      {isFree && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4 flex items-center justify-between">
          <span className="text-sm text-primary">
            Free tier — limited prospect access. Upgrade to unlock full database and pipeline tools.
          </span>
          <a
            href="/pricing"
            className="text-xs font-bold text-primary hover:underline"
          >
            Upgrade
          </a>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-white text-xl font-bold tracking-tight">
            Browse Prospects
          </h1>
          <div className="h-4 w-px bg-white/10 mx-2" />
          <span className="text-gray-500 text-sm font-mono">
            {total.toLocaleString()} prospect{total !== 1 ? "s" : ""}
          </span>
        </div>
        <Link
          href="/recruiter/pipeline"
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">
            view_kanban
          </span>
          Pipeline
        </Link>
      </div>

      {/* Control Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* Search */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or school..."
            className="bg-[#141414] text-white pl-9 pr-3 py-2 rounded-lg text-sm border border-white/10 hover:border-white/20 focus:outline-none focus:ring-1 focus:ring-primary transition-colors w-56"
          />
        </div>

        {/* Position Filter */}
        <div className="relative">
          <select
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            className="appearance-none bg-[#141414] text-white pl-3 pr-8 py-2 rounded-lg text-sm border border-white/10 hover:border-white/20 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-colors w-36"
          >
            <option value="all">All Positions</option>
            {POSITIONS.map((pos) => (
              <option key={pos} value={pos}>
                {pos}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
            <span className="material-symbols-outlined text-[16px]">
              expand_more
            </span>
          </div>
        </div>

        {/* Class Year Filter */}
        <div className="relative">
          <select
            value={classYearFilter}
            onChange={(e) => setClassYearFilter(e.target.value)}
            className="appearance-none bg-[#141414] text-white pl-3 pr-8 py-2 rounded-lg text-sm border border-white/10 hover:border-white/20 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-colors w-36"
          >
            <option value="all">All Classes</option>
            {CLASS_YEARS.map((year) => (
              <option key={year} value={year.toString()}>
                Class of {year}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
            <span className="material-symbols-outlined text-[16px]">
              expand_more
            </span>
          </div>
        </div>

        {/* Zone Filter */}
        <div className="relative">
          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="appearance-none bg-[#141414] text-white pl-3 pr-8 py-2 rounded-lg text-sm border border-white/10 hover:border-white/20 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-colors w-36"
          >
            <option value="all">All Zones</option>
            {ZONES.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
            <span className="material-symbols-outlined text-[16px]">
              expand_more
            </span>
          </div>
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={() => {
              setPositionFilter("all");
              setClassYearFilter("all");
              setZoneFilter("all");
              setSearch("");
            }}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded border border-white/10 hover:border-white/20"
          >
            <span className="material-symbols-outlined text-[14px]">close</span>
            Clear
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <LoadingSkeleton />
        ) : displayed.length === 0 ? (
          <EmptyState hasFilters={hasActiveFilters} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {displayed.map((athlete) => {
                const profile = resolveProfile(athlete.profile);
                const name = profile?.full_name ?? "Unknown Athlete";
                const initials = getInitials(name);
                const school = athlete.high_school
                  ? `${athlete.high_school}${athlete.state ? `, ${athlete.state}` : ""}`
                  : "Unknown School";
                const stars = athlete.star_rating ?? 0;
                const bookmarked = isInShortlist(athlete.id);

                return (
                  <div
                    key={athlete.id}
                    className="bg-[#141414] border border-white/5 rounded-xl overflow-hidden group hover:border-white/10 transition-all"
                  >
                    {/* Clickable card body */}
                    <Link
                      href={`/recruiter/prospects/${athlete.id}`}
                      className="block"
                    >
                      <div className="flex gap-3 p-3">
                        {/* Photo */}
                        <div className="relative flex-shrink-0">
                          {profile?.avatar_url ? (
                            <Image
                              src={profile.avatar_url}
                              alt={name}
                              width={56}
                              height={56}
                              className="rounded-lg object-cover size-14 border border-white/10"
                            />
                          ) : (
                            <div className="size-14 rounded-lg bg-gradient-to-br from-primary/30 to-purple-600/30 border border-white/10 flex items-center justify-center">
                              <span className="text-lg font-bold text-white/60">
                                {initials}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="font-bold text-white text-sm truncate">
                              {name}
                            </h4>
                            {/* Stars */}
                            <div className="flex gap-0.5 flex-shrink-0">
                              {Array.from({ length: Math.min(stars, 5) }).map(
                                (_, i) => (
                                  <span
                                    key={i}
                                    className="material-symbols-outlined text-primary text-[12px]"
                                    style={{
                                      fontVariationSettings: "'FILL' 1",
                                    }}
                                  >
                                    star
                                  </span>
                                ),
                              )}
                            </div>
                          </div>
                          <p className="text-[11px] text-gray-500 truncate">
                            {school}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="bg-white/5 text-gray-300 border border-white/5 text-[10px] px-1.5 py-0.5 rounded font-bold">
                              {athlete.primary_position}
                            </span>
                            <span className="text-[10px] text-gray-600 font-mono">
                              &apos;{String(athlete.class_year).slice(-2)}
                            </span>
                            {athlete.zone && (
                              <span className="text-[10px] text-purple-400/70 truncate">
                                {athlete.zone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>

                    {/* Action footer */}
                    <div className="px-3 pb-2 flex justify-between items-center">
                      {athlete.repmax_score != null ? (
                        <span className="text-[10px] text-gray-600 font-mono">
                          RM {athlete.repmax_score}
                        </span>
                      ) : (
                        <span />
                      )}

                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Bookmark */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleToggleBookmark(athlete.id);
                          }}
                          className={`p-1 rounded hover:bg-white/10 transition-colors ${
                            bookmarked
                              ? "text-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                          title={
                            bookmarked
                              ? "Remove from shortlist"
                              : "Add to shortlist"
                          }
                        >
                          <span
                            className="material-symbols-outlined text-[16px]"
                            style={
                              bookmarked
                                ? { fontVariationSettings: "'FILL' 1" }
                                : undefined
                            }
                          >
                            bookmark
                          </span>
                        </button>

                        {/* Add to Pipeline */}
                        {!isFree && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleAddToPipeline(athlete.id);
                            }}
                            className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-primary transition-colors"
                            title="Add to pipeline"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              playlist_add
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6 mb-4">
              <span className="text-xs text-gray-500">
                Showing {offset + 1}&ndash;{Math.min(offset + PAGE_SIZE, total)} of{" "}
                {total.toLocaleString()}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchAthletes(Math.max(0, offset - PAGE_SIZE))}
                  disabled={!hasPrev}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    chevron_left
                  </span>
                  Previous
                </button>
                <button
                  onClick={() => fetchAthletes(offset + PAGE_SIZE)}
                  disabled={!hasMore}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                >
                  Next
                  <span className="material-symbols-outlined text-[14px]">
                    chevron_right
                  </span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading Skeleton
// ---------------------------------------------------------------------------

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="bg-[#141414] border border-white/5 rounded-xl p-3 animate-pulse"
        >
          <div className="flex gap-3">
            <div className="size-14 bg-gray-700 rounded-lg" />
            <div className="flex-1">
              <div className="h-4 w-24 bg-gray-700 rounded mb-2" />
              <div className="h-3 w-32 bg-gray-700 rounded mb-2" />
              <div className="h-4 w-12 bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-20">
      <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">
        person_search
      </span>
      <h3 className="text-xl font-bold text-white mb-2">
        {hasFilters ? "No Matching Prospects" : "No Prospects Found"}
      </h3>
      <p className="text-gray-500 mb-6 max-w-md">
        {hasFilters
          ? "Try adjusting your filters to see more results."
          : "There are no athletes in the database yet."}
      </p>
    </div>
  );
}
